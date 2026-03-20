import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required']
});

const page = await browser.newPage();
const requests = new Set();

page.on('requestfinished', (request) => {
  const url = request.url();
  if (url.includes('/redux/images/') && /\.(png|jpe?g|gif|webp|bmp)(\?|$)/i.test(url)) {
    requests.add(url);
  }
});

await page.goto('http://127.0.0.1:8080/redux/index.html', {
  waitUntil: 'domcontentloaded',
  timeout: 45000
});

await page.waitForTimeout(30000);

console.log('COUNT', requests.size);
for (const url of [...requests].sort()) {
  console.log(url);
}

await browser.close();
