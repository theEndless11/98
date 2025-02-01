import { connectToDatabase } from '../utils/db';  // Corrected path
import mongoose from 'mongoose';
import { publishToAbly } from '../utils/ably';  // Corrected path

// Define the schema for the post
const postSchema = new mongoose.Schema({
    message: String,
    timestamp: Date,
    username: String,
    sessionId: String,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: [String],  // Store usernames or user IDs of users who liked the post
    dislikedBy: [String],  // Store usernames or user IDs of users who disliked the post
    comments: [{ username: String, comment: String, timestamp: Date }]
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
            console.log('Connecting to database...');
            await connectToDatabase();  // Ensure this step completes
            console.log('Database connected successfully.');

            const newPost = new Post({ message, timestamp: new Date(), username, sessionId });
            await newPost.save();

            console.log('New post saved:', newPost);

            // Publish to Ably
            try {
                await publishToAbly('newOpinion', newPost);
                console.log('Post published to Ably:', newPost);
            } catch (error) {
                console.error('Error publishing to Ably:', error);
            }

            // Send only the necessary data (not the full Mongoose document)
            const cleanPost = {
                _id: newPost._id,
                message: newPost.message,
                timestamp: newPost.timestamp,
                username: newPost.username,
                likes: newPost.likes,
                dislikes: newPost.dislikes,
                comments: newPost.comments,
            };

            res.status(201).json(cleanPost);  // Send clean post data without Mongoose metadata
        } catch (error) {
            console.error('Error saving post:', error);
            res.status(500).json({ message: 'Error saving post', error });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

