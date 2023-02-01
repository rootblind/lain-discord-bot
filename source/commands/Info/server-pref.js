const {
    EmbedBuilder,
    SlashCommandBuilder,
    PermissionFlagsBits,
} = require('discord.js');

const sqlite = require('sqlite3').verbose();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-pref')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('Show the specific commands configuration for this server.')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Select the desired configuration.')
                .setRequired(true)
                .addChoices(
                    {name: 'dedicated-roles', value: `dedicatedRolesScheme`},
                    {name: 'logs', value: `prefChannelsScheme`},
                    {name: 'welcome-event', value: `welcomeScheme`}
                )
            )
        ,

        async execute(interaction)
        {
            const {options, guild} = interaction;

            const choice = options.getString('choice');
            let sql = `SELECT * FROM ${choice} WHERE Guild = ${guild.id}`;

            const embed = new EmbedBuilder()
                .setColor(0x800080)
                .setThumbnail(guild.iconURL());

            const db = new sqlite.Database('./source/lain-database.db', (err) => {if(err) console.error(err);});

            db.get(sql, (err, row) =>{
                if(err) console.error(err);
                if(row === undefined)
                {
                    const critical = new EmbedBuilder()
                        .setTitle('CRITICAL ERROR!')
                        .setDescription('Use \`/server-setup\` or ask an admin to do, or some commands will not work!');
                    interaction.reply({embeds: [critical], ephemeral: true});
                    return;
                }
                    switch(choice){
                        case "dedicatedRolesScheme":
                            embed.setTitle('Dedicated Roles Config')
                            let descriptionRole = "";
                            let staff;
                            if(row.Staff)
                            {
                                staff = row.Staff;
                                descriptionRole = descriptionRole + `Staff: **@${staff}**\n`;
                            }
                            else
                                descriptionRole = descriptionRole + "Staff: Not defined!\n";
                            let premium;
                            if(row.Premium)
                            {
                                premium = row.Premium;
                                descriptionRole = descriptionRole + `Premium: **@${premium}**\n`;
                            }
                            else
                                descriptionRole = descriptionRole + "Premium: Not defined!\n";
                            let exception;
                            if(row.Exception)
                            {
                                exception = row.Exception;
                                descriptionRole = descriptionRole + `Exeption: **@${exception}**`;
                            }
                            else
                                descriptionRole = descriptionRole + "Exception: Not defined!\n";
                            embed.setDescription(descriptionRole);
                            
                            break;

                        case "prefChannelsScheme":
                            embed.setTitle('Logs Config')
                            let descriptionLogs = "";
                            let modlogs;
                            if(row.ModLogs)
                            {
                                    modlogs = interaction.guild.channels.cache.get(row.ModLogs);
                                    descriptionLogs = descriptionLogs + `Modlogs: **#${modlogs.name}**\n`;
                            }
                            else
                                descriptionLogs = descriptionLogs + `Modlogs: Not defined!\n`;

                            let voice;
                            if(row.VoiceLogs)
                            {
                                voice = interaction.guild.channels.cache.get(row.ModLogs);
                                descriptionLogs = descriptionLogs + `VoiceLogs: **#${voice.name}**\n`;
                            }
                            else
                                descriptionLogs = descriptionLogs + `VoiceLogs: Not defined!\n`;
                                    
                            let members_a;
                            if(row.MembersActivityLogs)
                            {
                                members_a = interaction.guild.channels.cache.get(row.MembersActivityLogs);
                                descriptionLogs = descriptionLogs + `MembersActivity: **#${members_a.name}**`;
                            }
                            else
                                descriptionLogs = descriptionLogs + `MembersActivity: Not defined!`;
                                embed.setDescription(descriptionLogs);               
                            break;
                        case "welcomeScheme":
                            embed.setTitle('Welcome Event Config');
                            let channel;
                            let descriptionWelcome = "";
                            if(row.Channel)
                            {
                                channel = guild.channels.cache.get(row.Channel);
                                descriptionWelcome = descriptionWelcome + `Channel: **#${channel.name}**\n`;
                            }
                            else
                                descriptionWelcome = descriptionWelcome + `Channel: Not defined!\n`;
                            if(row.Status === 'enable')
                                descriptionWelcome = descriptionWelcome + `Status: **enable**`;
                            else
                                descriptionWelcome = descriptionWelcome + `Status: **disable**`;
                            embed.setDescription(descriptionWelcome);
                            break;
                        }
                return interaction.reply({embeds: [embed]});
            });
            

        }

};