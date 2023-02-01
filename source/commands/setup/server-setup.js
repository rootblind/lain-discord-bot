const {SlashCommandBuilder, EmbedBuilder,PermissionFlagsBits} = require('discord.js');

const sqlite = require('sqlite3').verbose();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-setup')
        .setDescription('Adds your server ID to Lain\'s database to fully enable the her!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction)
    {
        const db = new sqlite.Database('./source/lain-database.db', (err) => {if(err) console.error(err);});
        db.get(`SELECT * FROM welcomeScheme WHERE Guild = ?`, [interaction.guild.id], (err, row) => {
            if(err) console.log(err);
            if(row === undefined)
                db.run(`INSERT INTO welcomeScheme (Guild, Status) VALUES (?, ?)`, [interaction.guild.id, 'disable'], (err) => { if(err) console.error(err);});
        });

        db.get(`SELECT * FROM prefChannelsScheme WHERE Guild = ?`, [interaction.guild.id], (err, row) => {
            if(err) console.log(err);
            if(row === undefined)
                db.run(`INSERT INTO prefChannelsScheme (Guild) VALUES (?)`, [interaction.guild.id], (err) => { if(err) console.error(err);});
        });

        db.get(`SELECT * FROM dedicatedRolesScheme WHERE Guild = ?`, [interaction.guild.id], (err, row) => {
            if(err) console.log(err);
            if(row === undefined)
                db.run(`INSERT INTO dedicatedRolesScheme (Guild) VALUES (?)`, [interaction.guild.id], (err) => { if(err) console.error(err);});
        });

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Setup ran with success!')
            .setDescription(`**${interaction.guild.name}** is in my database now!`)
        interaction.reply({embeds: [embed], ephemeral: true});
    }
};