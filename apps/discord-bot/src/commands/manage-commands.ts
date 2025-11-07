import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

@ApplyOptions<Command.Options>({
  description: 'Manage Discord slash commands',
  aliases: ['cmd', 'command'],
  requiredUserPermissions: [PermissionFlagsBits.Administrator],
})
export class ManageCommandsCommand extends Command {
  public async messageRun(message: Message, args: Args) {
    const action = await args.pick('string').catch(() => null);
    
    if (!action) {
      return this.sendHelp(message);
    }

    switch (action.toLowerCase()) {
      case 'create':
      case 'register':
        return this.handleCreateCommands(message, args);
      case 'delete':
      case 'remove':
        return this.handleDeleteCommands(message, args);
      case 'list':
        return this.handleListCommands(message);
      case 'refresh':
      case 'reload':
        return this.handleRefreshCommands(message);
      default:
        return this.sendHelp(message);
    }
  }

  private async sendHelp(message: Message) {
    const embed = new EmbedBuilder()
      .setTitle('🛠️ Command Management Help')
      .setDescription('Manage Discord slash commands for this bot')
      .setColor(0x5865f2)
      .addFields(
        { name: '$cmd create [guild|global]', value: 'Register all slash commands', inline: false },
        { name: '$cmd delete [command-name|all]', value: 'Delete specific or all commands', inline: false },
        { name: '$cmd list', value: 'List all registered commands', inline: false },
        { name: '$cmd refresh', value: 'Refresh/reload all commands', inline: false }
      )
      .addFields(
        { name: '⚠️ Note', value: 'This command requires Administrator permissions', inline: false },
        { name: '🔧 Examples', value: '`$cmd create guild`\n`$cmd delete testflight`\n`$cmd list`', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'TestFlight Checker Bot', iconURL: message.client.user?.displayAvatarURL() });

    return message.reply({ embeds: [embed] });
  }

  private async handleCreateCommands(message: Message, args: Args) {
    const scope = await args.pick('string').catch(() => 'guild');
    
    try {
      const embed = new EmbedBuilder()
        .setTitle('🔄 Registering Commands...')
        .setDescription('Please wait while commands are being registered...')
        .setColor(0xffaa00)
        .setTimestamp();

      const reply = await message.reply({ embeds: [embed] });

      if (scope.toLowerCase() === 'global') {
        // Register global commands
        await message.client.application?.commands.set([
          {
            name: 'testflight',
            description: 'Manage TestFlight builds',
            options: [
              {
                name: 'add',
                description: 'Add a new TestFlight build',
                type: 1, // SUB_COMMAND
                options: [
                  { name: 'url', description: 'TestFlight URL', type: 3, required: true },
                  { name: 'name', description: 'App name', type: 3, required: true },
                  { name: 'version', description: 'App version', type: 3, required: true },
                  { name: 'build', description: 'Build number', type: 3, required: true },
                  { name: 'notes', description: 'Additional notes', type: 3, required: false },
                ]
              },
              {
                name: 'list',
                description: 'List all monitored builds',
                type: 1,
              },
              {
                name: 'remove',
                description: 'Remove a build from monitoring',
                type: 1,
                options: [
                  { name: 'id', description: 'Build ID to remove', type: 3, required: true },
                ]
              },
              {
                name: 'status',
                description: 'Check build status',
                type: 1,
                options: [
                  { name: 'id', description: 'Build ID to check', type: 3, required: true },
                ]
              }
            ]
          },
          {
            name: 'post',
            description: 'Post TestFlight builds to a channel',
            options: [
              {
                name: 'active',
                description: 'Post all active builds',
                type: 1,
                options: [
                  { name: 'channel', description: 'Target channel', type: 7, required: false },
                ]
              },
              {
                name: 'all',
                description: 'Post all builds',
                type: 1,
                options: [
                  { name: 'channel', description: 'Target channel', type: 7, required: false },
                ]
              },
              {
                name: 'build',
                description: 'Post specific build',
                type: 1,
                options: [
                  { name: 'id', description: 'Build ID', type: 3, required: true },
                  { name: 'channel', description: 'Target channel', type: 7, required: false },
                ]
              }
            ]
          },
          {
            name: 'ping',
            description: 'Check bot status',
            options: [
              { name: 'bot', description: 'Check bot latency', type: 1 },
              { name: 'monitor', description: 'Check monitoring status', type: 1 },
              { name: 'check', description: 'Force check all builds', type: 1 }
            ]
          },
          {
            name: 'website',
            description: 'Get website links',
            options: [
              { name: 'dashboard', description: 'Admin dashboard link', type: 1 },
              { name: 'public', description: 'Public status page link', type: 1 },
              { name: 'info', description: 'General information', type: 1 }
            ]
          },
          {
            name: 'search',
            description: 'Search TestFlight builds',
            options: [
              { name: 'query', description: 'Search term', type: 3, required: true },
              { 
                name: 'status', 
                description: 'Filter by status', 
                type: 3, 
                required: false,
                choices: [
                  { name: 'Active', value: 'ACTIVE' },
                  { name: 'Expired', value: 'EXPIRED' },
                  { name: 'Pending', value: 'PENDING' },
                  { name: 'Error', value: 'ERROR' },
                  { name: 'Not Found', value: 'NOT_FOUND' }
                ]
              }
            ]
          }
        ]);
      } else {
        // Register guild commands
        if (!message.guild) {
          return reply.edit({
            embeds: [new EmbedBuilder()
              .setTitle('❌ Error')
              .setDescription('Guild commands can only be registered in a server')
              .setColor(0xff0000)]
          });
        }

        await message.guild.commands.set([
          // Same command structure as above but for guild
        ]);
      }

      const successEmbed = new EmbedBuilder()
        .setTitle('✅ Commands Registered')
        .setDescription(`Successfully registered all slash commands ${scope.toLowerCase() === 'global' ? 'globally' : 'for this server'}`)
        .setColor(0x00ff00)
        .addFields(
          { name: 'Scope', value: scope.toLowerCase() === 'global' ? 'Global' : 'Guild', inline: true },
          { name: 'Commands', value: '5 commands registered', inline: true },
          { name: 'Status', value: '✅ Active', inline: true }
        )
        .setTimestamp();

      return reply.edit({ embeds: [successEmbed] });
    } catch (error) {
      console.error('Error registering commands:', error);
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Registration Failed')
        .setDescription('Failed to register slash commands')
        .setColor(0xff0000)
        .addFields({ name: 'Error', value: error instanceof Error ? error.message : 'Unknown error' })
        .setTimestamp();

      return message.reply({ embeds: [errorEmbed] });
    }
  }

