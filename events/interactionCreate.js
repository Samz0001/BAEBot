const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Handle Slash Commands
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

    // Handle Button Interaction (Create Ticket)
    if (interaction.isButton()) {
      if (interaction.customId === 'create_ticket') {
        // Create and show a modal to collect name and reason
        const modal = new ModalBuilder()
          .setCustomId('ticket_modal')
          .setTitle('Open a Support Ticket');

        const nameInput = new TextInputBuilder()
          .setCustomId('nameInput')
          .setLabel('What is your name?')
          .setStyle(TextInputStyle.Short); // Short input for name

        const reasonInput = new TextInputBuilder()
          .setCustomId('reasonInput')
          .setLabel('Why are you opening this ticket?')
          .setStyle(TextInputStyle.Paragraph); // Long input for reason

        const row1 = new ActionRowBuilder().addComponents(nameInput);
        const row2 = new ActionRowBuilder().addComponents(reasonInput);

        modal.addComponents(row1, row2);

        await interaction.showModal(modal);
      }
    }

    
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'ticket_modal') {
        const name = interaction.fields.getTextInputValue('nameInput');
        const reason = interaction.fields.getTextInputValue('reasonInput');

        
        const existingChannel = interaction.guild.channels.cache.find(c => c.name === `ticket-${interaction.user.id}`);
        if (existingChannel) {
          return interaction.reply({ content: 'You already have an open ticket!', ephemeral: true });
        }

        // Create the ticket channel
        const ticketChannel = await interaction.guild.channels.create({
          name: `ticket-${interaction.user.id}`,
          type: 0,  
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: interaction.user.id,
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            },
            {
              id: '1275868588682514433',  // Replace with your support staff role ID
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            }
          ]
        });

        await ticketChannel.send(`Hello ${name}, support will be with you shortly.\nReason for ticket: **${reason}**`);

        await interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
      }
    }
  },
};
