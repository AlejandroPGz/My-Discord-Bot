const { SlashCommandBuilder, codeBlock } = require('discord.js');

const { AsciiTable3, AlignmentEnum } = require('ascii-table3');
const db = require('../../dataBase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('libreria')
    .setDescription('📁 Muestra tu estanteria'),
  async execute(interaction) {
    const getBooksStatement = `
    SELECT * FROM library
    WHERE user_id = ?
    `;
    const books = db.prepare(getBooksStatement).all(interaction.user.id);
    const formatedBooksData = books.map(book => {
      return [book.book_name, book.status, book.author, book.status];
    });


    const table =
    new AsciiTable3('My library')
      .setHeading('Titulo', 'Estado', 'Autor', 'Estado')
      .setAlign(4, AlignmentEnum.CENTER)
      .addRowMatrix(formatedBooksData);

    await interaction.reply(codeBlock(table.toString()));
  },
};