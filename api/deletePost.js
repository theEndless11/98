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

    if (req.method === 'GET') {
        try {
            // Define threshold for posts within the last 1 hour
            const thresholdTime = 60 * 60 * 1000; // 1 hour in milliseconds
            const currentTime = Date.now(); // Get current time in milliseconds

            // Fetch posts from the database, sorted by timestamp, and filter by the last hour
            const posts = await Post.find({
                timestamp: { $gte: new Date(currentTime - thresholdTime) }
            }).sort({ timestamp: -1 });

            res.status(200).json(posts); // Send posts as a JSON response
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error retrieving posts', error });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { postId, username, sessionId } = req.body;
            
            // Delete post if it exists and belongs to the user making the request
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
            
            if (post.username !== username) {
                return res.status(403).json({ message: 'You can only delete your own posts' });
            }

            await post.deleteOne();  // Delete the post from the database
            res.status(200).json({ message: 'Post deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error deleting post', error });
        }
    } else {
        // If the request method is not supported
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
