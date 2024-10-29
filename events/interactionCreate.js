const fs = require('fs');
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Support staff role ID
    const supportStaffRoleId = '878856351747551244'; // Replace this with your actual support staff role ID

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

    // Handle Create Ticket Button
    if (interaction.isButton()) {
      if (interaction.customId === 'create_ticket') {
        const modal = new ModalBuilder()
          .setCustomId('ticket_modal')
          .setTitle('Open a Support Ticket');

        const nameInput = new TextInputBuilder()
          .setCustomId('nameInput')
          .setLabel('What is your name?')
          .setStyle(TextInputStyle.Short);

        const reasonInput = new TextInputBuilder()
          .setCustomId('reasonInput')
          .setLabel('Why are you opening this ticket?')
          .setStyle(TextInputStyle.Paragraph);

        const row1 = new ActionRowBuilder().addComponents(nameInput);
        const row2 = new ActionRowBuilder().addComponents(reasonInput);

        modal.addComponents(row1, row2);

        await interaction.showModal(modal);
      }
    }

    // Handle Modal Submit for Ticket Creation
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'ticket_modal') {
        const name = interaction.fields.getTextInputValue('nameInput');
        const reason = interaction.fields.getTextInputValue('reasonInput');

        const channelName = `ticket-${interaction.user.username}-${interaction.user.discriminator}`;

        const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName);
        if (existingChannel) {
          return interaction.reply({ content: 'You already have an open ticket!', ephemeral: true });
        }

        const ticketChannel = await interaction.guild.channels.create({
          name: channelName,
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
              id: supportStaffRoleId,  // Allow access for support staff role
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
            }
          ]
        });

        const embed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle('🎟️ Support Ticket')
          .addFields(
            { name: 'Name', value: name },
            { name: 'Reason', value: reason }
          )
          .setFooter({ text: `Ticket created by ${interaction.user.tag}` })
          .setTimestamp();

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('close_ticket')
              .setLabel('Close Ticket')
              .setStyle(ButtonStyle.Secondary)
          );

        if (interaction.member.roles.cache.has(supportStaffRoleId)) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId('delete_ticket')
              .setLabel('Delete Ticket')
              .setStyle(ButtonStyle.Danger)
          );
        }

        await ticketChannel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
      }
    }

    // Handle Close Ticket Button
    if (interaction.isButton()) {
      const ticketChannel = interaction.channel;

      if (interaction.customId === 'close_ticket') {
        // Allow the user who created the ticket or support staff to close it
        if (interaction.user.id !== ticketChannel.name.split('-')[1] && !interaction.member.roles.cache.has(supportStaffRoleId)) {
          return interaction.reply({ content: "You don't have permission to close this ticket.", ephemeral: true });
        }

        const messages = await ticketChannel.messages.fetch();
        const transcript = messages.map(m => `${m.author.tag}: ${m.content}`).reverse().join('\n');

        const transcriptChannel = interaction.guild.channels.cache.get('1300677910205566999');
        if (transcriptChannel && transcriptChannel.isTextBased()) {
          const chunkSize = 1900;
          for (let i = 0; i < transcript.length; i += chunkSize) {
            await transcriptChannel.send(`**Transcript for ${ticketChannel.name}**\n\`\`\`${transcript.slice(i, i + chunkSize)}\`\`\``);
          }
        } else {
          return interaction.reply({ content: "Could not find the transcripts channel or it's not a text channel.", ephemeral: true });
        }

        await interaction.reply({ content: 'Ticket closed and transcript saved.', ephemeral: true });
        const closedTicketsCategory = interaction.guild.channels.cache.get('1300676785473851432');
        if (closedTicketsCategory && closedTicketsCategory.type === 4) {
          await ticketChannel.setParent(closedTicketsCategory.id);
        }
      }

      // Handle Delete Ticket Button
      if (interaction.customId === 'delete_ticket') {
        // Only support staff can delete the ticket
        if (!interaction.member.roles.cache.has(878856350736732170)) {
          return interaction.reply({ content: "You don't have permission to delete this ticket.", ephemeral: true });
        }

        await interaction.reply({ content: 'Deleting the ticket channel...', ephemeral: true });
        setTimeout(() => ticketChannel.delete(), 3000);  // Delete after 3 seconds
      }
    }
  },
};
