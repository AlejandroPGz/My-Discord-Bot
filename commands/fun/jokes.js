const { SlashCommandBuilder } = require('discord.js');
const { default: axios } = require('axios');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('jokes')
    .setDescription('🤣 Replies with a random joke!'),
  async execute(interaction) {
    try {
      const joke = await axios.get('https://geek-jokes.sameerkumar.website/api?format=json');
      console.log(joke.data.joke);
      await interaction.deferReply('');
      await interaction.editReply(`${joke.data.joke}`);
    } catch (error) {
      await interaction.reply('Hubo un error');
    }
  },
};