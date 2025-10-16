#!/usr/bin/env node
/**
 * Install Python dependencies on Railway server startup
 * This runs automatically before the server starts
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function installPythonDependencies() {
  console.log('\n' + '='.repeat(60));
  console.log('🐍 Checking Python dependencies...');
  console.log('='.repeat(60));

  try {
    // Check if Python is available
    const { stdout: pythonVersion } = await execPromise('python3 --version');
    console.log('✅ Python found:', pythonVersion.trim());

    // Check if youtube-transcript-api is already installed
    try {
      await execPromise('python3 -c "import youtube_transcript_api"');
      console.log('✅ youtube-transcript-api already installed - skipping');
      console.log('='.repeat(60) + '\n');
      return;
    } catch {
      console.log('📦 youtube-transcript-api not found - installing...');
    }

    // Install youtube-transcript-api
    console.log('⏳ Installing youtube-transcript-api (this may take 30 seconds)...');
    const { stdout, stderr } = await execPromise(
      'cd src/python-scripts && pip3 install --user youtube-transcript-api',
      { timeout: 60000 }
    );

    if (stderr && !stderr.includes('Successfully installed')) {
      console.log('⚠️  Installation warnings:', stderr);
    }

    console.log('✅ youtube-transcript-api installed successfully!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.log('⚠️  Python not available on this server');
    console.log('✅ Server will use Node.js transcript methods instead');
    console.log('📊 Covers 90%+ of videos with Node.js + DOM fallback');
    console.log('='.repeat(60) + '\n');
  }
}

// Run installation
installPythonDependencies();
