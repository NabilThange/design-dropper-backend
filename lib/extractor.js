/**
 * Design System Extractor
 * Wraps dembrandt CLI for programmatic use
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Extract design system from a URL using dembrandt
 * @param {string} url - Website URL to extract from
 * @param {object} options - Extraction options
 * @returns {Promise<object>} Extracted design system data
 */
export async function extractDesignSystem(url, options = {}) {
  // Build dembrandt command
  let cmd = `dembrandt "${url}" --json-only`;
  
  // Add options
  if (options.darkMode) cmd += ' --dark-mode';
  if (options.mobile) cmd += ' --mobile';
  if (options.slow) cmd += ' --slow';
  if (options.browser) cmd += ` --browser=${options.browser}`;
  if (options.dtcg) cmd += ' --dtcg';
  
  // Add no-sandbox for Docker/Render environment
  cmd += ' --no-sandbox';

  console.log(`Executing: ${cmd}`);

  try {
    // Execute with generous timeout and buffer
    const { stdout, stderr } = await execAsync(cmd, { 
      timeout: 90000, // 90 seconds
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      env: {
        ...process.env,
        NODE_ENV: 'production'
      }
    });

    // Log any warnings from stderr
    if (stderr) {
      console.warn('dembrandt warnings:', stderr);
    }

    // Parse JSON output
    const data = JSON.parse(stdout);
    
    return data;

  } catch (error) {
    // Enhanced error handling
    if (error.killed) {
      throw new Error('Extraction timed out after 90 seconds');
    }
    
    if (error.code === 'ENOENT') {
      throw new Error('dembrandt CLI not found. Please install: npm install -g dembrandt');
    }

    // Try to parse error output
    if (error.stderr) {
      console.error('dembrandt error output:', error.stderr);
    }

    throw new Error(`Extraction failed: ${error.message}`);
  }
}
