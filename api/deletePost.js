import mongoose from 'mongoose';
import { connectToDatabase } from '../utils/db'; // Your connection utility

// Define the schema for the post
const postSchema = new mongoose.Schema({
    message: String,
    timestamp: Date,
    username: String,
    sessionId: String,
});

// Create the model for posts
const Post = mongoose.model('Post', postSchema);

// Serverless API handler for handling different request types
export default async function handler(req, res) {
    await connectToDatabase(); // Ensure you're connected to the database

    if (req.method === 'DELETE') {
        try {
            const { postId, username, sessionId } = req.body;
            
            // Check that the required fields are present
            if (!postId || !username || !sessionId) {
                return res.status(400).json({ message: 'Missing required fields: postId, username, sessionId' });
            }

            // Find the post to delete
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            // Ensure the post belongs to the user making the request
            if (post.username !== username) {
                return res.status(403).json({ message: 'You can only delete your own posts' });
            }

            // Delete the post from the database
            await post.deleteOne();
            res.status(200).json({ message: 'Post deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error deleting post', error });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

