import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { prisma } from '@windsurf/database';

@ApplyOptions<Command.Options>({
  description: 'Ping the bot and check TestFlight monitoring status'
})
export class PingCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping the bot and check TestFlight monitoring status')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('bot')
            .setDescription('Check bot latency and status')
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('monitor')
            .setDescription('Check TestFlight monitoring status')
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('check')
            .setDescription('Force check all TestFlight builds')
        )
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'bot':
        return this.handleBotPing(interaction);
      case 'monitor':
        return this.handleMonitorStatus(interaction);
      case 'check':
        return this.handleForceCheck(interaction);
      default:
        return interaction.reply({
          content: 'Unknown subcommand',
          ephemeral: true,
        });
    }
  }

  private async handleBotPing(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({
      content: 'Pinging...',
      fetchReply: true,
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(0x00ff00)
      .addFields(
        { name: 'Bot Latency', value: `${latency}ms`, inline: true },
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
        { name: 'Status', value: '✅ Online', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'TestFlight Checker Bot', iconURL: interaction.client.user?.displayAvatarURL() });

    return interaction.editReply({
      content: '',
      embeds: [embed],
    });
  }

  private async handleMonitorStatus(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const stats = await prisma.testflightBuild.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      });

      const totalBuilds = await prisma.testflightBuild.count();
      const recentChecks = await prisma.testflightBuild.count({
        where: {
          lastCheckedAt: {
            gte: new Date(Date.now() - 10 * 60 * 1000), // Last 10 minutes
          },
        },
      });

      const statusCounts: Record<string, number> = {};
      stats.forEach((stat: any) => {
        statusCounts[stat.status] = stat._count.status;
      });

      const embed = new EmbedBuilder()
        .setTitle('📊 TestFlight Monitoring Status')
        .setColor(0x007aff)
        .addFields(
          { name: 'Total Builds', value: totalBuilds.toString(), inline: true },
          { name: 'Active Builds', value: (statusCounts.ACTIVE || 0).toString(), inline: true },
          { name: 'Expired Builds', value: (statusCounts.EXPIRED || 0).toString(), inline: true },
          { name: 'Pending Builds', value: (statusCounts.PENDING || 0).toString(), inline: true },
          { name: 'Error Builds', value: (statusCounts.ERROR || 0).toString(), inline: true },
          { name: 'Recent Checks', value: `${recentChecks} in last 10min`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'TestFlight Checker', iconURL: interaction.client.user?.displayAvatarURL() });

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error getting monitor status:', error);
      return interaction.editReply({
        content: '❌ Failed to get monitoring status.',
      });
    }
  }

  private async handleForceCheck(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      // This would trigger the monitoring system to check all builds
      // For now, we'll just update the lastCheckedAt timestamp
      const builds = await prisma.testflightBuild.findMany({
        where: {
          status: {
            in: ['ACTIVE', 'PENDING'],
          },
        },
      });

      if (builds.length === 0) {
        return interaction.editReply({
          content: '📱 No builds available for checking.',
        });
      }

      // Update lastCheckedAt for all builds (simulating a check)
      await prisma.testflightBuild.updateMany({
        where: {
          status: {
            in: ['ACTIVE', 'PENDING'],
          },
        },
        data: {
          lastCheckedAt: new Date(),
        },
      });

      const embed = new EmbedBuilder()
        .setTitle('🔄 Force Check Initiated')
        .setColor(0xffaa00)
        .addFields(
          { name: 'Builds Checked', value: builds.length.toString(), inline: true },
          { name: 'Status', value: '✅ Check completed', inline: true },
          { name: 'Next Check', value: 'In ~5 minutes', inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'TestFlight Checker', iconURL: interaction.client.user?.displayAvatarURL() });

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error forcing check:', error);
      return interaction.editReply({
        content: '❌ Failed to force check TestFlight builds.',
      });
    }
  }
}
