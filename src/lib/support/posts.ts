import { getPost, updatePost } from "../database/support/posts";
import { SupportPost } from "../types/support/post";

export async function isPostApproved(channelId: string) {
    const post = await getPost(channelId);
    if (!post) return false;

    return post.approved;
}

export async function approvePost(post: SupportPost) {
    post.approved = true;
    await updatePost(post);

    return true;
}