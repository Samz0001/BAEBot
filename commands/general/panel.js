const{SlashCommandBuilder,EmbedBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle}  = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Creates a  support ticket panel with a button"),

    async execute(interaction) {
        const embed = new EmbedBuilder().setColor("#FF9900")
        .setTitle(" Bharat Ascend Esports - Support Panel 🛠️")
        .setDescription(
            "Welcome to Bharat Ascend Esports support!\n\n" +
            "If you need help or assistance with anything, we're here for you! Just hit the button below to open a Support Ticket and our team will assist you ASAP! 😊\n\n" +
            "🔥 **Bharat Ascend Esports** | Elevating the gaming experience! 🔥"
        ).setThumbnail('https://i.imgur.com/EwciQbA.png').setFooter({text:'Bharat Ascend Esports'});
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("create_ticket").setLabel("Create").setStyle(ButtonStyle.Primary)
        );
        await interaction.reply({embeds:[embed],components:[row]})
    }

}