const {Client, ActivityType} = require('discord.js');
const sqlite = require('sqlite3').verbose();
const fs = require('fs');
const { clearInterval } = require('timers');
function randNum(maxim)
{
    return Math.floor(Math.random() * maxim);
}
module.exports = {
    name: "ready",
    once: true,
    async execute(client)
    {
        let currentDate = new Date();
        console.log(`${client.user.username} is functional! - ${currentDate.getDate()}.${currentDate.getMonth()}.${currentDate.getFullYear()} | [${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}]`);
        const db = new sqlite.Database('./source/lain-database.db');

        
        let botAuto;
        let rawConfig = fs.readFileSync('./source/presence/presence-config.json');
        let presenceConfig = JSON.parse(rawConfig);
        //the bot might need to be restarted in order to read the new config
        botAuto = setInterval(() => {
                if(presenceConfig["status"] == "disable")
                {
                    return;
                }
                let actList = ["Playing", "Listening", "Watching"];
                let rawData = fs.readFileSync('./source/presence/presence-autoupdate.json');
                let presence = JSON.parse(rawData);
                let selectNum = randNum(4); // selecting the activity Playing, Listening or Watching
                let decide = actList[randNum(selectNum)];
                client.user.setPresence({activities: [{name: presence[decide][randNum(presence[decide].length)],
                    type: ActivityType[decide]}], status: 'online'});
            }, presenceConfig["delay"]);

    }
};
