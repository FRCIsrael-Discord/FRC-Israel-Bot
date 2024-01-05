import { EmbedBuilder, Message } from "discord.js";
import { ICommand } from "../../utils/interfaces/ICommand";
import { IBot } from "../../utils/interfaces/IBot";
import { getTimeLeft, addCooldown } from "../../utils/support";
import { getSupportRoleByChannelId, getSupportSetting } from "../../utils/config";
import { SupportType } from "../../utils/types/support";

module.exports = {
    category: "Support",
    name: "helpme",
    permissions: ['SendMessages'],
    botPermissions: ['SendMessages', 'EmbedLinks'],
    execute: async (bot: IBot, message: Message) => {
        const channelId = message.channelId;
        const supportType: SupportType | undefined = getSupportRoleByChannelId(channelId);
        if (!supportType) {
            return await message.reply("צ'אנל זה הוא לא צ'אנל של עזרה!");
        }

        const cooldown = getTimeLeft(message.author.id);
        if (cooldown > 0) {
            const minutes = Math.floor(cooldown / 60000);
            const seconds = ((cooldown % 60000) / 1000).toFixed(0);
            return await message.reply(`את/ה יכול/ה לפנות לעזרה שוב בעוד ${minutes}:${seconds.padStart(2, '0')} דקות!`);
        } else {
            if (!message.reference) {
                return await message.reply("עליך לשלוח את פקודה זו בתגובה לשאלה שלך!");
            } else {
                const reference = await message.fetchReference();
                const { author, content, channel } = reference;
                if (author.id !== message.author.id) {
                    return await message.reply("הודעה זו לא נשלחה על ידך.\nעליך לשלוח את פקודה זו בתגובה לשאלה שלך!");
                }

                const roleId = getSupportSetting(supportType)!.roleId;
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