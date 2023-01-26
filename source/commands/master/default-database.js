const {SlashCommandBuilder, PermissionFlagsBits} = require("discord.js");
const sqlite = require('sqlite3').verbose();

const OWNER = process.env.OWNER_ID;
module.exports = {
    data: new SlashCommandBuilder()
    .setName('default-database')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('Initiates all tables in the database.'),
    async execute(interaction)
    {
        if(!interaction.user.id.includes(OWNER))//owner only commands should include the condition
        {
            interaction.reply({content:'Only my master can use this command!', ephemeral: true});
            return;
        }
        const db = new sqlite.Database('./source/lain-database.db', (err) => {
            if(err) console.error(err);
        });
        //welcomeScheme table for set-welcome-message.js
        let sql = `CREATE TABLE IF NOT EXISTS welcomeScheme(ID INTEGER PRIMARY KEY, Guild TEXT, Channel TEXT, Title Text, Msg TEXT, Status Text)`;
        db.run(sql, [], (err) => {
            if(err)
                console.error(err);
        });

        //preference Channels
        sql = `CREATE TABLE IF NOT EXISTS prefChannelsScheme(ID INTEGER PRIMARY KEY, Guild TEXT, ModLogs TEXT, VoiceLogs TEXT, MembersActivityLogs TEXT)`;
        db.run(sql, [], (err) => {
            if(err)
                console.error(err);
        });

        //dedicated roles
        sql = `CREATE TABLE IF NOT EXISTS dedicatedRolesScheme(ID INTEGER PRIMARY KEY, Guild Text, Staff Text, Exception Text, Premium Text)`;
        db.run(sql, [], (err) => {
            if(err)
                console.error(err);
        });



        interaction.reply({content:'The default tables have been set in database.', ephemeral: true});
        db.close();
    }
    
}