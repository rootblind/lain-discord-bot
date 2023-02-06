const {SlashCommandBuilder, PermissionFlagsBits, ActivityType, EmbedBuilder} = require('discord.js');

const fs = require('fs');
const OWNER = process.env.OWNER_ID;

module.exports = {

    data: new SlashCommandBuilder()
        .setName('update-presence')
        .setDescription('Update Lain\'s presence.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
                subcommand.setName('activity')
                .setDescription('Update Lain\'s activity.')
                .addStringOption(option =>
                        option.setName('type')
                            .setDescription('Activity input')
                            .setRequired(true)
                            .addChoices(
                                { name: 'Playing', value: 'Playing'},
                                { name:'Listening' , value:'Listening' },
                                { name:'Watching' , value:'Watching' },
                            )
                    )
                .addStringOption(option =>
                        option.setName('activity')
                            .setDescription('Set the current activity')
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcommand =>
                subcommand.setName('status')
                .setDescription('Update Lain\'s status.')
                .addStringOption(option =>
                        option.setName('type')
                            .setRequired(true)
                            .setDescription('Status input')
                            .addChoices(
                                { name: 'Online', value: 'online'},
                                { name:'Idle' , value:'idle' },
                                { name:'Do not disturb' , value:'dnd' },
                                { name:'Invisible' , value:'invisible' },
                            )
                    )
            )
            .addSubcommand(subcommand =>
                    subcommand.setName('autoupdate')
                        .setDescription('Lain will update her presence on her own.')
                        .addStringOption(option =>
                                option.setName('activation')
                                    .setRequired(true)
                                    .setDescription('Enable or disaple autoupdates')
                                    .addChoices(
                                        { name: 'Enable', value: 'enable'},
                                        { name: 'Disable', value: 'disable'}
                                    )
                            )
                        .addNumberOption(option =>
                                option.setName('delay')
                                    .setDescription('The delay between autoupdates. Hours format [1,24]')

                                    
                            )
            ),
        async execute(interaction, client)
        {
            if(!interaction.user.id.includes(OWNER))//owner only commands should include the condition
            {
                interaction.reply({content:'Only my master can use this command!', ephemeral: true});
                return;
            }
            const  { options } = interaction;

            const subCmd = options.getSubcommand(['activity', 'status', 'autoupdate']);
            const type = options.getString('type');
            const activity = options.getString('activity');
            let delay = options.getNumber('delay');
            const switch_au = options.getString('activation');
            let rawConfig = fs.readFileSync('./source/objects/presence-config.json');
            let config = JSON.parse(rawConfig);
            try{
                switch(subCmd){
                    case "activity":
                        switch(type){
                            case 'Playing':
                                client.user.setActivity(activity, {type: ActivityType.Playing});
                                break;
                            case 'Listening':
                                client.user.setActivity(activity, {type: ActivityType.Listening});
                                break;
                            case 'Watching':
                                client.user.setActivity(activity, {type: ActivityType.Watching});
                                break;
                        }
                    case 'status':
                        client.user.setPresence({activities:client.user.presence.acivities , status: type});
                        break;
                    case 'autoupdate':
                        
                        config["status"] = switch_au;
                        if(delay > 0 && delay <= 24)
                            config["delay"] = Math.floor(delay) * 3600000;
                        fs.writeFileSync('./source/objects/presence-config.json', JSON.stringify(config));
                        break;
                }
            }
            catch(err)
            {
                console.log(err);
            }
            const embed = new EmbedBuilder()
                .setColor('Blue')
            if(subCmd == 'activity' || subCmd == 'status')
                embed.setDescription(`You've updated ${subCmd} to ${type}!`);
            else
                embed.setDescription(`Autoupdate is now ${switch_au}d . Delay set to ${config["delay"] / 3600000}h.`);
            return interaction.reply({embeds: [embed], ephemeral: true});
        }

};