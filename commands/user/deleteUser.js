const { SlashCommandBuilder } = require('discord.js');
const db = require('../../dataBase');
const { getUserMention } = require('../../utils/discordUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dete-user')
    .setDescription('🙇‍♂️ Delete your user!'),
  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      //1. comprobar si existe
      const searchStatement = `
        SELECT * FROM users 
        WHERE user_id = ?
        `;
      const user = db.prepare(searchStatement).get(userId);

      if (!user) {
        return await interaction.reply(`${getUserMention(userId)} Tu usuario no existe`);
      }

      //borrar usuario
      const deleteStatement = `
      DELETE FROM users
      WHERE user_id = ?
      `;
      db.prepare(deleteStatement).run(userId);

      //3. respuesta
      await interaction.reply(`${getUserMention(userId)} Tu usuario ha sido eliminado`);

    } catch (error) {
      console.log(error);
    }
  },
};