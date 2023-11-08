const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { default: axios } = require('axios');
const createEmbed = ( meme ) => {
  const exampleEmbed = new EmbedBuilder()
    .setTitle(`${meme.data.title}`)
    .setDescription(`${meme.data.postLink}`)
    .setColor('#ffffff')
    .setImage(`${meme.data.url}`);
  return exampleEmbed;
};
module.exports = {
  data: new SlashCommandBuilder()
    .setName('memes-reddit')
    .setDescription('😜 Replys with a random meme!'),
  async execute(interaction) {
    try {
      const meme = await axios.get('https://meme-api.com/gimme');
      console.log(meme.data.postLink);
      const embed = createEmbed( meme );
      await interaction.deferReply('');
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.log('error');
    }
  },
};