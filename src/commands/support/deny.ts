import { CommandInteraction, EmbedBuilder, TextChannel, ThreadChannel } from "discord.js";
import { Bot, SlashCommand } from "../../lib/types/discord";
import { getSupportForum, getSupportLogsChannelId, getSupportRole } from "../../config/config";
import { getPost } from "../../lib/database/support/posts";
import { approvePost, denyPost } from "../../lib/support/posts";
import { forumSupportLabels } from "../../lib/types/support";
import { editWebhookMessage, sendWebhookMessage } from "../../lib/database/support/webhook";

module.exports = {
    name: 'deny',
    category: 'Support',
    ephemeral: true,
    description: 'Deny a support request',
    botPermissions: ['SendMessages'],

    execute: async (bot: Bot, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) return;
        if (!interaction.inCachedGuild()) return;
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
            return await interaction.editReply({ content: 'You can\'t deny an approved thread!' });
        }
        if (post.denied) {
            return await interaction.editReply({ content: 'This thread is already denied!' });
        }


        const postAuthor = await guild!.members.fetch(post.authorId);


        await channel.send({ content: `השאלה נדחתה על ידי הצוות.` });
        await postAuthor.send({ content: `**השאלה שלך בנושא "${post.title}" נדחתה על ידי צוות השרת!**\n\nבמידה ואת/ה חושב/ת שזה טעות, יש לפתוח פנייה על שליחת הודעה פרטית לModMail של השרת\n(נמצא למעלה ברשימת הממברים בשרת)` });

        await interaction.editReply({ content: 'Denied!' });
        await channel.setLocked(true, 'Denied by staff');
        await channel.setArchived(true, 'Denied by staff');
        await denyPost(post, interaction.user.id);

        const logsChannelId = getSupportLogsChannelId();
        const logsChannel = (await guild!.channels.fetch()).find(channel => channel!.id === logsChannelId)! as TextChannel;
        await logsChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Support Request Denied')
                    .setDescription(`**Author:** <@${post.authorId}>\n\**Denied by:** ${interaction.user}\n**Post:** ${channel}\n**Type:** ${forumSupportLabels[post.type]}`)
                    .setColor('Red')
                    .setTimestamp()
            ]
        });
    }

} as SlashCommand;