#!/usr/bin/env node
/**
 * Nur Prayer Production Build Script
 * Inlines and Minifies CSS (css/tailwind.css) and JS modules
 * from main.html into a self-contained, compressed production/production.html distribution.
 */
'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUILD_DIR = __dirname;
const ROOT = path.join(BUILD_DIR, '..');
const OUT_FILE = path.join(BUILD_DIR, 'production.html');

const htmlPath = path.join(ROOT, 'main.html');
const bindingsJsPath = path.join(ROOT, 'components', 'bindings.js');
const iconJsPath = path.join(ROOT, 'components', 'icon', 'icon.js');
const bottomSheetJsPath = path.join(ROOT, 'components', 'bottom-sheet', 'bottom-sheet.js');
const tabsJsPath = path.join(ROOT, 'components', 'tabs', 'tabs.js');
const registryJsPath = path.join(ROOT, 'components', 'registry.js');
const constantJsPath = path.join(ROOT, 'utilities', 'constant.js');
const utilityJsPath = path.join(ROOT, 'utilities', 'utility.js');
const appJsPath = path.join(ROOT, 'app.js');
const navigationJsPath = path.join(ROOT, 'navigation.js');
const dashboardJsPath = path.join(ROOT, 'dashboard', 'dashboard.js');
const settingsJsPath = path.join(ROOT, 'settings', 'settings.js');
const duaJsPath = path.join(ROOT, 'duva', 'duva.js');
const prayerStoreJsPath = path.join(ROOT, 'services', 'prayer-store.js');
const tasbeehStoreJsPath = path.join(ROOT, 'services', 'tasbeeh-store.js');
const duasStoreJsPath = path.join(ROOT, 'services', 'duas-store.js');
const settingsStoreJsPath = path.join(ROOT, 'services', 'settings-store.js');
const routerJsPath = path.join(ROOT, 'services', 'router.js');
const appViewModelJsPath = path.join(ROOT, 'services', 'app-view-model.js');

// Prayer Tracking decomposed submodules
const prayerOldJsPath = path.join(ROOT, 'prayer-tracking', 'old-tracking.js');
const prayerPerfJsPath = path.join(ROOT, 'prayer-tracking', 'performance-view-model.js');
const prayerHistJsPath = path.join(ROOT, 'prayer-tracking', 'history-view-model.js');
const prayerTrackerVmJsPath = path.join(ROOT, 'prayer-tracking', 'tracker-view-model.js');
const prayerTrackingJsPath = path.join(ROOT, 'prayer-tracking', 'prayer-tracking.js');

// Tasbeeh decomposed submodules
const tasbeehServiceJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-service.js');
const tasbeehVmJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-view-model.js');
const tasbeehModelJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-model.js');
const tasbeehCalJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-calendar.js');
const tasbeehModalJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-modal.js');
const tasbeehPeriodJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-period.js');
const tasbeehOldJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-old', 'tasbeeh-old.js');
const tasbeehHistJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-history', 'tasbeeh-history.js');
const tasbeehCurJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-current', 'tasbeeh-current.js');
const tasbeehRegistrationJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-registration.js');
const tasbeehJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh.js');

// Modular Current submodules
const tasbeehCurCardJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-current', 'tasbeeh-current-card', 'tasbeeh-current-card.js');
const tasbeehCurFeedJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-current', 'tasbeeh-current-feed', 'tasbeeh-current-feed.js');
const tasbeehCurFormJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-current', 'tasbeeh-current-form', 'tasbeeh-current-form.js');
const tasbeehCurPageJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-current', 'tasbeeh-current-page', 'tasbeeh-current-page.js');

// Modular Old submodules
const tasbeehOldCardJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-old', 'tasbeeh-old-card', 'tasbeeh-old-card.js');
const tasbeehOldFeedJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-old', 'tasbeeh-old-feed', 'tasbeeh-old-feed.js');
const tasbeehOldFormJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-old', 'tasbeeh-old-form', 'tasbeeh-old-form.js');
const tasbeehOldPageJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-old', 'tasbeeh-old-page', 'tasbeeh-old-page.js');

// Modular History submodules
const tasbeehHistCardJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-history', 'tasbeeh-history-card', 'tasbeeh-history-card.js');
const tasbeehHistFeedJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-history', 'tasbeeh-history-feed', 'tasbeeh-history-feed.js');
const tasbeehHistFormJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-history', 'tasbeeh-history-form', 'tasbeeh-history-form.js');
const tasbeehHistPageJsPath = path.join(ROOT, 'tasbeeh', 'tasbeeh-history', 'tasbeeh-history-page', 'tasbeeh-history-page.js');

/**
 * Minify CSS content by removing comments and unnecessary whitespace
 */
