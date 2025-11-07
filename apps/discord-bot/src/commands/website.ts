import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

@ApplyOptions<Command.Options>({
  description: 'Get links to the TestFlight Checker website'
})
export class WebsiteCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      new SlashCommandBuilder()
        .setName('website')
        .setDescription('Get links to the TestFlight Checker website')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('dashboard')
            .setDescription('Get link to the admin dashboard')
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('public')
            .setDescription('Get link to the public TestFlight status page')
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('info')
            .setDescription('Get general information about TestFlight Checker')
        )
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'dashboard':
        return this.handleDashboard(interaction);
      case 'public':
        return this.handlePublic(interaction);
      case 'info':
        return this.handleInfo(interaction);
      default:
        return interaction.reply({
          content: 'Unknown subcommand',
          ephemeral: true,
        });
    }
  }

  private async handleDashboard(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setTitle('🔐 Admin Dashboard')
      .setDescription('Access the TestFlight Checker admin dashboard to manage builds, view analytics, and configure settings.')
      .setColor(0x007aff)
      .addFields(
        { name: 'Dashboard URL', value: '[testflightchecker.vercel.app/dashboard](https://testflightchecker.vercel.app/dashboard)', inline: false },
        { name: 'Features', value: '• Manage TestFlight builds\n• View monitoring statistics\n• Configure bot settings\n• User management', inline: false },
        { name: 'Access', value: 'Admin login required', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'TestFlight Checker', iconURL: interaction.client.user?.displayAvatarURL() });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Open Dashboard')
          .setStyle(ButtonStyle.Link)
          .setURL('https://testflightchecker.vercel.app/dashboard')
          .setEmoji('🔐'),
        new ButtonBuilder()
          .setLabel('Sign In')
          .setStyle(ButtonStyle.Link)
          .setURL('https://testflightchecker.vercel.app/auth/signin')
          .setEmoji('🔑')
      );

    return interaction.reply({
      embeds: [embed],
      components: [row],
    });
  }

  private async handlePublic(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setTitle('📱 Public TestFlight Status')
      .setDescription('View the current status of all monitored TestFlight builds in real-time.')
      .setColor(0x00ff00)
      .addFields(
        { name: 'Public URL', value: '[testflightchecker.vercel.app](https://testflightchecker.vercel.app)', inline: false },
        { name: 'Features', value: '• Real-time build status\n• Search and filter builds\n• Build statistics\n• No login required', inline: false },
        { name: 'Updates', value: 'Refreshed every 5 minutes', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'TestFlight Checker', iconURL: interaction.client.user?.displayAvatarURL() });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel('View Status Page')
          .setStyle(ButtonStyle.Link)
          .setURL('https://testflightchecker.vercel.app')
          .setEmoji('📱'),
        new ButtonBuilder()
          .setLabel('GitHub Repository')
          .setStyle(ButtonStyle.Link)
          .setURL('https://github.com/DudeThatsErin/TestFlightBot')
          .setEmoji('📚')
      );

    return interaction.reply({
      embeds: [embed],
      components: [row],
    });
  }

  private async handleInfo(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setTitle('ℹ️ About TestFlight Checker')
      .setDescription('TestFlight Checker is a comprehensive monitoring system for Apple TestFlight builds with Discord integration.')
      .setColor(0x5865f2)
      .addFields(
        { name: '🤖 Discord Bot', value: 'Manage builds directly from Discord with slash commands', inline: true },
        { name: '🌐 Web Dashboard', value: 'Full-featured admin panel for advanced management', inline: true },
        { name: '📊 Public Status', value: 'Real-time public status page for all monitored builds', inline: true },
        { name: '🔄 Auto Monitoring', value: 'Automatic checking every 5 minutes', inline: true },
        { name: '📧 Notifications', value: 'Discord and email alerts for status changes', inline: true },
        { name: '🔒 Secure', value: 'Admin authentication with 2FA support', inline: true }
      )
      .addFields(
        { name: '🔗 Quick Links', value: '• [Public Status](https://testflightchecker.vercel.app)\n• [Admin Dashboard](https://testflightchecker.vercel.app/dashboard)\n• [GitHub Repository](https://github.com/DudeThatsErin/TestFlightBot)', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'TestFlight Checker • Made with ❤️', iconURL: interaction.client.user?.displayAvatarURL() });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Public Status')
          .setStyle(ButtonStyle.Link)
          .setURL('https://testflightchecker.vercel.app')
          .setEmoji('📱'),
        new ButtonBuilder()
          .setLabel('Admin Dashboard')
          .setStyle(ButtonStyle.Link)
          .setURL('https://testflightchecker.vercel.app/dashboard')
          .setEmoji('🔐'),
        new ButtonBuilder()
          .setLabel('GitHub')
          .setStyle(ButtonStyle.Link)
          .setURL('https://github.com/DudeThatsErin/TestFlightBot')
          .setEmoji('📚')
      );

    return interaction.reply({
      embeds: [embed],
      components: [row],
    });
  }
}
