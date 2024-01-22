import { SupportPost } from "../../types/support/post";
import { getDb } from "../mongo";

export async function getPost(channelId: string) {
    const collection = getCollection();
    return await collection.findOne({ channelId });
}

export async function addPost(post: SupportPost) {
    const collection = getCollection();
    collection.insertOne(post);
}

export async function updatePost(post: SupportPost) {
    const collection = getCollection();
    collection.updateOne({ channelId: post.channelId }, { $set: post });
}

function getCollection() {
    const db = getDb();
    const collection = db.collection<SupportPost>('support-posts');

    return collection;
}