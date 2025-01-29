import { connectToDatabase } from '../../utils/db';
import mongoose from 'mongoose';
import { publishToAbly } from '../../utils/ably';

const postSchema = new mongoose.Schema({
    message: String,
    timestamp: Date,
    username: String,
    sessionId: String,
});
const Post = mongoose.model('Post', postSchema);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { message, username, sessionId } = req.body;
        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }
        if (!username || !sessionId) {
            return res.status(400).json({ message: 'Username and sessionId are required' });
        }

        try {
            await connectToDatabase();
            const newPost = new Post({ message, timestamp: new Date(), username, sessionId });
            await newPost.save();

            // Publish to Ably
            await publishToAbly('newOpinion', newPost);

            res.status(201).json(newPost);
        } catch (error) {
            res.status(500).json({ message: 'Error saving post', error });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
