const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const { execute } = require('../master/update-presence');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reddit')
        .setDescription('Post a random image from reddit')
        .addStringOption(option =>
                option.setName('subreddit')
                    .setDescription('The desired subreddit')
                    .setRequired(true)
            ),
        async execute(interaction)
        {
            const {options} = interaction;
            const subreddit = options.getString('subreddit');
            const embed = new EmbedBuilder();
            await fetch(`https://www.reddit.com/r/${subreddit}/random/.json`).then(async res => {
                let image = await res.json();

            try{
                let title = image[0].data.children[0].data.title;
                let url = image[0].data.children[0].data.url;
                embed.setTitle(title)
                    .setURL(url)
                    .setImage(url)
                    .setColor('Random');
            }catch(err){
                embed.setDescription(`/r/${subreddit} does not exist!`).setColor('Red');
            }
                return interaction.reply({embeds: [embed]});
            });
        }
}