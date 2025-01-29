import mongoose from 'mongoose';
import { connectToDatabase } from '../../utils/db';

const postSchema = new mongoose.Schema({
    message: String,
    timestamp: Date,
    username: String,
    sessionId: String,
});
const Post = mongoose.model('Post', postSchema);

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            await connectToDatabase();
            const posts = await Post.find().sort({ timestamp: -1 });
            res.status(200).json(posts);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving posts', error });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
