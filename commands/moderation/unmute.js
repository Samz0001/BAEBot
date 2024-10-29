const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmutes a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to unmute')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const target = interaction.options.getMember('target');

    if (!interaction.member.permissions.has('MUTE_MEMBERS')) {
      return interaction.reply("You don't have permission to unmute members!");
    }

    const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
    
    
    if (!muteRole) {
      return interaction.reply("The 'Muted' role does not exist in this server.");
    }

    if (!target.roles.cache.has(muteRole.id)) {
      return interaction.reply(`${target.user.tag} is not muted.`);
    }

    await target.roles.remove(muteRole);
    
    await interaction.reply(`${target.user.tag} has been unmuted.`);
  }
};
