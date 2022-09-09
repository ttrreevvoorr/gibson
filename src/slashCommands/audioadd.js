
const { SlashCommandBuilder } = require('@discordjs/builders')
const fs = require('fs')
const { readFile, getURL } = require("../utils/helpers")

module.exports = {
  data: new SlashCommandBuilder()
  .setName('audioadd')
  .setDescription('Adds audio to voice chat!!')
  .addStringOption(option => option.setName('triggers').setDescription('Comma separated text triggers').setRequired(true))
  .addStringOption(option => option.setName('mp3').setDescription('URL to MP3 or WAV sound file').setRequired(true))
  .addIntegerOption(option => option.setName('volume').setDescription('Volume, 100 being 100%').setRequired(false)),
  // .addNumberOption(option => option.setName('num').setDescription('Enter a number'))
  // .addBooleanOption(option => option.setName('choice').setDescription('Select a boolean'))
  // .addUserOption(option => option.setName('target').setDescription('Select a user'))
  // .addChannelOption(option => option.setName('destination').setDescription('Select a channel'))
  // .addRoleOption(option => option.setName('muted').setDescription('Select a role'))
  // .addMentionableOption(option => option.setName('mentionable').setDescription('Mention something')),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    let triggers = interaction.options.getString('triggers')
    let mp3URL = interaction.options.getString('mp3')
    let volume = interaction.options.getInteger('volume')
    // const number = interaction.options.getNumber('num')
    // const boolean = interaction.options.getBoolean('choice')
    // const user = interaction.options.getUser('target')
    // const member = interaction.options.getMember('target')
    // const channel = interaction.options.getChannel('destination')
    // const role = interaction.options.getRole('muted')
    // const mentionable = interaction.options.getMentionable('mentionable')

    volume = volume ? volume / 100 : 1

    //Check for errors
    if(!mp3URL){
      return Promise.reject("You failed to attach an audio clip.")
    }
    if(!mp3URL.startsWith("https")){
      return Promise.reject("I only support \`https\` hyperlinks.")
    }
    if(!mp3URL.endsWith(".mp3") && !mp3URL.endsWith(".wav")){
      return Promise.reject("This attachment does not appear to be an \`.mp3\` or a \`.wav\`")
    }
    if(!triggers || !triggers.length){
      return Promise.reject("You failed to provide adequate voice triggers. Try \`!help audioAdd\`")
    }

    triggers = triggers.split(",")

    let mp3FileName = mp3URL.split("/")[mp3URL.split("/").length -1].replace(" ","_")

    try {
      let response = await getURL(mp3URL)
      if (response.statusCode !== 200) {
        return Promise.reject(`The .mp3 file at this location was unobtainable:\n\`${mp3URL}\``)
      } 

      // Save the audio file 
      const path = `audio/${mp3FileName}`
      var file = fs.createWriteStream(path)
      response.pipe(file)
    
      // Update the voice command list
      const fileName = 'voiceCommands.json'
      let vcFile = await readFile(fileName)

      // Do any of these triggers exist?
      let found = false
      vcFile[interaction.guild.id] = vcFile[interaction.guild.id] || { voiceCommands: [] }
      vcFile[interaction.guild.id]?.voiceCommands.forEach(cmd => found = cmd.triggers.some(r=> triggers.includes(r)))
      if(found) {
        throw(`:no_entry: It appears some "${triggers}" already exist as a command`)
      }

      // Save the audio file and update the voice command list
      vcFile[interaction.guild.id] = {
        voiceCommands: [
          ...vcFile[interaction.guild.id].voiceCommands,
          {
            triggers,
            response: mp3FileName,
            volume
          }
        ]
      }
  
      fs.writeFile(fileName, JSON.stringify(vcFile, null, 2), function writeJSON(err) {
        if (err) return Promise.reject(err)
        interaction.editReply(`Typing any \`${triggers}\` will trigger \`${mp3FileName}\` in voice chat :thumbsup:`)
      })

    } catch(err){
      return Promise.reject(err)
    }
  
  }
}
