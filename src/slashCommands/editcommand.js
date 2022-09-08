
const { SlashCommandBuilder } = require('@discordjs/builders')
const { readFile } = require("../utils/helpers")
const fs = require('fs')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('editcommand')
    .setDescription('Updates the response of a !trigger')
    .addStringOption(option => option.setName('trigger').setDescription('The !trigger you would like to edit').setRequired(true))
    .addStringOption(option => option.setName('reaction').setDescription('New response to the !trigger shortcut').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    let triggers = interaction.options.getString('trigger')
    let reaction = interaction.options.getString('reaction')

    if(!triggers || !triggers.length){
      return Promise.reject("You failed to provide adequate !trigger(s).")
    }
    if(!reaction || !reaction.length){
      return Promise.reject("You failed to provide adequate trigger response.")
    }

    triggers = triggers.split(/[\s,]+/)
    if(triggers.length > 1){
      return Promise.reject("You can only edit one !trigger at a time.`")
    }

    triggers = triggers.map(t => {
      if(t[0] === "!") return t.slice(1)
      return t
    })

    try {
      // Update the voice command list
      const fileName = 'textCommands.json'
      let tcFile = await readFile(fileName)

      // Do any of these triggers exist?
      let editIndex = false
      tcFile[interaction.guild.id].textCommands.forEach((cmd,i) => {
        let found = cmd.triggers.some(r=> triggers.includes(r))
        if(found) editIndex = i
      })
      if(!editIndex) {
        throw(`:no_entry: It appears some "${triggers}" are not commands. You can not edit a command that does not exist.`)
      }

      // Save the audio file and update the voice command list
      tcFile[interaction.guild.id].textCommands[editIndex] = {
        ...tcFile[[interaction.guild.id]].textCommands[editIndex],
        response: reaction
      }
    
  
      fs.writeFile(fileName, JSON.stringify(tcFile, null, 2), function writeJSON(err) {
        if (err) return Promise.reject(err)
        return interaction.editReply(`The trigger \`${triggers.map(t => "!" + t)}\` now responds with \`${reaction}\`. Try it! :thumbsup:`)
      })

    } catch(err){
      return Promise.reject(err)
    }
  }
}
