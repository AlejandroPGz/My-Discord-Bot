const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { default: axios } = require('axios');

const createEmbed = ( info ) => {
  console.log(info);
  let bio1 = null;
  let link = null;
  if (info.bio?.value) {
    bio1 = info.bio.value;
  } else {
    bio1 = info.bio;
  }
  if ((/\[1\]/g).test(bio1)) {
    bio1 = bio1.replace(/\[1\]/g, '');
    console.log('tiene');
  }
  if ((/\(\[Source\]\[\d+\]\)/g).test(bio1)) {
    bio1 = bio1.replace(/\(\[Source\]\[\d+\]\)/g, '');
  }
  if ((/\(\[Source\]\)/g).test(bio1)) {
    bio1 = bio1.replace(/\(\[Source\]\)/g, '');
  }

  if (info?.wikipedia) {
    link = info.wikipedia;
  } else if (info?.links) {
    for (let i = 0; i < info.links.length; i++) {
      if (info.links[i].title === 'Wikipedia (esp)' || info.links[i].title === 'Wikipedia (en)' || info.links[i].title === 'Wikipedia' ) {
        link = info.links[i].url;
      } else {
        link = 'https://es.wikipedia.org/wiki/Wikipedia:Portada';
      }
    }} else {
    link = 'https://es.wikipedia.org/wiki/Wikipedia:Portada';
  }
  console.log(bio1);
  const parrafos = bio1.split('\r\n\r\n');
  const primerParrafo = parrafos[0];
  const segundoParrafo = parrafos[1] || '';
  const exampleEmbed = new EmbedBuilder()
    .setColor('#ffffff')
    .setTitle(`${info.personal_name}`)
    .setURL(`${link}`)
    .setDescription(`${primerParrafo +'\n'+ segundoParrafo}` || bio1)
    .addFields(
      { name: 'Nacimiento:', value: `${info.birth_date}`, inline: true },
      { name: 'Fallecimiento:', value: `${info.death_date}`, inline: true },
    )
    .setImage(`https://covers.openlibrary.org/a/id/${info.photos[0]}-L.jpg`);
  return exampleEmbed;
};


module.exports = {
  data: new SlashCommandBuilder()
    .setName('busca-un-autor')
    .setDescription('✒ Provee informacion acerca de un autor!')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('nombre del autor')
        .setRequired(true)
    )
  ,
  async execute(interaction) {
    let name = interaction.options.getString('name');
    name = name.toLowerCase();
    const cod = encodeURIComponent(name);
    try {
      const { data: infoKey } = await axios.get(`https://openlibrary.org/search/authors.json?q=${cod}`);
      const keyAuthor = infoKey.docs[0].key;
      // console.log(keyAuthor);
      const { data: infoGeneral } = await axios.get(`https://openlibrary.org/authors/${keyAuthor}.json`);
      // console.log(infoGeneral);
      const embed = createEmbed( await infoGeneral );
      await interaction.deferReply('');
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
      interaction.reply('Hubo un error, asegurese de ingresar correctamente el nombre');
    }
  },
};