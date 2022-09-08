
const { SlashCommandBuilder } = require('@discordjs/builders')
const { readFile } = require("../utils/helpers")
const fs = require('fs')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletecommand')
    .setDescription('Deletes a command by !trigger')
    .addStringOption(option => option.setName('triggers').setDescription('The !trigger you would like to edit').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    let triggers = interaction.options.getString('triggers')

    if(!triggers || !triggers.length){
      return Promise.reject("You failed to provide adequate !trigger(s).")
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
        cmd.triggers.forEach(r => {
          if(triggers.includes(r)){
            editIndex = i
          }
        })
      })
      if(editIndex === false) {
        throw(`:no_entry: It appears some "${triggers}" are not commands. You can not edit a command that does not exist.`)
      }

      // Save the audio file and update the voice command list
      tcFile[interaction.guild.id].textCommands.splice(editIndex, 1)    
  
      fs.writeFile(fileName, JSON.stringify(tcFile, null, 2), function writeJSON(err) {
        if (err) return Promise.reject(err)
        return interaction.editReply(`The trigger \`${triggers.map(t => "!" + t)}\` has been deleted.`)
      })

    } catch(err){
      console.log(err)
      return Promise.reject(err)
    }
  }
}
