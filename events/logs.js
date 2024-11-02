// events/logs.js
const { EmbedBuilder } = require('discord.js');
const { logChannelId } = require('../config/config.json');

module.exports = (client) => {
    console.log("Logging module initialized");

    const sendLog = async (embed, guild) => {
        const logChannel = guild.channels.cache.get(logChannelId);
        if (!logChannel) return console.log("Log channel not found");
        logChannel.send({ embeds: [embed] });
    };

    client.on('messageDelete', async (message) => {
        if (message.partial) await message.fetch();

        const embed = new EmbedBuilder()
            .setTitle('🗑️ Message Deleted')
            .setColor('#FF0000')
            .setDescription(`A message was deleted in <#${message.channel.id}>`)
            .addFields(
                { name: 'Author', value: message.author?.tag || 'Unknown', inline: true },
                { name: 'Content', value: message.content || 'No content', inline: true }
            )
            .setTimestamp();

        sendLog(embed, message.guild);
    });

    client.on('messageUpdate', async (oldMessage, newMessage) => {
        if (oldMessage.partial) await oldMessage.fetch();
        if (newMessage.partial) await newMessage.fetch();
        if (oldMessage.content === newMessage.content) return;

        const embed = new EmbedBuilder()
            .setTitle('✏️ Message Edited')
            .setColor('#FFA500')
            .setDescription(`A message was edited in <#${oldMessage.channel.id}>`)
            .addFields(
                { name: 'Author', value: oldMessage.author?.tag || 'Unknown', inline: true },
                { name: 'Before', value: oldMessage.content || 'No content', inline: true },
                { name: 'After', value: newMessage.content || 'No content', inline: true }
            )
            .setTimestamp();

        sendLog(embed, oldMessage.guild);
    });

    client.on('guildMemberAdd', (member) => {
        const embed = new EmbedBuilder()
            .setTitle('👋 Member Joined')
            .setColor('#00FF00')
            .setDescription(`Welcome <@${member.id}> to the server!`)
            .setTimestamp();

        sendLog(embed, member.guild);
    });

    client.on('guildMemberRemove', (member) => {
        const embed = new EmbedBuilder()
            .setTitle('👋 Member Left')
            .setColor('#FF0000')
            .setDescription(`<@${member.id}> has left the server.`)
            .setTimestamp();

        sendLog(embed, member.guild);
    });

    client.on('guildBanAdd', (ban) => {
        const embed = new EmbedBuilder()
            .setTitle('🔨 Member Banned')
            .setColor('#FF0000')
            .setDescription(`<@${ban.user.id}> has been banned from the server.`)
            .setTimestamp();

        sendLog(embed, ban.guild);
    });

    client.on('guildBanRemove', (ban) => {
        const embed = new EmbedBuilder()
            .setTitle('🔓 Member Unbanned')
            .setColor('#00FF00')
            .setDescription(`<@${ban.user.id}> has been unbanned from the server.`)
            .setTimestamp();

        sendLog(embed, ban.guild);
    });

    client.on('channelCreate', (channel) => {
        const embed = new EmbedBuilder()
            .setTitle('📁 Channel Created')
            .setColor('#00FF00')
            .setDescription(`A new channel <#${channel.id}> was created.`)
            .setTimestamp();

        sendLog(embed, channel.guild);
    });

    client.on('channelDelete', (channel) => {
        const embed = new EmbedBuilder()
            .setTitle('🗑️ Channel Deleted')
            .setColor('#FF0000')
            .setDescription(`Channel **${channel.name}** was deleted.`)
            .setTimestamp();

        sendLog(embed, channel.guild);
    });

    client.on('roleCreate', (role) => {
        const embed = new EmbedBuilder()
            .setTitle('🎭 Role Created')
            .setColor('#00FF00')
            .setDescription(`A new role **${role.name}** was created.`)
            .setTimestamp();

        sendLog(embed, role.guild);
    });

    client.on('roleDelete', (role) => {
        const embed = new EmbedBuilder()
            .setTitle('🗑️ Role Deleted')
            .setColor('#FF0000')
            .setDescription(`Role **${role.name}** was deleted.`)
            .setTimestamp();

        sendLog(embed, role.guild);
    });

    client.on('guildMemberUpdate', (oldMember, newMember) => {
        if (oldMember.nickname !== newMember.nickname) {
            const embed = new EmbedBuilder()
                .setTitle('📝 Nickname Changed')
                .setColor('#FFA500')
                .setDescription(`<@${newMember.id}> changed their nickname.`)
                .addFields(
                    { name: 'Before', value: oldMember.nickname || 'None', inline: true },
                    { name: 'After', value: newMember.nickname || 'None', inline: true }
                )
                .setTimestamp();

            sendLog(embed, newMember.guild);
        }
    });

    client.on('voiceStateUpdate', (oldState, newState) => {
        if (!oldState.channel && newState.channel) {
            const embed = new EmbedBuilder()
                .setTitle('🔊 Voice Channel Join')
                .setColor('#00FF00')
                .setDescription(`<@${newState.id}> joined voice channel **${newState.channel.name}**.`)
                .setTimestamp();

            sendLog(embed, newState.guild);
        } else if (oldState.channel && !newState.channel) {
            const embed = new EmbedBuilder()
                .setTitle('🔇 Voice Channel Leave')
                .setColor('#FF0000')
                .setDescription(`<@${oldState.id}> left voice channel **${oldState.channel.name}**.`)
                .setTimestamp();

            sendLog(embed, oldState.guild);
        } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            const embed = new EmbedBuilder()
                .setTitle('🔄 Voice Channel Switch')
                .setColor('#FFA500')
                .setDescription(`<@${newState.id}> switched from **${oldState.channel.name}** to **${newState.channel.name}**.`)
                .setTimestamp();

            sendLog(embed, newState.guild);
        }
    });
};
