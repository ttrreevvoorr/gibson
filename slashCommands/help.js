const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
  .setName('help')
  .setDescription('Returns information about any /command')
  .addStringOption(option =>
    option.setName('command')
      .setDescription('What do you need help with?')
      .setRequired(true)
      .addChoice('🔔 /audioadd', 'audioadd')
      .addChoice('📝 /addcommand', 'addcommand')
      .addChoice('📝 /deletecommand', 'deletecommand')
      .addChoice('📝 /editcommand', 'editcommand')
      .addChoice('📝 /commands', 'commands')
      .addChoice('🎲 /dice', 'dice')
      .addChoice('🔊 /listen play|pause|unpause|skip|stop', 'listen')
      .addChoice('🗳️ /poll', 'poll')
      .addChoice('⚠️ /remind', 'remind')),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    let embed = new MessageEmbed()
    let command = interaction.options.getString('command')
    switch(command){
      case "dice":
        embed = new MessageEmbed()
        embed.setTitle("/dice \`number:6\`")
        embed.setColor("#5cf5f7")
        embed.addField(`Returns a random integer`, "Returns a random number starting at 1 and ending at {integer} argument. Default is 6.\n\`\`\`/dice 20\`\`\`")
        return interaction.editReply({embeds: [embed]})
        break

      case "commands":
        embed = new MessageEmbed()
        embed.setTitle("/commands")
        embed.setColor("#5cf5f7")
        embed.addField(`Returns the custom text and voice channel commands that have been added to this server`, "The results are broken out into pages, and can be long.\n\`\`\`/commands\`\`\`")
        return interaction.editReply({embeds: [embed]})
        break

      case "poll":
        embed = new MessageEmbed()
        embed.setTitle("/poll \`question:\` \`choices:\` \`expires:30\`")
        embed.setColor("#5cf5f7")
        embed.addField(
          `Allows you to create a reaction poll with comma separated choices, expiring in X seconds (default: 30)`, 
          "In the following example we create a poll with 4 choices expiring in 60 seconds. \n\`\`\`/poll question:What game should we play tonight? choices:Dance Dance Revolution,Overwatch,Fortnite,Minecraft expires:60\`\`\`"
        )
        return interaction.editReply({embeds: [embed]})
        break

      case "audioadd":
        embed = new MessageEmbed()
        embed.setTitle("/audioadd \`triggers:\` \`mp3:\`")
        embed.setColor("#5cf5f7")
        embed.addField(
          `Allows Gibson to play an audio file in reaction to any text sent in a channel`, 
          "In the following example, we configure \`clip.mp3\` to play when any member types \"hello\" in a text channel while also in a voice channel. This only works with direct links to .mp3 and .wav files: \n\`\`\`/audioadd triggers:hello mp3:https://website.com/clip.mp3\`\`\`")
        return interaction.editReply({embeds: [embed]})
        break

      case "addcommand":
        embed = new MessageEmbed()
        embed.setTitle("/addcommand \`triggers:\` \`response:\`")
        embed.setColor("#5cf5f7")
        embed.addField(
          `Configure Gibson to respond to any \`!command\` with a predetermine response`, 
          "In the following example we configure \`!minecraft\` and \`!mc\` to respond with \`127.0.0.1\` when typed in a text-channel: \n\`\`\`/addcommand triggers:minecraft,mc reaction:127.0.0.1\`\`\`")
        return interaction.editReply({embeds: [embed]})
        break

      case "editcommand":
        embed = new MessageEmbed()
        embed.setTitle("/editcommand \`trigger:\` \`response:\`")
        embed.setColor("#5cf5f7")
        embed.addField(
          `Edit an existing \`!command\` to have a new reponse.\nAlso see: \`/addcommand\``, 
          "In the following example, we change the the response to an existing \`!minecraft\` command: \n\`\`\`/editcommand trigger:minecraft reaction:192.0.1.0\`\`\`")
        return interaction.editReply({embeds: [embed]})
        break

      case "deletecommand":
        embed = new MessageEmbed()
        embed.setTitle("/deletecommand \`trigger:\`")
        embed.setColor("#5cf5f7")
        embed.addField(
          `Delete an existing \`!command\`.\nAlso see: \`/editcommand\``, 
          "In the following example, we delete the existing \`!minecraft\` command: \n\`\`\`/deletecommand trigger:minecraft\`\`\`")
        return interaction.editReply({embeds: [embed]})
        break

      case "remind":
        embed = new MessageEmbed()
        embed.setTitle("/remind \`channel:\` \`about:\` `in:`")
        embed.setColor("#5cf5f7")
        embed.addField(
          `Creates a channel reminder to be sent in X seconds/hours/minutes/days from now`, 
          "In the following example, we notify channel \`#minecraft\` about a server restart in an hour from now: \n\`\`\`/remind channel:#minecraft about:Server restarting at 2:00pm PST in:1 hour\`\`\`")
        return interaction.editReply({embeds: [embed]})
        break

      case "listen":
        embed = new MessageEmbed()
        embed.setTitle("/listen \`play\` \`pause\` \`unpause\` \`stop\` \`skip\`")
        embed.setColor("#5cf5f7")
        embed.addField(
          `/listen play`, 
          "Attach a YouTube or Soundcloud URL to play a song while in a voice channel. If a song is already being played, a queue is created. \n\`\`\`/listen play song:https://www.youtube.com/watch?v=iWa-6g-TbgI\`\`\`or\`\`\`/listen play song:Brucia la terra by Andrea Bocelli\`\`\`")
        embed.addField(
          `/listen pause`, 
          "Pauses the current track being played, if any. \n\`\`\`/listen pause\`\`\`")
        embed.addField(
          `/listen unpause`, 
          "Resume the audio player where it was paused. \n\`\`\`/listen unpause\`\`\`")
        embed.addField(
          `/listen stop`, 
          "Stops the audio player and deletes the queue. \n\`\`\`/listen stop\`\`\`")
        embed.addField(
          `/listen skip`, 
          "Skips the current song and plays next song in queue, if any. \n\`\`\`/listen skip\`\`\`")
          return interaction.editReply({embeds: [embed]})
        break

      default:
        return interaction.editReply("This is not how you use the help command. Try again.")
        break
    }
  }
}