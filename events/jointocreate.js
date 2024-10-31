const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');
const { token } = require('../config/config.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

// The ID of the base "Join to Create" voice channel
const joinToCreateChannelId = '1301065805844447252';
const createdChannels = new Map(); // Keep track of created channels

client.on('voiceStateUpdate', async (oldState, newState) => {
    const guild = newState.guild;

    // User joins the "Join to Create" channel
    if (newState.channelId === joinToCreateChannelId && !createdChannels.has(newState.id)) {
        // Create a new temporary voice channel for the user
        const channelName = `${newState.member.user.username}'s Room`;
        const newChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: newState.channel.parent, // Optional: Set the same category as the base channel
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.Connect],
                },
                {
                    id: newState.id,
                    allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ManageChannels],
                },
            ],
        });

        // Move the user to the new channel
        await newState.setChannel(newChannel);

        // Track the created channel
        createdChannels.set(newState.id, newChannel.id);
    }

    // Check if the user left a temporary created channel
    if (oldState.channelId && createdChannels.has(oldState.id)) {
        const createdChannelId = createdChannels.get(oldState.id);
        const createdChannel = guild.channels.cache.get(createdChannelId);

        // If the channel is empty, delete it
        if (createdChannel && createdChannel.members.size === 0) {
            createdChannels.delete(oldState.id);
            await createdChannel.delete();
        }
    }
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(token);
