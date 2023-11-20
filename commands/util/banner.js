const Discord = require("discord.js")

module.exports = {
    name: "banner",
    description: "Allows to have the banner of a user",
    options: [
        {
            name: "user",
            description: "User",
            type: 6,
        },
    ],

    async run(client, interaction) {
        let user = interaction.options.getUser("user") || interaction.user;
        user = await client.users.fetch(user.id, { force: true });
        if (!user.banner)
            return interaction.reply({
                content: `${user} ${await client.lang('banner.nobanner', interaction.guild.id)}`,
                ephemeral: true,
            });
        let embed = {
            title: `${user.username}#${user.discriminator}`,
            color: process.env.COLOR,
            image: {
                url: user.bannerURL({ animated: true, size: 1024, format: "png" }),
            },
        };
        const button = new Discord.ActionRowBuilder().setComponents(
            new Discord.ButtonBuilder()
                .setStyle("Link")
                .setLabel(await client.lang('banner.banner', interaction.guild.id))
                .setEmoji({ name: "🖼️" })
                .setURL(user.bannerURL({ animated: true, size: 1024, format: "png" }))
        );
        interaction.reply({
            embeds: [embed],
            components: [button],
            ephemeral: true,
        });
    },
};
