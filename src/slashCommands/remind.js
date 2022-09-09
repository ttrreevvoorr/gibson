const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const humanInterval = require('human-interval');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('remind')
  .setDescription('Create a channel reminder')
  .addChannelOption(option => 
    option.setName('channel')
      .setDescription('The channel to remind').setRequired(true))
  .addStringOption(option => 
    option.setName('about')
      .setDescription('What are you reminding this channel about?').setRequired(true))
  .addStringOption(option => 
    option.setName('in')
      .setDescription('In how long from now? Ex: 2 hours, 14 minutes, 11 days, etc.').setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    // const user = interaction.options.getSubcommand() === 'user'
    const channel   = interaction.options.getChannel("channel")
    const reminder  = interaction.options.getString("about")
    const interval  = interaction.options.getString("in")
    const requested = interaction.member.nickname || interaction.member.user.username

    if(channel.type !== "GUILD_TEXT") {
      return interaction.editReply({
        content: `I am unable to send a reminder to non-text channel. \`${channel.name}\` is a \`${channel.type.toLowerCase()}\``, 
        ephemeral: true
      })
    }
    createTimeout(channel,reminder, humanInterval(interval), requested)
    return interaction.editReply({
      content: `I will remind ${channel} about \`${reminder}\` in \`${interval}\`.`,
      ephemeral: true
    })
  }
}

const createTimeout = (channel, reminder, interval, requested) => {
  return setTimeout(() => {
    const embed = new MessageEmbed()
    if(reminder.length < 256){
      embed.setTitle(`⚠️ Reminder: \n${reminder}`)
    } else {
      embed.setTitle(`⚠️ Reminder:`)
      embed.setDescription(`${reminder}`)
    }
    embed.setColor("#e08b0b")
    embed.setFooter(`Requested by: ${requested}`);

    return channel.send({embeds: [embed]})
  }, interval)
}
