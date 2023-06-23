const {Message, Client, SlashCommandBuilder, EmbedBuilder,PermissionFlagsBits, Embed} = require('discord.js');

const sqlite = require('sqlite3').verbose();

const client_id = process.env.LAIN_CLIENT_ID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('custom-embed')
        .setDescription('Create a custom embed in the current channel.')
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Embed\'s body description.')
                .setRequired(true)
            )
        .addStringOption(option =>
            option.setName(`title`)
                .setDescription('The title of the embed.')
            )
        .addStringOption(option =>
            option.setName('author-name')
                .setDescription('The name of the author')
            )

        .addStringOption(option =>
            option.setName('footer-text')
                .setDescription('The text of the footer.')
            )
        .addNumberOption(option =>
            option.setName('color')
                .setDescription('Input the hexcode of the desired color.')
            )
        .addStringOption(option =>
            option.setName('title-link')
                .setDescription('Hyperlink the title.')
            )

        .addStringOption(option =>
            option.setName('author-icon')
                .setDescription('Image URL of the author')
            )
        .addStringOption(option =>
            option.setName('author-link')
                .setDescription('Hyperlink author\'s name.')
            )

        .addStringOption(option =>
            option.setName('thumbnail')
                .setDescription('Insert a thumbnail image.')
            )
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Insert an image through url in the body of the embed.')
            )
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel where the embed will be sent or current channel.')
            )

        .addStringOption(option =>
            option.setName('footer-icon')
                .setDescription('Insert an icon in the footer.')
            ),

    async execute(interaction)
    {
        const db = new sqlite.Database('./source/lain-database.db', (err) => {
            if(err) console.error(err);
        });
        
        const {options} = interaction;

        let textDescription = options.getString('description');

        let title = options.getString('title') || null;
        let authorName = options.getString('author-name') || null;
        let textFooter = options.getString('footer-text') || null;
        let authorLink = options.getString('author-link') || null;
        let color = options.getNumber('color') || 0x800080;
        let titleLink = options.getString('title-link') || null;
        let authorIcon = options.getString('author-icon') || interaction.user.displayAvatarURL();
        let thumbnail = options.getString('thumbnail') || null;
        let imageLink = options.getString('image') || null;
        let footerIcon = options.getString("footer-icon") || null;
        let channel = options.getChannel('channel') || interaction.channel;
        const me = interaction.guild.members.fetch(client_id);
        if(interaction.member.permissionsIn(channel).has(PermissionFlagsBits.SendMessages))
        {
            return interaction.reply({content: 'You do not have SendMessages permission in that channel.', ephemeral: true});
        }
        if(me.permissionsIn(channel).has(PermissionFlagsBits.SendMessages))
        {
            return interaction.reply({content: 'I lack SendMessages permission in that channel!', ephemeral: true})
        }

        db.get(`SELECT * FROM dedicatedRolesScheme WHERE Guild = ?`, [interaction.guild.id], (err, row) => {
            if(err) console.error(err);
            let dedicatedRoles = [];
            if(row.Staff)
                dedicatedRoles.push(row.Staff);
            if(row.Premium)
                dedicatedRoles.push(row.Premium);
            if(!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) && 
                !interaction.member.permissions.has(PermissionFlagsBits.Administrator) &&
                !interaction.member.roles.cache.some(role => dedicatedRoles.includes(role.name)))
            {
                const noPermissionEmbed = new EmbedBuilder()
                    .setTitle('You lack permissions!')
                    .setDescription('You do not have the required roles or permissions to use this command!')
                    .setColor('Red');
                return interaction.reply({embeds: [noPermissionEmbed], ephemeral: true});
            }
            const customEmbed = new EmbedBuilder()
                .setDescription(textDescription)
                .setColor(color);

            const errEmbed = new EmbedBuilder()
                .setColor('Red');
            
            if(title)
            {
                if(title.length <= 255)
                    customEmbed.setTitle(title);
                else
                {
                    errEmbed.setDescription('The title is too long(255)!');
                    return interaction.reply({embeds: [errEmbed], ephemeral: true});
                }
            }


            if(authorName)
            {
                if(authorName.length <= 255)
                {
                    try{
                            customEmbed.setAuthor({name: authorName, iconURL: authorIcon, url: authorLink});
                    }catch(err)
                    {
                        errEmbed.setDescription('Invalid link provided for the author or its icon.');
                    return interaction.reply({embeds: [errEmbed], ephemeral: true});
                    }
                }
                else
                {
                    errEmbed.setDescription('Author\'s name is too long!(255)');
                    return interaction.reply({embeds: [errEmbed], ephemeral: true});
                }
            }


            if(textFooter)
            {
                if(textFooter.length < 81)
                {
                    try{
                        customEmbed.setFooter({text: textFooter, iconURL: footerIcon});
                    }catch(err){
                        errEmbed.setDescription('Invalid link provided for the footer icon or the text is too large!');
                        return interaction.reply({embeds: [errEmbed], ephemeral: true});
                    }
                }
                else
                {
                    errEmbed.setDescription('The footer text is too long!(80)');
                    return interaction.reply({embeds: [errEmbed], ephemeral: true});
                }
            }


            if(titleLink)
            {
                try
                    {
                        customEmbed.setURL(titleLink);
                    }
                    catch(err)
                    {
                        errEmbed.setDescription('Invalid link provided for the title link.');
                        return interaction.reply({embeds: [errEmbed], ephemeral: true});
                    }
                
            }

            if(thumbnail)
            {
                try{
                    customEmbed.setThumbnail(thumbnail);
                }catch(err){
                    errEmbed.setDescription('Invalid link provided for the thumbnail');
                    return interaction.reply({embeds: [errEmbed], ephemeral: true});
                }
            }
                
            if(imageLink)
            {
                try{
                    customEmbed.setImage(imageLink);
                }catch(err){
                    errEmbed.setDescription('Invalid link provided for the image');
                    return interaction.reply({embeds: [errEmbed], ephemeral: true});
                }
            }
            
            channel.send({embeds: [customEmbed]});
            db.get(`SELECT * FROM prefChannelsScheme WHERE Guild =?`, [interaction.guild.id], (err, row) => {
                if(err) console.error(err);
                if(row === undefined) return;
                const logEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(`Embed created by **${interaction.user.tag}** in **${channel.name}** channel.`)
                    .setTimestamp();
                let logChannel = interaction.guild.channels.cache.get(row.MembersActivityLogs);
                logChannel.send({embeds: [logEmbed]});
            });
            const sentEmbed = new EmbedBuilder()
                .setDescription(`Embed successfully sent to **${channel.name}**.`)
                .setFooter({text: 'This message is seen only by you.'});
            interaction.reply({embeds: [sentEmbed], ephemeral: true});
        });

    }
};