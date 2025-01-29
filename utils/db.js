import mongoose from 'mongoose';

let isConnected = false; // Track the connection state

/**
 * Connect to MongoDB
 */
export async function connectToDatabase() {
    if (isConnected) {
        console.log("Already connected to MongoDB");
        return; // If already connected, return early
    }

    try {
        // Connect to MongoDB using the URI in environment variables
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = true; // Set the connection state to true after successful connection
        console.log("MongoDB connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new Error('Failed to connect to database');
    }
}
