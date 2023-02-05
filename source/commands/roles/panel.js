const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder} = require('discord.js');
const { execute } = require('./add-role');

const sqlite = require('sqlite3').verbose();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role-panel')
        .setDescription('Display all reaction roles on the panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

        async execute(interaction)
        {
            const {guildId} = interaction;
            const db = new sqlite.Database('./source/lain-database.db', (err) => {if(err) console.error(err);});
            const embed = new EmbedBuilder();
            let promise;
            let getData = () => { return new Promise((resolve, reject) => {
                db.serialize(() => {
                        db.all(`SELECT * FROM rolesPanelScheme WHERE Guild= ?`, [guildId], (err, rows) => {
                            if(err) reject(err);
                            resolve(rows);
                            promise = rows;
                        });
                        
                    });
                });

            };
            await getData();
            if(!promise[0])
            {
                embed.setColor('Red').setDescription('This server does not present any data.');
                return interaction.reply({embeds: [embed], ephemeral: true});
            }
            const panelEmbed = new EmbedBuilder()
                .setColor('Purple')
                .setDescription('Pick your roles!');
            const options = promise.map(element => {
                const role = interaction.guild.roles.cache.get(element.Role);

                return {
                    label: role.name,
                    value: role.id,
                    description: element.Desc,
                };
                
            });
            const components = [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('reaction-roles')
                        .setMaxValues(options.length)
                        .addOptions(
                            options
                        ),
                ),
            ];
            interaction.channel.send({embeds: [panelEmbed], components: components});
            return interaction.reply({embeds: [embed.setColor('Green').setDescription('The panel has been sent.')], ephemeral: true});
        }
};