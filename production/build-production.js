#!/usr/bin/env node
/**
 * Nur Prayer Production Build Script
 * Inlines and Minifies CSS (css/tailwind.css) and JS modules
 * from main.html into a self-contained, compressed production/production.html distribution.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const BUILD_DIR = __dirname;
const ROOT = path.join(BUILD_DIR, '..');
const OUT_FILE = path.join(BUILD_DIR, 'production.html');

const htmlPath = path.join(ROOT, 'main.html');
const constantJsPath = path.join(ROOT, 'utilities', 'constant.js');
const utilityJsPath = path.join(ROOT, 'utilities', 'utility.js');
const appJsPath = path.join(ROOT, 'app.js');
const navigationJsPath = path.join(ROOT, 'navigation.js');
const prayerTrackingJsPath = fs.existsSync(path.join(ROOT, 'prayer-tracking', 'prayer-tracking.js'))
    ? path.join(ROOT, 'prayer-tracking', 'prayer-tracking.js')
    : path.join(ROOT, 'prayer-tracking.js');
const dashboardJsPath = fs.existsSync(path.join(ROOT, 'dashboard', 'dashboard.js'))
    ? path.join(ROOT, 'dashboard', 'dashboard.js')
    : path.join(ROOT, 'dashboard.js');
const settingsJsPath = fs.existsSync(path.join(ROOT, 'settings', 'settings.js'))
    ? path.join(ROOT, 'settings', 'settings.js')
    : path.join(ROOT, 'settings.js');
const tasbeehJsPath = fs.existsSync(path.join(ROOT, 'tasbeeh', 'tasbeeh.js'))
    ? path.join(ROOT, 'tasbeeh', 'tasbeeh.js')
    : path.join(ROOT, 'tasbeeh.js');
const duaJsPath = fs.existsSync(path.join(ROOT, 'duva', 'duva.js'))
    ? path.join(ROOT, 'duva', 'duva.js')
    : (fs.existsSync(path.join(ROOT, 'dua.js')) ? path.join(ROOT, 'dua.js') : path.join(ROOT, 'duva.js'));

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

        // 2. Combine and Minify JS
        const constantJs = fs.existsSync(constantJsPath) ? fs.readFileSync(constantJsPath, 'utf8') : '';
        const utilityJs = fs.existsSync(utilityJsPath) ? fs.readFileSync(utilityJsPath, 'utf8') : '';
        const appJs = fs.existsSync(appJsPath) ? fs.readFileSync(appJsPath, 'utf8') : '';
        const navigationJs = fs.existsSync(navigationJsPath) ? fs.readFileSync(navigationJsPath, 'utf8') : '';
        const prayerTrackingJs = fs.existsSync(prayerTrackingJsPath) ? fs.readFileSync(prayerTrackingJsPath, 'utf8') : '';
        const dashboardJs = fs.existsSync(dashboardJsPath) ? fs.readFileSync(dashboardJsPath, 'utf8') : '';
        const settingsJs = fs.existsSync(settingsJsPath) ? fs.readFileSync(settingsJsPath, 'utf8') : '';
        const tasbeehJs = fs.existsSync(tasbeehJsPath) ? fs.readFileSync(tasbeehJsPath, 'utf8') : '';
        const duaJs = fs.existsSync(duaJsPath) ? fs.readFileSync(duaJsPath, 'utf8') : '';
        const combinedJs = constantJs + '\n' + utilityJs + '\n' + appJs + '\n' + navigationJs + '\n' + prayerTrackingJs + '\n' + dashboardJs + '\n' + settingsJs + '\n' + tasbeehJs + '\n' + duaJs;
        const minifiedJs = minifyJs(combinedJs);

        // Replace script src tags with minified inlined script block
        html = html.replace(/<script[^>]*src="utilities\/constant\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="utilities\/utility\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="navigation\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:prayer-tracking\/)?prayer-tracking\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:dashboard\/)?dashboard\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:settings\/)?settings\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:tasbeeh\/)?tasbeeh\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:duva\/|dua\/)?(?:duva|dua)\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="app\.js"[^>]*><\/script>/g, () => `<script>${minifiedJs}<\/script>`);

        // ---- Strip data-ref attributes from production output ----
        // data-ref is a development/testing aid; it adds no runtime value
        // and is stripped from production to save bytes.
        (function stripDataRef() {
            var before = html.length;
            var matches = html.match(/\s+data-ref=("[^"]*"|'[^']*')/g) || [];
            html = html.replace(/\s+data-ref=("[^"]*"|'[^']*')/g, '');
            var after = html.length;
            console.log('[build] stripped ' + matches.length +
                        ' data-ref attributes (' + (before - after) +
                        ' bytes removed)');
        })();
        // ---- End data-ref strip ----

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
