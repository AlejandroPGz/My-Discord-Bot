const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { default: axios } = require('axios');
const paginationEmbed = require('discordjs-v14-pagination');

let arrayEmbeds = [];

//array de botones
const firstPageButton = new ButtonBuilder()
  .setCustomId('first')
  .setEmoji('1029435230668476476')
  .setStyle(ButtonStyle.Primary);

const previousPageButton = new ButtonBuilder()
  .setCustomId('previous')
  .setEmoji('1029435199462834207')
  .setStyle(ButtonStyle.Primary);

const nextPageButton = new ButtonBuilder()
  .setCustomId('next')
  .setEmoji('1029435213157240892')
  .setStyle(ButtonStyle.Primary);

const lastPageButton = new ButtonBuilder()
  .setCustomId('last')
  .setEmoji('1029435238948032582')
  .setStyle(ButtonStyle.Primary);

const buttons = [ firstPageButton, previousPageButton, nextPageButton, lastPageButton ];

const createEmbed = ( info, n ) => {
  console.log(info.items[0].volumeInfo);
  let img = null;
  let autor = null;
  let category = null;
  if (info.items[n].volumeInfo.imageLinks?.thumbnail) {
    img = info.items[n].volumeInfo.imageLinks.thumbnail;
    console.log('si hay');
  } else {
    img = 'https://cdn.pixabay.com/photo/2017/06/08/17/32/not-found-2384304_1280.jpg';
    console.log('no hay');
  }
  if (info.items[n].volumeInfo?.authors) {
    autor = info.items[n].volumeInfo.authors[0];
    console.log('si hay autor');
  } else {
    autor = 'no fue encontrado';
    console.log('no hay autor');
  }
  if (info.items[n].volumeInfo?.categories) {
    category = info.items[n].volumeInfo.categories[0];
  } else {
    category = 'no encontrado';
  }

  //console.log(info.items[n].volumeInfo);
  console.log(info.items[n].volumeInfo.title, 'titulo');
  console.log(autor, 'autor');
  //console.log(info.items[n].volumeInfo.categories[0], 'categoria');
  //console.log(info.items[n].volumeInfo.imageLinks.thumbnail);
  console.log(img, 'imagen');
  const exampleEmbed = new EmbedBuilder()
    .setColor('#ffffff')
    .setTitle(`${info.items[n].volumeInfo.title}`)
    .addFields(
      { name: 'Autor:', value: `${autor}`, inline: true },
      { name: 'Categoria:', value: `${category}`, inline: true },
    )
    .setImage(`${img}`);
  return exampleEmbed;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('busca-un-libro')
    .setDescription('📕 Provee informacion acerca de un libro!')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('nombre del libro')
        .setRequired(true)
    )
  ,
  async execute(interaction) {
    let name = interaction.options.getString('name');
    name = name.toLowerCase();
    const cod = encodeURIComponent(name);
    //console.log(cod);
    //const editoriales = 'Ediciones LEA';
    try {
      const { data: info } = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${cod}}`);
      for (let i = 0; i < info.items.length; i++) {
        let a = createEmbed( await info, i );
        arrayEmbeds.push(a);
      }
      //const embed1 = createEmbed( await info, 0 );
      //const embed2 = createEmbed( await info, 1);
      //arrayEmbeds.push(embed1, embed2);
      //console.log(arrayEmbeds);
      await interaction.deferReply('');
      paginationEmbed(
        interaction, // The interaction object
        arrayEmbeds, // Your array of embeds
        buttons, // Your array of buttons
        60000, // (Optional) The timeout for the embed in ms, defaults to 60000 (1 minute)
        'Page {current}/{total}' // (Optional) The text to display in the footer, defaults to 'Page {current}/{total}'
      );
      arrayEmbeds = [];
    } catch (error) {
      console.log(error);
      interaction.reply('Hubo un error, asegurese de ingresar correctamente el nombre');
    }
  }
};