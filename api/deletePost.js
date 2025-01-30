import mongoose from 'mongoose';
import { connectToDatabase } from '../utils/db'; // Your connection utility

// Define the schema for the post
const postSchema = new mongoose.Schema({
    message: String,
    timestamp: Date,
    username: String,
    sessionId: String,
});

export default async function handler(req, res) {
    await connectToDatabase(); // Ensure you're connected to the database

    if (req.method === 'DELETE') {
        try {
            const { postId, username, sessionId } = req.body;

            if (!postId || !username || !sessionId) {
                return res.status(400).json({ message: 'Missing required fields: postId, username, sessionId' });
            }

            // Ensure postId is in valid ObjectId format
            if (!mongoose.Types.ObjectId.isValid(postId)) {
                return res.status(400).json({ message: 'Invalid postId' });
            }

            // Convert postId to a valid ObjectId using the 'new' keyword
            const objectId = new mongoose.Types.ObjectId(postId);  // This is the correct way

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
            console.error('Error in deletePost API:', error);  // Log full error details
            res.status(500).json({ message: 'Error deleting post', error: error.message });
        }
    } else {
        // If the request method is not supported
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
