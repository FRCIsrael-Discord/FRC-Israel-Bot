import { CacheType, Client, Guild, GuildMember, Interaction, TextChannel } from "discord.js"
import { IBot } from "../utils/interfaces/IBot"
import { IEvent } from "../utils/interfaces/IEvent"
import { ISlashCommand } from "../utils/interfaces/ISlashCommand";

module.exports = {
    name: "interactionCreate",
    once: false,
    execute: async (bot: IBot, interaction: Interaction<CacheType>, ...args: any) => {
        const { slashCommands, owners, client } = bot;
        const { guild } = interaction;
        const channel = interaction.channel as TextChannel;
        if (!interaction.isCommand()) return;
        const member = interaction.member as GuildMember;
        if (!interaction.inGuild()) return interaction.reply("This command can only be used in a server!");
    
        const slashCommand: ISlashCommand | undefined = slashCommands.get(interaction.commandName);
        if (!slashCommand) return interaction.reply("This command does not exist!");

        if (slashCommand.devOnly && !owners.includes(member.id)) {
            return interaction.reply("This command is only for developers!");
        }
        
        if (slashCommand.permissions && !channel.permissionsFor(member).has(slashCommand.permissions)) {
            const missingPerms = channel.permissionsFor(member).missing(slashCommand.permissions!)
            return interaction.reply(`You don't have permission to use this command!\nMissing permissions: ${missingPerms?.join(', ')}`);
        }
        
        if (slashCommand.botPermissions && !channel?.permissionsFor(client.user!)?.has(slashCommand.botPermissions)) {
            const missingPerms = channel?.permissionsFor(client.user!)?.missing(slashCommand.botPermissions)
            return interaction.reply(`I don't have the required permissions to use this command!\nMissing permissions: ${missingPerms?.join(', ')}`);
        }
        
        await slashCommand.execute(bot, interaction)
    }
} as IEvent