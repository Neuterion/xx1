const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const wait = require('node:timers/promises').setTimeout;

const sqlite3 = require('sqlite3').verbose();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stock')
    .setDescription('Displays information about available Nitro redeem codes.'),
  async execute(interaction, db_path) {
    const db = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, err => {
      if (err) {
        console.error(err.message);
      }
    });

    const columns = [
      ['1 Year Nitro Boost', 0, 0, false],
      ['1 Month Nitro Boost', 0, 0, false],
      ['1 Year Nitro Classic', 0, 0, false],
      ['1 Month Nitro Classic', 0, 0, false],
    ]

    const tables = ['yearboost', 'monthboost', 'yearclassic', 'monthclassic'];
    const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Stock')

    tables.forEach(table => {
      db.each(`SELECT * FROM ${table}`, (err, row) => {
        if (err) {
          console.error(err.message);
        }

        if (row.code !== null) {
          if (row.used === 0) {
            columns[tables.indexOf(table)][1]++;
          } else {
            columns[tables.indexOf(table)][2]++;
          }
        }
      }, (err, rows) => {
        if (err) {
          console.error(err.message);
        }

        const unused = columns[tables.indexOf(table)][1];
        const used = columns[tables.indexOf(table)][2];

        embed.addField(
          columns[tables.indexOf(table)][0],
          `${unused} available codes\n${used} used codes\n${unused + used} total codes`, 
          false
        );

        columns[tables.indexOf(table)][3] = true;
      });
    })

    await interaction.deferReply();
    while (!columns.every(column => column[3])) {
      await wait(1);
    }
    await interaction.editReply({embeds: [embed]});
  }
}
