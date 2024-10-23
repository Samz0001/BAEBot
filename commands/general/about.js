const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Provides links to Bharat Ascend Esports socials'),
  
  async execute(interaction) {
    const message = `
**Bharat Ascend Esports - Socials:**
Website: [bharatascendesports.com](https://bharatascendesports.com/)
Steam Group: [BAE2024](https://steamcommunity.com/groups/BAE2024)
X (Twitter): [@BharatAscend](https://x.com/BharatAscend)
Instagram: [bharatascendesports](https://www.instagram.com/bharatascendesports/)
LinkedIn: [Bharat Ascend Esports](https://www.linkedin.com/company/bharat-ascend-esports)
Facebook: [Bharat Ascend Esports](https://www.facebook.com/people/Bharat-Ascend-Esports/61564648351353/)
    `;
    
    await interaction.reply(message);
  }
};
