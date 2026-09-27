const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel] });

client.once('ready', () => console.log(`Ingelogd als ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'ticketpanel') {
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild))
          return interaction.reply({ content: 'Je hebt de machtiging Server beheren nodig.', ephemeral: true });
        const embed = new EmbedBuilder().setColor(0x5865F2).setTitle('🎫 Support & Sollicitaties')
          .setDescription('Kies hieronder waarvoor je een ticket wilt openen. Staff helpt je zo snel mogelijk.');
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('ticket_support').setLabel('Support').setEmoji('🎫').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('ticket_apply').setLabel('Sollicitatie').setEmoji('📋').setStyle(ButtonStyle.Success)
        );
        return interaction.reply({ embeds: [embed], components: [row] });
      }
      if (interaction.commandName === 'close') {
        const channel = interaction.channel;
        if (!channel?.topic?.startsWith('ticket-owner:'))
          return interaction.reply({ content: 'Dit is geen ticketkanaal.', ephemeral: true });
        const ownerId = channel.topic.split(':')[1];
        const staffRole = interaction.guild.roles.cache.get(config.staffRoleId);
        if (interaction.user.id !== ownerId && !interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageChannels) && !(staffRole && interaction.member.roles.cache.has(staffRole.id)))
          return interaction.reply({ content: 'Alleen de aanvrager of staff kan dit ticket sluiten.', ephemeral: true });
        await interaction.reply('Ticket wordt over 5 seconden gesloten.');
        setTimeout(() => channel.delete('Ticket gesloten').catch(console.error), 5000);
      }
    }
    if (interaction.isButton() && ['ticket_support','ticket_apply'].includes(interaction.customId)) {
      const guild = interaction.guild;
      const isApply = interaction.customId === 'ticket_apply';
      const categoryId = isApply ? config.applicationCategoryId : config.supportCategoryId;
      const role = guild.roles.cache.get(config.staffRoleId);
      const category = categoryId ? guild.channels.cache.get(categoryId) : null;
      if (categoryId && !category) return interaction.reply({ content: 'De ingestelde ticketcategorie bestaat niet. Controleer config.json.', ephemeral: true });
      const existing = guild.channels.cache.find(c => c.type === ChannelType.GuildText && c.topic === `ticket-owner:${interaction.user.id}` && c.name.startsWith(isApply ? 'sollicitatie-' : 'support-'));
      if (existing) return interaction.reply({ content: `Je hebt al een open ticket: ${existing}`, ephemeral: true });
      const channel = await guild.channels.create({
        name: `${isApply ? 'sollicitatie' : 'support'}-${interaction.user.username.toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,18) || 'gebruiker'}`,
        type: ChannelType.GuildText, parent: category?.id,
        topic: `ticket-owner:${interaction.user.id}`,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] },
          ...(role ? [{ id: role.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }] : []),
          { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ReadMessageHistory] }
        ]
      });
      const intro = isApply ? 'Vertel ons voor welke functie je solliciteert en stel jezelf kort voor.' : 'Beschrijf je vraag of probleem zo duidelijk mogelijk.';
      const embed = new EmbedBuilder().setColor(isApply ? 0x57F287 : 0x5865F2).setTitle(isApply ? '📋 Sollicitatie' : '🎫 Support')
        .setDescription(`Welkom ${interaction.user}! ${intro}\n\nEen medewerker helpt je zodra die beschikbaar is.`);
      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_close').setLabel('Ticket sluiten').setEmoji('🔒').setStyle(ButtonStyle.Danger));
      await channel.send({ content: role ? `${interaction.user} ${role}` : `${interaction.user}`, embeds: [embed], components: [row] });
      await interaction.reply({ content: `Je ticket is aangemaakt: ${channel}`, ephemeral: true });
    }
    if (interaction.isButton() && interaction.customId === 'ticket_close') {
      const channel = interaction.channel;
      if (!channel?.topic?.startsWith('ticket-owner:')) return interaction.reply({ content: 'Ticket niet herkend.', ephemeral: true });
      const ownerId = channel.topic.split(':')[1];
      const staffRole = interaction.guild.roles.cache.get(config.staffRoleId);
      if (interaction.user.id !== ownerId && !interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageChannels) && !(staffRole && interaction.member.roles.cache.has(staffRole.id)))
        return interaction.reply({ content: 'Alleen de aanvrager of staff kan dit ticket sluiten.', ephemeral: true });
      await interaction.reply('Ticket wordt over 5 seconden gesloten.');
      setTimeout(() => channel.delete('Ticket gesloten').catch(console.error), 5000);
    }
  } catch (error) {
    console.error(error);
    const reply = { content: 'Er ging iets mis. Controleer de botmachtigingen en configuratie.', ephemeral: true };
    if (interaction.deferred || interaction.replied) await interaction.followUp(reply).catch(()=>{});
    else await interaction.reply(reply).catch(()=>{});
  }
});

client.login(process.env.DISCORD_TOKEN);
