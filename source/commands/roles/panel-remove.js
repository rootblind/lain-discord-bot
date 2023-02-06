const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');
const { execute } = require('./panel-add');

const sqlite = require('sqlite3').verbose();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel-remove')
        .setDescription('Remove role from the panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption(option =>
                option.setName('role')
                    .setDescription('The role to be removed')
                    .setRequired(true)
            ),
        async execute(interaction)
        {
            const {options} = interaction;
            const role = options.getRole('role');
            const db = new sqlite.Database('./source/lain-database.db', (err) => {
                if(err) console.error(err);
            });

            const embed = new EmbedBuilder();

            try{
                db.run(`DELETE FROM rolesPanelScheme WHERE Role= ?`, [role.id], (err) => {if(err) console.error(err);});
            }catch(err)
            {
                embed.setColor('Red').setDescription('There are problems with the database, contact the bot master');
                return interaction.reply({embeds: [embed], ephemeral: true});
            }
            embed.setColor('Green').setDescription(`${role.name} is no longer on the panel if it was before.`);
            return interaction.reply({embeds: [embed], ephemeral: true});
        }

};