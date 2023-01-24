const {EmbedBuilder } = require("discord.js");
const sqlite = require('sqlite3').verbose();




function handleLogs(client)
{
    const db = new sqlite.Database('./source/lain-database.db', (err) => {
        if(err) console.error(err);
    });

    function send_log_data(guildId, embed, select)//select decides in which channel the embed will be logged
    {
        db.get(`SELECT * FROM prefChannelsScheme WHERE Guild= ?`, [guildId], (err, row) => {
            if(err) console.error(err);
            if(row === undefined) return;

            let modLogs = client.channels.cache.get(row.ModLogs) || null;
            let voiceLogs =  client.channels.cache.get(row.VoiceLogs) || null;
            let memberLogs =  client.channels.cache.get(row.MembersActivityLogs) || null;

            if(modLogs === null && voiceLogs === null && memberLogs === null) return;

            embed.setTimestamp();

            try {
                if(modLogs && select == 0)
                    modLogs.send({embeds: [embed]});
                if(voiceLogs && select == 1)
                    voiceLogs.send({embeds: [embed]});
                if(memberLogs && select == 2)
                    memberLogs.send({embeds: [embed]});
            } catch (error) {
                console.error(error);
            }

        });
    }

    client.on("messageDelete", function (message) {
        if (message.author.bot) return;

        const embed = new EmbedBuilder()
            .setTitle('Message Deleted')
            .setColor('Red')
            .setDescription(`
            **Author : ** <@${message.author.id}> - *${message.author.tag}*
            **Date : ** ${message.createdAt}
            **Channel : ** <#${message.channel.id}> - *${message.channel.name}*
            **Deleted Message : **\`${message.content.replace(/`/g, "'")}\`
         `);

        return send_log_data(message.guild.id, embed, 2);
    });



    client.on("guildMemberRemove", (member) => {

        const embed = new EmbedBuilder()
            .setTitle('User Left')
            .setColor('Red')
            .setDescription(`Member: ${member.user} (\`${member.user.id}\`)\n\`${member.user.tag}\``,
                member.user.displayAvatarURL({ dynamic: true }));

        return send_log_data(member.guild.id, embed, 2);

    });

    client.on("messageUpdate", (oldMessage, newMessage) => {
        const embed = new EmbedBuilder()
            .setTitle('Message Edited')
            .setColor('Grey')
            .setDescription(`Message Edited from \`${oldMessage.content}\` to \`${newMessage.content}\` by ${newMessage.author.tag}`);

        return send_log_data(newMessage.guild.id, embed, 2);

    });

    client.on("voiceStateUpdate", (oldState, newState) => {
        if(newState.channel === null)
            return;
        const embed = new EmbedBuilder()
            .setTitle('Voice Channel Joined')
            .setColor('Green')
            .setDescription(newState.member.user.tag + " joined " + `**${newState.channel.name}**` + "!");

        return send_log_data(newState.member.guild.id, embed, 1);
    });

}


module.exports = { handleLogs };