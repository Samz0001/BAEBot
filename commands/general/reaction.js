const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionroles')
        .setDescription('Sets up reaction roles message')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator), // Only admins can use this command

    async execute(interaction) {
        const { client, guild } = interaction;

        // Defer the interaction to prevent it from timing out
        await interaction.deferReply({ ephemeral: true });

        // Define the roles and custom emojis using the custom emoji format (name:id)
        const roles = {
            'cs2:1301114211178385410': '1301110245107433504',       // Replace with your custom CS2 emoji and role ID
            'valo:1301115752262275092>': '1301110274140409866', // Replace with your custom Valorant emoji and role ID
            'bgmi:1301115750055940096': '1301110294709276723',     // Replace with your custom BGMI emoji and role ID
        };

        // Create an embed for the reaction roles message
        const embed = new EmbedBuilder()
            .setColor('#FFD700') // Gold color
            .setTitle('🎉 Welcome to Bharat Ascend Esports! 🎉')
            .setDescription(
                "Get ready for the ultimate gaming experience! Whether you're into CS2, Valorant, or BGMI, react below to join your favorite game channels and connect with fellow players.\n\n" +
                `<:cs2:1301114211178385410> **CS2 Role**:\nReact with <:cs2:1301114211178385410> to join the CS2 community!\n\n` +
                `<:valo:1301115752262275092>  **Valorant Role**:\nReact with <:valo:1301115752262275092>  to become part of the Valorant squad!\n\n` +
                `<:bgmi:1301115750055940096>  **BGMI Role**:\nReact with <:bgmi:1301115750055940096>  to join the BGMI warriors!`
            )
            .setImage('https://i.imgur.com/NwW78KE.jpeg') // Replace with your banner image URL
            .setThumbnail(interaction.guild.iconURL()) // Use guild icon as thumbnail
            .setFooter({ text: 'React to get your roles!' })
            .setTimestamp();

        try {
            // Send the embed message for reaction roles
            const message = await interaction.channel.send({ embeds: [embed] });

            // Add custom emoji reactions for each role
            for (const emoji of Object.keys(roles)) {
                // Add reactions using the custom emoji format <:name:id>
                await message.react(`<:${emoji}>`);
            }

            // Send a follow-up reply to the interaction
            await interaction.followUp({ content: 'Reaction roles message has been set up!', ephemeral: true });

            // Listen for reactions on the message
            client.on('messageReactionAdd', async (reaction, user) => {
                if (reaction.message.id !== message.id || user.bot) return;

                const roleId = roles[`${reaction.emoji.name}:${reaction.emoji.id}`];
                if (!roleId) return;

                try {
                    const member = await guild.members.fetch(user.id);
                    const role = guild.roles.cache.get(roleId);

                    if (role && member) {
                        await member.roles.add(role);
                        console.log(`Added role ${role.name} to ${member.user.tag}`);
                    } else {
                        console.error(`Role or member not found. Role ID: ${roleId}, User ID: ${user.id}`);
                    }
                } catch (error) {
                    console.error(`Error adding role: ${error.message}`);
                }
            });

            client.on('messageReactionRemove', async (reaction, user) => {
                if (reaction.message.id !== message.id || user.bot) return;

                const roleId = roles[`${reaction.emoji.name}:${reaction.emoji.id}`];
                if (!roleId) return;

                try {
                    const member = await guild.members.fetch(user.id);
                    const role = guild.roles.cache.get(roleId);

                    if (role && member) {
                        await member.roles.remove(role);
                        console.log(`Removed role ${role.name} from ${member.user.tag}`);
                    } else {
                        console.error(`Role or member not found. Role ID: ${roleId}, User ID: ${user.id}`);
                    }
                } catch (error) {
                    console.error(`Error removing role: ${error.message}`);
                }
            });

        } catch (error) {
            console.error(`Error setting up reaction roles message: ${error.message}`);
            await interaction.followUp({ content: 'Failed to set up reaction roles message.', ephemeral: true });
        }
    },
};