function minifyCss(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove CSS comments
        .replace(/\s+/g, ' ') // Collapse multiple whitespace to single space
        .replace(/\s*([{}:;,])\s*/g, '$1') // Remove space around separators
        .replace(/;\}/g, '}') // Remove trailing semicolon before }
        .trim();
}

/**
 * Minify JS content by removing comments and blank lines
 */
function minifyJs(js) {
    return js
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/^\s*\/\/.*/gm, '') // Remove single-line comments
        .replace(/import\s+[\s\S]*?from\s*['"][^'"]+['"];?/g, '') // Multiline import from
        .replace(/import\s*['"][^'"]+['"];?/g, '') // Bare import '...'
        .replace(/export\s+default\s+[^;]+;/g, '') // Remove export default
        .replace(/export\s*\{[\s\S]*?\}(\s*from\s*['"][^'"]+['"])?;?/g, '') // Strip multiline export { ... } [from '...']
        .replace(/^\s*export\s+const\s+/gm, 'const ') // Strip export from const
        .replace(/^\s*export\s+let\s+/gm, 'let ') // Strip export from let
        .replace(/^\s*export\s+var\s+/gm, 'var ') // Strip export from var
        .replace(/^\s*export\s+function\s+/gm, 'function ') // Strip export from function
        .replace(/^\s*export\s+class\s+/gm, 'class ') // Strip export from class
        .replace(/\n\s*\n/g, '\n') // Remove consecutive blank lines
        .trim();
}

/**
 * Minify HTML structure by stripping comments and collapsing whitespace
 */
function minifyHtml(html) {
    // 1. Remove HTML comments, preserving Knockout virtual element bindings (<!-- ko --> and <!-- /ko -->)
    let minified = html.replace(/<!--(?!\s*\/?ko\b)[\s\S]*?-->/g, '');
    
    // 2. Collapse whitespace between HTML tags
    minified = minified.replace(/>\s+</g, '><');

    // 3. Remove leading/trailing line whitespace
    minified = minified.split('\n').map(line => line.trim()).filter(Boolean).join('\n');

    return minified.trim();
}

