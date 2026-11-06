// tests/pwa.test.js
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export async function runPwaTests() {
    console.log('▶ Running PWA Manifest & Service Worker Tests...');

    // 1. Manifest Validation
    const manifestPath = path.join(ROOT, 'manifest.json');
    assert(fs.existsSync(manifestPath), 'manifest.json must exist');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    assert.strictEqual(manifest.id, 'nur-prayer-app');
    assert(manifest.name.includes('Nur Prayer'));
    assert.strictEqual(manifest.theme_color, '#123D2E');
    assert.strictEqual(manifest.background_color, '#FFFFFF');
    assert.strictEqual(manifest.display, 'standalone');
    assert(Array.isArray(manifest.icons) && manifest.icons.length >= 3, 'Must have at least 3 icons (192, 512, maskable)');

    const has192 = manifest.icons.some(i => i.sizes === '192x192');
    const has512 = manifest.icons.some(i => i.sizes === '512x512');
    const hasMaskable = manifest.icons.some(i => i.purpose === 'maskable');
    assert(has192 && has512 && hasMaskable, 'Manifest must declare 192, 512, and maskable icons');

    // 2. Icon Assets Existence
    for (const icon of manifest.icons) {
        const iconPath = path.join(ROOT, icon.src);
        assert(fs.existsSync(iconPath), `Icon file ${icon.src} must exist on disk`);
    }

    assert(fs.existsSync(path.join(ROOT, 'favicon.svg')), 'favicon.svg must exist');

    // 3. Service Worker Validation
    const swPath = path.join(ROOT, 'sw.js');
    assert(fs.existsSync(swPath), 'sw.js must exist');
    const swContent = fs.readFileSync(swPath, 'utf8');

    assert(swContent.includes('CACHE_NAME'), 'sw.js must define CACHE_NAME');
    assert(swContent.includes('aladhan.com'), 'sw.js must handle Aladhan API caching strategy');
    assert(swContent.includes('skipWaiting'), 'sw.js must support skipWaiting');
    assert(swContent.includes('clients.claim'), 'sw.js must support clients.claim');

    // 4. HTML Meta and SW Registration
    const htmlContent = fs.readFileSync(path.join(ROOT, 'main.html'), 'utf8');
    assert(htmlContent.includes('manifest.json'), 'main.html must link to manifest.json');
    assert(htmlContent.includes('theme-color'), 'main.html must have theme-color meta tag');
    assert(htmlContent.includes('serviceWorker.register'), 'main.html must register service worker');

    console.log('  ✔ PWA: Manifest, vector icons, Service Worker strategies, and registration passed');
}

