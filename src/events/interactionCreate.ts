import { CacheType, Client, Guild, GuildMember, Interaction, TextChannel } from "discord.js"
import { IBot } from "../utils/interfaces/IBot"
import { IEvent } from "../utils/interfaces/IEvent"
import { ISlashCommand } from "../utils/interfaces/ISlashCommand";

module.exports = {
    name: "interactionCreate",
    once: false,
    execute: async (bot: IBot, interaction: Interaction<CacheType>, ...args: any) => {
        const { slashCommands, buttons, modals, owners, client } = bot;
        const { guild } = interaction;
        const channel = interaction.channel as TextChannel;
        if (interaction.isCommand()) {
            const member = interaction.member as GuildMember;
            if (!interaction.inGuild()) return interaction.reply("This command can only be used in a server!");
    
            const slashCommand: ISlashCommand | undefined = slashCommands.get(interaction.commandName);
            if (!slashCommand) return await interaction.editReply("This command does not exist!");
    
            await interaction.deferReply({ ephemeral: slashCommand.ephemeral || false }).catch((err: Error) => {
                console.error(err);
            });
    
            if (slashCommand.devOnly && !owners.includes(member.id)) {
                return await interaction.editReply("This command is only for developers!");
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
                console.error(err);
            });
        } else if (interaction.isButton()) {
            const button = buttons.get(interaction.customId);
            if (button?.deferReply) {
                await interaction.deferReply({ ephemeral: button?.ephemeral || false }).catch((err: Error) => {
                    console.error(err);
                });
            }

            if (!button) {
                if (interaction.deferred) return await interaction.editReply("This button does not exist!");
                return await interaction.reply("This button does not exist!");
            }
        
            await button.execute(bot, interaction).catch((err: Error) => {
                console.error(err);
            });
        } else if (interaction.isModalSubmit()) {
            const modal = modals.get(interaction.customId);
            if (modal?.deferReply) {
                await interaction.deferReply({ ephemeral: modal?.ephemeral || false }).catch((err: Error) => {
                    console.error(err);
                });
            }

            if (!modal) {
                if (interaction.deferred) return await interaction.followUp("This modal does not exist!");
                return await interaction.reply("This modal does not exist!");
            }

            await modal.execute(bot, interaction).catch((err: Error) => {
                console.error(err);
            });
        }
    }
} as IEvent