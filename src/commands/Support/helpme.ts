import { ActionRowBuilder, ChannelType, EmbedBuilder, Message, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder, StringSelectMenuBuilder, ThreadOnlyChannel } from "discord.js";
import { getSupportForum, getSupportSetting } from "../../utils/config";
import { IBot } from "../../utils/interfaces/IBot";
import { ICommand } from "../../utils/interfaces/ICommand";
import { addCooldown, getTimeLeft } from "../../utils/support";
import { SupportType, forumSupportLabels } from "../../utils/types/support";

module.exports = {
    category: "Support",
    name: "helpme",
    permissions: ['SendMessages'],
    botPermissions: ['SendMessages', 'EmbedLinks'],
    execute: async (bot: IBot, message: Message) => {
        const { channel, author } = message;
        const supportChannelId = getSupportForum();
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

        const availableTags = forumChannel.availableTags;
        const appliedTags = availableTags.filter(tag => channel.appliedTags.includes(tag.id));

        if (appliedTags.length > 1) {
            const tooManyTagsEmbed = new EmbedBuilder()
                .setTitle('שגיאה בעת בקשת עזרה')
                .setDescription('על הפוסט להיות מוגדר תחת קטגוריה אחת בלבד.\nהקטגוריות המוגדרו כרגע עבור הפוסט:')
                .addFields(appliedTags.map(tag => (
                    { name: '\u0085', value: `${tag.name} ${tag.emoji?.name}` }
                )))
                .setColor('Red')
                .setTimestamp();
            await message.reply({ embeds: [tooManyTagsEmbed] });

            const tagChooserModel = new StringSelectMenuBuilder()
                .setCustomId('supportTagChooser')
                .setPlaceholder('בחר קטגוריה אחת בלבד')
                .addOptions(availableTags.map(tag => (
                    { label: `${tag.name} ${tag.emoji?.name}`, value: tag.name }
                )))

            const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(tagChooserModel);

            return await channel.send({ content: 'יש לבחור עבור הפוסט קטגוריה אחת בלבד!', components: [row] });
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

                const roleId = getSupportSetting(supportType)!.roleId;
                const role = await channel.guild.roles.fetch(roleId);
                role?.members.forEach(member => {
                    channel.members.add(member.id);
                });

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