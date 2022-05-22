import { ApplicationCommand, CommandInteraction, GuildMember } from "discord.js"
import { IBot } from "../../utils/interfaces/IBot";
import { ISlashCommand } from "../../utils/interfaces/ISlashCommand";

module.exports = {
    name: "kickdana",
    category: "Other",
    devOnly: true,
    description: "Kick dana from voice channel",
    permissions: ["SEND_MESSAGES"],
    botPermissions: ['SEND_MESSAGES'],
    execute: async (bot: IBot, interaction: CommandInteraction) => {
        const member = interaction.member as GuildMember;
        
        if (member.voice.channel) {
            await member.voice.disconnect();
            await interaction.reply({content: "Dana has been kicked from voice channel!", ephemeral: true});
        } else {
            await interaction.reply({content: "Dana is not in voice channel!", ephemeral: true});
        }
    }
} as ISlashCommand;