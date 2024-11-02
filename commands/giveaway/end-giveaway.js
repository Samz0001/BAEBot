const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const giveawayStore = require('../../giveawayStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('end-giveaway')
    .setDescription('Ends a giveaway early and selects winners')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('The message ID of the giveaway')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');
    const giveaway = giveawayStore.giveaways[messageId];

    if (!giveaway) {
      return interaction.reply({ content: 'Giveaway not found. Make sure the message ID is correct.', ephemeral: true });
    }

    const { entrants, prize, winnersCount } = giveaway;
    console.log(`Ending giveaway. Entrants list for message ${messageId}:`, Array.from(entrants));

    if (entrants.size === 0) {
      return interaction.reply({ content: 'No participants found for this giveaway.', ephemeral: true });
    }

    const entrantsArray = Array.from(entrants);
    const winners = [];
    for (let i = 0; i < winnersCount; i++) {
      if (entrantsArray.length === 0) break;
      const randomIndex = Math.floor(Math.random() * entrantsArray.length);
      winners.push(entrantsArray.splice(randomIndex, 1)[0]);
    }

    const winnerMentions = winners.map(id => `<@${id}>`).join(', ');
    const embed = new EmbedBuilder()
      .setTitle('🎉 Giveaway Ended Early 🎉')
      .setDescription(`Prize: **${prize}**\nWinners: ${winnerMentions || 'No winners'}`)
      .setColor('FFFF00')
      .setFooter({ text: 'Thanks for participating!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    delete giveawayStore.giveaways[messageId];
  }
};
