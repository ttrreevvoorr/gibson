const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
  data: new SlashCommandBuilder()
  .setName("dice")
  .setDescription("Returns a random number; Rolls an any-sided dice")
  .addIntegerOption(option => option.setName('number').setDescription('What is the max number to be returned? Default is 6')),

  async execute(interaction) {
    const max = interaction.options.getInteger('number') || 6
    const username = interaction.member.nickname || interaction.member.user.username
    return interaction.reply(`🎲 **${username}** rolled a **${Math.floor((Math.random() * max) + 1)}** on a ${max}-sided dice!`)
  }
}
