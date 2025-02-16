import Ably from 'ably';

const ably = new Ably.Realtime('jrRn0w.bxfGbA:DwW2svyt4ahbcu6ZTgEdPge_9Gx3G3DSGOo6LezEvJ4'); // Replace with your actual Ably API key

export const publishToAbly = async (channelName, data) => {
  try {
    const channel = ably.channels.get(channelName);
    await channel.publish('newOpinion', data); // Publish the message to the channel
    console.log('Message successfully published to Ably');
  } catch (error) {
    console.error('Error publishing message to Ably:', error);
    throw new Error('Failed to publish to Ably');
  }
};
