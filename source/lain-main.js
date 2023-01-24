
const {config} = require('dotenv');
const {Client, GatewayIntentBits, Routes, Partials, Collection} = require('discord.js');
const {REST} = require('@discordjs/rest');

//user files
const {loadEvents} = require('../Handlers/eventHandler');
const { loadCommands } = require('../Handlers/commandHandler');
const { handleLogs } = require('../Handlers/handlerLogs.js')

config();


const client = new Client({ intents: [
    Object.keys(GatewayIntentBits),
],
partials:[
    Object.keys(Partials)
]
});
//env variables
const TOKEN = process.env.LAIN_TOKEN;
const CLIENT_ID=process.env.LAIN_CLIENT_ID;
const GUILD_ID=process.env.TEST_SERVER_ID;

const rest = new REST({ version: '10'}).setToken(TOKEN);
client.commands = new Collection();



async function main()
{

    const commands = [];
    try{
        console.log('Refreshing slash commands');
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands,
        });
        client.login(TOKEN).then(() => {
            loadEvents(client);
            loadCommands(client);
            handleLogs(client);
        });
    }catch(err)
    {
        console.log(err);
    }
}
main();
module.exports = client;