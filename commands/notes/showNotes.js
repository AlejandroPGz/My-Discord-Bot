const { SlashCommandBuilder, codeBlock } = require('discord.js');
const { AsciiTable3, AlignmentEnum } = require('ascii-table3');
const db = require('../../dataBase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('todas-notas')
    .setDescription('Muestra todas las notas'),
  async execute(interaction) {
    const getNotesStatement = `
    SELECT notes.title, notes.description, users.name
    FROM users
    INNER JOIN notes 
    ON notes.user_id = users.user_id
    `;
    const notes = db.prepare(getNotesStatement).all();
    const formatedNotes = notes.map(note => {
      return [note.title, note.decription, note.name];
    });


    const table =
    new AsciiTable3('Mis notas')
      .setHeading('Titulo', 'Descripcion', 'Usuario')
      .setAlign(3, AlignmentEnum.CENTER)
      .addRowMatrix(formatedNotes);

    await interaction.reply(codeBlock(table.toString()));
  },
};