function readFile(p) {
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function buildProduction() {
    try {
        if (!fs.existsSync(htmlPath)) {
            console.error('Error: main.html missing');
            process.exit(1);
        }

        let html = fs.readFileSync(htmlPath, 'utf8');

        // 1. Minify inlined CSS in <style type="text/tailwindcss">
        html = html.replace(/<style type="text\/tailwindcss">([\s\S]*?)<\/style>/g, (_, css) => {
            return `<style type="text/tailwindcss">${minifyCss(css)}</style>`;
        });

        // Strip any residual link CSS tags
        html = html.replace(/<link[^>]*href="css\/[^"]*"[^>]*\/?>/g, '');

        // 2. Combine and Minify JS in exact dependency order
        const bindingsJs = readFile(bindingsJsPath);
        const iconJs = readFile(iconJsPath);
        const bottomSheetJs = readFile(bottomSheetJsPath);
        const tabsJs = readFile(tabsJsPath);
        const constantJs = readFile(constantJsPath);
        const utilityJs = readFile(utilityJsPath);
        const prayerStoreJs = readFile(prayerStoreJsPath);
        const tasbeehStoreJs = readFile(tasbeehStoreJsPath);
        const duasStoreJs = readFile(duasStoreJsPath);
        const settingsStoreJs = readFile(settingsStoreJsPath);
        const routerJs = readFile(routerJsPath);
        const dashboardJs = readFile(dashboardJsPath);
        const settingsJs = readFile(settingsJsPath);

        // Prayer submodules
        const prayerOldJs = readFile(prayerOldJsPath);
        const prayerPerfJs = readFile(prayerPerfJsPath);
        const prayerHistJs = readFile(prayerHistJsPath);
        const prayerTrackerVmJs = readFile(prayerTrackerVmJsPath);
        const prayerTrackingJs = readFile(prayerTrackingJsPath);

        // Tasbeeh submodules
        const tasbeehServiceJs = readFile(tasbeehServiceJsPath);
        const tasbeehModelJs = readFile(tasbeehModelJsPath);
        const tasbeehCalJs = readFile(tasbeehCalJsPath);
        const tasbeehModalJs = readFile(tasbeehModalJsPath);
        const tasbeehPeriodJs = readFile(tasbeehPeriodJsPath);

        // Modular Current submodules
        const tasbeehCurCardJs = readFile(tasbeehCurCardJsPath);
        const tasbeehCurFeedJs = readFile(tasbeehCurFeedJsPath);
        const tasbeehCurFormJs = readFile(tasbeehCurFormJsPath);
        const tasbeehCurPageJs = readFile(tasbeehCurPageJsPath);

        // Modular Old submodules
        const tasbeehOldCardJs = readFile(tasbeehOldCardJsPath);
        const tasbeehOldFeedJs = readFile(tasbeehOldFeedJsPath);
        const tasbeehOldFormJs = readFile(tasbeehOldFormJsPath);
        const tasbeehOldPageJs = readFile(tasbeehOldPageJsPath);

        // Modular History submodules
        const tasbeehHistCardJs = readFile(tasbeehHistCardJsPath);
        const tasbeehHistFeedJs = readFile(tasbeehHistFeedJsPath);
        const tasbeehHistFormJs = readFile(tasbeehHistFormJsPath);
        const tasbeehHistPageJs = readFile(tasbeehHistPageJsPath);

        const tasbeehVmJs = readFile(tasbeehVmJsPath);
        const tasbeehOldJs = readFile(tasbeehOldJsPath);
        const tasbeehHistJs = readFile(tasbeehHistJsPath);
        const tasbeehCurJs = readFile(tasbeehCurJsPath);
        const tasbeehRegistrationJs = readFile(tasbeehRegistrationJsPath);
        const tasbeehJs = readFile(tasbeehJsPath);

        const duaJs = readFile(duaJsPath);
        const registryJs = readFile(registryJsPath);
        const appJs = readFile(appJsPath);
        const navigationJs = readFile(navigationJsPath);
        const appViewModelJs = readFile(appViewModelJsPath);

        const combinedJs = [
            bindingsJs,
            iconJs,
            bottomSheetJs,
            tabsJs,
            constantJs,
            utilityJs,
            prayerStoreJs,
            tasbeehStoreJs,
            duasStoreJs,
            settingsStoreJs,
            routerJs,
            dashboardJs,
            settingsJs,
            prayerOldJs,
            prayerPerfJs,
            prayerHistJs,
            prayerTrackerVmJs,
            prayerTrackingJs,
            tasbeehModelJs,
            tasbeehServiceJs,
            tasbeehCalJs,
            tasbeehModalJs,
            tasbeehPeriodJs,
            tasbeehCurCardJs,
            tasbeehCurFeedJs,
            tasbeehCurFormJs,
            tasbeehCurPageJs,
            tasbeehOldCardJs,
            tasbeehOldFeedJs,
            tasbeehOldFormJs,
            tasbeehOldPageJs,
            tasbeehHistCardJs,
            tasbeehHistFeedJs,
            tasbeehHistFormJs,
            tasbeehHistPageJs,
            tasbeehVmJs,
            tasbeehOldJs,
            tasbeehHistJs,
            tasbeehCurJs,
            tasbeehJs,
            tasbeehRegistrationJs,
            duaJs,
            registryJs,
            appJs,
            navigationJs,
            appViewModelJs
        ].join('\n');

        const minifiedJs = minifyJs(combinedJs);

        // Replace script src tags with minified inlined script block
        html = html.replace(/<script[^>]*src="components\/bindings\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="components\/icon\/icon\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="components\/bottom-sheet\/bottom-sheet\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="components\/registry\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script\s+type="module"(?![^>]*src=)[^>]*>[\s\S]*?registerAllComponents[\s\S]*?<\/script>/g, '');
        html = html.replace(/<script[^>]*src="utilities\/constant\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="utilities\/utility\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="services\/prayer-store\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="services\/tasbeeh-store\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="services\/duas-store\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="services\/settings-store\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="services\/router\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="services\/app-view-model\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="navigation\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:prayer-tracking\/)?prayer-tracking\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:dashboard\/)?dashboard\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:settings\/)?settings\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:tasbeeh\/)?tasbeeh\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:duva\/|dua\/)?(?:duva|dua)\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="app\.js"[^>]*><\/script>/g, () => `<script>${minifiedJs}<\/script>`);

        // ---- Strip data-ref attributes from production output ----
        (function stripDataRef() {
            var before = html.length;
            var matches = html.match(/\s+data-ref=("[^"]*"|'[^']*')/g) || [];
            html = html.replace(/\s+data-ref=("[^"]*"|'[^']*')/g, '');
            var after = html.length;
            console.log('[build] stripped ' + matches.length +
                        ' data-ref attributes (' + (before - after) +
                        ' bytes removed)');
        })();

        // 3. Minify HTML wrapper
        const originalSizeBytes = Buffer.byteLength(html, 'utf8');
        const minifiedHtml = minifyHtml(html);

        // 4. Write out minified production/production.html
        fs.writeFileSync(OUT_FILE, minifiedHtml, 'utf8');

        const minifiedSizeBytes = fs.statSync(OUT_FILE).size;
        const minifiedKb = (minifiedSizeBytes / 1024).toFixed(1);
        const unminifiedKb = (originalSizeBytes / 1024).toFixed(1);
        const savedPct = Math.round((1 - minifiedSizeBytes / originalSizeBytes) * 100);

        console.log(`✓ production/production.html built & compressed successfully (${minifiedKb} KB, minified from ${unminifiedKb} KB, -${savedPct}%)`);
    } catch (err) {
        console.error('Build failed:', err.message);
        process.exit(1);
    }
}

buildProduction();
