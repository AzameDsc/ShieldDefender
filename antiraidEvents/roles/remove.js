const ShieldDefender = require("../../structures/ShieldDefender");

module.exports = {
  name: "GUILD_MEMBER_UPDATE",

  /**
   * @param {ShieldDefender} client
   */

  async run(client, data) {
    const guild = client.guilds.cache.get(data.guild_id);
    const log = (await guild.fetchAuditLogs({ type: 25, limit: 1 })).entries.first();
    if (!log) return;
    const executor = log.executor;
    if (executor.id === client.user.id) return;
    const guildManager = client.managers.guildManager.getOrCreate(guild?.id);
    const config = guildManager.get("antiraid")?.roles?.remove;

    if (!config || !config?.toggle) return;
    const newData = await guild.members.fetch(data.user.id);
    if (newData.roles.cache.size >= data.roles.length) return;


    const allItemPermissions = client.managers.permissionManager.filter((permissions, key) => key.split("-")[1] === guild.id && permissions.has("rolesRemove"));
    let bypass = false;

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
    newData.roles.set(data.roles);
    client.util.punish(guild, executorMember, config.punish, "ShieldDefender - Anti-RolesRemove", `${await client.lang('antiraid.roleremove.err', message.guild.id)} ${newData}`, `${await client.lang('antiraid.roleremove.succes', message.guild.id)} ${newData}`)
  }
} 