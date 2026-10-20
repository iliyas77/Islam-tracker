#!/usr/bin/env node
/**
 * Nur Prayer Production Build Script
 * Inlines and Minifies CSS (css/style.css) and JS modules
 * from main.html into a self-contained, compressed production/production.html distribution.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const BUILD_DIR = __dirname;
const ROOT = path.join(BUILD_DIR, '..');
const OUT_FILE = path.join(BUILD_DIR, 'production.html');

const htmlPath = path.join(ROOT, 'main.html');
const colorCssPath = path.join(ROOT, 'css', 'color.css');
const styleCssPath = path.join(ROOT, 'css', 'style.css');
const utilityJsPath = path.join(ROOT, 'utilities', 'utility.js');
const prayerCardJsPath = path.join(ROOT, 'components', 'prayer-card.js');
const appJsPath = path.join(ROOT, 'features', 'app', 'app.js');
const navigationJsPath = path.join(ROOT, 'features', 'navigation', 'navigation.js');
const currentPrayerJsPath = path.join(ROOT, 'features', 'current-prayer', 'current-prayer.js');
const dashboardJsPath = path.join(ROOT, 'features', 'dashboard', 'dashboard.js');
const oldTrackingJsPath = path.join(ROOT, 'features', 'old-tracking', 'old-tracking.js');
const settingsJsPath = path.join(ROOT, 'features', 'settings', 'settings.js');
const tasbeehCurrentJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-current.js');
const tasbeehOldJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-old.js');
const duasJsPath = path.join(ROOT, 'features', 'duas', 'duas.js');

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
    // 1. Remove HTML comments
    let minified = html.replace(/<!--[\s\S]*?-->/g, '');
    
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

        // 1. Minify and inline CSS (css/color.css + css/style.css)
        const colorCss = fs.existsSync(colorCssPath) ? fs.readFileSync(colorCssPath, 'utf8') : '';
        const styleCss = fs.existsSync(styleCssPath) ? fs.readFileSync(styleCssPath, 'utf8') : '';
        const minifiedCss = minifyCss(colorCss + '\n' + styleCss);

        // Replace link CSS tags with minified inlined style block
        html = html.replace(/<link[^>]*href="css\/color\.css"[^>]*\/?>/g, '');
        html = html.replace(/<link[^>]*href="css\/style\.css"[^>]*\/?>/g, () => `<style>${minifiedCss}</style>`);

        // 2. Combine and Minify JS
        const utilityJs = fs.existsSync(utilityJsPath) ? fs.readFileSync(utilityJsPath, 'utf8') : '';
        const prayerCardJs = fs.existsSync(prayerCardJsPath) ? fs.readFileSync(prayerCardJsPath, 'utf8') : '';
        const appJs = fs.existsSync(appJsPath) ? fs.readFileSync(appJsPath, 'utf8') : '';
        const navigationJs = fs.existsSync(navigationJsPath) ? fs.readFileSync(navigationJsPath, 'utf8') : '';
        const currentPrayerJs = fs.existsSync(currentPrayerJsPath) ? fs.readFileSync(currentPrayerJsPath, 'utf8') : '';
        const dashboardJs = fs.existsSync(dashboardJsPath) ? fs.readFileSync(dashboardJsPath, 'utf8') : '';
        const oldTrackingJs = fs.existsSync(oldTrackingJsPath) ? fs.readFileSync(oldTrackingJsPath, 'utf8') : '';
        const settingsJs = fs.existsSync(settingsJsPath) ? fs.readFileSync(settingsJsPath, 'utf8') : '';
        const tasbeehCurrentJs = fs.existsSync(tasbeehCurrentJsPath) ? fs.readFileSync(tasbeehCurrentJsPath, 'utf8') : '';
        const tasbeehOldJs = fs.existsSync(tasbeehOldJsPath) ? fs.readFileSync(tasbeehOldJsPath, 'utf8') : '';
        const duasJs = fs.existsSync(duasJsPath) ? fs.readFileSync(duasJsPath, 'utf8') : '';
        const combinedJs = utilityJs + '\n' + prayerCardJs + '\n' + appJs + '\n' + navigationJs + '\n' + currentPrayerJs + '\n' + dashboardJs + '\n' + oldTrackingJs + '\n' + settingsJs + '\n' + tasbeehCurrentJs + '\n' + tasbeehOldJs + '\n' + duasJs;
        const minifiedJs = minifyJs(combinedJs);

        // Replace script src tags with minified inlined script block
        html = html.replace(/<script[^>]*src="utilities\/utility\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="components\/prayer-card\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="features\/navigation\/navigation\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="features\/current-prayer\/current-prayer\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="features\/dashboard\/dashboard\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="features\/old-tracking\/old-tracking\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="features\/settings\/settings\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="features\/tasbeeh\/tasbeeh-current\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="features\/tasbeeh\/tasbeeh-old\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="features\/tasbeeh\/tasbeeh\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="features\/duas\/duas\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="features\/app\/app\.js"[^>]*><\/script>/g, () => `<script>${minifiedJs}<\/script>`);

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
