import { ApplicationCommand, ApplicationCommandOptionType, CommandInteraction } from "discord.js"
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";
import { logError } from "../../utils/logger";
import { SupportSetting, SupportType } from "../../utils/types/support";
import { setSupportSetting } from "../../utils/config";

module.exports = {
    name: "support",
    category: "Config Manager",
    ephemeral: true,
    description: "Configure support settings",
    permissions: ['ManageGuild'],
    botPermissions: ['SendMessages'],
    options: [
        {
            name: 'type',
            description: "The type of support to configure",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: "programming",
                    value: "programming"
                },
                {
                    name: "media",
                    value: "media"
                },
                {
                    name: "modeling",
                    value: "modeling"
                },
                {
                    name: "electronics",
                    value: "electronics"
                },
                {
                    name: "strategy",
                    value: "strategy"
                },
                {
                    name: "community",
                    value: "community"
                },
                {
                    name: "pr",
                    value: "pr"
                }
            ]
        },
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
        const type = options.getString('type', true) as SupportType;
        const role = options.getRole('role', true);

        if (!role.mentionable) {
            return await interaction.editReply({ content: "The role you provided is not mentionable!" });
        }


        try {
            setSupportSetting(type, {
                channelId: channel.id,
                roleId: role.id
            });
        } catch (err) {
            logError(err);
            return await interaction.editReply({ content: "An error occurred while updating support settings!" });
        }

        await interaction.editReply({ content: `Support settings for ${type} have been updated!\nRole: ${role}\nChannel: ${channel}` });
    }
} as ISlashCommand;