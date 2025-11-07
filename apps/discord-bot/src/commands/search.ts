import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { prisma } from '@windsurf/database';

@ApplyOptions<Command.Options>({
  description: 'Search through TestFlight builds'
})
export class SearchCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search through TestFlight builds')
        .addStringOption((option) =>
          option
            .setName('query')
            .setDescription('Search term (app name, version, or build number)')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('status')
            .setDescription('Filter by status')
            .setRequired(false)
            .addChoices(
              { name: 'Active', value: 'ACTIVE' },
              { name: 'Expired', value: 'EXPIRED' },
              { name: 'Pending', value: 'PENDING' },
              { name: 'Error', value: 'ERROR' },
              { name: 'Not Found', value: 'NOT_FOUND' }
            )
        )
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const query = interaction.options.getString('query', true);
      const statusFilter = interaction.options.getString('status');

      // Build search conditions
      const searchConditions: any = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { version: { contains: query, mode: 'insensitive' } },
          { buildNumber: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } },
        ],
      };

      if (statusFilter) {
        searchConditions.status = statusFilter;
      }

      const builds = await prisma.testflightBuild.findMany({
        where: searchConditions,
        orderBy: [
          { status: 'asc' }, // Active builds first
          { createdAt: 'desc' }
        ],
        take: 5, // Top 5 results as requested
      });

      if (builds.length === 0) {
        const embed = new EmbedBuilder()
          .setTitle('🔍 Search Results')
          .setDescription(`No TestFlight builds found matching "${query}"${statusFilter ? ` with status ${statusFilter}` : ''}`)
          .setColor(0xff6b6b)
          .setTimestamp()
          .setFooter({ text: 'TestFlight Checker', iconURL: interaction.client.user?.displayAvatarURL() });

        return interaction.editReply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setTitle('🔍 Search Results')
        .setDescription(`Found ${builds.length} TestFlight build(s) matching "${query}"${statusFilter ? ` with status ${statusFilter}` : ''}`)
        .setColor(0x007aff)
        .setTimestamp()
        .setFooter({ text: 'TestFlight Checker', iconURL: interaction.client.user?.displayAvatarURL() });

      builds.forEach((build: any, index: number) => {
        const statusEmoji: Record<string, string> = {
          PENDING: '⏳',
          ACTIVE: '✅',
          EXPIRED: '❌',
          NOT_FOUND: '🚫',
          ERROR: '⚠️',
        };
        const emoji = statusEmoji[build.status] || '❓';

        // Highlight matching terms in the description
        let description = `**Build:** ${build.buildNumber}\n**Status:** ${emoji} ${build.status}`;
        
        if (build.testflightUrl) {
          description += `\n**URL:** [Join TestFlight](${build.testflightUrl})`;
        }
        
        if (build.notes && build.notes.toLowerCase().includes(query.toLowerCase())) {
          const truncatedNotes = build.notes.length > 100 ? build.notes.substring(0, 100) + '...' : build.notes;
          description += `\n**Notes:** ${truncatedNotes}`;
        }
        
        description += `\n**ID:** \`${build.id}\``;
        
        if (build.lastCheckedAt) {
          description += `\n**Last Checked:** <t:${Math.floor(build.lastCheckedAt.getTime() / 1000)}:R>`;
        }

        embed.addFields({
          name: `${index + 1}. ${build.name} v${build.version}`,
          value: description,
          inline: false,
        });
      });

      // Add search tips if fewer than 5 results
      if (builds.length < 5) {
        embed.addFields({
          name: '💡 Search Tips',
          value: '• Try shorter or more general terms\n• Search by app name, version, or build number\n• Use status filters to narrow results\n• Check spelling and try different keywords',
          inline: false,
        });
      }

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error searching TestFlight builds:', error);
      return interaction.editReply({
        content: '❌ Failed to search TestFlight builds. Please try again.',
      });
    }
  }
}
