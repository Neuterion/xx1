const { MessageEmbed } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord-api-types/v10');

const sqlite3 = require('sqlite3').verbose();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restock')
    .setDescription('Store Nitro redeem codes here.')
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
    .addStringOption(option =>
      option.setName('codes')
        .setDescription('Enter one or mode codes here')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, db_path) {
    const db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, err => {
      if (err) {
        console.error(err.message);
      }
    });

    const codes = interaction.options.getString('codes').split(' ');
    const type = interaction.options.getString('time') + interaction.options.getString('type')

    for await (const code of codes) {
      db.run(`INSERT OR IGNORE INTO ${type} (code) VALUES (?)`, [code]);
    }

    const embed = new MessageEmbed().setTitle('Successfully stored codes!').setColor('#0099ff');
    await interaction.reply({ embeds: [embed] });
  }
}