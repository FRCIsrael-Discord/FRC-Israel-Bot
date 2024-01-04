import { Message } from "discord.js";
import { ICommand } from "../../utils/interfaces/ICommand";
import { IBot } from "../../utils/interfaces/IBot";
import { getTimeLeft } from "../../utils/support";
import { EmbedBuilder } from "@discordjs/builders";
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
            return await message.reply(`You can ping for help again in ${Math.ceil(cooldown / 1000)} seconds!`);
        } else {
            const reference = await message.fetchReference();
            if (!reference) {
                return await message.reply("You must reply to your question to ping for help!");
            } else {
                const { author, content, channel } = reference;
                const roleId = getSupportSetting(supportType)!.roleId;
                const embed = new EmbedBuilder()
                    .setTitle("Support Request")
                    .setDescription(`**User:** ${author}\n**Question:** ${content}`)
                    .setFooter({
                        text: `Requested by ${message.author.tag}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setTimestamp();
                await channel.send({ content: `<@&${roleId}>`, embeds: [embed] });
            }
        }
    },
} as ICommand;