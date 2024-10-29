const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')  // Changed the command name to "panel"
    .setDescription('Sets up a support ticket panel'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('🎟️ Bharat Ascend Esports - Support Panel')
      .setDescription("Welcome to Bharat Ascend Esports support!\n\nIf you need help or assistance with anything, we're here for you! Just hit the button below to open a Support Ticket and our team will assist you ASAP! 😊")
      .setFooter({ text: '🔥 Bharat Ascend Esports | Elevating the gaming experience! 🔥' })
      .setThumbnail('https://i.imgur.com/StcuzlJ.png');  // Replace with your logo URL

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('Create')
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
