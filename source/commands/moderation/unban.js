const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,

} = require('discord.js');


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

        try {
            await interaction.guild.members.unban(userId);

            const embed = new EmbedBuilder()
                .setDescription(`Successfully unbanned the user with id ${userId} .`)
                .setColor(0x5fb040)
                .setTimestamp();
            await interaction.reply(
                { embeds: [embed]}
            );
        } catch (err) {
            console.error(err);
            const errEmbed = new EmbedBuilder()
                .setDescription('The targeted ID is either invalid or not from a banned user.')
                .setColor(0xc72c3b);
            
            interaction.reply({embed: [errEmbed], ephemeral: true});
        }
    }
}