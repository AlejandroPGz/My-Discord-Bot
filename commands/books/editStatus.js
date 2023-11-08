const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const db = require('../../dataBase');
const { getUserFromDb } = require('../../utils/searchUser');
//menu estado
const menuStatus = new StringSelectMenuBuilder()
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

const rowStatus = new ActionRowBuilder()
  .addComponents(menuStatus);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('edita')
    .setDescription('📚 Edita un libro de tu estantería!'),
  async execute(interaction) {
    const deleteMessage = async (messages) => {
      const fetchedMessages = await interaction.channel.messages.fetch({ limit: messages });

      fetchedMessages.forEach(element => {
        if (element.author.bot) {
          element.delete();
        }
      });
    };
    const userExists = getUserFromDb(interaction.user.id);

    if (userExists) {
      try {
        await interaction.deferReply('');

        const searchStatement = `
        SELECT book_name, book_id FROM library
        `;
        const prepare = db.prepare(searchStatement);
        const results = prepare.all();
        //console.log(results);
        const booksArray = results.map((row) => {
          return {
            name: row.book_name,
            id: row.book_id,
          };
        });
        //console.log(booksArray);

        // Se crea el menú de opciones
        const menuBooks = new StringSelectMenuBuilder()
          .setCustomId('books')
          .setMinValues(0)
          .setMaxValues(1)
          .setPlaceholder('¿Cuál libro desea editar?');
        booksArray.forEach((book) => {
          const option = new StringSelectMenuOptionBuilder()
            .setLabel(book.name)
            .setValue(book.id.toString());

          menuBooks.addOptions(option);
        });
        const rowBooks = new ActionRowBuilder()
          .addComponents(menuBooks);

        const reply = await interaction.editReply({ content: 'Libros:', components: [rowBooks] });

        const myfilter = i => i.user.id === interaction.user.id; //comprobamos si la interaccion del menu fue hecha por el mismo usuaio que pidio el comando
        const collector = reply.createMessageComponentCollector({ filter: myfilter, time: 10000 });

        collector.on('collect', async i => {

          const book_id = i.values[0];

          if (book_id) {
            deleteMessage(1);
            const reply2 = await interaction.followUp({ content: 'Status:', components: [rowStatus] });

            const myfilter = i => i.user.id === interaction.user.id; //comprobamos si la interaccion del menu fue hecha por el mismo usuaio que pidio el comando
            const collector2 = reply2.createMessageComponentCollector({ filter: myfilter, time: 10000 });

            let status = null;
            let stars = null;
            const editStatement = `
            UPDATE library
            SET status = ?, stars = ?
            WHERE user_id = ? AND book_id = ?
            `;
            const userId = interaction.user.id;
            collector2.on('collect', async i => {
              if (i.values[0] === 'to-read') {
                status = 'To read';
              } else if (i.values[0] === 'readed') {
                status = 'Readed';
              } else if (i.values[0] === 'reading') {
                status = 'Reading';
              }

              console.log(status);

              if (status) {
                if (status === 'Readed' ) {
                  deleteMessage(1);
                  const reply3 = await interaction.followUp({ components: [rowStars] });
                  const collector3 = reply3.createMessageComponentCollector({ filter: myfilter, time: 5000000 });


                  collector3.on('collect', async i => {
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
                      console.log('existen');
                      deleteMessage(1);
                      db.prepare(editStatement).run(status, stars, userId, book_id);
                      await interaction.followUp({ content: 'Estado Editado', ephemeral: true });
                    } else {
                      console.log('no existen');
                    }
                  });
                }

                if (status === 'Reading' || status === 'To read') {
                  stars = '0';
                  db.prepare(editStatement).run(status, stars, userId, book_id);
                  deleteMessage(1);
                  await interaction.followUp({ content: 'Estado Editado', ephemeral: true });
                }

              }

            });
          }


        });

      } catch (error) {
        console.log(error);
        interaction.reply('Hubo un error, asegurese de ingresar correctamente el nombre');
      }
    } else {
      await interaction.reply('Primero debe crear un usuario');
    }

  }
};