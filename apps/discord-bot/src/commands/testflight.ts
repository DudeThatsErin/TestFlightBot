import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { prisma } from '@windsurf/database';
import { z } from 'zod';

const testflightUrlSchema = z.object({
  url: z.string().url().includes('testflight.apple.com'),
  name: z.string().min(1).max(100),
  version: z.string().min(1).max(20),
  buildNumber: z.string().min(1).max(20),
  notes: z.string().max(500).optional(),
});

@ApplyOptions<Command.Options>({
  description: 'Manage TestFlight builds'
})
export class TestFlightCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      new SlashCommandBuilder()
        .setName('testflight')
        .setDescription('Manage TestFlight builds')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('add')
            .setDescription('Add a new TestFlight build to monitor')
            .addStringOption((option) =>
              option
                .setName('url')
                .setDescription('TestFlight URL')
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName('name')
                .setDescription('App name')
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName('version')
                .setDescription('App version')
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName('build')
                .setDescription('Build number')
                .setRequired(true)
            )
            .addStringOption((option) =>
              option
                .setName('notes')
                .setDescription('Additional notes')
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('list')
            .setDescription('List all monitored TestFlight builds')
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('remove')
            .setDescription('Remove a TestFlight build from monitoring')
            .addStringOption((option) =>
              option
                .setName('id')
                .setDescription('Build ID to remove')
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('status')
            .setDescription('Check the status of a specific TestFlight build')
            .addStringOption((option) =>
              option
                .setName('id')
                .setDescription('Build ID to check')
                .setRequired(true)
            )
        )
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'add':
        return this.handleAdd(interaction);
      case 'list':
        return this.handleList(interaction);
      case 'remove':
        return this.handleRemove(interaction);
      case 'status':
        return this.handleStatus(interaction);
      default:
        return interaction.reply({
          content: 'Unknown subcommand',
          ephemeral: true,
        });
    }
  }

  private async handleAdd(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const url = interaction.options.getString('url', true);
      const name = interaction.options.getString('name', true);
      const version = interaction.options.getString('version', true);
      const buildNumber = interaction.options.getString('build', true);
      const notes = interaction.options.getString('notes') || undefined;

      // Validate input
      const validatedData = testflightUrlSchema.parse({
        url,
        name,
        version,
        buildNumber,
        notes,
      });

      // Check if build already exists
      const existingBuild = await prisma.testflightBuild.findUnique({
        where: {
          version_buildNumber: {
            version: validatedData.version,
            buildNumber: validatedData.buildNumber,
          },
        },
      });

      if (existingBuild) {
        return interaction.editReply({
          content: `❌ Build ${validatedData.version} (${validatedData.buildNumber}) already exists!`,
        });
      }

      // Create new build entry
      const build = await prisma.testflightBuild.create({
        data: {
          name: validatedData.name,
          version: validatedData.version,
          buildNumber: validatedData.buildNumber,
          testflightUrl: validatedData.url,
          notes: validatedData.notes,
          createdById: 'system', // We'll need to handle user mapping later
          status: 'PENDING',
        },
      });

      const embed = new EmbedBuilder()
        .setTitle('✅ TestFlight Build Added')
        .setColor(0x00ff00)
        .addFields(
          { name: 'App Name', value: build.name, inline: true },
          { name: 'Version', value: build.version, inline: true },
          { name: 'Build', value: build.buildNumber, inline: true },
          { name: 'Status', value: build.status, inline: true },
          { name: 'ID', value: build.id, inline: true }
        )
        .setTimestamp();

      if (build.notes) {
        embed.addFields({ name: 'Notes', value: build.notes });
      }

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error adding TestFlight build:', error);
      return interaction.editReply({
        content: '❌ Failed to add TestFlight build. Please check your input and try again.',
      });
    }
  }

  private async handleList(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const builds = await prisma.testflightBuild.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      if (builds.length === 0) {
        return interaction.editReply({
          content: '📱 No TestFlight builds are currently being monitored.',
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('📱 Monitored TestFlight Builds')
        .setColor(0x007aff)
        .setTimestamp();

      builds.forEach((build: any, index: number) => {
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
          value: `**Build:** ${build.buildNumber}\n**Status:** ${emoji} ${build.status}\n**ID:** \`${build.id}\``,
          inline: true,
        });
      });

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error listing TestFlight builds:', error);
      return interaction.editReply({
        content: '❌ Failed to retrieve TestFlight builds.',
      });
    }
  }

  private async handleRemove(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const buildId = interaction.options.getString('id', true);

      const build = await prisma.testflightBuild.findUnique({
        where: { id: buildId },
      });

      if (!build) {
        return interaction.editReply({
          content: '❌ Build not found. Please check the ID and try again.',
        });
      }

      await prisma.testflightBuild.delete({
        where: { id: buildId },
      });

      const embed = new EmbedBuilder()
        .setTitle('🗑️ TestFlight Build Removed')
        .setColor(0xff0000)
        .addFields(
          { name: 'App Name', value: build.name, inline: true },
          { name: 'Version', value: build.version, inline: true },
          { name: 'Build', value: build.buildNumber, inline: true }
        )
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error removing TestFlight build:', error);
      return interaction.editReply({
        content: '❌ Failed to remove TestFlight build.',
      });
    }
  }

  private async handleStatus(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const buildId = interaction.options.getString('id', true);

      const build = await prisma.testflightBuild.findUnique({
        where: { id: buildId },
        include: {
          logs: {
            orderBy: { checkedAt: 'desc' },
            take: 5,
          },
        },
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
          { name: 'Last Checked', value: build.lastCheckedAt ? `<t:${Math.floor(build.lastCheckedAt.getTime() / 1000)}:R>` : 'Never', inline: true }
        )
        .setTimestamp();

      if (build.notes) {
        embed.addFields({ name: 'Notes', value: build.notes });
      }

      if (build.logs.length > 0) {
        const recentLogs = build.logs.slice(0, 3).map((log: any) => 
          `<t:${Math.floor(log.checkedAt.getTime() / 1000)}:t> - ${log.status}${log.message ? `: ${log.message}` : ''}`
        ).join('\n');
        
        embed.addFields({ name: 'Recent Checks', value: recentLogs || 'No recent checks' });
      }

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error checking TestFlight build status:', error);
      return interaction.editReply({
        content: '❌ Failed to check TestFlight build status.',
      });
    }
  }
}
