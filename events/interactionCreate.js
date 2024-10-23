module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
      // Keep existing interaction handling logic
      if (interaction.isCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
  
        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(error);
          await interaction.reply({
            content: 'There was an error executing that command!',
            ephemeral: true,
          });
        }
      }
      
  
      // Handle button interaction for ticket creation
      
  
        // Create a new channel for the ticket
        
        // Send a message in the newly created channel
        
  
      // Add any other interaction types or button handlers here (optional)
      // if (interaction.isButton() && interaction.customId === 'other_button') {
      //   // Handle other button interactions if needed
      // }
    },
  };
  