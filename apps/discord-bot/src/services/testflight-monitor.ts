import axios from 'axios';
import * as cron from 'node-cron';
import { prisma, TestflightStatus } from '@windsurf/database';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';

export class TestFlightMonitor {
  private client: Client;
  private channelId: string;
  private isRunning = false;

  constructor(client: Client, channelId: string) {
    this.client = client;
    this.channelId = channelId;
  }

  public start() {
    if (this.isRunning) {
      console.log('TestFlight monitor is already running');
      return;
    }

    console.log('Starting TestFlight monitor...');
    this.isRunning = true;

    // Run every 5-6 minutes (randomized to avoid rate limiting)
    cron.schedule('*/5 * * * *', async () => {
      // Add random delay between 0-60 seconds
      const delay = Math.random() * 60000;
      setTimeout(() => this.checkAllBuilds(), delay);
    });

    // Initial check after 30 seconds
    setTimeout(() => this.checkAllBuilds(), 30000);
  }

  public stop() {
    this.isRunning = false;
    console.log('TestFlight monitor stopped');
  }

  private async checkAllBuilds() {
    if (!this.isRunning) return;

    try {
      const builds = await prisma.testflightBuild.findMany({
        where: {
          status: {
            in: ['PENDING', 'ACTIVE']
          }
        }
      });

      console.log(`Checking ${builds.length} TestFlight builds...`);

      for (const build of builds) {
        try {
          await this.checkBuild(build.id);
          // Add delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Error checking build ${build.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error fetching builds to check:', error);
    }
  }

  private async checkBuild(buildId: string) {
    const build = await prisma.testflightBuild.findUnique({
      where: { id: buildId }
    });

    if (!build) {
      console.error(`Build ${buildId} not found`);
      return;
    }

    const startTime = Date.now();
    let status: TestflightStatus = 'ERROR';
    let message = '';
    let httpStatus: number | null = null;
    let errorDetails: string | null = null;

    try {
      const response = await axios.get(build.testflightUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        }
      });

      httpStatus = response.status;
      const responseTime = Date.now() - startTime;

      if (response.status === 200) {
        const html = response.data;
        
        // Check if the TestFlight page indicates the app is available
        if (html.includes('Start Testing') || html.includes('Open in TestFlight')) {
          status = 'ACTIVE';
          message = `Build is available for testing (${responseTime}ms)`;
        } else if (html.includes('expired') || html.includes('no longer available')) {
          status = 'EXPIRED';
          message = `Build has expired (${responseTime}ms)`;
        } else if (html.includes('full') || html.includes('capacity')) {
          status = 'ACTIVE';
          message = `Build is at capacity but still active (${responseTime}ms)`;
        } else {
          status = 'NOT_FOUND';
          message = `Build status unclear (${responseTime}ms)`;
        }
      } else {
        status = 'ERROR';
        message = `HTTP ${response.status} (${responseTime}ms)`;
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      if (error.response) {
        httpStatus = error.response.status;
        if (error.response.status === 404) {
          status = 'NOT_FOUND';
          message = `Build not found (404) (${responseTime}ms)`;
        } else {
          status = 'ERROR';
          message = `HTTP ${error.response.status} (${responseTime}ms)`;
        }
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        status = 'ERROR';
        message = `Network error: ${error.code} (${responseTime}ms)`;
      } else {
        status = 'ERROR';
        message = `Request failed (${responseTime}ms)`;
      }
      
      errorDetails = error.message;
    }

    // Update build status if it changed
    const previousStatus = build.status;
    if (status !== previousStatus) {
      await prisma.testflightBuild.update({
        where: { id: buildId },
        data: {
          status,
          lastCheckedAt: new Date()
        }
      });

      // Send notification to Discord channel
      await this.sendStatusUpdate(build, status, previousStatus, message);
    }

    // Log the check
    await prisma.testflightBuildLog.create({
      data: {
        buildId,
        status,
        message,
        responseTimeMs: Date.now() - startTime,
        httpStatus,
        errorDetails
      }
    });

    // Update last checked time
    await prisma.testflightBuild.update({
      where: { id: buildId },
      data: { lastCheckedAt: new Date() }
    });
  }

  private async sendStatusUpdate(
    build: any,
    newStatus: TestflightStatus,
    previousStatus: TestflightStatus,
    message: string
  ) {
    try {
      const channel = await this.client.channels.fetch(this.channelId) as TextChannel;
      if (!channel) {
        console.error('Discord channel not found');
        return;
      }

      const statusEmoji: Record<string, string> = {
        PENDING: '⏳',
        ACTIVE: '✅',
        EXPIRED: '❌',
        NOT_FOUND: '🚫',
        ERROR: '⚠️',
      };

      const statusColors: Record<string, number> = {
        PENDING: 0xffff00,
        ACTIVE: 0x00ff00,
        EXPIRED: 0xff0000,
        NOT_FOUND: 0x808080,
        ERROR: 0xff6600,
      };

      const embed = new EmbedBuilder()
        .setTitle(`${statusEmoji[newStatus]} TestFlight Status Update`)
        .setColor(statusColors[newStatus])
        .addFields(
          { name: 'App', value: build.name, inline: true },
          { name: 'Version', value: `${build.version} (${build.buildNumber})`, inline: true },
          { name: 'Status Change', value: `${statusEmoji[previousStatus] || '❓'} ${previousStatus} → ${statusEmoji[newStatus] || '❓'} ${newStatus}`, inline: false },
          { name: 'Details', value: message, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: `Build ID: ${build.id}` });

      if (newStatus === 'ACTIVE' && previousStatus !== 'ACTIVE') {
        embed.setDescription(`🎉 **${build.name}** is now available for testing!`);
        embed.addFields({ name: 'TestFlight URL', value: build.testflightUrl });
      } else if (newStatus === 'EXPIRED') {
        embed.setDescription(`⏰ **${build.name}** has expired and is no longer available.`);
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending Discord notification:', error);
    }
  }
}
