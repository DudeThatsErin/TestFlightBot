import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { prisma } from '@windsurf/database';

@ApplyOptions<Command.Options>({
  description: 'Dynamic command handler for database-driven commands'
})
export class DynamicCommand extends Command {
  public override async chatInputRun(interaction: ChatInputCommandInteraction) {
    try {
      // Find the command in the database
      const command = await prisma.discordCommand.findUnique({
        where: { 
          name: interaction.commandName,
          enabled: true 
        },
        include: {
          options: {
            include: {
              choices: true,
            },
            orderBy: { order: 'asc' },
          },
          responses: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!command) {
        return interaction.reply({
          content: '❌ Command not found or disabled.',
          ephemeral: true,
        });
      }

      // Check permissions
      if (command.ownerOnly && interaction.user.id !== process.env.DISCORD_OWNER_ID) {
        return interaction.reply({
          content: '❌ This command is owner-only.',
          ephemeral: true,
        });
      }

      if (command.guildOnly && !interaction.guild) {
        return interaction.reply({
          content: '❌ This command can only be used in a server.',
          ephemeral: true,
        });
      }

      if (command.nsfw && !interaction.channel?.isTextBased()) {
        return interaction.reply({
          content: '❌ This command can only be used in NSFW channels.',
          ephemeral: true,
        });
      }

      // Check cooldown (implement cooldown logic here if needed)
      // TODO: Implement cooldown system with Redis or in-memory cache

      // Get the appropriate response based on subcommand or default
      const subcommand = interaction.options.getSubcommand(false);
      const trigger = subcommand || 'default';
      
      const response = command.responses.find(r => r.trigger === trigger) || 
                      command.responses.find(r => r.trigger === 'default') ||
                      command.responses[0];

      if (!response) {
        return interaction.reply({
          content: '❌ No response configured for this command.',
          ephemeral: true,
        });
      }

      // Build the response
      const replyOptions: any = {
        ephemeral: response.ephemeral,
      };

      // Add content if available
      if (response.content) {
        replyOptions.content = this.processResponseContent(response.content, interaction);
      }

      // Add embeds if available
      if (response.embeds) {
        const embeds = Array.isArray(response.embeds) ? response.embeds : [response.embeds];
        replyOptions.embeds = embeds.map((embedData: any) => {
          const embed = new EmbedBuilder();
          
          if (embedData.title) embed.setTitle(this.processResponseContent(embedData.title, interaction));
          if (embedData.description) embed.setDescription(this.processResponseContent(embedData.description, interaction));
          if (embedData.color) embed.setColor(embedData.color);
          if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail.url);
          if (embedData.image) embed.setImage(embedData.image.url);
          if (embedData.footer) embed.setFooter({ text: embedData.footer.text, iconURL: embedData.footer.icon_url });
          if (embedData.author) embed.setAuthor({ name: embedData.author.name, iconURL: embedData.author.icon_url, url: embedData.author.url });
          if (embedData.timestamp) embed.setTimestamp();
          
          if (embedData.fields) {
            embedData.fields.forEach((field: any) => {
              embed.addFields({
                name: this.processResponseContent(field.name, interaction),
                value: this.processResponseContent(field.value, interaction),
                inline: field.inline || false,
              });
            });
          }
          
          return embed;
        });
      }

      // Add components if available
      if (response.components) {
        const components = Array.isArray(response.components) ? response.components : [response.components];
        replyOptions.components = components.map((componentData: any) => {
          const row = new ActionRowBuilder<ButtonBuilder>();
          
          if (componentData.type === 1) { // Action Row
            componentData.components.forEach((comp: any) => {
              if (comp.type === 2) { // Button
                const button = new ButtonBuilder()
                  .setCustomId(comp.custom_id)
                  .setLabel(comp.label)
                  .setStyle(comp.style || ButtonStyle.Primary);
                
                if (comp.emoji) button.setEmoji(comp.emoji);
                if (comp.disabled) button.setDisabled(comp.disabled);
                if (comp.url) button.setURL(comp.url);
                
                row.addComponents(button);
              }
            });
          }
          
          return row;
        });
      }

      // Send the response
      await interaction.reply(replyOptions);

      // Add reactions if specified
      if (response.reactions && response.reactions.length > 0) {
        const message = await interaction.fetchReply();
        for (const reaction of response.reactions) {
          try {
            await message.react(reaction);
          } catch (error) {
            console.error(`Failed to add reaction ${reaction}:`, error);
          }
        }
      }

      // Auto-delete if specified
      if (response.deleteAfter && response.deleteAfter > 0) {
        setTimeout(async () => {
          try {
            const message = await interaction.fetchReply();
            await message.delete();
          } catch (error) {
            console.error('Failed to auto-delete message:', error);
          }
        }, response.deleteAfter * 1000);
      }

    } catch (error) {
      console.error('Error executing dynamic command:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        return interaction.reply({
          content: '❌ An error occurred while executing this command.',
          ephemeral: true,
        });
      }
    }
  }

  private processResponseContent(content: string, interaction: ChatInputCommandInteraction): string {
    // Replace placeholders with actual values
    return content
      .replace(/\{user\}/g, interaction.user.toString())
      .replace(/\{user\.mention\}/g, interaction.user.toString())
      .replace(/\{user\.username\}/g, interaction.user.username)
      .replace(/\{user\.id\}/g, interaction.user.id)
      .replace(/\{guild\}/g, interaction.guild?.name || 'DM')
      .replace(/\{guild\.name\}/g, interaction.guild?.name || 'DM')
      .replace(/\{guild\.id\}/g, interaction.guild?.id || 'DM')
      .replace(/\{channel\}/g, interaction.channel?.toString() || 'Unknown')
      .replace(/\{channel\.name\}/g, interaction.channel?.isTextBased() ? (interaction.channel as any).name : 'Unknown')
      .replace(/\{channel\.id\}/g, interaction.channel?.id || 'Unknown')
      .replace(/\{bot\.mention\}/g, interaction.client.user.toString())
      .replace(/\{bot\.username\}/g, interaction.client.user.username)
      .replace(/\{timestamp\}/g, `<t:${Math.floor(Date.now() / 1000)}:f>`)
      .replace(/\{timestamp\.relative\}/g, `<t:${Math.floor(Date.now() / 1000)}:R>`);
  }
}

