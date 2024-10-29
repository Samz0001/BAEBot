const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');  // For making API requests

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Generates a random meme')
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('The topic of the meme (esports, gaming, general)')
        .setRequired(false)
        .addChoices(
          { name: 'Esports', value: 'esports' },
          { name: 'Gaming', value: 'gaming' },
          { name: 'General', value: 'general' }
        )
    ),

  async execute(interaction) {
    // Get the chosen topic from the command input (default to "general")
    const topic = interaction.options.getString('topic') || 'general';

    let subreddit;
    
    // Assign subreddit based on the selected topic
    if (topic === 'esports') {
      subreddit = 'esports';
    } else if (topic === 'gaming') {
      subreddit = 'gamingmemes';
    } else {
      subreddit = 'memes';  // Default subreddit
    }

    // Make a request to the Reddit API (or an alternative API like MemeAPI)
    try {
      const response = await axios.get(`https://www.reddit.com/r/${subreddit}/random/.json`);
      const [postData] = response.data;

      const post = postData.data.children[0].data;

      // Create an embed to show the meme
      const embed = new EmbedBuilder()
        .setTitle(post.title)
        .setImage(post.url)
        .setURL(`https://reddit.com${post.permalink}`)
        .setFooter({ text: `From r/${subreddit}` });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error fetching meme:', error);
      await interaction.reply('Oops! Could not fetch a meme. Try again later.');
    }
  }
};
