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
            return await message.reply("This channel is not a support channel!");
        }

        const cooldown = getTimeLeft(message.author.id);
        if (cooldown > 0) {
            const minutes = Math.floor(cooldown / 60000);
            const seconds = ((cooldown % 60000) / 1000).toFixed(0);
            return await message.reply(`You can ping for help again in ${minutes}:${seconds.padStart(2, '0')} minutes!`);
        } else {
            if (!message.reference) {
                return await message.reply("You must reply to your question to ping for help!");
            } else {
                const reference = await message.fetchReference();
                const { author, content, channel } = reference;
                if (author.id !== message.author.id) {
                    return await message.reply("You must reply to a message sent by you!");
                }

                const roleId = getSupportSetting(supportType)!.roleId;
                const embed = new EmbedBuilder()
                    .setTitle("Support Request")
                    .setDescription(`**User:** ${author}\n**Question:** ${content}`)
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