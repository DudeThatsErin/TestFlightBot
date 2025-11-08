import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs/promises';
import path from 'path';

const COMMANDS_DIR = path.join(process.cwd(), 'commands');

// GET - List all categories
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Read all command files to get categories
    const categories = new Set<string>();
    
    try {
      const files = await fs.readdir(COMMANDS_DIR, { recursive: true });
      for (const file of files) {
        if (typeof file === 'string' && file.endsWith('.js')) {
          const filePath = path.join(COMMANDS_DIR, file);
          const relativePath = path.relative(COMMANDS_DIR, filePath);
          const category = path.dirname(relativePath);
          if (category !== '.') {
            categories.add(category);
          }
        }
      }
    } catch (error) {
      // Commands directory doesn't exist yet
    }

    return NextResponse.json(Array.from(categories));
  } catch (error) {
    console.error('Error listing categories:', error);
    return NextResponse.json({ error: 'Failed to list categories' }, { status: 500 });
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newName } = await request.json();
    
    if (!newName || typeof newName !== 'string') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const categoryPath = path.join(COMMANDS_DIR, newName);
    
    // Create the category directory
    await fs.mkdir(categoryPath, { recursive: true });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// PUT - Rename category
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { oldName, newName } = await request.json();
    
    if (!oldName || !newName || typeof oldName !== 'string' || typeof newName !== 'string') {
      return NextResponse.json({ error: 'Both old and new category names are required' }, { status: 400 });
    }

    const oldPath = path.join(COMMANDS_DIR, oldName);
    const newPath = path.join(COMMANDS_DIR, newName);
    
    try {
      // Check if old category exists
      await fs.access(oldPath);
      
      // Rename the directory
      await fs.rename(oldPath, newPath);
      
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Category not found or rename failed' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error renaming category:', error);
    return NextResponse.json({ error: 'Failed to rename category' }, { status: 500 });
  }
}

// DELETE - Delete category and all its commands
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { categoryName } = await request.json();
    
    if (!categoryName || typeof categoryName !== 'string') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const categoryPath = path.join(COMMANDS_DIR, categoryName);
    
    try {
      // Check if category exists
      await fs.access(categoryPath);
      
      // Remove the entire directory and its contents
      await fs.rm(categoryPath, { recursive: true, force: true });
      
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
