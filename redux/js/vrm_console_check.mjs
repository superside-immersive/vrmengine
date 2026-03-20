#!/usr/bin/env node

import { chromium } from 'playwright-core';

const DEFAULT_URL = 'http://127.0.0.1:8080/redux/index.html';
const DEFAULT_TIMEOUT_MS = 90000;
const DEFAULT_CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const VRM_MARKER = '[XRA][VRM_LOADED]';

const pageUrl = process.argv[2] || process.env.XRA_URL || DEFAULT_URL;
const timeoutMs = Number(process.env.VRM_CHECK_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
const chromePath = process.env.CHROME_PATH || DEFAULT_CHROME_PATH;

const deadline = Date.now() + timeoutMs;
let foundMarker = false;

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required']
});

try {
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => {
    const text = msg.text();
    console.log(`[browser:${msg.type()}] ${text}`);
    if (text.includes(VRM_MARKER)) {
      foundMarker = true;
    }
  });

  page.on('pageerror', (error) => {
    console.log(`[browser:pageerror] ${error.message}`);
  });

  page.on('requestfailed', (request) => {
    const failure = request.failure();
    const reason = failure?.errorText || 'unknown';
    console.log(`[browser:requestfailed] ${request.url()} :: ${reason}`);
  });

  console.log(`[VRM Check] loading ${pageUrl}`);
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });

  while (!foundMarker && Date.now() < deadline) {
    await page.waitForTimeout(500);
  }

  if (!foundMarker) {
    console.log(`[VRM Check] FAIL: no se detectó '${VRM_MARKER}' en ${timeoutMs}ms`);
    process.exitCode = 1;
  } else {
    console.log(`[VRM Check] OK: se detectó '${VRM_MARKER}'`);
    process.exitCode = 0;
  }
} finally {
  await browser.close();
}
