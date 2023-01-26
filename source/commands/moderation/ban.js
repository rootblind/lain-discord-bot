const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,

} = require('discord.js');

const sqlite = require('sqlite3').verbose();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option => 
        option.setName('target')
        .setDescription('User to be banned.')
        .setRequired(true)
        )
    .addStringOption(option =>
        option.setName("delete-messages")
        .setDescription('Delete target messages')
        .addChoices(
            { name: "1 day", value: '86400' },
            { name: "3 days", value: '259200' },
            { name: "7 days", value: '604800'}
        )
    )
    .addStringOption(option =>
        option.setName('reason')
        .setDescription('Provide a reason.')
        ),

    async execute(interaction,client) {
        const {guild, options} = interaction;

        const user = options.getUser('target');
        const reason = options.getString('reason') || 'No reason provided.';
        const delDays = options.getString('delete-messages') || '0';
        let member;
        try{
            member  = await interaction.guild.members.fetch(user.id);
        }catch(err)
        {
            const noMemberEmbed = new EmbedBuilder()
            .setDescription('The specified ID is either invalid or not on the server!')
            .setColor(0xc72c3a);

            interaction.reply({embeds: [noMemberEmbed], emphemeral: true});
        }
            
        

        const errEmbed = new EmbedBuilder()
        .setDescription(`You can't take action on ${user.username}!`)
        .setColor(0xc72c3a);
        const db = new sqlite.Database('./source/lain-database.db', (err) => { if(err) console.error(err);});
        
        db.get(`SELECT * FROM dedicatedRolesScheme WHERE Guild = ?`, [interaction.guild.id], (err, row) => {
            if(err) console.error(err);
            let exceptions = [];
            if(row.Staff)
                exceptions.push(row.Staff);
            if(row.Exception)
                exceptions.push(row.Exception);
            
            if(member.permissions.has([PermissionFlagsBits.BanMembers]) || member.roles.cache.some(role => exceptions.includes(role.name)))
            {
                return interaction.reply({embeds: [errEmbed], emphemeral: true});
            }
            try {
                member.ban({deleteMessageSeconds: delDays, reason: reason});
            } catch (error) {
                console.log(error);
                interaction.reply({embeds: [errEmbed], emphemeral: true});
            }
    
            const embedBan = new EmbedBuilder()
                .setDescription(`Successfully banned ${user} for the reason: ${reason}`)
                .setColor(0x5fb040)
                .setTimestamp()
            
            interaction.reply({
                embeds: [embedBan]
            });
        });
    }
}