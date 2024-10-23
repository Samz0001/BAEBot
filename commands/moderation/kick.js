const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a user from the server')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to kick')
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getMember('target');
    
    if (!interaction.member.permissions.has('KICK_MEMBERS')) {
      return interaction.reply("You don't have permission to kick members!");
    }

    if (!target) {
      return interaction.reply('User not found!');
    }

    await target.kick();
    await interaction.reply(`${target.user.tag} has been kicked.`);
  }
};
