require('dotenv').config()
const fs = require('fs')
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
// const { clientId, token } = require('./config.json');
const clientId = process.env.CLIENT_ID, 
      token = process.env.TOKEN

const commands = [];
const commandFiles = fs.readdirSync('./slashCommands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./slashCommands/${file}`)
  commands.push(command.data.toJSON());
}

// console.log(clientId)
const rest = new REST({ version: '9' }).setToken(token);
(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );
    
    console.log('Successfully registered application commands.');
    console.log(commands);
  } catch (error) {
    console.error(error);
  }
})()
