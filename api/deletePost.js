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
            // Fetch posts from the database, sorted by the timestamp in descending order
            const posts = await Post.find().sort({ timestamp: -1 });
            res.status(200).json(posts); // Send posts as a JSON response
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error retrieving posts', error });
        }
    } else if (req.method === 'DELETE') {
        try {
            // Ensure postId, username, and sessionId are passed in the request body
            const { postId, username, sessionId } = req.body;

            if (!postId || !username || !sessionId) {
                return res.status(400).json({ message: 'Missing required fields: postId, username, sessionId' });
            }

            // Ensure postId is in valid ObjectId format
            if (!mongoose.Types.ObjectId.isValid(postId)) {
                return res.status(400).json({ message: 'Invalid postId' });
            }

            // Convert postId to a valid ObjectId if it's a valid string
            const objectId = mongoose.Types.ObjectId(postId);

            // Find the post by postId
            const post = await Post.findById(objectId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
            
            // Check if the post belongs to the user making the request
            if (post.username !== username) {
                return res.status(403).json({ message: 'You can only delete your own posts' });
            }

            // Delete the post
            await post.deleteOne();  // Delete the post from the database
            console.log(`Post with ID ${postId} deleted by ${username}`); // Add log for successful deletion

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


