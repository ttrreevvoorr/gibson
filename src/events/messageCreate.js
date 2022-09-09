const { MessageEmbed } = require('discord.js')
const {
  joinVoiceChannel,
  createAudioPlayer, 
  createAudioResource
} = require('@discordjs/voice')

const player = createAudioPlayer()
const { join } = require('path')
const { readFile } = require("../utils/helpers")
let botConfig = { "inVoice":  false }

const Log = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  // Foreground (text) colors
  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    crimson: "\x1b[38m"
  },
  // Background colors
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
    crimson: "\x1b[48m"
  }
}

const voiceFileName = './serverCommands/voiceCommands.json'
const textFileName = './serverCommands/textCommands.json'

const prefix = "!"

module.exports = {
  messageCreate: async (message) => {
    // The message sent by the user
    const userMessage = message.content.toLowerCase()
    const { channel } = message
    const guildId = message?.member?.guild?.id
  
    // Log all messages sent to the console for debugging
    // console.log(`${Log.reset}${Log.fg.blue}`,`[#${message.channel.name}(${message.channel})]:`,`${Log.reset}${Log.fg.green} ${message.author.username}:`,`${Log.reset}${Log.fg.yellow}`,`${message.content}${Log.reset}`)
  
    // Break if message sent by self
    if (message.author.bot || !guildId) {
      return
    }
    
    // User is in a voice channel, sending a message
    // Check custom commands to see if their message is a voice command
    if (message.member?.voice?.channel) {
      const requestCmd = message.content.toLowerCase()
  
      const vcFile = await readFile(voiceFileName)
      vcCmds = vcFile[guildId]?.voiceCommands || []
  
      vcCmds.forEach(async (cmd) => {
        let isCmd = false
        cmd.triggers.forEach(trigger => {
          if (requestCmd.includes(trigger)) isCmd = true
        })
  
        if (isCmd) {
          const volume = cmd.volume ? cmd.volume : 0.75

          let connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
          })

          // TODO: move player logic to its own model/class to manipulate there, 
          // rather than dual subscriptions
          botConfig.connection = connection 
          botConfig.inVoice = true
          botConfig.connection.subscribe(player)
          const resource = await createAudioResource(join(__dirname, `../audio/${cmd.response}`), { inlineVolume: true })
          resource.volume.setVolume(volume)
          player.play(resource)
        }
      })
    }
  
    // This message contains a !command
    // Check custom commands to see if exists
    const commandBody = userMessage.slice(prefix.length)
    const args = commandBody.split(' ')
    const command = args.shift().toLowerCase()
  
    // Obtain custom shortcut commands
    let tcFile = await readFile(textFileName)
    let tcCmds = tcFile[guildId]?.textCommands || []
    let foundCmd = false
    tcCmds.forEach( cmd => {
      cmd.triggers.forEach(trigger => {
        if(trigger === command) foundCmd = cmd
      })
    })

    if (foundCmd) {
      return message.channel.send(foundCmd.response)
    }

  }
}
