// commands/giveaway/reroll.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const giveawayStore = require('../../giveawayStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reroll')
    .setDescription('Reroll the winners of an ongoing or ended giveaway')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('The message ID of the giveaway')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');
    console.log('Reroll command received for message ID:', messageId); // Debugging statement
    console.log('Current giveaways:', giveawayStore.giveaways); // Debugging statement
    
    const giveaway = giveawayStore.giveaways[messageId];

    if (!giveaway) {
      return interaction.reply({ content: 'Giveaway not found. Make sure the message ID is correct.', ephemeral: true });
    }

    const { entrants, prize, winnersCount } = giveaway;
    const entrantsArray = Array.from(entrants);

    if (entrantsArray.length === 0) {
      return interaction.reply({ content: 'No participants found for this giveaway.', ephemeral: true });
    }

    // Randomly select new winners
    const winners = [];
    for (let i = 0; i < winnersCount; i++) {
      if (entrantsArray.length === 0) break;
      const randomIndex = Math.floor(Math.random() * entrantsArray.length);
      winners.push(entrantsArray.splice(randomIndex, 1)[0]);
    }

    const winnerMentions = winners.map(id => `<@${id}>`).join(', ');
    const embed = new EmbedBuilder()
      .setTitle('🎉 Giveaway Reroll 🎉')
      .setDescription(`Prize: **${prize}**\nNew Winners: ${winnerMentions || 'No winners'}`)
      .setColor('FFFF00')
      .setFooter({ text: 'Thanks for participating!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
