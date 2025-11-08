import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs/promises';
import path from 'path';

const COMMANDS_DIR = path.join(process.cwd(), 'commands');

// PUT - Move command to different category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category } = await request.json();
    const commandId = params.id;
    
    if (!category || typeof category !== 'string') {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // Find the current command file
    let currentFilePath: string | null = null;
    let commandFileName: string | null = null;
    
    try {
      const files = await fs.readdir(COMMANDS_DIR, { recursive: true });
      for (const file of files) {
        if (typeof file === 'string' && file.endsWith('.js')) {
          const filePath = path.join(COMMANDS_DIR, file);
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            // Simple check for command ID in file content
            if (content.includes(`name: '${commandId}'`) || content.includes(`name: "${commandId}"`)) {
              currentFilePath = filePath;
              commandFileName = path.basename(file);
              break;
            }
          } catch (error) {
            // Skip files that can't be read
            continue;
          }
        }
      }
    } catch (error) {
      // Commands directory doesn't exist
      return NextResponse.json({ error: 'Commands directory not found' }, { status: 404 });
    }

    if (!currentFilePath || !commandFileName) {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 });
    }

    // Create new category directory if it doesn't exist
    const newCategoryPath = path.join(COMMANDS_DIR, category);
    await fs.mkdir(newCategoryPath, { recursive: true });

    // New file path
    const newFilePath = path.join(newCategoryPath, commandFileName);

    // Move the file
    await fs.rename(currentFilePath, newFilePath);

    // Clean up empty directories
    const oldDir = path.dirname(currentFilePath);
    if (oldDir !== COMMANDS_DIR) {
      try {
        const remainingFiles = await fs.readdir(oldDir);
        if (remainingFiles.length === 0) {
          await fs.rmdir(oldDir);
        }
      } catch (error) {
        // Directory not empty or other error, ignore
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moving command:', error);
    return NextResponse.json({ error: 'Failed to move command' }, { status: 500 });
  }
}
