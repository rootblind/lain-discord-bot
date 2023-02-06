const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');

const client_id = process.env.LAIN_CLIENT_ID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Create or delete a role.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
                subcommand.setName('create')
                    .setDescription('Create a new role.')
                    .addStringOption(option =>
                        option.setName('role-name')
                            .setDescription('The name of the role.')
                            .setRequired(true)
                    )
                    .addNumberOption(option =>
                        option.setName('hexcolor')
                            .setDescription('The hexcode of the role')
                            .setRequired(true)
                    )
            )
        .addSubcommand(subcommand =>
                subcommand.setName('delete')
                    .setDescription('Delete an existing role.')
                    .addRoleOption(option =>
                            option.setName('role')
                                .setDescription('Role to be deleted.')
                                .setRequired(true)
                        )
                    .addStringOption(option =>
                            option.setName('reason')
                                .setDescription('Give a reason.')
                        )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('edit')
                .setDescription('Edit a role.')
                .addRoleOption(option =>
                        option.setName('role')
                            .setDescription('The role you want to edit.')
                            .setRequired(true)
                    )
                .addStringOption(option =>
                    option.setName('role-name')
                        .setDescription('The name of the role.')
                )
                .addNumberOption(option =>
                    option.setName('hexcolor')
                        .setDescription('The hexcode of the role')
                )
                .addNumberOption(option =>
                        option.setName('position')
                            .setDescription('The position of this role')
                    )
        )
        .addSubcommand(subcommand =>
                subcommand.setName('assign')
                    .setDescription('Assign a role to a member.')
                    .addUserOption(option =>
                        option.setName('member')
                            .setDescription('The member that will be assigned the role.')
                            .setRequired(true)
                    )
                    .addRoleOption(option =>
                            option.setName('role')
                                .setDescription('The role to be assigned.')
                                .setRequired(true)
                        )

        )
        .addSubcommand(subcommand =>
                subcommand.setName('remove')
                    .setDescription('Remove one role from a member.')
                    .addUserOption(option =>
                        option.setName('member')
                            .setDescription('The member that will be assigned the role.')
                            .setRequired(true)
                    )
                    .addRoleOption(option =>
                        option.setName('role')
                            .setDescription('The role to be assigned.')
                            .setRequired(true)
                    )
                    
            ),
        
        async execute(interaction)
        {
            const {options, guild} = interaction;
            const me = guild.members.cache.get(client_id);
            const subCmd = options.getSubcommand(['create','delete', 'assign', 'remove', 'edit']);
            let name = options.getString('role-name');
            let color = options.getNumber('hexcolor');
            const role = options.getRole('role');
            const reason = options.getString('reason') || "No reason given.";
            const user = options.getUser('member');
            let position = options.getNumber('position');

            const embed = new EmbedBuilder();

            if(!me.permissions.has([PermissionFlagsBits.ManageRoles]))
            {
                embed.setColor('Red').setDescription('I lack permission to manage roles!');
                return interaction.reply({embeds: [embed], ephemeral: true});
            }
            if(reason.length > 100)
            {
                embed.setColor('Red').setDescription('The length of your reason is too high! Try with less than 100 characters.');
                return interaction.reply({embeds: [embed]});
            }
            if(position)
                if(position >= interaction.member.roles.highest.position)
                {
                    embed.setColor('Red').setDescription('You can not edit a role\'s position to one higher than your role position!');
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            if(color)
                if(color > 0xffffff)
                {
                    embed.setColor('Red').setDescription('The hexcolor is invalid!');
                }
            if(name)
                if(name.length > 64)
                {
                    embed.setColor('Red').setDescription('The length of your role name is too high! Try with less than 64 characters.');
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            if(role)
            {
                if(interaction.member.roles.highest.position <= role.position)
                {
                    embed.setColor('Red').setDescription('Your highest role is too low!');
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
                if(role.id == guild.roles.everyone.id)
                {
                    embed.setColor('Red').setDescription('You can not access @everyone');
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
                if(me.roles.highest.position <= role.position)
                {
                    embed.setColor('Red').setDescription('My highest role is too low!');
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            }

            let member;
            try{
                if(user)
                {
                    member = await guild.members.fetch(user.id);
                }
            }catch(err){
                if(user)
                {
                    embed.setColor('Red').setDescription('The user provided is not a member of this server!');
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            }
            
            switch(subCmd){
                case "create":
                    guild.roles.create({
                        name: name,
                        color: color,
                        permissions: [],
                        position: 1,
                    }).catch(err => console.log(err));
                    embed.setColor(color).setTitle('Role Created').setDescription(`**${name}** role has been created!`);
                    break;
                case "delete":
                    embed.setColor('Green').setTitle('Role Removed').setDescription(`**${role.name}** has been removed!`);
                    guild.roles.delete(role, [reason])
                        .catch(err => console.log(err));
                    
                    break;
                case "assign":
                    member.roles.add(role).catch(err => console.log(err));
                    embed.setColor(role.color).setTitle("Role Assigned")
                        .setDescription(`**${role.name}** has been assigned to **${member.user.username}**!`);
                    break;
                case "remove":
                    member.roles.remove(role).catch(err => console.log(err));
                    embed.setColor(role.color).setTitle("Role Assigned")
                        .setDescription(`**${role.name}** has been removed from **${member.user.username}**!`);
                    break;
                case "edit":
                    if(!position)
                        position = role.position;
                    if(!color)
                        color = role.color;
                    if(!name)
                        name = role.name;
                    embed.setColor(color).setTitle('Role Edited').setDescription(`**${role.name}** has been edited with the input provided now.`);
                    guild.roles.edit(role, {
                        name: name,
                        color: color,
                        position: position
                    });
                    
                    break;

                
            }

            return interaction.reply({embeds: [embed], ephemeral: true});

        }

}