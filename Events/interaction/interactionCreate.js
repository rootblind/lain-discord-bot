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
        else if(interaction.isStringSelectMenu()){
            if(interaction.customId == 'reaction-roles')
            {
                for(let i = 0; i < interaction.values.length; i++)
                {
                    const roleId = interaction.values[i];
                    const has_role = interaction.member.roles.cache.has(roleId);

                    switch(has_role)
                    {
                        case true:
                            interaction.member.roles.remove(roleId);
                            break;
                        case false:
                            interaction.member.roles.add(roleId);
                            break;
                    }
                }

                interaction.reply({content: "Role updated", ephemeral: true});
            }
        }
    }
}