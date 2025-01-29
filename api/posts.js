import mongoose from 'mongoose';
import { connectToDatabase } from '../utils/db'; // Your connection utility

// Define the schema for the post
const postSchema = new mongoose.Schema({
    message: String,
    timestamp: { type: Date, default: Date.now },  // Default to current date/time
    username: String,
    sessionId: String,
});

// Create the model for posts
const Post = mongoose.model('Post', postSchema);

// Serverless API handler for getting posts
export default async function handler(req, res) {
    // Handle GET requests to fetch posts
    if (req.method === 'GET') {
        try {
            await connectToDatabase(); // Connect to MongoDB

            // Fetch posts from the database, sorted by the timestamp in descending order
            const posts = await Post.find().sort({ timestamp: -1 });
            res.status(200).json(posts); // Send posts as a JSON response
        } catch (error) {
            console.error("Error retrieving posts:", error);
            res.status(500).json({ message: 'Error retrieving posts', error }); // Handle any errors
        }
    } else {
        // If the request is not a GET request, respond with 405 Method Not Allowed
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
