const {Message, Client, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');
const sqlite = require('sqlite3').verbose();

module.exports = {
    data: new SlashCommandBuilder()
    .setName('set-welcome-message')
    .setDescription('Set up the welcome message')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
        option.setName('channel')
        .setDescription('The channel where the welcome message will be posted.')
        .setRequired(true)
    )
    .addStringOption(option => 
        option.setName('welcome-message-title')
        .setDescription('The title of the message.')
        .setRequired(true))
    .addStringOption(option =>
        option.setName('welcome-message')
        .setDescription('Your welcoming message.')
        .setRequired(true)
    ),
    async execute(interaction)
    {
        const {channel, options} = interaction;

        const welcomeChannel = options.getChannel('channel');
        if(welcomeChannel.type != 0)
        {
            interaction.reply('You must provide a text channel!');
            return;
        }
        const welcomeTitle = options.getString('welcome-message-title');
        const welcomeMessage = options.getString('welcome-message');
        if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.SendMessages))
            interaction.reply({content:'Lacking SendMessages permission.', ephemeral: true});
        
        const db = new sqlite.Database('./source/lain-database.db', (err) => {
            if(err) console.error(err);
        });
        db.serialize(function(){
            db.get(`SELECT * FROM welcomeScheme WHERE Guild='${interaction.guild.id}'`, (err, row) => {
                if(err) console.error(err);
                if(row !== undefined)
                    db.run(`UPDATE welcomeScheme SET Channel = ?, Title = ?, Msg = ? WHERE Guild = ?`, [
                        welcomeChannel.id,
                        welcomeTitle,
                        welcomeMessage,
                        interaction.guild.id
                    ],
                        (err) => { if(err) console.error(err); });
                else
                    db.run(`INSERT INTO welcomeScheme(Guild, Channel, Title, Msg) VALUES (?, ?, ?, ?)`, [
                        interaction.guild.id,
                        welcomeChannel.id,
                        welcomeTitle,
                        welcomeMessage
                    ], (err) => { if(err) console.error(err);});
            });//if the row exists, means the welcomeScheme for the specific guild already exists, so we update it, else we insert new row
        });
            
        await interaction.reply({content: 'The welcome message has been set. This is a preview:', ephemeral: true});
        const welcomeEmbed = new EmbedBuilder()
            .setAuthor({name: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL()})
            .setTitle(welcomeTitle)
            .setDescription(welcomeMessage)
            .setColor(0x00001)
            .setTimestamp()
            .setFooter({text:`ID: ${interaction.user.id}`});
        await interaction.followUp({embeds: [welcomeEmbed], ephemeral: true});
    }
}