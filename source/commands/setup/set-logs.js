const {Message, Client, SlashCommandBuilder, EmbedBuilder,PermissionFlagsBits, Embed} = require('discord.js');

const sqlite = require('sqlite3').verbose();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('set-logs')
    .setDescription('Set the desired channels to post the logs.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
        option.setName('mod-logs')
        .setDescription('The channel to log the moderation activity.')
        )
    .addChannelOption(option =>
        option.setName('voice-logs')
        .setDescription('The channel to log voice channels activity')
        )
    .addChannelOption(option =>
        option.setName('members-logs')
        .setDescription('The channel to log members activity')
        )
    ,
    async execute(interaction)
    {
        const {guild, channel, options} = interaction;
        let modLogChannel = options.getChannel('mod-logs') || null;
        let voiceLogChannel = options.getChannel('voice-logs') || null;
        let membersLogChannel = options.getChannel('members-logs') || null;
        if(modLogChannel !== null && modLogChannel.type != 0 || voiceLogChannel !== null && voiceLogChannel.type != 0 || membersLogChannel !== null && membersLogChannel.type != 0)
        {
            await interaction.reply({content: 'All the parameters provided must be text channels!', ephemeral: true});
            return;
        }
        const db = new sqlite.Database('./source/lain-database.db', (err) => {
            if(err) console.error(err);
        });

        db.get(`SELECT * FROM prefChannelsScheme WHERE Guild= '${interaction.guild.id}'`, (err, row) => {
            if(err) console.error(err);
            if(row === undefined)
            {
                db.run(`INSERT INTO prefChannelsScheme(Guild) VALUES (?)`, [interaction.guild.id], 
                    (err) => { if(err) console.error(err);});
            }
            if(modLogChannel !== null)
                    db.run(`UPDATE prefChannelsScheme SET ModLogs = ? WHERE Guild = ?`, [modLogChannel.id, interaction.guild.id],
                    (err) => { if(err) console.error(err);});
            if(voiceLogChannel !== null)
                    db.run(`UPDATE prefChannelsScheme SET VoiceLogs = ? WHERE Guild = ?`, [voiceLogChannel.id, interaction.guild.id],
                        (err) => { if(err) console.error(err);});
            if(membersLogChannel !== null)
                    db.run(`UPDATE prefChannelsScheme SET MembersActivityLogs = ? WHERE Guild = ?`, [membersLogChannel.id, interaction.guild.id],
                        (err) => { if(err) console.error(err);});
           
        });
        
        const ModEmbed = new EmbedBuilder()
            .setDescription(`Moderation logs are set to ${modLogChannel}`);
        const VoiceEmbed = new EmbedBuilder()
            .setDescription(`Voice logs are set to ${voiceLogChannel}`);
        const MemberAcEmbed = new EmbedBuilder()
            .setDescription(`Members activity logs are set to ${membersLogChannel}`);
        let response = [];
        if(modLogChannel)
            response.push(ModEmbed);
        if(voiceLogChannel)
            response.push(VoiceEmbed);
        if(membersLogChannel)
            response.push(MemberAcEmbed);
        
        if(response.length)
            await interaction.reply({embeds: response, ephemeral: true});
        else
        {
            const removeEmbed = new EmbedBuilder()
                .setDescription(`Logs have been disabled. No channel provided!`);
            db.run(`UPDATE prefChannelsScheme SET ModLogs = ?, VoiceLogs = ?, MembersActivityLogs = ? WHERE Guild = ?`, [
                null, null, null, interaction.guild.id
            ], (err) => {if(err) console.error(err);});
            await interaction.reply({embeds: [removeEmbed], ephemeral: true});
        }
    }
}