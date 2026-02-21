#!/usr/bin/env node

/**
 * Design Dropper Backend API
 * Wraps dembrandt CLI for Chrome extension consumption
 */

import express from 'express';
import cors from 'cors';
import { extractDesignSystem } from './lib/extractor.js';
import { toDesignMD, toCSSVariables, toTailwindConfig } from './lib/formatters.js';
import { getCached, setCache } from './lib/cache.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins for Chrome extension
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (for Render keep-alive)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Main extraction endpoint
app.post('/api/extract', async (req, res) => {
  const { url, options = {} } = req.body;

  // Validation
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      error: 'URL is required' 
    });
  }

  // Normalize URL
  let normalizedUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    normalizedUrl = 'https://' + url;
  }

  console.log(`Extracting design system from: ${normalizedUrl}`);
  console.log(`Options:`, options);

  try {
    // Check cache first
    const cacheKey = `${normalizedUrl}-${JSON.stringify(options)}`;
    const cached = getCached(cacheKey);
    
    if (cached) {
      console.log('Returning cached result');
      return res.json({ 
        success: true, 
        data: cached,
        cached: true,
        extractionTime: '0s (cached)'
      });
    }

    // Extract design system
    const startTime = Date.now();
    const rawData = await extractDesignSystem(normalizedUrl, options);
    const extractionTime = ((Date.now() - startTime) / 1000).toFixed(1);

    // Generate all formats
    const result = {
      raw: rawData,
      formats: {
        designMD: toDesignMD(rawData, normalizedUrl),
        json: JSON.stringify(rawData, null, 2),
        css: toCSSVariables(rawData),
        tailwind: toTailwindConfig(rawData),
        dtcg: rawData.dtcg || rawData // dembrandt already supports DTCG
      },
      metadata: {
        url: normalizedUrl,
        extractedAt: new Date().toISOString(),
        extractionTime: `${extractionTime}s`,
        options
      },
      stats: {
        colors: rawData.colors?.palette?.length || 0,
        fonts: rawData.typography?.fonts?.length || 0,
        spacing: rawData.spacing?.scale?.length || 0,
        components: (rawData.buttons?.length || 0) + (rawData.inputs?.length || 0),
        shadows: rawData.shadows?.length || 0,
        borders: rawData.borders?.length || 0
      }
    };

    // Cache result
    setCache(cacheKey, result);

    console.log(`Extraction complete in ${extractionTime}s`);
    res.json({ 
      success: true, 
      data: result,
      cached: false,
      extractionTime: `${extractionTime}s`
    });

  } catch (error) {
    console.error('Extraction failed:', error);
    
    // Provide helpful error messages
    let errorMessage = error.message;
    let errorType = 'extraction_failed';

    if (error.message.includes('Timeout')) {
      errorMessage = 'Extraction timed out. Try enabling "Slow Mode" for JavaScript-heavy sites.';
      errorType = 'timeout';
    } else if (error.message.includes('net::ERR_')) {
      errorMessage = 'Could not connect to the website. Check if the URL is correct.';
      errorType = 'connection_failed';
    } else if (error.message.includes('navigation')) {
      errorMessage = 'Failed to load the page. The site may be blocking automated access.';
      errorType = 'navigation_failed';
    }

    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      errorType,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Design Dropper API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🎨 Extract endpoint: POST http://localhost:${PORT}/api/extract`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
