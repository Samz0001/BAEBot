const { REST, Routes ,ActivityType} = require('discord.js');
const fs = require('fs');
const { token ,guildId,clientId} = require('../config/config.json');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}!`);

    // Set the bot's presence to "Listening to BAe"
    client.user.setPresence({
        activities: [{ name: 'BAE', type: ActivityType.Listening }], // Use ActivityType.Listening instead of 'LISTENING'
        status: 'online',
      });
    console.log('Custom status set to Listening to BAe!');

    const commands = [];
    const commandFolders = fs.readdirSync('./commands');

    for (const folder of commandFolders) {
      const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
      for (const file of commandFiles) {
        const command = require(`../commands/${folder}/${file}`);
        commands.push(command.data.toJSON());
      }
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      console.log('Started refreshing (/) commands globally');

      await rest.put(
        Routes.applicationCommands(client.user.id,guildId,clientId),
        { body: commands }
      );

      console.log('Successfully reloaded application (/) commands globally.');

    } catch (error) {
      console.error(error);
    }
  }
};
////TESTTTTT