const {Client} = require('discord.js');

module.exports = {
    name: "ready",
    once: true,
    async execute(client)
    {
        let currentDate = new Date();
        console.log(`${client.user.username} is functional! - ${currentDate.getDate()}.${currentDate.getMonth()}.${currentDate.getFullYear()} | [${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}]`);

    }
};
