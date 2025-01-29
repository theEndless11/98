import { connectToDatabase } from './utils/db';
import mongoose from 'mongoose';
import { publishToAbly } from './utils/ably';

const postSchema = new mongoose.Schema({
    message: String,
    timestamp: Date,
    username: String,
    sessionId: String,
});
const Post = mongoose.model('Post', postSchema);

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { id } = req.query; // Get the post ID from the URL
        const { username, sessionId } = req.body;

        try {
            await connectToDatabase();
            const post = await Post.findById(id); // Find the post by ID

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            // Ensure the user is allowed to delete this post (check username and sessionId)
            if (post.username !== username || post.sessionId !== sessionId) {
                return res.status(403).json({ message: 'You can only delete your own posts' });
            }

            // Delete the post
            await Post.findByIdAndDelete(id);

            // Notify Ably about the deleted post (for real-time updates on other clients)
            await publishToAbly('deleteOpinion', { id });

            res.status(200).json({ message: 'Post deleted successfully' });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({
                message: 'Error deleting post',
                error: error.message,
            });
        }
    } else {
        // Only handle DELETE requests, respond with 405 for other methods
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
