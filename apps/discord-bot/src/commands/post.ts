import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, TextChannel } from 'discord.js';
import { prisma } from '@windsurf/database';

@ApplyOptions<Command.Options>({
  description: 'Post TestFlight builds to a channel'
})
export class PostCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      new SlashCommandBuilder()
        .setName('post')
        .setDescription('Post TestFlight builds to a channel')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('active')
            .setDescription('Post all active TestFlight builds')
            .addChannelOption((option) =>
              option
                .setName('channel')
                .setDescription('Channel to post to (optional, defaults to current channel)')
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('all')
            .setDescription('Post all TestFlight builds')
            .addChannelOption((option) =>
              option
                .setName('channel')
                .setDescription('Channel to post to (optional, defaults to current channel)')
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('build')
            .setDescription('Post a specific TestFlight build')
            .addStringOption((option) =>
              option
                .setName('id')
                .setDescription('Build ID to post')
                .setRequired(true)
            )
            .addChannelOption((option) =>
              option
                .setName('channel')
                .setDescription('Channel to post to (optional, defaults to current channel)')
                .setRequired(false)
            )
        )
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'active':
        return this.handlePostActive(interaction);
      case 'all':
        return this.handlePostAll(interaction);
      case 'build':
        return this.handlePostBuild(interaction);
      default:
        return interaction.reply({
          content: 'Unknown subcommand',
          ephemeral: true,
        });
    }
  }

  private async handlePostActive(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const targetChannel = interaction.options.getChannel('channel') as TextChannel || interaction.channel as TextChannel;
      
      const activeBuilds = await prisma.testflightBuild.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });

      if (activeBuilds.length === 0) {
        return interaction.editReply({
          content: '📱 No active TestFlight builds found.',
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('🚀 Active TestFlight Builds')
        .setColor(0x00ff00)
        .setDescription(`Found ${activeBuilds.length} active TestFlight build(s)`)
        .setTimestamp()
        .setFooter({ text: 'TestFlight Checker', iconURL: interaction.client.user?.displayAvatarURL() });

      activeBuilds.forEach((build: any, index: number) => {
        embed.addFields({
          name: `${index + 1}. ${build.name} v${build.version}`,
          value: `**Build:** ${build.buildNumber}\n**URL:** [Join TestFlight](${build.testflightUrl})\n**ID:** \`${build.id}\``,
          inline: true,
        });
      });

      await targetChannel.send({ embeds: [embed] });
      
      return interaction.editReply({
        content: `✅ Posted ${activeBuilds.length} active TestFlight builds to ${targetChannel.toString()}`,
      });
    } catch (error) {
      console.error('Error posting active builds:', error);
      return interaction.editReply({
        content: '❌ Failed to post active TestFlight builds.',
      });
    }
  }

  private async handlePostAll(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const targetChannel = interaction.options.getChannel('channel') as TextChannel || interaction.channel as TextChannel;
      
      const allBuilds = await prisma.testflightBuild.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20, // Limit to prevent spam
      });

      if (allBuilds.length === 0) {
        return interaction.editReply({
          content: '📱 No TestFlight builds found.',
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('📱 All TestFlight Builds')
        .setColor(0x007aff)
        .setDescription(`Showing ${allBuilds.length} TestFlight build(s)`)
        .setTimestamp()
        .setFooter({ text: 'TestFlight Checker', iconURL: interaction.client.user?.displayAvatarURL() });

      allBuilds.forEach((build: any, index: number) => {
        const statusEmoji: Record<string, string> = {
          PENDING: '⏳',
          ACTIVE: '✅',
          EXPIRED: '❌',
          NOT_FOUND: '🚫',
          ERROR: '⚠️',
        };
        const emoji = statusEmoji[build.status] || '❓';

        embed.addFields({
          name: `${index + 1}. ${build.name} v${build.version}`,
          value: `**Build:** ${build.buildNumber}\n**Status:** ${emoji} ${build.status}\n**URL:** [TestFlight](${build.testflightUrl})\n**ID:** \`${build.id}\``,
          inline: true,
        });
      });

      await targetChannel.send({ embeds: [embed] });
      
      return interaction.editReply({
        content: `✅ Posted ${allBuilds.length} TestFlight builds to ${targetChannel.toString()}`,
      });
    } catch (error) {
      console.error('Error posting all builds:', error);
      return interaction.editReply({
        content: '❌ Failed to post TestFlight builds.',
      });
    }
  }

  private async handlePostBuild(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const buildId = interaction.options.getString('id', true);
      const targetChannel = interaction.options.getChannel('channel') as TextChannel || interaction.channel as TextChannel;
      
      const build = await prisma.testflightBuild.findUnique({
        where: { id: buildId },
      });

      if (!build) {
        return interaction.editReply({
          content: '❌ Build not found. Please check the ID and try again.',
        });
      }

      const statusEmoji: Record<string, string> = {
        PENDING: '⏳',
        ACTIVE: '✅',
        EXPIRED: '❌',
        NOT_FOUND: '🚫',
        ERROR: '⚠️',
      };
      const emoji = statusEmoji[build.status] || '❓';

      const embed = new EmbedBuilder()
        .setTitle(`📱 ${build.name} v${build.version}`)
        .setColor(build.status === 'ACTIVE' ? 0x00ff00 : build.status === 'EXPIRED' ? 0xff0000 : 0xffff00)
        .addFields(
          { name: 'Build Number', value: build.buildNumber, inline: true },
          { name: 'Status', value: `${emoji} ${build.status}`, inline: true },
          { name: 'TestFlight URL', value: `[Join TestFlight](${build.testflightUrl})`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'TestFlight Checker', iconURL: interaction.client.user?.displayAvatarURL() });

      if (build.notes) {
        embed.addFields({ name: 'Notes', value: build.notes });
      }

      await targetChannel.send({ embeds: [embed] });
      
      return interaction.editReply({
        content: `✅ Posted TestFlight build "${build.name}" to ${targetChannel.toString()}`,
      });
    } catch (error) {
      console.error('Error posting build:', error);
      return interaction.editReply({
        content: '❌ Failed to post TestFlight build.',
      });
    }
  }
}
