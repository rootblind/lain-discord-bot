const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,

} = require('discord.js');

const sqlite = require('sqlite3').verbose();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a timed-out member.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Specify the user.')
                .setRequired(true)
            ),
        
        async execute(interaction)
        {
            const {guild, options} = interaction;

            const user = options.getUser('user');
            let member;
            const errEmbed = new EmbedBuilder()
                .setColor('Red');
            try{
                member = await guild.members.fetch(user.id);
            }catch(err)
            {
                errEmbed.setDescription('Invalid ID or user is not from this server!');
                return interaction.reply({embeds: [errEmbed], ephemeral: true});
            }
            const unmuteEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`**${user.username}** was unmuted!`)
                .setTimestamp();
            if(member.roles.highest.position >= interaction.member.roles.highest.position)
            {
                errEmbed.setDescription(`You can not take action on ${user.username}!`);
                return interaction.reply({embeds: [errEmbed], ephemeral: true});
            }

            const db = new sqlite.Database('./source/lain-database.db', (err) => { if(err) console.error(err);});

            try{
                await member.timeout(null);
                interaction.reply({embeds: [unmuteEmbed]});
            }catch(err){
                console.log(err);
                errEmbed.setDescription('Something went wrong!')
                return interaction.reply({embeds: [errEmbed], ephemeral: true})
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
                    .setColor(`Green`)
                    .setTitle('User Unmuted')
                    .setDescription(`**Member:** ${user.tag} (${user.id})\n**Moderator:** ${interaction.user.tag} (${interaction.user.id})`)
                    .setTimestamp();
                channelLog.send({embeds: [logEmbed]});
    
            });


        }


};