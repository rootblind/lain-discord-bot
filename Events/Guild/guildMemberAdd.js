const {EmbedBuilder} = require("@discordjs/builders");
const {GuildMember, Embed} = require('discord.js');
const sqlite = require('sqlite3').verbose();

const db = new sqlite.Database('./source/lain-database.db', (err) => {
    if(err) console.error(err);
});

module.exports = {
    name: "guildMemberAdd",
    async execute(member)
    {
        
        db.get(`SELECT * FROM welcomeScheme WHERE Guild = '${member.guild.id}'`, (err, row) => {
            if(err) console.error(err);
            if(row === undefined) return;
            if(row.Status != "enable") return;
            let channel = row.Channel;
            let theTitle = row.Title || " ";
            let Msg = row.Msg || " ";
            const {user, guild} = member;
            const welcomeChannel = member.guild.channels.cache.get(channel);
            
            const welcomeEmbed = new EmbedBuilder()
            .setAuthor({name: `${member.user.tag}`, iconURL: member.user.displayAvatarURL()})
            .setTitle(theTitle)
            .setDescription(Msg)
            .setColor(0x00001)
            .setTimestamp()
            .setFooter({text:`ID: ${member.id}`});
            welcomeChannel.send({embeds: [welcomeEmbed]});
        });

    }
};
