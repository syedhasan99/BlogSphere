import { connect, Schema, model } from 'mongoose';

connect('mongodb://127.0.0.1:27017/basicBlog');

const postSchema = new Schema({
    title: String,
    content: String,
    image: String,
}, {
    timestamps: true
});

export const Post = model("Post", postSchema);