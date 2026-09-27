# Koen Ticketbot

Discord.js v14 bot voor supporttickets en sollicitaties.

## Benodigd
- Node.js 20 of hoger
- Een Discord-app/bot in de Discord Developer Portal
- Bot uitgenodigd met **Manage Channels**, **View Channels**, **Send Messages**, **Read Message History** en **Embed Links**

## Installeren
```bash
npm install
```

Vul in `config.json` de clientId, guildId en staffRoleId in. De twee categorie-ID's zijn optioneel; laat ze leeg om tickets zonder ingestelde categorie te maken.

Stel je bot-token in als omgevingsvariabele `DISCORD_TOKEN`. Zet dit token nooit in GitHub of in screenshots.

Windows PowerShell (alleen voor de huidige terminal):
```powershell
$env:DISCORD_TOKEN="JOUW_TOKEN_HIER"
npm run commands
npm start
```

## Gebruik
1. Start de bot en voer `/ticketpanel` uit als serverbeheerder.
2. Leden kiezen **Support** of **Sollicitatie**.
3. De aanvrager en ingestelde staffrol krijgen toegang tot het ticket.
4. Sluiten kan met de knop of `/close`.

De bot sluit het kanaal na 5 seconden. Er wordt in deze basisversie nog geen transcript opgeslagen.
