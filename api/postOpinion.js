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

let isDbConnected = false;

// Check if the database connection is already established to avoid redundant connections
const ensureDatabaseConnection = async () => {
    if (!isDbConnected) {
        try {
            console.log('Connecting to database...');
            await connectToDatabase();
            isDbConnected = true;
            console.log('Database connected successfully.');
        } catch (error) {
            console.error('Error connecting to the database:', error);
            throw new Error('Failed to connect to database');
        }
    }
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { message, username, sessionId } = req.body;

        // Validate input
        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }
        if (!username || !sessionId) {
            return res.status(400).json({ message: 'Username and sessionId are required' });
        }

        try {
            // Ensure database connection
            await ensureDatabaseConnection();

            // Create the new post
            const newPost = new Post({
                message,
                timestamp: new Date(),
                username,
                sessionId
            });

            // Save the post
            console.log('Saving new post...');
           const savedPost = await newPost.save();  // Ensure the post is saved properly
// Log the saved post to ensure it has the right structure
console.log('New post saved:', savedPost);

// Publish to Ably
await publishToAbly('newOpinion', savedPost);  // Send the full post to Ably

// Respond with the saved post to the client
return res.status(201).json(savedPost);


            // Respond with the saved post
            return res.status(201).json(savedPost);
        } catch (error) {
            console.error('Error saving post:', error);
            return res.status(500).json({ message: 'Error saving post', error });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}

