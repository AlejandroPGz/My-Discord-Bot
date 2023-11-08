const { default: axios } = require('axios');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const createEmbed = ({ country, weather, hexColor }) => {
  const exampleEmbed = new EmbedBuilder()
    .setColor(`${hexColor}`)
    .setTitle(country.name.common)
    .setURL(`https://es.wikipedia.org/wiki/${country.translations.spa.common}`)
    .setDescription('muesta info del pais')
    .setThumbnail(`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`)
    .addFields(
      { name: 'Capital', value: `${country.capital[0]}`, inline: true },
      { name: 'Poblacion', value: `${parseInt(country.population).toLocaleString()}`, inline: true },
      { name: 'Region', value: `${country.region}`, inline: true },
    )
    .addFields(
      { name: 'Grados', value: `${weather.main.temp}`, inline: true },
      { name: 'Clima', value: `${weather.weather[0].description}`, inline: true },
      { name: 'GoogleMaps', value: `${country.maps.googleMaps}`, },

    )
    .setImage(`${country.flags.png}`);
  return exampleEmbed;
};
module.exports = {
  data: new SlashCommandBuilder()
    .setName('search-country')
    .setDescription('🌍 Search any country!')
    .addStringOption(option =>
      option
        .setName('country')
        .setDescription('write a country')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const country = interaction.options.getString('country');
      const { data: countryInfo } = await axios.get(`https://restcountries.com/v3.1/name/${country}`);
      const latitud =  countryInfo[0].latlng[0];
      const longitud =  countryInfo[0].latlng[1];
      const imageUrl = `${countryInfo[0].flags.png}`;
      let hexColor = null;
      const canvas = createCanvas(1, 1);
      const context = canvas.getContext('2d');
      loadImage(imageUrl).then(image => {
        // Establece el tamaño del lienzo de acuerdo al tamaño de la imagen
        canvas.width = image.width;
        canvas.height = image.height;
        // Dibuja la imagen en el lienzo
        context.drawImage(image, 0, 0);
        // Obtiene el color del píxel en la posición deseada
        const colorData = context.getImageData(1, 1, 1, 1).data;
        // Muestra los valores RGBA del píxel
        const red = colorData[0].toString(16).padStart(2, '0');
        const green = colorData[1].toString(16).padStart(2, '0');
        const blue = colorData[2].toString(16).padStart(2, '0');
        hexColor = `#${red}${green}${blue}`;
        return hexColor;
      });
      const { data: weather } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitud}&lon=${longitud}&appid=ccd47940cdd6cfbad918a9aa0d9cc3af&units=metric`);
      const embed = createEmbed({ country: countryInfo[0], weather, hexColor });
      await interaction.deferReply('');
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply('ese pais no existe');
    }
  },
};