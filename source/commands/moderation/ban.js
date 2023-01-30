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
        if(reason.length > 255)
        {
            const ed = new EmbedBuilder()
                .setDescription('The reason length is too high!')
                .setColor('Red');
            return await interaction.reply({embeds: [ed], ephemeral: true});
        }

        let member;
        try{
            member  = await interaction.guild.members.fetch(user.id);
        }catch(err)
        {
            const noMemberEmbed = new EmbedBuilder()
            .setDescription('The specified ID is either invalid or not on the server!')
            .setColor(0xc72c3a);

            return await interaction.reply({embeds: [noMemberEmbed], ephemeral: true});
        }

        const errEmbed = new EmbedBuilder()
        .setDescription(`You can't take action on ${user.username}!`)
        .setColor(0xc72c3a);

        if(member.roles.highest.position >= interaction.member.roles.highest.position)
            return interaction.reply({embeds: [errEmbed], ephemeral: true});
    
        const db = new sqlite.Database('./source/lain-database.db', (err) => { if(err) console.error(err);});
        
        db.get(`SELECT * FROM dedicatedRolesScheme WHERE Guild = ?`, [interaction.guild.id], (err, row) => {
            if(err) console.error(err);
            if(row === undefined)
            {
                const critical = new EmbedBuilder()
                    .setTitle('CRITICAL ERROR!')
                    .setDescription('Use \`/server-setup\` or ask an admin to do, or some commands will not work!');
                interaction.reply({embeds: [critical], ephemeral: true});
                return;
            }
            let exceptions = [];
            if(row.Staff)
                exceptions.push(row.Staff);
            if(row.Exception)
                exceptions.push(row.Exception);
            
            if(member.permissions.has([PermissionFlagsBits.BanMembers]) || member.roles.cache.some(role => exceptions.includes(role.name)))
            {
                return interaction.reply({embeds: [errEmbed], ephemeral: true});
            }
            try {
                member.ban({deleteMessageSeconds: delDays, reason: reason});
            } catch (error) {
                console.log(error);
                return interaction.reply({embeds: [errEmbed], ephemeral: true});
            }
    
            const embedBan = new EmbedBuilder()
                .setDescription(`Successfully banned ${user} for the reason: ${reason}`)
                .setColor(0x5fb040)
                .setTimestamp()
            db.get(`SELECT * FROM prefChannelsScheme WHERE Guild = ?`, [interaction.guild.id], (err, row) => {
                if(err) console.error(err);
                if(row === undefined)
                {
                    const critical = new EmbedBuilder()
                        .setTitle('CRITICAL ERROR!')
                        .setDescription('Use \`/server-setup\` or ask an admin to do, or some commands will not work!');
                    interaction.reply({embeds: [critical], ephemeral: true});
                    return;
                }
            if(!row.ModLogs) return;

                let channelLog = interaction.guild.channels.cache.get(row.ModLogs);
                const logEmbed = new EmbedBuilder()
                    .setColor(`Red`)
                    .setTitle('User Banned')
                    .setDescription(`**Member:** ${member.user.tag} (${member.user.id})\n**Moderator:** ${interaction.user.tag} (${interaction.user.id})\n**Reason:** ${reason}`)
                    .setTimestamp()
                    .setThumbnail(member.user.displayAvatarURL());
                channelLog.send({embeds: [logEmbed]});

            });
            interaction.reply({
                embeds: [embedBan]
            });
        });
    }
}