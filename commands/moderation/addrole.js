const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('Assign a role to a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to assign a role')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    // Check if the user has the permission to manage roles
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: "You don't have permission to manage roles!", ephemeral: true });
    }

    // Get the user and role from the options
    const target = interaction.options.getMember('target');
    const role = interaction.options.getRole('role');

    // Check if the bot has permission to manage the role
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: "I don't have permission to manage roles!", ephemeral: true });
    }

    // Check if the role is higher than the bot's role (bots cannot assign roles higher than their own)
    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ content: "I cannot assign roles higher than my highest role!", ephemeral: true });
    }

    // Add the role to the target user
    await target.roles.add(role);
    await interaction.reply(`${role.name} has been added to ${target.user.tag}.`);
  }
};
