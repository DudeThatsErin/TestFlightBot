import fs from 'fs';
import path from 'path';

export interface DiscordConfig {
  botToken: string;
  clientId: string;
  guildId: string;
}

const CONFIG_PATH = path.join(process.cwd(), 'config', 'discord.json');
const EXAMPLE_CONFIG_PATH = path.join(process.cwd(), 'config', 'discord.example.json');

// Ensure config directory exists
function ensureConfigDir() {
  const configDir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

// Create config file from example if it doesn't exist
function ensureConfigFile() {
  ensureConfigDir();
  
  if (!fs.existsSync(CONFIG_PATH)) {
    if (fs.existsSync(EXAMPLE_CONFIG_PATH)) {
      fs.copyFileSync(EXAMPLE_CONFIG_PATH, CONFIG_PATH);
    } else {
      // Create default config
      const defaultConfig: DiscordConfig = {
        botToken: '',
        clientId: '',
        guildId: ''
      };
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
    }
  }
}

// Read Discord configuration
export function getDiscordConfig(): DiscordConfig {
  try {
    ensureConfigFile();
    const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error reading Discord config:', error);
    return {
      botToken: '',
      clientId: '',
      guildId: ''
    };
  }
}

// Write Discord configuration
export function setDiscordConfig(config: DiscordConfig): boolean {
  try {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing Discord config:', error);
    return false;
  }
}

// Check if configuration is complete
export function isDiscordConfigured(): boolean {
  const config = getDiscordConfig();
  return !!(config.botToken && config.clientId);
}

// Get configuration with fallback to environment variables
export function getDiscordConfigWithFallback(): DiscordConfig {
  const config = getDiscordConfig();
  
  return {
    botToken: config.botToken || process.env.DISCORD_TOKEN || '',
    clientId: config.clientId || process.env.DISCORD_CLIENT_ID || '',
    guildId: config.guildId || process.env.DISCORD_GUILD_ID || ''
  };
}
