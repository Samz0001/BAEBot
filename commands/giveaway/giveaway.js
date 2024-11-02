const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');
const giveawayStore = require('../../giveawayStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Organize a giveaway with a specified duration')
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('The prize for the giveaway')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration of the giveaway (e.g., 10m, 2h, 1d)')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('winners')
        .setDescription('Number of winners')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: "You don't have permission to organize giveaways!", ephemeral: true });
    }

    const prize = interaction.options.getString('prize');
    const durationInput = interaction.options.getString('duration');
    const winnersCount = interaction.options.getInteger('winners');

    const duration = ms(durationInput);
    if (!duration) {
      return interaction.reply({ content: 'Invalid duration format. Use something like 10m, 2h, or 1d.', ephemeral: true });
    }

    const endDate = new Date(Date.now() + duration);

    const embed = new EmbedBuilder()
      .setTitle('🎉 Giveaway 🎉')
      .setDescription(`Prize: **${prize}**\nReact with 🎉 to enter!\nWinners: **${winnersCount}**`)
      .setColor('#FF0000')
      .setFooter({ text: `Ends at ${endDate.toUTCString()}` })
      .setTimestamp(endDate);

    const giveawayMessage = await interaction.reply({ embeds: [embed], fetchReply: true });
    await giveawayMessage.react('🎉');

    giveawayStore.giveaways[giveawayMessage.id] = {
      prize,
      winnersCount,
      entrants: new Set(),
      messageId: giveawayMessage.id,
      endDate
    };

    const collector = giveawayMessage.createReactionCollector({
      filter: (reaction, user) => reaction.emoji.name === '🎉' && !user.bot,
      time: duration,
    });

    collector.on('collect', (reaction, user) => {
      giveawayStore.giveaways[giveawayMessage.id].entrants.add(user.id);
      console.log(`Collected entrant: ${user.tag} (${user.id})`);
    });

    collector.on('end', async () => {
      const entrants = Array.from(giveawayStore.giveaways[giveawayMessage.id].entrants);
      console.log(`Final entrants: ${entrants}`);

      if (entrants.length === 0) {
        return interaction.followUp({ content: "No one participated in the giveaway!" });
      }

      const winners = [];
      for (let i = 0; i < winnersCount; i++) {
        if (entrants.length === 0) break;
        const randomIndex = Math.floor(Math.random() * entrants.length);
        winners.push(entrants.splice(randomIndex, 1)[0]);
      }

      const winnerMentions = winners.map(id => `<@${id}>`).join(', ');
      const resultEmbed = new EmbedBuilder()
        .setTitle('🎉 Giveaway Ended 🎉')
        .setDescription(`Prize: **${prize}**\nWinners: ${winnerMentions || 'No winners'}`)
        .setColor('FFFF00')
        .setFooter({ text: 'Thanks for participating!' })
        .setTimestamp();

      await interaction.followUp({ embeds: [resultEmbed] });
      delete giveawayStore.giveaways[giveawayMessage.id];
    });
  }
};
