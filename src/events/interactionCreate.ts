import { CacheType, Events, GuildMember, Interaction, TextChannel } from 'discord.js';
import { Bot, Event, SlashCommand } from '../lib/interfaces/discord';
import { logError } from '../utils/logger';

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    execute: async (bot: Bot, interaction: Interaction<CacheType>, ...args: any) => {
        const { slashCommands, buttons, modals, owners, client } = bot;
        const { guild } = interaction;
        const channel = interaction.channel as TextChannel;
        if (interaction.isCommand()) {
            const member = interaction.member as GuildMember;
            if (!interaction.inGuild()) return interaction.reply('This command can only be used in a server!');

            const slashCommand: SlashCommand | undefined = slashCommands.get(interaction.commandName);
            if (!slashCommand) return await interaction.editReply('This command does not exist!');

            await interaction.deferReply({ ephemeral: slashCommand.ephemeral || false }).catch((err: Error) => {
                logError(err.message);
            });

            if (slashCommand.devOnly && !owners.includes(member.id)) {
                return await interaction.editReply('This command is only for developers!');
            }

            if (slashCommand.permissions && !channel.permissionsFor(member).has(slashCommand.permissions)) {
                const missingPerms = channel.permissionsFor(member).missing(slashCommand.permissions!)
                return await interaction.editReply(`You don't have permission to use this command!\nMissing permissions: ${missingPerms?.join(', ')}`);
            }

            if (slashCommand.botPermissions && !channel?.permissionsFor(client.user!)?.has(slashCommand.botPermissions)) {
                const missingPerms = channel?.permissionsFor(client.user!)?.missing(slashCommand.botPermissions)
                return await interaction.editReply(`I don't have the required permissions to use this command!\nMissing permissions: ${missingPerms?.join(', ')}`);
            }

            await slashCommand.execute(bot, interaction).catch((err: Error) => {
                logError(err.message);
            });
        } else if (interaction.isButton()) {
            const button = buttons.get(interaction.customId);
            if (button?.deferReply) {
                await interaction.deferReply({ ephemeral: button?.ephemeral || false }).catch((err: Error) => {
                    logError(err.message);
                });
            }

            if (!button) {
                if (interaction.deferred) return await interaction.editReply('This button does not exist!');
                return await interaction.reply('This button does not exist!');
            }

            await button.execute(bot, interaction).catch((err: Error) => {
                logError(err.message);
            });
        } else if (interaction.isModalSubmit()) {
            const modal = modals.get(interaction.customId);
            if (!modal) return;

            if (modal?.deferReply) {
                await interaction.deferReply({ ephemeral: modal?.ephemeral || false }).catch((err: Error) => {
                    logError(err.message);
                });
            }

            await modal.execute(bot, interaction).catch((err: Error) => {
                logError(err.message);
            });
        }
    }
} as Event