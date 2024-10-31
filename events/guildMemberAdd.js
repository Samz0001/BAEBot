const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const welcomeChannelId = '1300707035721109524'; // Replace with your actual welcome channel ID
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
    if (!welcomeChannel) return;

    const memberCount = member.guild.memberCount;

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle(`Welcome to Bharat Ascend Esports, Enjoy Your Stay Here!`)
      .setDescription(`welcome, ${member} to BAE Family. Enjoy Your Stay!\n\n• Get your game roles in <#1300756250832670721> to access various channels.\n• Remember to read the <#1300756250832670721>.\n• [Link to server invite](https://discord.gg/qGD6fpeWb2)\n\nYou are our **${memberCount}th** member!`)
      .setImage("https://i.imgur.com/DB2tKNB.gif")
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Welcome to Bharat Ascend Esports!`, iconURL: member.guild.iconURL({ dynamic: true }) });

    await welcomeChannel.send({ embeds: [embed] });
  },
};
