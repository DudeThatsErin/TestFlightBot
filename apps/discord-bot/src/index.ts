import { SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';
import { config } from 'dotenv';
import { TestFlightMonitor } from './services/testflight-monitor';

// Load environment variables
config();

const client = new SapphireClient({
  defaultPrefix: '!',
  regexPrefix: /^(hey +)?bot[,! ]/i,
  caseInsensitiveCommands: true,
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  },
  shards: 'auto',
  intents: [
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel],
  loadMessageCommandListeners: true
});

const main = async () => {
  try {
    client.logger.info('Logging in');
    await client.login(process.env.DISCORD_TOKEN);
    client.logger.info('Logged in');

    // Start TestFlight monitoring service
    const channelId = process.env.DISCORD_CHANNEL_ID;
    if (channelId) {
      const monitor = new TestFlightMonitor(client, channelId);
      monitor.start();
      client.logger.info('TestFlight monitor started');
    } else {
      client.logger.warn('DISCORD_CHANNEL_ID not set, TestFlight monitoring disabled');
    }
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
};

main();
