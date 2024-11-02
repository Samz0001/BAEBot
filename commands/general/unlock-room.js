const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock-room')
        .setDescription('Unlocks your current voice channel for a specific role')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), 
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        const roleId = '878856351747551244'; 

        if (!voiceChannel) {
            return interaction.reply({ content: 'You must be in a voice channel to use this command.', ephemeral: true });
        }

        try {
            await voiceChannel.permissionOverwrites.edit(roleId, { 
                Connect: true 
            });

            await interaction.reply({ content: `🔓 The channel ${voiceChannel.name} is now unlocked for the specified role.`, ephemeral: true });
        } catch (error) {
            console.error(`Error unlocking room: ${error}`);
            await interaction.reply({ content: 'An error occurred while unlocking the room.', ephemeral: true });
        }
    },
};
