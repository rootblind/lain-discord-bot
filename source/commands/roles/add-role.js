const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');

const sqlite = require('sqlite3').verbose();

const client_id = process.env.LAIN_CLIENT_ID;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-role')
        .setDescription('Add a reaction role to the panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption(option =>
            
                option.setName('role')
                    .setDescription('Role to be assigned')
                    .setRequired(true)
            )
        .addStringOption(option =>
                option.setName('description')
                    .setDescription('Description of the role')

            ),
        async execute(interaction)
        {
            const {options, member, guildId} = interaction;
            const role = options.getRole('role');
            const description = options.getString('description') || "No description";
            const responseEmbed = new EmbedBuilder();
            const db = new sqlite.Database('./source/lain-database.db');
            try{
                const me = interaction.guild.members.cache.get(client_id);
                if(role.position >= member.roles.highest.position || role.position >= me.roles.highest.position)
                {
                    responseEmbed.setColor('Red').setDescription('Lacking permission for that role!');
                    return interaction.reply({embeds: [responseEmbed], ephemeral: true});
                }

                db.run(`INSERT OR IGNORE INTO rolesPanelScheme (Guild, Role, Desc) VALUES(?, ?, ?)`,
                    [guildId, role.id, description], (err) => {
                        if(err)
                        {
                            responseEmbed.setColor('Red').setDescription('There are problems with the database, contact the bot master!');
                            return interaction.reply({embeds: [responseEmbed], ephemeral: true});
                        }
                        responseEmbed.setColor('Green').setDescription(`Added ${role.name} to the panel if it didn't already exist.`);
                        return interaction.reply({embeds: [responseEmbed], ephemeral: true});
                    });
            }catch(err){
                console.log(err);
            }
        }
};