const {CommandInteraction} = require('discord.js');

module.exports = {
    name: 'interactionCreate',

    execute(interaction, client){
        if(interaction.isChatInputCommand())
        {
            const command = client.commands.get(interaction.commandName);

            if(!command)
            {
                interaction.reply({content: "This is not an operable command!"});
            }
            command.execute(interaction, client);
        }
        else return;
    }
}