const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mutes a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to mute')
        .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getMember('target');
    
    if (!interaction.member.permissions.has('MUTE_MEMBERS')) {
      return interaction.reply("You don't have permission to mute members!");
    }

    let muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
    if (!muteRole) {
      muteRole = await interaction.guild.roles.create({
        name: 'Muted',
        permissions: []
      });

      interaction.guild.channels.cache.forEach(channel => {
        channel.permissionOverwrites.create(muteRole, {
          SEND_MESSAGES: false,
          SPEAK: false
        });
      });
    }

    await target.roles.add(muteRole);
    await interaction.reply(`${target.user.tag} has been muted.`);
  }
};
