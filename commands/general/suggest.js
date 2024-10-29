const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion to the server')
    .addStringOption(option =>
      option.setName('suggestion')
        .setDescription('The suggestion you want to submit')
        .setRequired(true)
    ),

  async execute(interaction) {
    const suggestion = interaction.options.getString('suggestion');

    const suggestionsChannel = interaction.guild.channels.cache.find(channel => channel.name === 'suggestions');
    
    // If the channel isn't found, return an error message
    if (!suggestionsChannel) {
      return interaction.reply({
        content: 'Could not find the suggestions channel. Please contact an admin.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#FFA500') 
      .setTitle('New Suggestion')
      .setDescription(`**Suggestion:** ${suggestion}`)
      .setFooter({ text: `Suggested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    const message = await suggestionsChannel.send({ embeds: [embed] });

    await message.react('👍');
    await message.react('👎');

    await interaction.reply({
      content: 'Your suggestion has been submitted! Head over to the suggestions channel to see it.',
      ephemeral: true,
    });
  }
};
