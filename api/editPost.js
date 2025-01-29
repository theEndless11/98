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
    if (req.method === 'PUT') {
        const { id } = req.query; // Get the post ID from the URL
        const { message, username, sessionId } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }

        try {
            await connectToDatabase();
            const post = await Post.findById(id);

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            // Ensure the user is allowed to edit this post (check username and sessionId)
            if (post.username !== username || post.sessionId !== sessionId) {
                return res.status(403).json({ message: 'You can only edit your own posts' });
            }

            // Update the post
            post.message = message;
            post.timestamp = new Date();
            await post.save();

            // Publish the edited post to Ably
            await publishToAbly('editOpinion', post);

            res.status(200).json(post);
        } catch (error) {
            res.status(500).json({ message: 'Error updating post', error });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
