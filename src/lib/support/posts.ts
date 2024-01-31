import { getPost, updatePost } from "../database/support/posts";
import { SupportPost } from "../types/support/post";

export async function isPostApproved(channelId: string) {
    const post = await getPost(channelId);
    if (!post) return false;

    return post.approved;
}

export async function approvePost(post: SupportPost, approvedBy: string) {
    post.approved = true;
    post.approvedBy = approvedBy;
    await updatePost(post);

    return true;
}

export async function denyPost(post: SupportPost, deniedBy: string) {
    post.denied = true;
    post.deniedBy = deniedBy;
    await updatePost(post);

    return true;
}