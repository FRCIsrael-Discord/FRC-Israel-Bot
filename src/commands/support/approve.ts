import { CommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import { Bot, SlashCommand } from "../../lib/types/discord";
import { getSupportForum, getSupportLogsChannelId, getSupportRole } from "../../config/config";
import { getPost } from "../../lib/database/support/posts";
import { approvePost } from "../../lib/support/posts";
import { forumSupportLabels } from "../../lib/types/support";
import { editWebhookMessage, sendWebhookMessage } from "../../lib/database/support/webhook";

module.exports = {
    name: 'approve',
    category: 'Support',
    ephemeral: true,
    description: 'Approve a support request and pings the matching support role',
    botPermissions: ['SendMessages'],

    execute: async (bot: Bot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        if (!interaction.inCachedGuild()) return;
        const { member, guild, channel } = interaction;

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
        if (post.denied) {
            return await interaction.editReply({ content: 'You can\'t approve a denied thread!' });
        }
        if (post.approved) {
            return await interaction.editReply({ content: 'This thread is already approved!' });
        }

        const supportRole = getSupportRole(post.type);
        if (!supportRole) {
            return await interaction.editReply({ content: 'Support role is not configured!' });
        }

        (await channel.send({ content: `<@&${supportRole}>` })).delete(); // ghost ping the support role
        const message = await sendWebhookMessage({
            threadId: channel.id,
            content: `Loading...`,
            username: member.displayName,
            avatarURL: member.displayAvatarURL()
        });
        // edit message to include the ping
        await editWebhookMessage(message!.id, {
            threadId: channel.id,
            content: `<@&${supportRole}>`,
        });

        await approvePost(post, interaction.user.id);
        await interaction.editReply({ content: 'Approved!' });

        const logsChannelId = getSupportLogsChannelId();
        const logsChannel = (await guild!.channels.fetch()).find(channel => channel!.id === logsChannelId)! as TextChannel;
        await logsChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Support Request Approved')
                    .setDescription(`**Author:** <@${post.authorId}>\n**Approved by:** ${interaction.user}\n**Post:** ${channel}\n**Type:** ${forumSupportLabels[post.type]}`)
                    .setColor('Green')
                    .setTimestamp()
            ]
        });
    }

} as SlashCommand;