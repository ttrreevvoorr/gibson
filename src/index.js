require('dotenv').config()
const Discord = require("discord.js")
const { Collection, Intents, } = require("discord.js")

const fs = require("fs")

const { messageCreate } = require("./events/messageCreate")
// const { interactionCreate } = require("./events/interactionCreate")

const token = process.env.TOKEN

const MemoryMom = require("./utils/MemoryMom")
const memory = new MemoryMom()

const client = new Discord.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    // Intents.FLAGS.GUILDS,
    // Intents.FLAGS.GUILD_MEMBERS,
    // Intents.FLAGS.GUILD_BANS,
    // Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    // Intents.FLAGS.GUILD_INTEGRATIONS,
    // Intents.FLAGS.GUILD_WEBHOOKS,
    // Intents.FLAGS.GUILD_INVITES,
    // Intents.FLAGS.GUILD_VOICE_STATES,
    // Intents.FLAGS.GUILD_PRESENCES,
    // Intents.FLAGS.GUILD_MESSAGES,
    // Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    // Intents.FLAGS.GUILD_MESSAGE_TYPING,
    // Intents.FLAGS.DIRECT_MESSAGES,
    // Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    // Intents.FLAGS.DIRECT_MESSAGE_TYPING
  ]
})



// Initiate commands:
client.commands = new Collection()
const commandFiles = fs.readdirSync("./src/slashCommands").filter(file => file.endsWith(".js"))
for (const file of commandFiles) {
  const command = require(`./slashCommands/${file}`)
  client.commands.set(command.data.name, command)
}
client.on("ready", () => {
  console.log("Ready!")
})

client.on("messageCreate", messageCreate)

// client.on("voiceStateUpdate", (msg, err) => {})

// client.on("guildMemberSpeaking", (msg, err) => {})

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return
  
  const command = client.commands.get(interaction.commandName)

  if (!command) return

  try {
    await command.execute(interaction, memory)
  }
  catch (error) {
    console.error(error)
    await interaction.editReply({
      content: `There was an error while executing this command:\n ${error}`,
      ephemeral: true
    })
  }
})

client.on("disconnect", message => {
  console.log("dying...")
  console.log(message)
  process.exit(1)
})

client.login(token)
