import mongoose from 'mongoose';
import { connectToDatabase } from '../utils/db'; // Your connection utility

const sessionExpirationTime = 60 * 60 * 1000; // 1 hour in milliseconds

// Define the schema for the post
const postSchema = new mongoose.Schema({
    message: String,
    timestamp: Date,
    username: String,
    sessionId: String,  // Session ID that the post is associated with
});

// Create the model for posts
const Post = mongoose.model('Post', postSchema);

export default async function handler(req, res) {
    await connectToDatabase(); // Ensure you're connected to the database

    if (req.method === 'DELETE') {
        try {
            // Get the current time
            const currentTime = Date.now();

            // Find all posts with expired sessions
            const expiredPosts = await Post.find({
                timestamp: { $lte: new Date(currentTime - sessionExpirationTime) }
            });

            if (expiredPosts.length > 0) {
                // Delete expired posts
                const result = await Post.deleteMany({
                    _id: { $in: expiredPosts.map(post => post._id) }
                });

                console.log(`${result.deletedCount} expired posts deleted.`);
                res.status(200).json({ message: 'Expired posts have been deleted successfully.' });
            } else {
                res.status(200).json({ message: 'No expired posts found.' });
            }
        } catch (error) {
            console.error('Error clearing history:', error);
            res.status(500).json({ message: 'Error clearing history', error });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
