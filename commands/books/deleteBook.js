const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const db = require('../../dataBase');
const { getUserMention } = require('../../utils/discordUtils');
const { getBookFromDb } = require('../../utils/searchBookDB');
const { getUserFromDb } = require('../../utils/searchUser');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('borrarlibro')
    .setDescription('Delete a book from your library!'),
  async execute(interaction) {
    const userExists = getUserFromDb(interaction.user.id);

    if (userExists) {

      try {
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
        const menu = new StringSelectMenuBuilder()
          .setCustomId('books')
          .setMinValues(0)
          .setMaxValues(1)
          .setPlaceholder('¿Cuál libro desea eliminar?');
        booksArray.forEach((book) => {
          const option = new StringSelectMenuOptionBuilder()
            .setLabel(book.name)
            .setValue(book.id.toString());

          menu.addOptions(option);
        });
        const row = new ActionRowBuilder()
          .addComponents(menu);

        await interaction.deferReply('');
        const reply = await interaction.editReply({ content: 'Escoja el libro', components: [row] });

        const collector = reply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          filter: (i) => i.user.id === interaction.user.id,
          time: 1000000,
        });

        collector.on('collect', async (interaction) => {
          const bookId = interaction.values[0];
          //console.log(interaction);
          const busquedaDelLibro = getBookFromDb(bookId);

          if (bookId) {
            const deleteStatement = `
  DELETE FROM library
  WHERE book_id = ?
  `;
            db.prepare(deleteStatement).run(bookId);

            //console.log(busquedaDelLibro.book_name);

            const deleteMessage = async (messages) => {
              const fetchedMessages = await interaction.channel.messages.fetch({ limit: messages });

              fetchedMessages.forEach(element => {
                if (element.author.bot) {
                  console.log('es del bot');
                  element.delete();
                }
              });

              await interaction.reply({ content: `${getUserMention(interaction.user.id)} ${busquedaDelLibro.book_name} ha sido eliminado de tu libreria`, components: [] });

            };
            deleteMessage(1);

          }
        });



      } catch (error) {
        console.log('hubo un error');
        await interaction.reply('Hubo un error');
      }

    } else {
      await interaction.reply('Primero debe crear un usuario');
    }


  }
};