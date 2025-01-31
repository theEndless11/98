import mongoose from 'mongoose';
import { connectToDatabase } from '../utils/db'; // Your connection utility

// Define the schema for the post
const postSchema = new mongoose.Schema({
    message: String,
    timestamp: Date,
    username: String,
    sessionId: String,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    comments: [{ username: String, comment: String }],
});

// Create the model for posts
const Post = mongoose.model('Post', postSchema);

export default async function handler(req, res) {
    const { postId } = req.query;  // Vercel automatically parses dynamic params here
    const { username, action, comment } = req.body;

    await connectToDatabase(); // Ensure you're connected to the DB

    if (req.method === 'POST') {
        try {
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            // Handle different actions: like, dislike, comment
            if (action === 'like') {
                post.likes += 1;
            } else if (action === 'dislike') {
                post.dislikes += 1;
            } else if (action === 'comment') {
                if (!comment || !comment.trim()) {
                    return res.status(400).json({ message: 'Comment cannot be empty' });
                }
                post.comments.push({ username, comment, timestamp: new Date() });
            } else {
                return res.status(400).json({ message: 'Invalid action type' });
            }

            await post.save();
            res.json(post);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating post', error });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
