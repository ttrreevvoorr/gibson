const { SlashCommandBuilder } = require("@discordjs/builders")
const pollEmbed = require("../embeds/pollembed");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("poll")
  .setDescription("Create a poll with numerous options, up to 10.")
  .addStringOption(option => option.setName("question").setDescription("What are you polling for?").setRequired(true))
  .addStringOption(option => option.setName("choices").setDescription("Poll choices separated by commas").setRequired(true))
  .addIntegerOption(option => option.setName("expires").setDescription("In how many seconds does this expire? 0 is infinite. Default: 30").setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    const question = interaction.options.getString("question")
    const choices  = interaction.options.getString("choices")
    const expires  = interaction.options.getInteger("expires") || 30

    interaction.editReply({content: "Generating your poll...", ephemeral: true})
    return pollEmbed(interaction, question, choices.split(","), expires);
  }
}
