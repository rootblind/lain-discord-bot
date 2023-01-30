/*
    You can use the code as you please, but I kindly ask to do not remove or modify this command, it is a way to support
    my work as in letting other people finding out about me.

    You are still allowed to modify any content of this bot, including this file, if you don't want to support me.

    Thank you for choosing my bot for your server or as framework for your own discord bot code.
*/

const {
    EmbedBuilder,
    SlashCommandBuilder,
} = require('discord.js');
const lain_id = process.env.LAIN_CLIENT_ID;
module.exports = {
    data: new SlashCommandBuilder()
        .setName(`about-me`)
        .setDescription('Find out about me and my maker.')
        .addStringOption(option =>
            option.setName(`choice`)
            .setDescription(`About me or my maker.`)
            .setRequired(true)
            .addChoices(
            {name: "Lain", value: "lain"},
            {name: "Maker", value: 'blind'}
            )
        ),
        async execute(interaction)
        {
            const {guild, options} = interaction;
            const embedReply = new EmbedBuilder();
            if(options.getString('choice') == 'lain')
            {
                const me = await interaction.guild.members.cache.get(lain_id);
                embedReply.setAuthor({name: me.user.tag, iconURL: me.user.displayAvatarURL()})
                    .setTitle('About:Lain Bot')
                    .setURL('https://github.com/rootblind/lain-discord-bot')
                    .setDescription(`Hello, I am Lain bot, a discord bot for general and niche needs for discord servers.
                    I was coded and being mentained by **rootblind**, you can find my source and his github by clicking the title of this message.
                    There you can find details about how I work and you can even use the source for your own discord bot code or self host me out of the box for your own discord server.
                    If I seem disfunctional, please let my maker now so I can get patched!
                    You can get support from here: **https://discord.gg/ZWJFsWF72b**
                    My name and avatar were inspired by the anime girl character Lain from **"Serial Experiments Lain"** a great and confusing anime.`);
                
                    
            }
            else{
                embedReply.setAuthor({name: 'Blind#1115',
                iconURL: 'https://cdn.discordapp.com/avatars/224131162996473856/29bbaa50ffa54e98187b3559e13cee0b.png?size=1024'})
                    .setTitle('About:Blind')
                    .setURL('https://github.com/rootblind')
                    .setColor('Blue')
                    .setDescription(
                        `Hi, I am the one developing Lain bot. A programming entusiast and computer nerd.
                        Not that much to say about me, I'm not really a "people person".
                        I would like to ask you to look over my work by clicking the title hyperlink.
                        Most of my projects and free and open source and I plan in coding even more and more challenging ones that you can use as applications or as base code for your own projects.
                        If you wish to discuss with me about my work or any other topic, feel free to contact me via discord or join the server I made for offering support and chatting.
                        Here: **https://discord.gg/ZWJFsWF72b**`
                    );
            }
            await interaction.reply({embeds: [embedReply]});
        }
};