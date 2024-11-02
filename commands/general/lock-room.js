const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock-room')
        .setDescription('Locks your current voice channel for a specific role')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        const roleId = '878856351747551244'; // 

        if (!voiceChannel) {
            return interaction.reply({ content: 'You must be in a voice channel to use this command.', ephemeral: true });
        }

        try {
            await voiceChannel.permissionOverwrites.edit(roleId, { 
                Connect: false 
            });

            await interaction.reply({ content: `🔒 The channel ${voiceChannel.name} is now locked for the specified role.`, ephemeral: true });
        } catch (error) {
            console.error(`Error locking room: ${error}`);
            await interaction.reply({ content: 'An error occurred while locking the room.', ephemeral: true });
        }
    },
};
