const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('remind').setDescription('Toggle HW deadline reminder.'),
    async execute(interaction) {
        const role = interaction.guild.roles.cache.find((role) => role.name === 'remindHW');

        if (interaction.member.roles.cache.some((role) => role.name === 'remindHW')) {
            await interaction.member.roles.remove(role);
            await interaction.reply(`Turned off homework deadline reminders.`);
        } else {
            await interaction.member.roles.add(role);
            await interaction.reply(`You will be pinged for a HW deadline reminder.`);
        }
    },
};
