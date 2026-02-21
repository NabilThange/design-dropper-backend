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

  console.log(`[Extractor] Executing: ${cmd}`);

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

    // Log raw output for debugging
    console.log(`[Extractor] Raw stdout length: ${stdout.length} bytes`);
    console.log(`[Extractor] First 200 chars: ${stdout.substring(0, 200)}`);

    // Log any warnings from stderr
    if (stderr) {
      console.warn('[Extractor] dembrandt warnings:', stderr);
    }

    // Clean the output - remove ANSI codes and terminal formatting
    let cleanOutput = stdout
      .replace(/\u001b\[[0-9;]*m/g, '') // Remove ANSI color codes
      .replace(/[✓✗]/g, '') // Remove checkmarks
      .trim();

    // Find the JSON object (starts with { and ends with })
    const jsonStart = cleanOutput.indexOf('{');
    const jsonEnd = cleanOutput.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('[Extractor] No JSON found in output');
      console.error('[Extractor] Clean output:', cleanOutput.substring(0, 500));
      throw new Error('No valid JSON found in dembrandt output');
    }

    const jsonString = cleanOutput.substring(jsonStart, jsonEnd + 1);
    console.log(`[Extractor] Extracted JSON length: ${jsonString.length} bytes`);

    // Parse JSON output
    const data = JSON.parse(jsonString);
    console.log(`[Extractor] Successfully parsed JSON with ${Object.keys(data).length} top-level keys`);
    
    return data;

  } catch (error) {
    // Enhanced error handling
    console.error('[Extractor] Error occurred:', error.message);
    
    if (error.killed) {
      throw new Error('Extraction timed out after 90 seconds');
    }
    
    if (error.code === 'ENOENT') {
      throw new Error('dembrandt CLI not found. Please install: npm install -g dembrandt');
    }

    // Try to parse error output
    if (error.stderr) {
      console.error('[Extractor] dembrandt error output:', error.stderr);
    }

    // If it's a JSON parse error, include more context
    if (error instanceof SyntaxError) {
      console.error('[Extractor] JSON parse error. Raw output:', error.stdout?.substring(0, 500));
      throw new Error(`Failed to parse dembrandt output: ${error.message}`);
    }

    throw new Error(`Extraction failed: ${error.message}`);
  }
}
