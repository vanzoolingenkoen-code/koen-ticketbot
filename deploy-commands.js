const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');
const commands = [
  new SlashCommandBuilder().setName('ticketpanel').setDescription('Plaats het support- en sollicitatiepaneel'),
  new SlashCommandBuilder().setName('close').setDescription('Sluit het huidige ticket')
].map(c => c.toJSON());
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
    console.log('Slashcommands geregistreerd.');
  } catch (e) { console.error(e); process.exitCode = 1; }
})();
