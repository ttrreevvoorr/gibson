const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get the avatar URL of the selected user, or your own avatar.')
    .addUserOption(option => option.setName('target').setDescription('The user\'s avatar to show')),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    const user = interaction.options.getUser('target');
    if (user) return interaction.editReply(`${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true })}`);
    return interaction.editReply(`Your avatar: ${interaction.user.displayAvatarURL({ dynamic: true })}`);
  }
};