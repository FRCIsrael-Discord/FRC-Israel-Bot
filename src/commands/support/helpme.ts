import crypto from 'crypto';
import { ActionRowBuilder, ChannelType, CommandInteraction, ComponentType, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { getSupportForum, getSupportRole } from '../../config/config';
import { Bot, SlashCommand } from '../../lib/types/discord';
import { SupportType, forumSupportLabels } from '../../lib/types/support';
import { addCooldown, getTimeLeft } from '../../lib/support/cooldowns';
import { logError } from '../../utils/logger';
import { addPost } from '../../lib/database/support/posts';

module.exports = {
    name: 'helpme',
    category: 'Support',
    description: 'Create a support thread',
    botPermissions: ['SendMessages'],
    permissions: ['SendMessages'],
    ephemeral: true,

    execute: async (bot: Bot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const { user } = interaction;

        const supportChannelId = getSupportForum();
        if (!supportChannelId) {
            return await interaction.editReply(`לא הוגדר צ'אנל פורום!\nיש לפנות לצוות השרת בנושא זה.`);
        }
        const supportChannel = interaction.guild!.channels.cache.get(supportChannelId)!;
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

                        const post = await supportChannel.threads.create({
                            name: `${title} - ${nickname}`,
                            message: {
                                content:
                                    '**כותרת השאלה:**\n' +
                                    `${title}\n\n` +
                                    '**פירוט השאלה:**\n' +
                                    `${question}\n\n\n` +
                                    `_(נשאל על ידי ${collectorInteraction.user})_`
                            },
                            appliedTags: [tag.id],
                        });

                        await post.lastMessage?.pin();
                        await post.lastMessage?.delete(); // deletes the 'pinned a message' message

                        await post.send('הפוסט פורסם!\nברגע שצוות השרת יאשר את הפוסט, הבוט יתייג את העוזרים המתאימיים.');

                        await post.members.add(user.id);

                        await modalInteraction.editReply({ content: `השאלה נשלחה!\nניתן לצפות בפוסט שנפתח:\n\n <#${post.id}>`, components: [] });
                        addCooldown(user.id);

                        await addPost({
                            channelId: post.id,
                            type: Object.keys(forumSupportLabels).find(key => forumSupportLabels[key as SupportType] === tag.name) as SupportType,
                            approved: false,
                            authorId: user.id,
                            question,
                            title,
                        });
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