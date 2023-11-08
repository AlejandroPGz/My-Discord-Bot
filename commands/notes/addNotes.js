const { SlashCommandBuilder } = require('discord.js');
const db = require('../../dataBase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create-notes')
    .setDescription('🖍 create a note!')
    .addStringOption(option =>
      option
        .setName('titulo')
        .setDescription('titulo de la nota')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('nota')
        .setDescription('nota')
        .setRequired(true)
    ),
  async execute(interaction) {
    const title = interaction.options.getString('titulo');
    const description = interaction.options.getString('nota');
    try {
      const statement = 'INSERT INTO notes (title, description, user_id) VALUES (?, ?, ?)';
      db.prepare(statement).run(title, description, interaction.user.id);
      await interaction.reply('Nota Creada');

    } catch (error) {
      console.log(error);
    }},
};