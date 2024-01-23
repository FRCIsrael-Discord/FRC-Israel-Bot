import { CommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import { Bot, SlashCommand } from "../../lib/types/discord";
import { getSupportForum, getSupportLogsChannelId, getSupportRole } from "../../config/config";
import { getPost } from "../../lib/database/support/posts";
import { approvePost } from "../../lib/support/posts";
import { forumSupportLabels } from "../../lib/types/support";

module.exports = {
    name: 'approve',
    category: 'Support',
    ephemeral: true,
    description: 'Approve a support request and pings the matching support role',
    botPermissions: ['SendMessages'],

    execute: async (bot: Bot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        const { guild, channel } = interaction;

        const supportChannelId = getSupportForum();
        if (!supportChannelId) {
            return await interaction.editReply({ content: 'Support forum channel is not configured!' });
        }
        if (!channel?.isThread() || channel.parentId !== supportChannelId) {
            return await interaction.editReply({ content: 'This command can only be used in a support thread!' });
        }

        const post = await getPost(channel.id);
        if (!post) {
            return await interaction.editReply({ content: 'This thread doesn\'t exists in the database!\n\nProbably an old thread before the ping update.\nPlease contact the server owner.' });
        }
        if (post.approved) {
            return await interaction.editReply({ content: 'This thread is already approved!' });
        }

        const supportRole = getSupportRole(post.type);
        if (!supportRole) {
            return await interaction.editReply({ content: 'Support role is not configured!' });
        }

        const author = await guild!.members.fetch(post.authorId);
        const firstMessage = await channel.fetchStarterMessage();

        await firstMessage!.reply({ content: `<@&${supportRole}>\nשאלה זאת אושרה על ידי הצוות!` });
        await author.send({ content: `**השאלה שלך בנושא "${post.title}" אושרה על ידי הצוות!**\nהאנשים המתאימים תוייגו ויענו לך בהמשך.\n\nניתן לצפות בשאלה כאן:\n<#${channel.id}>` });

        await approvePost(post);
        await interaction.editReply({ content: 'Approved!' });

        const logsChannelId = getSupportLogsChannelId();
        const logsChannel = (await guild!.channels.fetch()).find(channel => channel!.id === logsChannelId)! as TextChannel;
        await logsChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Support Request Approved')
                    .setDescription(`**Author:** <@${post.authorId}>\n**Approved by:** ${interaction.user}\n**Post:** ${channel}\n**Type:** ${forumSupportLabels[post.type]}`)
                    .setColor('Random')
                    .setTimestamp()
            ]
        });
    }

} as SlashCommand;