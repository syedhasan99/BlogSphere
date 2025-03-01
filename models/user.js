import { connect, Schema, model } from "mongoose";

connect('mongodb://127.0.0.1:27017/basicBlog');

const userSchema = new Schema({
    name: String,
    email: String,
    password: String
})

export const User = model('User', userSchema);