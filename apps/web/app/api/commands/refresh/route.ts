import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Path to commands directory
    const commandsPath = path.join(process.cwd(), 'commands');
    
    // Check if commands directory exists
    try {
      await fs.access(commandsPath);
    } catch (error) {
      return NextResponse.json({ 
        error: 'Commands directory not found. Please create a "commands" folder in your project root.' 
      }, { status: 404 });
    }

    const commands = await scanCommandsDirectory(commandsPath);
    
    // Here you would typically save the commands to your database
    // For now, we'll just return the scanned commands
    console.log(`Found ${commands.length} commands in filesystem`);
    
    return NextResponse.json({ 
      message: `Successfully scanned ${commands.length} commands from filesystem`,
      commands 
    });

  } catch (error) {
    console.error('Error refreshing commands:', error);
    return NextResponse.json({ error: 'Failed to refresh commands' }, { status: 500 });
  }
}

async function scanCommandsDirectory(dirPath: string): Promise<any[]> {
  const commands: any[] = [];
  
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        // Recursively scan subdirectories (categories)
        const subCommands = await scanCommandsDirectory(itemPath);
        commands.push(...subCommands);
      } else if (item.isFile() && (item.name.endsWith('.js') || item.name.endsWith('.ts'))) {
        // Parse command file
        try {
          const command = await parseCommandFile(itemPath, path.basename(dirPath));
          if (command) {
            commands.push(command);
          }
        } catch (error) {
          console.warn(`Failed to parse command file ${itemPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return commands;
}

async function parseCommandFile(filePath: string, category: string): Promise<any | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Basic parsing - look for common patterns
    const command = {
      name: fileName,
      description: extractDescription(content) || `${fileName} command`,
      category: category === 'commands' ? 'general' : category,
      enabled: true,
      cooldown: extractCooldown(content) || 5,
      type: content.includes('SlashCommandBuilder') ? 'slash' : 'prefix',
      filePath: filePath
    };
    
    return command;
  } catch (error) {
    console.error(`Error parsing command file ${filePath}:`, error);
    return null;
  }
}

function extractDescription(content: string): string | null {
  // Look for .setDescription() calls
  const descMatch = content.match(/\.setDescription\(['"`]([^'"`]+)['"`]\)/);
  if (descMatch) return descMatch[1];
  
  // Look for description property
  const propMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
  if (propMatch) return propMatch[1];
  
  // Look for comments
  const commentMatch = content.match(/\/\*\*?\s*([^*]+)\*\//);
  if (commentMatch) return commentMatch[1].trim();
  
  return null;
}

function extractCooldown(content: string): number | null {
  const cooldownMatch = content.match(/cooldown:\s*(\d+)/);
  return cooldownMatch ? parseInt(cooldownMatch[1]) : null;
}
