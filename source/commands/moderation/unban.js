const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,

} = require('discord.js');
const sqlite = require('sqlite3').verbose();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban an user from the banlist of the server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option.setName('user-id')
            .setDescription('Provide the Discord ID of the target user')
            .setRequired(true)
            ),
    
    async execute(interaction)
    {
        const {channel, options} = interaction;
        const userId = options.getString('user-id');
        const embed = new EmbedBuilder()
            .setDescription(`Successfully unbanned the user with id ${userId} .`)
            .setColor(0x5fb040)
            .setTimestamp();
        const errEmbed = new EmbedBuilder()
            .setDescription('The targeted ID is either invalid or not from a banned user.')
            .setColor(0xc72c3b);

        const db = new sqlite.Database('./source/lain-database.db', (err) => { if(err) console.error(err);});

        try {
            await interaction.guild.members.unban(userId);
            await interaction.reply({ embeds: [embed]});
        } catch (err) {
            return await interaction.reply({embeds: [errEmbed], ephemeral: true});
        }

        db.get(`SELECT * FROM prefChannelsScheme WHERE Guild = ?`, [interaction.guild.id], (err, row) => {
            if(err) console.error(err);
            if(row === undefined) return;

            let channelLog = interaction.guild.channels.cache.get(row.ModLogs);
            const logEmbed = new EmbedBuilder()
                .setColor(`Green`)
                .setTitle('User Unbanned')
                .setDescription(`**Member ID:** ${userId}\n**Moderator:** ${interaction.user.tag} (${interaction.user.id})`)
                .setTimestamp();
            channelLog.send({embeds: [logEmbed]});

        });
    }
}