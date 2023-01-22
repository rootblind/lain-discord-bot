const { SlashCommandBuilder, CommandInteraction, PermissionFlagsBits} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check my latency.")
    ,

    execute(interaction, client)
    {
        
        interaction.reply({content: `🏓 Pong! Latency is ${Math.round(client.ws.ping)}ms`, ephermal: true});
    }
,    
    
}
