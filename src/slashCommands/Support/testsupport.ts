import { ApplicationCommand, ApplicationCommandOptionType, CommandInteraction } from "discord.js"
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { logError } from "../../utils/logger";
import { SupportSetting, SupportType } from "../../utils/types/support";
import { setSupportForum, setSupportSetting } from "../../utils/config";
import { channel } from "diagnostics_channel";

module.exports = {
    name: "testsupport",
    category: "Config Manager",
    ephemeral: true,
    description: "Configure support settings",
    permissions: ['ManageGuild'],
    botPermissions: ['SendMessages'],
    options: [
        {
            name: 'channel',
            description: "The support channel to set",
            type: ApplicationCommandOptionType.Channel,
            required: true,
        },
        {
            name: 'role',
            description: "The support role to set",
            type: ApplicationCommandOptionType.Role,
            required: true,
        }
    ],
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const { options } = interaction;
        const channel = options.getChannel('channel', true);
        const role = options.getRole('role', true);

        try {
            setSupportForum(channel.id);
            setSupportSetting('community', {
                channelId: channel.id,
                roleId: role.id
            });
        } catch (err) {
            logError(err);
            return await interaction.editReply({ content: "An error occurred while updating support settings!" });
        }

        await interaction.editReply({ content: `Support settings for ALL have been updated!\nRole: ${role}\nChannel: ${channel}` });
    }
} as ISlashCommand;