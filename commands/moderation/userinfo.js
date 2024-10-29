const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Displays information about a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to get information about')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const target = interaction.options.getMember('target');

    const embed = new EmbedBuilder()
      .setTitle(`${target.user.tag}'s Information`)
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Username', value: target.user.tag, inline: true },
        { name: 'ID', value: target.user.id, inline: true },
        { name: 'Created At', value: target.user.createdAt.toDateString(), inline: false },
        { name: 'Joined Server At', value: target.joinedAt.toDateString(), inline: false },
        { name: 'Roles', value: target.roles.cache.map(role => role.name).join(', '), inline: false }
      )
      .setColor('#00FF00')
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
