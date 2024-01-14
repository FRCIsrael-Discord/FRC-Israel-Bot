import { APIMessageComponentEmoji, ActionRowBuilder, ChannelType, CommandInteraction, ComponentType, EmbedBuilder, GuildForumTagEmoji, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { getSupportForum, getSupportRole } from "../../utils/config";
import { forumSupportLabels } from "../../utils/types/support";
import { addCooldown, getTimeLeft } from "../../utils/support";

function getEmoji(emoji: GuildForumTagEmoji) {
    if (emoji.id === null) return emoji.name;
    return `<:${emoji.name}:${emoji.id}>`;
}

module.exports = {
    name: "helpme",
    category: "Support",
    description: "Create a support thread",
    botPermissions: ['SendMessages'],
    permissions: ['SendMessages'],
    ephemeral: true,

    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const { user } = interaction;

        const supportChannelId = getSupportForum();
        if (!supportChannelId) {
            return await interaction.editReply("לא הוגדר צ'אנל פורום!\nיש לפנות לצוות השרת בנושא זה.");
        }
        const supportChannel = interaction.guild!.channels.cache.get(supportChannelId)!;
        if (supportChannel.type !== ChannelType.GuildForum) {
            return await interaction.editReply("ניתן לבקש עזרה רק בצ'אנל מסוג פורום!")
        }

        const cooldown = getTimeLeft(user.id);
        if (cooldown > 0) {
            const minutes = Math.floor(cooldown / 60000);
            const seconds = ((cooldown % 60000) / 1000).toFixed(0);
            return await interaction.editReply(`את/ה יכול/ה לפנות לעזרה שוב בעוד ${minutes}:${seconds.padStart(2, '0')} דקות!`);
        }


        const tagChooserModel = new StringSelectMenuBuilder()
            .setCustomId('supportTagChooserModal')
            .setPlaceholder('בחר/י קטגוריה')
            .addOptions(supportChannel.availableTags.map(tag => (
                { label: `${tag.name}`, value: tag.name, emoji: { name: tag.emoji!.name, id: tag.emoji!.id, animated: false } as APIMessageComponentEmoji }
            )))

        const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(tagChooserModel);
        const reply = await interaction.editReply({ components: [row] });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.customId === 'supportTagChooserModal' && i.user.id === user.id,
        });

        collector.on('collect', async interaction => {
            try {

                const tag = supportChannel.availableTags.find(tag => tag.name === interaction.values[0]);
                if (!tag) return;

                const supportRole = getSupportRole(Object.keys(forumSupportLabels).find(key => forumSupportLabels[key] === tag.name) as keyof typeof forumSupportLabels);
                if (!supportRole) {
                    await interaction.reply({ content: 'לא נמצא תפקיד תמיכה עבור הקטגוריה הנבחרת!', ephemeral: true });
                    return;
                }

                const modal = new ModalBuilder()
                    .setCustomId('supportThreadModal')
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

                await interaction.showModal(modal);

                interaction.awaitModalSubmit({ time: 0, filter: (i) => i.customId === 'supportThreadModal' && i.user.id === user.id })
                    .then(async modalInteraction => {
                        await modalInteraction.deferUpdate();

                        const title = modalInteraction.fields.getTextInputValue('titleInput');
                        const question = modalInteraction.fields.getTextInputValue('questionInput');

                        if (!interaction.inCachedGuild()) return;

                        const nickname = interaction.member.displayName;

                        const embed = new EmbedBuilder()
                            .setTitle("בקשת עזרה")
                            .setDescription(`**נשאל על ידי:** ${interaction.user}\n**כותרת השאלה:** ${title}\n**השאלה:** ${question}`)
                            .setFooter({
                                text: `Requested by ${interaction.user.tag}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                            .setColor('Random')
                            .setTimestamp();

                        const post = await supportChannel.threads.create({
                            name: `${title} - ${nickname}`,
                            message: {
                                content: `<@&${supportRole}>`,
                                embeds: [embed],
                            },
                            appliedTags: [tag.id],
                        });
                        await post.members.add(user.id);

                        await modalInteraction.editReply({ content: `השאלה נשלחה! ניתן לצפות בפוסט שנפתח:\n <#${post.id}>`, components: [] });
                        addCooldown(user.id);
                    }).catch(async (err) => {
                        await interaction.editReply({ content: 'הזמן להגשת השאלה נגמר!\nיש לנסות שוב.', components: [] });
                    });
            } catch (err) {
                console.log(err);
            }
        });
    }
} as ISlashCommand;