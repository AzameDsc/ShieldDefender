const ShieldDefender = require("../../structures/ShieldDefender"),
    { Channel } = require("discord.js");



module.exports = {
    name: "WEBHOOK_CREATE",
    /**
     * @param {ShieldDefender} client
     * @param {Channel} webhook
     */
    async run(client, webhook) {
        const guild = client.guilds.cache.get(webhook.guild_id)
        const guildManager = client.managers.guildManager.getOrCreate(guild?.id)
        const config = guildManager.get("antiraid")?.webhooks.create
        if (!config || !config?.toggle) return;
        const allItemPermissions = client.managers.permissionManager.filter((permissions, key) => key.split("-")[1] === guild.id && permissions.has("createWebhooks"));
        let bypass = false;
        const log = (await guild.fetchAuditLogs({ type: 50, limit: 1 })).entries.first();
        const executor = log.executor;
        const executorMember = await guild.members.fetch(executor.id);
        if (executor.id === client.user.id) return;
        if (executor.id === guild.ownerId) bypass = true;
        if ((guildManager.get("crowns") || []).includes(executor.id)) bypass = true;
        for await (const itemPermissions of allItemPermissions.values()) {
            if (itemPermissions.itemId === executor.id || executorMember.roles.cache.has(itemPermissions.itemId)) {
                bypass = true;
                break;
            }
        }
        if (bypass) return;
        (await guild.fetchWebhooks()).filter((w) => w.owner.id === executor.id).forEach((w) => w.delete("ShieldDefender - Anti-WebhookCreate").catch(() => { }));
        client.util.punish(guild, executorMember, config.punish, "ShieldDefender - Anti-WebhookCreate", await client.lang('antiraid.webhookscreate.err', message.guild.id), await client.lang('antiraid.webhookscreate.succes', message.guild.id))
    }
}