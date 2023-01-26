//these roles are dedicated to special permissions or exceptions.

const {Message, Client, SlashCommandBuilder, EmbedBuilder,PermissionFlagsBits} = require('discord.js');
const guildMemberAdd = require('../../../Events/Guild/guildMemberAdd');
const sqlite = require('sqlite3').verbose();

module.exports ={
    data: new SlashCommandBuilder()
        .setName('set-dedicated-roles')
        .setDescription('Garant permissions and exceptions to these roles')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option =>
            option.setName('staff-role')
                .setDescription('Make your staff group immune to moderation commands.')
                )
        .addRoleOption(option =>
            option.setName('exception-role')
                .setDescription('Make your trusted members immune to moderation commands.')
            )
        .addRoleOption(option =>
            option.setName(`premium-role`)
                .setDescription('The members with this role can use premium commands like getting custom roles.')
            ),
    async execute(interaction)
    {
        const {guild, options} = interaction;
        const staffRole = options.getRole(`staff-role`) || null;
        const exceptionRole = options.getRole(`exception-role`) || null;
        const premiumRole = options.getRole(`premium-role`) || null;
        
        const db = new sqlite.Database('./source/lain-database.db', (err) => {
            if(err) console.error(err);
        });

        db.get(`SELECT * FROM dedicatedRolesScheme WHERE Guild = ?`, [interaction.guild.id], (err, row) => {
            if(err) console.error(err);
            if(row === undefined)
            {
                db.run(`INSERT INTO dedicatedRolesScheme(Guild) VALUES (?)`, [interaction.guild.id], (err) => { if(err) console.error(err); });
            }
            if(staffRole !== null)
                db.run(`UPDATE dedicatedRolesScheme SET Staff = ? WHERE Guild = ?`, 
                    [staffRole.name, interaction.guild.id], (err) => { 
                        if(err) console.error(err); });
            if(exceptionRole !== null)
                db.run(`UPDATE dedicatedRolesScheme SET Exception = ? WHERE Guild = ?`, 
                    [exceptionRole.name, interaction.guild.id], (err) => { 
                        if(err) console.error(err); });
            if(premiumRole !== null)
                db.run(`UPDATE dedicatedRolesScheme SET Premium = ? WHERE Guild = ?`, 
                        [premiumRole.name, interaction.guild.id], (err) => { 
                            if(err) console.error(err); });

        });
        let inputGiven = false;
        if(staffRole || premiumRole || exceptionRole)
            inputGiven = true;
        
        
        if(inputGiven)
        {
            let result = [];
            const staffEmbed = new EmbedBuilder()
            const exceptionEmbed = new EmbedBuilder()
            const premiumEmbed = new EmbedBuilder()
            if(staffRole)
            {
                staffEmbed.setDescription(`${staffRole.name} is set as STAFF role.`);
                result.push(staffEmbed);
            }
            if(exceptionRole)
            {
                exceptionEmbed.setDescription(`${exceptionRole.name} is set as EXCEPTION role.`);
                result.push(exceptionEmbed);
            }
            if(premiumRole)
            {
                premiumEmbed.setDescription(`${premiumRole.name} is set as PREMIUM role.`);
                result.push(premiumEmbed);
            }
            await interaction.reply({embeds: result, emphemeral: true});
        }
        else
        {
            const removeEmbed = new EmbedBuilder()
                .setDescription('Dedicated roles have been disabled. No input given.');
            db.run(`UPDATE dedicatedRolesScheme SET Staff = ?, Exception = ?, Premium = ? WHERE Guild = ?`, [
                null, null, null, interaction.guild.id
            ], (err) => { if(err) console.error(err);});
            await interaction.reply({embeds: [removeEmbed], emphemeral: true});
        }

    }
        
}