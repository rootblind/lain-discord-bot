const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');

const sqlite = require('sqlite3').verbose();

const client_id = process.env.LAIN_CLIENT_ID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-color')
        .setDescription('Add a role color to the color panel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
                subcommand.setName('defaults')
                    .setDescription('Create color roles with the default colors.')
            )
        .addSubcommand(subcommand => 
                subcommand.setName('role')
                    .setDescription('Add a specified role to the color panel.')
                    .addRoleOption(option =>
                            option.setName('role')
                                .setDescription('Add the role to the color panel.')
                                .setRequired(true)
                        )
            ),


        async execute(interaction)
        {
            const {options, guild, guildId, member} = interaction;
            const me = guild.members.cache.get(client_id);

            const subCmd = options.getSubcommand(['defaults', 'existent', 'custom']);

        }

};