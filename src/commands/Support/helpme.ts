import { ActionRowBuilder, ChannelType, ComponentType, EmbedBuilder, GuildForumTagEmoji, Message, MessageActionRowComponentBuilder, StringSelectMenuBuilder } from "discord.js";
import { getSupportForum, getSupportRole } from "../../utils/config";
import { IBot } from "../../utils/interfaces/IBot";
import { ICommand } from "../../utils/interfaces/ICommand";
import { addCooldown, getTimeLeft } from "../../utils/support";
import { SupportType, forumSupportLabels } from "../../utils/types/support";

function getEmoji(emoji: GuildForumTagEmoji) {
    if (emoji.id === null) return emoji.name;
    return `<:${emoji.name}:${emoji.id}>`;
}

module.exports = {
    category: "Support",
    name: "helpme",
    permissions: ['SendMessages'],
    botPermissions: ['SendMessages', 'EmbedLinks'],
    execute: async (bot: IBot, message: Message) => {
        const { channel, author } = message;
        const supportChannelId = getSupportForum();
        if (!supportChannelId) {
            return await message.reply("לא הוגדר צ'אנל פורום!\nיש לפנות לצוות השרת בנושא זה.");
        }
        if (!channel.isThread()) {
            return await message.reply("ניתן לבקש עזרה רק בצ'אנל מסוג פורום!")
        }
        if (channel.parent!.type !== ChannelType.GuildForum) {
            return await message.reply("ניתן לבקש עזרה רק בצ'אנל מסוג פורום!")
        }

        const forumChannel = channel.parent!;
        if (forumChannel.id !== supportChannelId) {
            return await message.reply(`ניתן לבקש עזרה רק על שאלות בצ'אנל <#${supportChannelId}>!`);
        }

        if (message.author.id !== channel.ownerId) {
            return await message.reply("רק הכותב/ת של הפוסט יכול/ה לבקש עזרה!");
        }

        const availableTags = forumChannel.availableTags;
        const appliedTags = availableTags.filter(tag => channel.appliedTags.includes(tag.id));

        if (appliedTags.length > 1) {

            const tooManyTagsEmbed = new EmbedBuilder()
                .setTitle('שגיאה בעת בקשת עזרה')
                .setDescription('על הפוסט להיות מוגדר תחת קטגוריה אחת בלבד.\nהקטגוריות המוגדרות כרגע עבור הפוסט:')
                .addFields(appliedTags.map(tag => (
                    { name: '\u0085', value: `${tag.name} ${getEmoji(tag.emoji!)}` }
                )))
                .setColor('Red')
                .setTimestamp();

            const tagChooserModel = new StringSelectMenuBuilder()
                .setCustomId('supportTagChooserModal')
                .setPlaceholder('בחר קטגוריה')
                .addOptions(availableTags.map(tag => (
                    { label: `${tag.name}`, value: tag.name }
                )))

            const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(tagChooserModel);
            const reply = await message.reply({ embeds: [tooManyTagsEmbed], components: [row] });

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: (interaction) => {
                    if (interaction.customId !== 'supportTagChooserModal') return false;
                    if (interaction.user.id !== message.author.id) {
                        interaction.reply({ content: 'רק כותב/ת של הפוסט יכול/ה לבחור קטגוריה!', ephemeral: true });
                        return false;
                    }
                    return true;
                }
                ,
            });

            collector.on('collect', async interaction => {
                const tag = availableTags.find(tag => tag.name === interaction.values[0]);
                if (!tag) return;

                channel.setAppliedTags([tag.id]);
                await interaction.reply({ content: `הקטגוריה ${tag.name} נבחרה בהצלחה!\nכעת ניתן לבקש עזרה על ידי שליחת הפקודה בתגובה לשאלה שלך.` });
            });
            return;

        }

        const supportType = Object.keys(forumSupportLabels).find(key => forumSupportLabels[key] == appliedTags[0].name) as SupportType | undefined;
        if (!supportType) {
            return await message.reply(`לא ניתן לבקש עזרה מסוג ${appliedTags[0]}!\nניתן לבקש עזרה רק מסוגים הבאים: ${Object.values(forumSupportLabels).join(', ')}`);
        }

        const cooldown = getTimeLeft(author.id);
        if (cooldown > 0) {
            const minutes = Math.floor(cooldown / 60000);
            const seconds = ((cooldown % 60000) / 1000).toFixed(0);
            return await message.reply(`את/ה יכול/ה לפנות לעזרה שוב בעוד ${minutes}:${seconds.padStart(2, '0')} דקות!`);
        } else {
            if (!message.reference) {
                return await message.reply("עליך לשלוח את פקודה זו בתגובה לשאלה שלך!");
            } else {
                const reference = await message.fetchReference();
                const { author, content } = reference;
                if (author.id !== message.author.id) {
                    return await message.reply("הודעה זו לא נשלחה על ידך.\nעליך לשלוח את פקודה זו בתגובה לשאלה שלך!");
                }

                const roleId = getSupportRole(supportType)!;
                if (!roleId) return await message.reply(`לא הוגדר רול תמיכה עבור ${forumSupportLabels[supportType]}!\nיש לפנות לצוות השרת בנושא זה.`);
                const role = await channel.guild.roles.fetch(roleId);
                if (!role) return await message.reply(`רול התמיכה עבור ${forumSupportLabels[supportType]} לא נמצא בשרת!\nיש לפנות לצוות השרת בנושא זה.`);

                const embed = new EmbedBuilder()
                    .setTitle("בקשת עזרה")
                    .setDescription(`**נשאל על ידי:** ${author}\n**השאלה:** ${content}`)
                    .setFooter({
                        text: `Requested by ${message.author.tag}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setColor('Random')
                    .setTimestamp();
                await channel.send({ content: `<@&${roleId}>`, embeds: [embed] });
                addCooldown(message.author.id);
            }
        }
    },
} as ICommand;