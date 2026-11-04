#!/usr/bin/env node
/**
 * Couples Conversation Cards (CCC) - PDF Generator
 * 
 * Generates high-quality, professionally formatted 4" x 6" PDF card decks
 * from JSON card specifications.
 * 
 * Usage:
 *   node generate_cards_pdf.js [options]
 * 
 * Options:
 *   --orientation, -o  <portrait|landscape|both>  Page layout (default: portrait)
 *   --output, -out     <filepath>                 Output PDF filename or path
 *   --backs, -b                                   Include card backs (for duplex printing)
 *   --no-cover                                    Omit the deck cover / reference card
 *   --html-only                                   Generate preview HTML without compiling PDF
 *   --input, -i        <filepath>                 Custom deck data JSON (default: ./couples_conversation_cards_deck_data.json)
 *   --help, -h                                    Show this help message
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { generateHtmlDocument } = require('./card_generator');

// Candidate browser executable search paths across Windows, Linux, and macOS
const ENV_BROWSER_PATHS = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  process.env.CHROME_BIN
].filter(Boolean);

const CHROME_CANDIDATES = [
  ...ENV_BROWSER_PATHS,
  // Windows
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe') : null,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Microsoft\\Edge\\Application\\msedge.exe') : null,
  // Linux (including standard GitHub Actions runner paths)
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
].filter(Boolean);

function findBrowserExecutable(customPath) {
  if (customPath && fs.existsSync(customPath)) {
    return customPath;
  }
  for (const candidate of CHROME_CANDIDATES) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    orientation: 'portrait', // 'portrait' | 'landscape' | 'both'
    output: null,
    outputDir: path.join(__dirname, 'output'),
    backs: false,
    includeCover: true,
    htmlOnly: false,
    input: path.join(__dirname, 'couples_conversation_cards_deck_data.json'),
    browserPath: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--orientation' || arg === '-o') {
      options.orientation = args[++i];
    } else if (arg.startsWith('--orientation=')) {
      options.orientation = arg.split('=')[1];
    } else if (arg === '--output' || arg === '-out') {
      options.output = args[++i];
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    } else if (arg === '--backs' || arg === '-b') {
      options.backs = true;
    } else if (arg === '--no-cover') {
      options.includeCover = false;
    } else if (arg === '--html-only') {
      options.htmlOnly = true;
    } else if (arg === '--input' || arg === '-i') {
      options.input = args[++i];
    } else if (arg.startsWith('--input=')) {
      options.input = arg.split('=')[1];
    } else if (arg === '--browser-path') {
      options.browserPath = args[++i];
    } else if (arg === '--output-dir' || arg === '--out-dir') {
      const v = args[++i];
      options.outputDir = path.isAbsolute(v) ? v : path.join(__dirname, v);
    } else if (arg.startsWith('--output-dir=')) {
      const v = arg.split('=')[1];
      options.outputDir = path.isAbsolute(v) ? v : path.join(__dirname, v);
    }
  }

  return options;
}

function showHelp() {
  console.log(`
===========================================================
  Couples Conversation Cards (CCC) - 4x6 PDF Generator
===========================================================

Generates visually stunning, print-ready 4" x 6" PDF card decks.

Usage:
  node generate_cards_pdf.js [options]

Options:
  -o, --orientation <portrait|landscape|both>
      Page orientation. Defaults to 'portrait'.
      - portrait:  4" wide x 6" tall (vertical stack, classic card)
      - landscape: 6" wide x 4" tall (horizontal 2-column, tabletop view)
      - both:      Generates both portrait and landscape decks

  -out, --output <path>
      Custom output PDF filepath.
      (Default: couples_conversation_cards_<orientation>_4x6.pdf)

  -b, --backs
      Include branded card backs for double-sided (duplex) printing.
      Fronts and backs will alternate (Front 1, Back 1, Front 2, Back 2...).

  --no-cover
      Omit the deck cover & color guide card.

  --html-only
      Generate the standalone HTML file without compiling PDF.
      Useful for inspecting in browser or printing directly.

  -i, --input <path>
      Path to custom deck JSON data file.
      (Default: ./couples_conversation_cards_deck_data.json)

  -h, --help
      Show this help information.

Examples:
  node generate_cards_pdf.js
  node generate_cards_pdf.js --orientation=landscape
  node generate_cards_pdf.js --orientation=both
  node generate_cards_pdf.js --backs
  node generate_cards_pdf.js --html-only
`);
}

async function generateSingleDeck(deckData, orientation, options, browser) {
  const isLandscape = orientation === 'landscape';
  const width = isLandscape ? '6in' : '4in';
  const height = isLandscape ? '4in' : '6in';

  console.log(`\nRendering ${orientation.toUpperCase()} 4x6 deck...`);
  console.log(`- Card dimensions: ${width} x ${height}`);
  console.log(`- Total cards: ${deckData.cards.length}`);
  console.log(`- Include cover card: ${options.includeCover ? 'Yes' : 'No'}`);
  console.log(`- Include card backs: ${options.backs ? 'Yes (duplex)' : 'No'}`);

  // 1. Generate HTML
  const htmlContent = generateHtmlDocument(deckData, {
    orientation,
    includeBacks: options.backs,
    includeCover: options.includeCover
  });

  // Ensure output directory exists
  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
  }

  // Output HTML path
  const defaultBaseName = `couples_conversation_cards_${orientation}_4x6${options.backs ? '_with_backs' : ''}`;
  const htmlPath = path.join(options.outputDir, `${defaultBaseName}.html`);
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log(`  [OK] HTML written: ${path.relative(__dirname, htmlPath)}`);

  if (options.htmlOnly) {
    console.log(`  [OK] Skipped PDF generation (--html-only requested).`);
    return { htmlPath };
  }

  // Determine PDF Output Path
  let pdfPath;
  if (options.output && options.orientation !== 'both') {
    pdfPath = path.isAbsolute(options.output)
      ? options.output
      : (path.dirname(options.output) !== '.' ? path.join(__dirname, options.output) : path.join(options.outputDir, options.output));
  } else {
    pdfPath = path.join(options.outputDir, `${defaultBaseName}.pdf`);
  }

  // 2. Render to PDF with Puppeteer
  const page = await browser.newPage();
  
  // Set viewport to high density matching 4x6 at 300 DPI (1200 x 1800 or 1800 x 1200)
  const viewWidth = isLandscape ? 1200 : 800;
  const viewHeight = isLandscape ? 800 : 1200;
  await page.setViewport({ width: viewWidth, height: viewHeight, deviceScaleFactor: 2 });

  // Navigate to local file URL
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  // Wait for Google Fonts
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });

  // Print to PDF Buffer
  const pdfBuffer = await page.pdf({
    width,
    height,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await page.close();

  // Try writing to target path, handling EBUSY lock gracefully (e.g. Foxit/Acrobat open)
  let finalPdfPath = pdfPath;
  try {
    fs.writeFileSync(pdfPath, pdfBuffer);
  } catch (writeErr) {
    if (writeErr.code === 'EBUSY') {
      const parsed = path.parse(pdfPath);
      finalPdfPath = path.join(parsed.dir, `${parsed.name}.new${parsed.ext}`);
      fs.writeFileSync(finalPdfPath, pdfBuffer);
      console.warn(`  [!] Notice: "${path.basename(pdfPath)}" is currently open in a PDF viewer.`);
      console.warn(`      Saved latest version as: "${path.basename(finalPdfPath)}"`);
    } else {
      throw writeErr;
    }
  }

  const stats = fs.statSync(finalPdfPath);
  const sizeKb = (stats.size / 1024).toFixed(1);
  const totalPages = (options.includeCover ? (options.backs ? 2 : 1) : 0) + deckData.cards.length * (options.backs ? 2 : 1);

  console.log(`  [OK] PDF generated: ${path.relative(__dirname, finalPdfPath)} (${sizeKb} KB, ${totalPages} pages)`);
  return { htmlPath, pdfPath: finalPdfPath, totalPages, sizeKb };
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Verify input data file
  if (!fs.existsSync(options.input)) {
    console.error(`Error: Deck data file not found at: ${options.input}`);
    process.exit(1);
  }

  const rawJson = fs.readFileSync(options.input, 'utf-8');
  let deckData;
  try {
    deckData = JSON.parse(rawJson);
  } catch (err) {
    console.error(`Error: Failed to parse JSON data: ${err.message}`);
    process.exit(1);
  }

  console.log(`Loaded deck: "${deckData.deck_name}" (${deckData.total_cards} cards)`);

  const orientations = [];
  if (options.orientation === 'both') {
    orientations.push('portrait', 'landscape');
  } else if (options.orientation === 'landscape') {
    orientations.push('landscape');
  } else {
    orientations.push('portrait');
  }

  let browser = null;
  if (!options.htmlOnly) {
    const browserExecutable = findBrowserExecutable(options.browserPath);
    if (!browserExecutable) {
      console.error('Error: Could not find Google Chrome or Microsoft Edge executable.');
      console.error('Please specify the path with --browser-path <path_to_chrome_or_edge>');
      process.exit(1);
    }
    console.log(`Using browser: ${browserExecutable}`);
    browser = await puppeteer.launch({
      executablePath: browserExecutable,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
  }

  try {
    const results = [];
    for (const ori of orientations) {
      const res = await generateSingleDeck(deckData, ori, options, browser);
      results.push(res);
    }

    console.log(`\n===========================================================`);
    console.log(`  Generation Complete!`);
    console.log(`===========================================================`);
    results.forEach(r => {
      if (r.pdfPath) {
        console.log(`* PDF: ${r.pdfPath}`);
      }
      if (r.htmlPath) {
        console.log(`* HTML: ${r.htmlPath}`);
      }
    });
    console.log(`===========================================================\n`);

  } catch (err) {
    console.error(`Fatal error during PDF generation:`, err);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, generateSingleDeck };
