const axios = require('axios');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token, youtubeApiKey, youtubeChannelId, discordChannelId } = require('../config/config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Variables to track the last notified video, live stream, and live stream status
let lastNotifiedVideoId = null; // Last notified video ID to avoid duplicate uploads
let lastNotifiedLiveId = null; // Last notified live stream ID to avoid duplicate live notifications
let activeLiveVideoId = null; // Active live video ID to identify ongoing live streams
let liveStreamActive = false; // Flag to track if a live stream is currently active
let channelName = null; // YouTube channel name
let channelLogoUrl = null; // YouTube channel logo URL
let discordChannelUnavailable = false; // Flag to log missing Discord channel only once

// Fetch the channel details to dynamically set the name and logo
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
            channelLogoUrl = channel.snippet.thumbnails.default.url;
        } else {
            console.error('Channel not found.');
        }
    } catch (error) {
        console.error('Error fetching channel details:', error.message);
    }
}

// Check if a video was published within the last 24 hours
function isRecent(publishedAt) {
    const videoDate = new Date(publishedAt);
    const currentDate = new Date();
    const timeDifference = currentDate - videoDate;
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return timeDifference <= oneDay;
}

// Check YouTube channel for new videos and live streams
async function checkYouTubeNotifications() {
    try {
        // Fetch the latest videos from the YouTube channel
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

        // Log a message if no items were found in the API response
        if (!items || items.length === 0) {
            console.log('No videos found in the YouTube API response.');
            return;
        }

        // Get the specified Discord channel to post notifications
        const channel = client.channels.cache.get(discordChannelId);
        if (!channel && !discordChannelUnavailable) {
            console.error('Specified Discord channel not found.');
            discordChannelUnavailable = true; // Log only once if the channel is missing
            return;
        }

        // Loop through each item returned by the YouTube API
        for (const item of items) {
            const videoId = item.id.videoId;
            if (!videoId) continue; // Skip items without a videoId (e.g., channels or playlists)

            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const isLive = item.snippet.liveBroadcastContent === 'live';

            // Set up the embed with the video thumbnail, title, and additional info
            const embed = new EmbedBuilder()
                .setAuthor({ name: channelName, iconURL: channelLogoUrl })
                .setThumbnail(item.snippet.thumbnails.default.url)
                .setImage(item.snippet.thumbnails.high.url)
                .setColor('#FF0000')
                .setTimestamp();

            // Send notification if a live stream is currently active and recent
            if (isLive && videoId !== lastNotifiedLiveId && isRecent(item.snippet.publishedAt)) {
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

            // Notify for regular video uploads, excluding live videos
            if (!isLive && videoId !== lastNotifiedVideoId && videoId !== activeLiveVideoId) {
                // Send upload notification only if there is no ongoing live stream
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

        // Reset live stream status if no live stream is active in the current check
        if (!items.some(item => item.snippet.liveBroadcastContent === 'live')) {
            liveStreamActive = false;
            activeLiveVideoId = null;
            lastNotifiedLiveId = null;
        }
    } catch (error) {
        console.error('Error checking YouTube notifications:', error.message);
    }
}

// Run the bot and set intervals for notifications
client.once('ready', async () => {
    await fetchChannelDetails(); // Fetch channel details on bot start
    checkYouTubeNotifications(); // Run immediately on start for uploads and live streams
    setInterval(checkYouTubeNotifications, 5 * 60 * 1000); // Check every 5 minutes
});

// Close the bot connection gracefully on exit
process.on('SIGINT', () => {
    client.destroy();
    console.log('Bot connection closed gracefully.');
});

client.login(token);