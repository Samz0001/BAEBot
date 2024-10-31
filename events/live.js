const axios = require('axios');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token, youtubeApiKey, youtubeChannelId, discordChannelId } = require('../config/config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let lastNotifiedVideoId = null; // Store the last notified video ID to prevent duplicate uploads
let lastNotifiedLiveId = null; // Store the last notified live stream ID to prevent duplicate live notifications
let activeLiveVideoId = null; // Store the active live video ID to identify ongoing streams
let liveStreamActive = false; // Flag to indicate if a live stream is currently active
let channelName = null; // Store the YouTube channel name
let channelLogoUrl = null; // Store the YouTube channel logo URL

// Fetch channel details to get the name and logo dynamically
async function fetchChannelDetails() {
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
                part: 'snippet',
                id: youtubeChannelId,
                key: youtubeApiKey,
            },
        });
        
        const channel = response.data.items[0];
        if (channel) {
            channelName = channel.snippet.title;
            channelLogoUrl = channel.snippet.thumbnails.default.url; // Get the channel logo URL
        } else {
            console.error('Channel not found.');
        }
    } catch (error) {
        console.error('Error fetching channel details:', error.message);
    }
}

// Function to check for new uploads and live streams
async function checkYouTubeNotifications() {
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                channelId: youtubeChannelId,
                key: youtubeApiKey,
                order: 'date',
                maxResults: 2,
            },
        });

        const items = response.data.items;
        if (items && items.length > 0) {
            const channel = client.channels.cache.get(discordChannelId);
            if (!channel) {
                console.error('Specified Discord channel not found.');
                return;
            }

            for (const item of items) {
                const videoId = item.id.videoId;
                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                const isLive = item.snippet.liveBroadcastContent === 'live';

                const embed = new EmbedBuilder()
                    .setAuthor({ name: channelName, iconURL: channelLogoUrl })
                    .setThumbnail(item.snippet.thumbnails.default.url)
                    .setImage(item.snippet.thumbnails.high.url)
                    .setColor('#FF0000')
                    .setTimestamp();

                // Live Stream Notification
                if (isLive && videoId !== lastNotifiedLiveId) {
                    lastNotifiedLiveId = videoId;
                    activeLiveVideoId = videoId; // Mark this video as currently live
                    liveStreamActive = true; // Set live stream active flag

                    embed
                        .setTitle(`🎉 ${channelName} is Live!`)
                        .setURL(videoUrl)
                        .setDescription(item.snippet.description || 'Join the live stream now!')
                        .setFooter({ text: `${channelName} Live Stream`, iconURL: channelLogoUrl });

                    await channel.send({ content: `@everyone ${channelName} is live at ${videoUrl}`, embeds: [embed] });
                }

                // Video Upload Notification (only if it's not the active live video)
                if (!isLive && videoId !== lastNotifiedVideoId && videoId !== activeLiveVideoId) {
                    // Ensure live stream is inactive before sending upload notification
                    if (!liveStreamActive) {
                        lastNotifiedVideoId = videoId;

                        embed
                            .setTitle(item.snippet.title)
                            .setURL(videoUrl)
                            .setDescription(`${channelName} published a new video on YouTube!`)
                            .addFields({ name: 'Description', value: item.snippet.description || 'No description provided.' })
                            .setFooter({ text: 'YouTube', iconURL: channelLogoUrl });

                        await channel.send({ content: `@everyone ${channelName} just uploaded a new video at ${videoUrl}`, embeds: [embed] });
                    }
                }
            }
        } else {
            console.log('No new live stream or video found.');

            // Reset live stream status when no live stream is found
            liveStreamActive = false;
            activeLiveVideoId = null;
            lastNotifiedLiveId = null;
        }
    } catch (error) {
        console.error('Error checking YouTube notifications:', error.message);
    }
}

// Log in and set intervals for both checks
client.once('ready', async () => {
    await fetchChannelDetails(); // Fetch the channel name and logo once when the bot starts
    checkYouTubeNotifications(); // Run immediately on start for uploads and live streams
    setInterval(checkYouTubeNotifications, 5 * 60 * 1000); // Check every 5 minutes
});

client.login(token);