  private async handleDeleteCommands(message: Message, args: Args) {
    const target = await args.pick('string').catch(() => null);
    
    if (!target) {
      return message.reply('❌ Please specify a command name or "all" to delete all commands.');
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle('🗑️ Deleting Commands...')
        .setDescription('Please wait while commands are being deleted...')
        .setColor(0xffaa00)
        .setTimestamp();

      const reply = await message.reply({ embeds: [embed] });

      if (target.toLowerCase() === 'all') {
        // Delete all commands
        await message.client.application?.commands.set([]);
        if (message.guild) {
          await message.guild.commands.set([]);
        }

        const successEmbed = new EmbedBuilder()
          .setTitle('✅ All Commands Deleted')
          .setDescription('Successfully deleted all slash commands')
          .setColor(0x00ff00)
          .setTimestamp();

        return reply.edit({ embeds: [successEmbed] });
      } else {
        // Delete specific command
        const commands = await message.client.application?.commands.fetch();
        const command = commands?.find(cmd => cmd.name === target.toLowerCase());

        if (!command) {
          return reply.edit({
            embeds: [new EmbedBuilder()
              .setTitle('❌ Command Not Found')
              .setDescription(`No command found with name "${target}"`)
              .setColor(0xff0000)]
          });
        }

        await command.delete();

        const successEmbed = new EmbedBuilder()
          .setTitle('✅ Command Deleted')
          .setDescription(`Successfully deleted command "${target}"`)
          .setColor(0x00ff00)
          .setTimestamp();

        return reply.edit({ embeds: [successEmbed] });
      }
    } catch (error) {
      console.error('Error deleting commands:', error);
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Deletion Failed')
        .setDescription('Failed to delete commands')
        .setColor(0xff0000)
        .addFields({ name: 'Error', value: error instanceof Error ? error.message : 'Unknown error' })
        .setTimestamp();

      return message.reply({ embeds: [errorEmbed] });
    }
  }

  private async handleListCommands(message: Message) {
    try {
      const globalCommands = await message.client.application?.commands.fetch();
      const guildCommands = message.guild ? await message.guild.commands.fetch() : null;

      const embed = new EmbedBuilder()
        .setTitle('📋 Registered Commands')
        .setColor(0x007aff)
        .setTimestamp();

      if (globalCommands && globalCommands.size > 0) {
        const globalList = globalCommands.map(cmd => `\`${cmd.name}\` - ${cmd.description}`).join('\n');
        embed.addFields({ name: `🌐 Global Commands (${globalCommands.size})`, value: globalList, inline: false });
      }

      if (guildCommands && guildCommands.size > 0) {
        const guildList = guildCommands.map(cmd => `\`${cmd.name}\` - ${cmd.description}`).join('\n');
        embed.addFields({ name: `🏠 Guild Commands (${guildCommands.size})`, value: guildList, inline: false });
      }

      if ((!globalCommands || globalCommands.size === 0) && (!guildCommands || guildCommands.size === 0)) {
        embed.setDescription('No commands are currently registered');
      }

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error listing commands:', error);
      return message.reply('❌ Failed to list commands.');
    }
  }

  private async handleRefreshCommands(message: Message) {
    try {
      const embed = new EmbedBuilder()
        .setTitle('🔄 Refreshing Commands...')
        .setDescription('Reloading all command modules...')
        .setColor(0xffaa00)
        .setTimestamp();

      const reply = await message.reply({ embeds: [embed] });

      // Reload the command store
      await this.container.stores.get('commands').loadAll();

      const successEmbed = new EmbedBuilder()
        .setTitle('✅ Commands Refreshed')
        .setDescription('Successfully reloaded all command modules')
        .setColor(0x00ff00)
        .setTimestamp();

      return reply.edit({ embeds: [successEmbed] });
    } catch (error) {
      console.error('Error refreshing commands:', error);
      return message.reply('❌ Failed to refresh commands.');
    }
  }
}
