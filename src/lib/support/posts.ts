import { getPost, updatePost } from "../database/support/posts";

export async function isPostApproved(channelId: string) {
    const post = await getPost(channelId);
    if (!post) return false;

    return post.approved;
}

export async function approvePost(channelId: string) {
    const post = await getPost(channelId);
    if (!post) return false;

    post.approved = true;
    await updatePost(post);

    return true;
}