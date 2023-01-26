const {SlashCommandBuilder, CommandInteractions, PermissionFlagsBits, EmbedBuilder} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a specific amount of messages from a target user or channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option =>
        option.setName('amount')
        .setDescription('Amount of messages to be deleted.')
        .setRequired(true)
        )
    .addUserOption(option =>
        option.setName('target')
        .setDescription('Select a target to delete their messages.')
        .setRequired(false)
        ),
    async execute(interaction)
    {
        const {channel, options} = interaction;

        const amount = options.getInteger('amount');
        const target = options.getUser('target');

        const messages = await channel.messages.fetch({
            limit: amount + 1,
        });
        const res = new EmbedBuilder()
            .setColor(0x930cbf)
        if(target)
        {
            let i = 0;
            const filtered = [];
            (await messages).filter((msg) =>{
                if(msg.author.id === target.id && amount > i)
                {
                    filtered.push(msg);
                    i++;
                }
            });
            await channel.bulkDelete(filtered).then(messages =>{
                res.setDescription(`I\'ve deleted ${messages.size} messages from ${target}.`);
                interaction.reply({embeds: [res]});
            });
        }
        else
        {
            await channel.bulkDelete(amount, true).then(messages =>{
                res.setDescription(`I\'ve deleted ${messages.size} messages from the channel.`);
                interaction.reply({embeds: [res]});
            });
        }
    }
}