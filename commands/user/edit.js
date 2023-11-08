const { SlashCommandBuilder, inlineCode } = require('discord.js');
const db = require('../../dataBase');
const { getUserMention } = require('../../utils/discordUtils');
const { getUserFromDb } = require('../../utils/searchUser');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('edit-user')
    .setDescription('🤸‍♂️ Edita tu usario!')
    .addStringOption( option =>
      option
        .setName('nombre')
        .setDescription('nuevo-nombre')
        .setRequired(true)
    ),
  async execute(interaction) {
    const name = interaction.options.getString('nombre');
    const userId = interaction.user.id;
    console.log(name);

    try {
      //1. comprobar si existe
      const oldUser = getUserFromDb(userId);

      if (!oldUser) {
        return await interaction.reply(`${getUserMention(userId)} Tu usuario no existe`);
      }

      //borrar usuario
      const editStatement = `
      UPDATE users
      SET name = ?
      WHERE user_id = ?
      `;
      db.prepare(editStatement).run(name, userId);

      const newUser = getUserFromDb(userId);
      console.log(newUser);

      //3. respuesta
      await interaction.reply(`${getUserMention(userId)} Tu usuario ha sido actualizado a: ${inlineCode(newUser.name)}`);
    } catch (error) {
      console.log(error);
    }
  },
};