
const { SlashCommandBuilder } = require('@discordjs/builders')
const fs = require('fs')
const { readFile } = require("../helpers")

module.exports = {
  data: new SlashCommandBuilder()
  .setName('addcommand')
  .setDescription('Adds a !trigger response to the bot')
  .addStringOption(option => option.setName('triggers').setDescription('Comma separated text !triggers').setRequired(true))
  .addStringOption(option => option.setName('reaction').setDescription('Text response to the trigger').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    let triggers = interaction.options.getString('triggers')
    let reaction = interaction.options.getString('reaction')

    if(!triggers || !triggers.length){
      return Promise.reject("You failed to provide adequate !trigger(s).")
    }
    if(!reaction || !reaction.length){
      return Promise.reject("You failed to provide adequate trigger response.")
    }

    triggers = triggers.split(",").map(t => {
      if(t[0] === "!") return t.slice(1)
      return t
    })

    try {
      // Update the voice command list
      const fileName = 'textCommands.json'
      let tcFile = await readFile(fileName)
      tcFile[interaction.guild.id] = tcFile[interaction.guild.id] || { textCommands: [] }
      // Do any of these triggers exist?
      let found = false
      tcFile[interaction.guild.id].textCommands.forEach(cmd => found = cmd.triggers.some(r=> triggers.includes(r)))
      if(found) {
        throw(`:no_entry: It appears some "${triggers}" already exist as a command`)
      }

      // Update the text command list save the text file
      tcFile[interaction.guild.id] = {
        textCommands: [
          ...tcFile[interaction.guild.id].textCommands,
          {
            triggers,
            response: reaction
          }
        ]
      }
  
      fs.writeFile(fileName, JSON.stringify(tcFile, null, 2), function writeJSON(err) {
        if (err) return Promise.reject(err)
        interaction.editReply(`Typing any \`${triggers.map(t => "!" + t)}\` will trigger \`${reaction}\` in any channel :thumbsup:`)
      })

    } catch(err){
      return Promise.reject(err)
    }
  }
}
