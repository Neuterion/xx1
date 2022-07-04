const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { PermissionFlagsBits } = require('discord-api-types/v10');

const sqlite3 = require('sqlite3').verbose();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gen')
    .setDescription('Generates codes stored in a database.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('time')
      .setDescription('The time of the code')
      .setRequired(true)
      .addChoices(
        { name: '1 Year', value: 'year' },
        { name: '1 Month', value: 'month' }
      ))
    .addStringOption(option =>
      option.setName('type')
      .setDescription('The type of the code')
      .setRequired(true)
      .addChoices(
        { name: 'Boost', value: 'boost' },
        { name: 'Classic', value: 'classic' }
      ))
    .addNumberOption(option =>
      option.setName('amount')
      .setDescription('The amount of codes to generate')
      .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, db_path) {
    const amount = interaction.options.getNumber('amount');
    if (amount < 1) {
      return interaction.reply('You must generate at least 1 code.');
    }

    const db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, err => {
      if (err) {
        console.error(err.message);
      }
    });
    const type = interaction.options.getString('time') + interaction.options.getString('type')
    db.all(`SELECT code FROM ${type} WHERE used == 0 LIMIT ${amount}`, (err, rows) => {
      if (err) {
        console.error(err.message);
      }

      if (rows.length === 0) {
        interaction.reply('No codes available.');
      } else {
        const embed = new MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Generated successfully!')
        
        let description = 'Whether the codes will be used right now or not, they will now be marked as used in the database.\n\n';

        rows.forEach(row => {
          description += row.code + '\n';
          db.run(`UPDATE ${type} SET used = 1 WHERE code = ?`, [row.code]);
        })

        embed.setDescription(description);
        interaction.reply({embeds: [embed]});
      }
    })
  }
}