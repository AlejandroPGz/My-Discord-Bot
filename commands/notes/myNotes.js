const { SlashCommandBuilder, codeBlock } = require('discord.js');

const { AsciiTable3, AlignmentEnum } = require('ascii-table3');
const db = require('../../dataBase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mis-notas')
    .setDescription('📁 Muestra tus notas'),
  async execute(interaction) {
    const getNotesStatement = `
    SELECT * FROM notes
    WHERE user_id = ?
    `;
    const notes = db.prepare(getNotesStatement).all(interaction.user.id);
    const formatedNotes = notes.map(note => {
      return [note.title, note.description];
    });


    const table =
    new AsciiTable3('Mis notas')
      .setHeading('Titulo', 'Descripcion')
      .setAlign(2, AlignmentEnum.CENTER)
      .addRowMatrix(formatedNotes);

    await interaction.reply(codeBlock(table.toString()));
  },
};