const {CommandInteraction, PermissionFlagsBits} = require('discord.js');

module.exports = {
    name: 'interactionCreate',

    execute(interaction, client){
        if(interaction.isChatInputCommand())
        {
            const command = client.commands.get(interaction.commandName);
            const me = interaction.guild.members.cache.get(process.env.LAIN_CLIENT_ID);
            if(!me.permissions.has(PermissionFlagsBits.Administrator))
            {
                interaction.reply({content: 'Lain will work only with Administrator permissions!', ephemeral: true})
                return;
            }
            if(!command)
            {
                interaction.reply({content: "This is not an operable command!"});
            }
            command.execute(interaction, client);
        }
        else return;
    }
}