const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,

} = require('discord.js');

const sqlite = require('sqlite3').verbose();
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Time-out a member.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member that will receive a time-out.')
                .setRequired(true)
            )
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Duration of the time-out.')
                .setRequired(true)
            )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason of the time-out.')
            ),
        
        async execute(interaction)
        {
            const {guild, options} = interaction;
            const userTarget = options.getUser('target');
            const time_t = options.getString('time');
            const convertedTime = ms(time_t);
            const reason = options.getString('reason') || 'No reason given!';

            const errEmbed = new EmbedBuilder()
                .setColor('Red');
            
            let memberTarget;
            
            try{
                memberTarget = await guild.members.fetch(userTarget.id);
            }catch(err){
                errEmbed.setDescription('The ID provided is invalid or not a member of this server!');
                return interaction.reply({embeds: [errEmbed], ephemeral: true});
            }


            if(memberTarget.roles.highest.position >= interaction.member.roles.highest.position)
            {
                errEmbed.setDescription(`You can not take action on ${userTarget.username}!`);
                return interaction.reply({embeds: [errEmbed], ephemeral: true});
            }
            if(!convertedTime)
            {
                errEmbed.setDescription('Wrong time format! Examples: 1d, 1m, , 1h, 1s');
                return interaction.reply({embeds: [errEmbed], ephemeral: true});
            }

            const embedMute = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`**${userTarget.username}** was muted (${time_t}) for **${reason}**`)
                .setTimestamp();
            const db = new sqlite.Database('./source/lain-database.db', (err) => { if(err) console.error(err);});

            db.get(`SELECT * FROM dedicatedRolesScheme WHERE Guild = ?`, [guild.id], (err, row) => {
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
                
                if(memberTarget.permissions.has([PermissionFlagsBits.ModerateMembers]) || memberTarget.roles.cache.some(role => exceptions.includes(role.name)))
                {
                    errEmbed.setDescription(`You can not take action on ${userTarget.username}!`);
                    return interaction.reply({embeds: [errEmbed], ephemeral: true});
                }
                try{
                    memberTarget.timeout(convertedTime, reason);
                }catch(err){
                    console.log(err);
                    errEmbed.setDescription('Something went wrong!');
                    return interaction.reply({embeds: [errEmbed], ephemeral: true});
                }

                db.get(`SELECT * FROM prefChannelsScheme WHERE Guild = ?`, [guild.id], (err, row) => {
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
    
                    let channelLog = guild.channels.cache.get(row.ModLogs);
                    const logEmbed = new EmbedBuilder()
                        .setColor(`Red`)
                        .setTitle('User Muted')
                        .setDescription(`**Member:** ${userTarget.tag} (${userTarget.id})\n**Moderator:** ${interaction.user.tag} (${interaction.user.id})\n**Duration:** ${time_t}\n**Reason:** ${reason}`)
                        .setTimestamp();
                    channelLog.send({embeds: [logEmbed]});
    
                });
                interaction.reply({embeds: [embedMute]});
            
            });


        }

};