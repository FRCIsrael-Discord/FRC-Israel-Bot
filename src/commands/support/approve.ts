import { CommandInteraction } from "discord.js";
import { Bot, SlashCommand } from "../../lib/types/discord";
import { getSupportForum } from "../../config/config";
import { getPost } from "../../lib/database/support/posts";
import { approvePost } from "../../lib/support/posts";

module.exports = {
    name: 'approve',
    category: 'Support',
    ephemeral: true,
    description: 'Approve a support request and pings the matching support role',
    botPermissions: ['SendMessages'],

    execute: async (bot: Bot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const { channel } = interaction;

        const supportChannelId = getSupportForum();
        if (!supportChannelId) {
            return await interaction.editReply({ content: 'Support forum channel is not configured!' });
        }
        if (!channel?.isThread() || channel.parentId !== supportChannelId) {
            return await interaction.editReply({ content: 'This command can only be used in a support thread!' });
        }

        const post = await getPost(channel.id);
        if (!post) {
            return await interaction.editReply({ content: 'This thread doesn\'t exists in the database!\nProbably an old thread before the ping update.\nPlease contact the server owner.' });
        }
        if (post.approved) {
            return await interaction.editReply({ content: 'This thread is already approved!' });
        }

        await approvePost(post);
        await interaction.editReply({ content: 'Approved!' });
    }

} as SlashCommand;