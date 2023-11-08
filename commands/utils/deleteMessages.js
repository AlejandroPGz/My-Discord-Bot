const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete-messages')
    .setDescription('🗑 Borra mensajes!')
    .addStringOption(option =>
      option
        .setName('number')
        .setDescription('cuantos mensajes')
        .setRequired(true)
    ),
  async execute(interaction) {
    let number = interaction.options.getString('number');

    try {
      const fetchedMessages = await interaction.channel.messages.fetch({ limit: number });
      fetchedMessages.forEach(element => {
        element.delete();
      });
      await interaction.reply({ content: 'mensajes borrados', ephemeral: true });
    } catch (error) {
      console.log(error);
    }

  }

};