// Export a function to register all dynamic commands
export async function registerDynamicCommands(registry: Command.Registry) {
  try {
    const commands = await prisma.discordCommand.findMany({
      where: { enabled: true },
      include: {
        options: {
          include: {
            choices: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    for (const command of commands) {
      registry.registerChatInputCommand((builder) => {
        builder
          .setName(command.name)
          .setDescription(command.description)
          .setDefaultMemberPermissions(
            command.permissions.length > 0 ? 
              command.permissions.reduce((acc, perm) => acc | getDiscordPermission(perm), 0).toString() : 
              null
          )
          .setDMPermission(!command.guildOnly)
          .setNSFW(command.nsfw);

        // Add options
        command.options.forEach(option => {
          const optionType = getDiscordOptionType(option.type);
          
          if (optionType === 1) { // SUB_COMMAND
            builder.addSubcommand(sub => {
              sub.setName(option.name).setDescription(option.description);
              return sub;
            });
          } else if (optionType === 3) { // STRING
            builder.addStringOption(opt => {
              opt.setName(option.name)
                 .setDescription(option.description)
                 .setRequired(option.required);
              
              if (option.choices.length > 0) {
                option.choices.forEach(choice => {
                  opt.addChoices({ name: choice.name, value: choice.value });
                });
              }
              
              if (option.minLength) opt.setMinLength(option.minLength);
              if (option.maxLength) opt.setMaxLength(option.maxLength);
              if (option.autocomplete) opt.setAutocomplete(true);
              
              return opt;
            });
          } else if (optionType === 4) { // INTEGER
            builder.addIntegerOption(opt => {
              opt.setName(option.name)
                 .setDescription(option.description)
                 .setRequired(option.required);
              
              if (option.minValue) opt.setMinValue(option.minValue);
              if (option.maxValue) opt.setMaxValue(option.maxValue);
              
              return opt;
            });
          } else if (optionType === 5) { // BOOLEAN
            builder.addBooleanOption(opt => {
              opt.setName(option.name)
                 .setDescription(option.description)
                 .setRequired(option.required);
              return opt;
            });
          } else if (optionType === 6) { // USER
            builder.addUserOption(opt => {
              opt.setName(option.name)
                 .setDescription(option.description)
                 .setRequired(option.required);
              return opt;
            });
          } else if (optionType === 7) { // CHANNEL
            builder.addChannelOption(opt => {
              opt.setName(option.name)
                 .setDescription(option.description)
                 .setRequired(option.required);
              
              if (option.channelTypes.length > 0) {
                opt.addChannelTypes(...option.channelTypes.map(type => parseInt(type)));
              }
              
              return opt;
            });
          }
          // Add more option types as needed
        });

        return builder;
      });
    }
  } catch (error) {
    console.error('Error registering dynamic commands:', error);
  }
}

// Helper functions (same as in deploy route)
function getDiscordOptionType(type: string): number {
  const typeMap: Record<string, number> = {
    SUB_COMMAND: 1,
    SUB_COMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4,
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7,
    ROLE: 8,
    MENTIONABLE: 9,
    NUMBER: 10,
    ATTACHMENT: 11,
  };
  return typeMap[type] || 3;
}

function getDiscordPermission(permission: string): number {
  const permissionMap: Record<string, number> = {
    CREATE_INSTANT_INVITE: 1 << 0,
    KICK_MEMBERS: 1 << 1,
    BAN_MEMBERS: 1 << 2,
    ADMINISTRATOR: 1 << 3,
    MANAGE_CHANNELS: 1 << 4,
    MANAGE_GUILD: 1 << 5,
    ADD_REACTIONS: 1 << 6,
    VIEW_AUDIT_LOG: 1 << 7,
    PRIORITY_SPEAKER: 1 << 8,
    STREAM: 1 << 9,
    VIEW_CHANNEL: 1 << 10,
    SEND_MESSAGES: 1 << 11,
    SEND_TTS_MESSAGES: 1 << 12,
    MANAGE_MESSAGES: 1 << 13,
    EMBED_LINKS: 1 << 14,
    ATTACH_FILES: 1 << 15,
    READ_MESSAGE_HISTORY: 1 << 16,
    MENTION_EVERYONE: 1 << 17,
    USE_EXTERNAL_EMOJIS: 1 << 18,
    VIEW_GUILD_INSIGHTS: 1 << 19,
    CONNECT: 1 << 20,
    SPEAK: 1 << 21,
    MUTE_MEMBERS: 1 << 22,
    DEAFEN_MEMBERS: 1 << 23,
    MOVE_MEMBERS: 1 << 24,
    USE_VAD: 1 << 25,
    CHANGE_NICKNAME: 1 << 26,
    MANAGE_NICKNAMES: 1 << 27,
    MANAGE_ROLES: 1 << 28,
    MANAGE_WEBHOOKS: 1 << 29,
    MANAGE_EMOJIS_AND_STICKERS: 1 << 30,
    USE_APPLICATION_COMMANDS: 1 << 31,
  };
  return permissionMap[permission] || 0;
}
