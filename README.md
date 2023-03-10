
# Lain

 
 Nodejs Discord bot for managing a server.
 
 This project is ON GOING, you can raise **issues** if you wish for features or to contribute!


![Logo](https://i.ibb.co/xG8Nv30/Lain-Discord-Bot.png)

## Key modules

You can find them [here](https://github.com/rootblind/lain-discord-bot/tree/main/source/commands).

- Moderation
- Info
- Miscellaneous
- Premium members
- Setup
- Roles
- More will be added soon


## How to Use

Clone the project

```bash
  git clone https://github.com/rootblind/lain-discord-bot.git
```

Go to the project directory

```bash
  cd lain-discord-bot
```

Install dependencies

```bash
  npm install
  #make sure to be in the project folder
```

Use Nodejs to run the bot

```bash
  node ./source/lain-main.js
```

It is important to note that, as the bot Owner, you should run the /default-database command before using it.

Also Lain is set to work only if she has Administrator permissions. You can change that in [this file](https://github.com/rootblind/lain-discord-bot/blob/main/Events/interaction/interactionCreate.js).


## Get the latest Nodejs version from here:
[Click](https://nodejs.org/en/)


    
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file



`Your token: LAIN_TOKEN`

`Your bot client ID: LAIN_CLIENT_ID`

`Your discord ID: OWNER_ID`

`TEST_SERVER_ID`

At the moment, the bot runs on guild commands, not global.

The `TEST_SERVER_ID` refers to the server you're running her on.

You can change the name of the variables, but make sure to make the change in code as well!

## Credits

 - [Nodejs](https://nodejs.org/en/)
 - [Discordjs](https://discordjs.guide/#before-you-begin)
 - [SQLite3](https://www.sqlite.org/index.html)


## Author

- [@rootblind](https://www.github.com/rootblind)


## License

[GPL v3](https://github.com/rootblind/lain-discord-bot/blob/main/LICENSE)


## 🔗 Links

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](www.linkedin.com/in/grecu-ionut-catalin)


## Ask for Support

For support, you can find me on discord: Blind#1115

Or [join this discord server](https://discord.gg/ZWJFsWF72b)


## If you want to support me

If you find this project or my work useful or interesting to you, please consider supporting me.

You can do that by [donating](https://www.paypal.com/paypalme/kassgar), offering some tips to improve my skills or

using Lain Bot without removing or modifying the /about-me command.
