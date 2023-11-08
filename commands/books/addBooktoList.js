const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');
const { default: axios } = require('axios');
const db = require('../../dataBase');
const { getBookFromDb } = require('../../utils/searchBookDB');
const { getUserFromDb } = require('../../utils/searchUser');

//menu estado
const menu = new StringSelectMenuBuilder()
  .setCustomId('status')
  .setMinValues(0)
  .setMaxValues(1)
  .setPlaceholder('Seleccione su estado!')
  .addOptions(
    new StringSelectMenuOptionBuilder()
      .setLabel('Por Leer')
      .setValue('to-read'),
    new StringSelectMenuOptionBuilder()
      .setLabel('Leido')
      .setValue('readed'),
    new StringSelectMenuOptionBuilder()
      .setLabel('Leyendo')
      .setValue('reading'),
  );

//menu estrellas
const menuStars = new StringSelectMenuBuilder()
  .setCustomId('ranking')
  .setMinValues(0)
  .setMaxValues(1)
  .setPlaceholder('Rankea el libro!')
  .addOptions(
    new StringSelectMenuOptionBuilder()
      .setLabel('⭐')
      .setValue('⭐'),
    new StringSelectMenuOptionBuilder()
      .setLabel('⭐⭐')
      .setValue('⭐⭐'),
    new StringSelectMenuOptionBuilder()
      .setLabel('⭐⭐⭐')
      .setValue('⭐⭐⭐'),
    new StringSelectMenuOptionBuilder()
      .setLabel('⭐⭐⭐⭐')
      .setValue('⭐⭐⭐⭐'),
    new StringSelectMenuOptionBuilder()
      .setLabel('⭐⭐⭐⭐⭐')
      .setValue('⭐⭐⭐⭐⭐'),
  );

const rowStars = new ActionRowBuilder()
  .addComponents(menuStars);

const row = new ActionRowBuilder()
  .addComponents(menu);

// embed
const createEmbed = ( info) => {
  let img = null;
  if (info.volumeInfo.imageLinks?.thumbnail) {
    img = info.volumeInfo.imageLinks.thumbnail;
  } else {
    img = 'https://cdn.pixabay.com/photo/2017/06/08/17/32/not-found-2384304_1280.jpg';
  }

  const exampleEmbed = new EmbedBuilder()
    .setColor('#ffffff')
    .setTitle(`${info.volumeInfo.title}`)
    .addFields(
      { name: 'Autor:', value: `${info.volumeInfo.authors[0]}`, inline: true },
      { name: 'Categoria:', value: `${info.volumeInfo.categories[0]}`, inline: true },
    )
    .setImage(`${img}`);
  return exampleEmbed;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('añade-un-libro-a-tu-lista')
    .setDescription('📚 Añade un libro a tu estantería!')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('nombre del libro')
        .setRequired(true)
    ),
  async execute(interaction) {

    const userExists = getUserFromDb(interaction.user.id);

    if (userExists) {

      let name = interaction.options.getString('name');
      name = name.toLowerCase();
      const cod = encodeURIComponent(name);

      try {
        await interaction.deferReply('');

        const { data: info } = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${cod}}`);

        const encontrarLibro = (array)  => {
          try {
            for (let i = 0; i < array.length; i++) {
              const posicionActual = array[i];
              const titulo = posicionActual.volumeInfo.title;
              const autores = posicionActual.volumeInfo.authors[0];
              const categoria = posicionActual.volumeInfo.categories;
              const types = posicionActual.volumeInfo.industryIdentifiers;
              let bookID = null;
              for (let i = 0; i < types.length; i++) {
                if (posicionActual.volumeInfo.industryIdentifiers[i].type === 'ISBN_13') {
                  bookID = posicionActual.volumeInfo.industryIdentifiers[i].identifier;
                }
              }
              if (titulo && autores && categoria && bookID ) {
                return {
                  title: titulo,
                  author: autores,
                  category: categoria,
                  posicionActual: posicionActual,
                  id: bookID
                };
              }

            }
          } catch (error) {
            console.log('error');
            interaction.editReply({ content: 'El libro no fue encontrado', ephemeral: true });
          }
        };
        const libro  = encontrarLibro(info.items);
        if (libro) {
          const exists =  getBookFromDb(libro.id); //comprobamos si existe en la db

          const deleteMessage = async (messages) => {
            const fetchedMessages = await interaction.channel.messages.fetch({ limit: messages });
            fetchedMessages.forEach(element => {
              if (element.author.bot) {
                element.delete();
              }
            });
          };
          if (!exists) { //si existe ejecutamos el resto
            const statement = 'INSERT INTO library (book_id, book_name, status, stars, author, category, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
            let status = null;
            let stars = null;

            const embedP = createEmbed( await libro.posicionActual );
            const reply = await interaction.editReply({
              embeds: [embedP], //embed
              components: [row], //menu
            });

            const myfilter = i => i.user.id === interaction.user.id; //comprobamos si la interaccion del menu fue hecha por el mismo usuaio que pidio el comando
            const collector = reply.createMessageComponentCollector({ filter: myfilter, time: 10000 });

            collector.on('collect', async i => {

              if (i.values[0] === 'to-read') {
                status = 'To read';
              } else if (i.values[0] === 'readed') {
                status = 'Readed';
              } else if (i.values[0] === 'reading') {
                status = 'Reading';
              }

              if (status) {
                if (status === 'Readed' ) {
                  await interaction.editReply({ content: 'Rankea el libro', components: [], });
                  const reply = await interaction.followUp({ components: [rowStars] });
                  const collector2 = reply.createMessageComponentCollector({ filter: myfilter, time: 5000000 });


                  collector2.on('collect', async i => {
                    if (i.values[0] === '⭐') {
                      stars = '⭐';
                    } else if (i.values[0] === '⭐⭐') {
                      stars = '⭐⭐';
                    } else if (i.values[0] === '⭐⭐⭐') {
                      stars = '⭐⭐⭐';
                    } else if (i.values[0] === '⭐⭐⭐⭐') {
                      stars = '⭐⭐⭐⭐';
                    } else if (i.values[0] === '⭐⭐⭐⭐⭐') {
                      stars = '⭐⭐⭐⭐⭐';
                    }

                    if (status && stars) {
                      db.prepare(statement).run(libro.id, libro.title, status, stars, libro.author, libro.category, interaction.user.id );
                      deleteMessage(2);
                      await interaction.followUp({ content: 'Libro Agregado, para ver tu estantería utiliza el comando /libray', ephemeral: true });
                    } else {
                      console.log('no existen');
                    }
                  });
                }

                if (status === 'Reading' || status === 'To read') {
                  stars = '0';
                  db.prepare(statement).run(libro.id, libro.title, status, stars, libro.author, libro.category, interaction.user.id );
                  deleteMessage(1);
                  await interaction.followUp({ content: 'Libro Agregado, para ver tu estantería utiliza el comando /libray', ephemeral: true });
                }

              }

            });

            collector.on('end', async (collected) => {
              if (collected.size === 0) {
                await interaction.deleteReply(); // Eliminar el mensaje de la interacción
                await interaction.followUp({ content: 'El mensaje ha sido eliminado debido a la falta de respuesta.', ephemeral: true }); // Enviar un mensaje de seguimiento
              }
            });


          } else {
            await interaction.editReply({ content: 'El libro ya fue ingresado anteriormente', ephemeral: true });
          }



        }

      } catch (error) {
        console.log(error);
        interaction.reply('Hubo un error, asegurese de ingresar correctamente el nombre');
      }
    } else {
      await interaction.reply('Primero debe crear un usuario');
    }

  }
};