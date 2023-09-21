const schedule = require('node-schedule');

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const TOKEN = Bun.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(TOKEN);

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

const homeworkRecurrenceRule = new schedule.RecurrenceRule();
homeworkRecurrenceRule.minute = 0;
homeworkRecurrenceRule.hour = 22;
homeworkRecurrenceRule.dayOfWeek = 6;
homeworkRecurrenceRule.tz = 'America/New_York';

const homeworkReminder = schedule.scheduleJob(homeworkRecurrenceRule, () => {
    const channel = client.channels.cache.get(Bun.env.channelId);
    channel.send(`<@&${Bun.env.remindRoleId}> You have 2 hrs until the HW deadline!`);
});

const classRecurrenceRule = new schedule.RecurrenceRule();
classRecurrenceRule.minute = 45;
classRecurrenceRule.hour = 19;
classRecurrenceRule.dayOfWeek = 4;
classRecurrenceRule.tz = 'America/New_York';

const classReminder = schedule.scheduleJob(classRecurrenceRule, () => {
    const channel = client.channels.cache.get(Bun.env.channelId);
    channel.send(`<@&${Bun.env.studentRoleId}> Class begins in 15 minutes!`);
});
