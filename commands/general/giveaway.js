const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms'); // Import ms package for parsing durations like '10m', '2h', '1d'

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
    // Permission check for managing messages
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: "You don't have permission to organize giveaways!", ephemeral: true });
    }

    // Get command options
    const prize = interaction.options.getString('prize');
    const durationInput = interaction.options.getString('duration');
    const winnersCount = interaction.options.getInteger('winners');

    // Convert duration to milliseconds using the ms package
    const duration = ms(durationInput);
    if (!duration) {
      return interaction.reply({ content: 'Invalid duration format. Use something like 10m, 2h, or 1d.', ephemeral: true });
    }

    const endDate = new Date(Date.now() + duration);

    // Create and send the giveaway embed
    const embed = new EmbedBuilder()
      .setTitle('🎉 Giveaway 🎉')
      .setDescription(`Prize: **${prize}**\nReact with 🎉 to enter!\nWinners: **${winnersCount}**`)
      .setColor('#FF0000')
      .setFooter({ text: `Ends at ${endDate.toUTCString()}` })
      .setTimestamp(endDate); // Set timestamp to end date for visual cue

    const giveawayMessage = await interaction.reply({ embeds: [embed], fetchReply: true });
    await giveawayMessage.react('🎉');

    // Schedule the end of the giveaway
    setTimeout(async () => {
      const updatedMessage = await interaction.channel.messages.fetch(giveawayMessage.id);
      const reactions = updatedMessage.reactions.cache.get('🎉');

      // Fetch users who reacted with 🎉
      const users = await reactions.users.fetch();
      const entrants = users.filter(user => !user.bot).map(user => user.id);

      if (entrants.length === 0) {
        return interaction.followUp({ content: "No one participated in the giveaway!" });
      }

      // Randomly select winners
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
        .setColor('#00FF00')
        .setFooter({ text: 'Thanks for participating!' })
        .setTimestamp();

      await interaction.followUp({ embeds: [resultEmbed] });
    }, duration);  // Duration in milliseconds
  }
};
