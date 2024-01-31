import crypto from 'crypto';
import { ActionRowBuilder, ChannelType, CommandInteraction, ComponentType, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle, ThreadChannel, WebhookClient } from 'discord.js';
import { getHelperRoleId, getSupportForum, getSupportRole } from '../../config/config';
import { Bot, SlashCommand } from '../../lib/types/discord';
import { SupportType, forumSupportLabels } from '../../lib/types/support';
import { addCooldown, getTimeLeft } from '../../lib/support/cooldowns';
import { logError } from '../../utils/logger';
import { addPost } from '../../lib/database/support/posts';
import { editWebhookMessage, sendWebhookMessage } from '../../lib/database/support/webhook';

module.exports = {
    name: 'helpme',
    category: 'Support',
    description: 'Create a support thread',
    botPermissions: ['SendMessages'],
    permissions: ['SendMessages'],
    ephemeral: true,

    execute: async (bot: Bot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const { user, guild } = interaction;

        const supportChannelId = getSupportForum();
        if (!supportChannelId) {
            return await interaction.editReply(`לא הוגדר צ'אנל פורום!\nיש לפנות לצוות השרת בנושא זה.`);
        }
        const supportChannel = guild!.channels.cache.get(supportChannelId)!;
        if (supportChannel.type !== ChannelType.GuildForum) {
            return await interaction.editReply(`ניתן לבקש עזרה רק בצ'אנל מסוג פורום!`)
        }

        const cooldown = getTimeLeft(user.id);
        if (cooldown > 0) {
            const minutes = Math.floor(cooldown / 60000);
            const seconds = ((cooldown % 60000) / 1000).toFixed(0);
            return await interaction.editReply(`את/ה יכול/ה לפנות לעזרה שוב בעוד ${minutes}:${seconds.padStart(2, '0')} דקות!`);
        }

        const customId = crypto.randomBytes(10).toString('hex');

        const tagChooserModel = new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder('בחר/י קטגוריה')
            .addOptions(supportChannel.availableTags.map(tag => (
                {
                    label: `${tag.name}`,
                    value: tag.name,
                    emoji: { animated: false, id: tag.emoji?.id || undefined, name: tag.emoji?.name || undefined }
                }
            )));

        const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(tagChooserModel);
        const reply = await interaction.editReply({ components: [row] });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.customId === customId && i.user.id === user.id,
        });

        collector.on('collect', async collectorInteraction => {
            try {
                const tag = supportChannel.availableTags.find(tag => tag.name === collectorInteraction.values[0]);
                if (!tag) return;

                const customModalId = crypto.randomBytes(10).toString('hex');

                const modal = new ModalBuilder()
                    .setCustomId(customModalId)
                    .setTitle(`בקשת עזרה בנושא ${tag.name}`)

                const titleInput = new TextInputBuilder()
                    .setCustomId('titleInput')
                    .setLabel('כותרת השאלה')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)

                const questionInput = new TextInputBuilder()
                    .setCustomId('questionInput')
                    .setLabel('פירוט השאלה')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Paragraph)

                const firstRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(titleInput)
                const secondRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(questionInput)

                modal.addComponents(firstRow, secondRow);

                await collectorInteraction.showModal(modal);

                collectorInteraction.awaitModalSubmit({ time: 0, filter: (i) => i.customId === customModalId && i.user.id === user.id })
                    .then(async modalInteraction => {
                        await modalInteraction.deferUpdate();
                        await modalInteraction.editReply({ content: 'מעבד את הבקשה...', components: [] })

                        const title = modalInteraction.fields.getTextInputValue('titleInput');
                        const question = modalInteraction.fields.getTextInputValue('questionInput');

                        if (!collectorInteraction.inCachedGuild()) return;

                        const nickname = collectorInteraction.member.displayName;

                        const postMessage = await sendWebhookMessage({
                            threadName: `${title} - ${nickname}`,
                            content: `${question}`,
                            username: nickname,
                            avatarURL: user.displayAvatarURL(),
                        })
                        if (!postMessage) {
                            logError('Failed to create support thread! The support webhook is not configured!');
                            return await modalInteraction.editReply({ content: 'התרחשה שגיאה בעיבוד הבקשה!\nיש לפנות לצוות השרת בנושא זה.', components: [] });
                        }

                        const activeThreads = await guild!.channels.fetchActiveThreads();
                        const post = activeThreads.threads.find(thread => thread.id === postMessage.channelId);
                        if (!post || !post.isThread()) {
                            logError('Failed to fetch support thread!');
                            return await modalInteraction.editReply({ content: 'התרחשה שגיאה בעיבוד הבקשה!\nיש לפנות לצוות השרת בנושא זה.', components: [] });
                        }
                        await post.setAppliedTags([tag.id]);

                        const firstMessage = post.lastMessage;
                        await post.lastMessage?.pin();
                        await post.lastMessage?.delete(); // deletes the 'pinned a message' message
                        await (await post.send(`<@${user.id}> <@&${getHelperRoleId()}>`)).delete(); // ghost ping the user
                        await editWebhookMessage(firstMessage!.id, {
                            threadId: post.id,
                            content: `${question}\n\n\n_(נשאל על ידי ${collectorInteraction.user})_\n||<@&${getHelperRoleId()}>||`
                        });

                        await addPost({
                            channelId: post.id,
                            type: Object.keys(forumSupportLabels).find(key => forumSupportLabels[key as SupportType] === tag.name) as SupportType,
                            approved: false,
                            authorId: user.id,
                            question,
                            title,
                        });

                        addCooldown(user.id);
                        await modalInteraction.editReply({ content: `השאלה נשלחה!\nניתן לצפות בפוסט שנפתח:\n\n <#${post.id}>`, components: [] });

                    }).catch(async (err) => {
                        logError(err);
                        await collectorInteraction.editReply({ content: 'התרחשה שגיאה בעיבוד הבקשה!\nיש לפנות לצוות השרת בנושא זה.', components: [] });
                    });
            } catch (err) {
                logError(err);
            }
        });
    }
} as SlashCommand;
