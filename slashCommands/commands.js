const { SlashCommandBuilder } = require("@discordjs/builders")
const { readFile } = require("../helpers")
const { MessageEmbed } = require("discord.js")
const voiceFileName = 'voiceCommands.json'
const textFileName = 'textCommands.json'

module.exports = {
  data: new SlashCommandBuilder()
  .setName("commands")
  .setDescription("Returns all of the custom commands for this server"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    let embeds = [], embed, pages = 0

    // Return this server's text commands
    let tcFile = await readFile(textFileName)
    tcCmds = tcFile[interaction.guild.id]?.textCommands
    if(!tcCmds) return interaction.editReply("This server does not have any text commands configured. Use \`/addcommand\` to create one.")
    pages = tcCmds.length > 20 ? Math.round(tcCmds.length / 20) : 1

    for(i=0; i<pages; i++) {
      embed = new MessageEmbed()
      embed.setColor("#FFFFFF")
      embed.setTitle(`Supported !trigger responses`)
      embed.setDescription(`Page ${i+1}/${pages}`)
      
      let start = i * 24
      tcCmds.sort((a, b) => {
        if(a.response < b.response) { return -1 }
        if(a.response > b.response) { return 1 }
        return 0
      }).slice(start).every(async (cmd, i) => {
        if(i>=24) return false  
        embed.addField(`${cmd.triggers }`,`${cmd.response}`, true)
      })
      embeds.push(embed)
    }


    // Return this server's audio responses
    const vcFile = await readFile(voiceFileName)
    vcCmds = vcFile[interaction.guild.id]?.voiceCommands
    if(!vcCmds) return interaction.editReply("This server does not have any audio triggers configured. Use \`/audioadd\` to create one.")
    pages = vcCmds.length > 20 ? Math.round(vcCmds.length / 20) : 1

    for(i=0; i<pages; i++) {
      embed = new MessageEmbed()
      embed.setColor("#FFFFFF")
      embed.setTitle(`Voice commands I support`)
      embed.setDescription(`Page ${i+1}/${pages}`)
      
      let start = i * 24
      vcCmds.sort((a, b) => {
        if(a.response < b.response) { return -1 }
        if(a.response > b.response) { return 1 }
        return 0
      }).slice(start).every(async (cmd, i) => {
        if(i>=24) return false  
        embed.addField(`${cmd.response.length > 15 ? cmd.response.slice(0, 12) + "..." : cmd.response }`,`${cmd.triggers}`, true)
      })
      embeds.push(embed)
    }

    interaction.editReply({embeds})
  }
}
