const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leavevoice')
    .setDescription('Makes Gibson leave the voice channel'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    return interaction.editReply(`I have tried to leave the voice channel. If not, try disconnecting me.`);
  },
};
