
function loadCommands(client)
{
    const ascii = require('ascii-table');
    const table = new ascii().setHeading('Commands', 'Status');
    const fs = require('fs');
    const folders = fs.readdirSync('./source/commands');

    let commandsArray = [];
    //folder is the current folder, folders are the commands folders
    //same goes for file and files
    for(const folder of folders)
    {
        const files = fs.readdirSync(`./source/commands/${folder}`).filter((file) => file.endsWith('.js'));

        for(const file of files)
        {//command File
            const commandF = require(`../source/commands/${folder}/${file}`);

            const proprieties = {folder, ...commandF};

            client.commands.set(commandF.data.name, proprieties);
            commandsArray.push(commandF.data.toJSON());
            table.addRow(file, "loaded");
            continue;
        }
    }
    client.application.commands.set(commandsArray);
    return console.log(table.toString(), "\nLoaded commands");
}

module.exports = {loadCommands};