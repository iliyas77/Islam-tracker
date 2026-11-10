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
const componentHelperJsPath = path.join(ROOT, 'components', 'component-helper.js');
const iconJsPath = path.join(ROOT, 'components', 'icon', 'icon.js');
const bottomSheetJsPath = path.join(ROOT, 'components', 'bottom-sheet', 'bottom-sheet.js');
const tabsJsPath = path.join(ROOT, 'components', 'tabs', 'tabs.js');
const registryJsPath = path.join(ROOT, 'components', 'registry.js');
const constantJsPath = path.join(ROOT, 'utilities', 'constant.js');
const utilityJsPath = path.join(ROOT, 'utilities', 'utility.js');
const appJsPath = path.join(ROOT, 'app.js');
const navigationJsPath = path.join(ROOT, 'navigation.js');
const dashboardServiceJsPath = path.join(ROOT, 'features', 'dashboard', 'dashboard-service.js');
const dashboardClockJsPath = path.join(ROOT, 'features', 'dashboard', 'components', 'dashboard-clock', 'dashboard-clock.js');
const dashboardTimelineJsPath = path.join(ROOT, 'features', 'dashboard', 'components', 'dashboard-timeline', 'dashboard-timeline.js');
const dashboardFeaturesGridJsPath = path.join(ROOT, 'features', 'dashboard', 'components', 'dashboard-features-grid', 'dashboard-features-grid.js');
const dashboardJsPath = path.join(ROOT, 'features', 'dashboard', 'dashboard.js');
const dashboardRegJsPath = path.join(ROOT, 'features', 'dashboard', 'dashboard-registration.js');
const settingsServiceJsPath = path.join(ROOT, 'features', 'settings', 'settings-service.js');
const settingsPrayerTimesJsPath = path.join(ROOT, 'features', 'settings', 'components', 'settings-prayer-times', 'settings-prayer-times.js');
const settingsStartDateJsPath = path.join(ROOT, 'features', 'settings', 'components', 'settings-start-date', 'settings-start-date.js');
const settingsFontSizeJsPath = path.join(ROOT, 'features', 'settings', 'components', 'settings-font-size', 'settings-font-size.js');
const settingsBackupJsPath = path.join(ROOT, 'features', 'settings', 'components', 'settings-backup', 'settings-backup.js');
const settingsRegJsPath = path.join(ROOT, 'features', 'settings', 'settings-registration.js');
const settingsJsPath = path.join(ROOT, 'features', 'settings', 'settings.js');
const prayerStoreJsPath = path.join(ROOT, 'services', 'prayer-store.js');
const tasbeehStoreJsPath = path.join(ROOT, 'services', 'tasbeeh-store.js');
const duasStoreJsPath = path.join(ROOT, 'services', 'duas-store.js');
const settingsStoreJsPath = path.join(ROOT, 'services', 'settings-store.js');
const routerJsPath = path.join(ROOT, 'services', 'router.js');
const appViewModelJsPath = path.join(ROOT, 'services', 'app-view-model.js');

// Tasbeeh decomposed submodules
const tasbeehServiceJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-service.js');
const tasbeehVmJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-view-model.js');
const tasbeehModelJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-model.js');
const tasbeehCalJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-calendar.js');
const tasbeehModalJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-modal.js');
const tasbeehPeriodJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-period.js');
const tasbeehOldJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-old', 'tasbeeh-old.js');
const tasbeehHistJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-history', 'tasbeeh-history.js');
const tasbeehCurJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-current', 'tasbeeh-current.js');
const tasbeehRegistrationJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-registration.js');
const tasbeehJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh.js');

// Modular Current submodules
const tasbeehCurCardJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-current', 'tasbeeh-current-card', 'tasbeeh-current-card.js');
const tasbeehCurFeedJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-current', 'tasbeeh-current-feed', 'tasbeeh-current-feed.js');
const tasbeehCurFormJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-current', 'tasbeeh-current-form', 'tasbeeh-current-form.js');
const tasbeehCurPageJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-current', 'tasbeeh-current-page', 'tasbeeh-current-page.js');

// Modular Old submodules
const tasbeehOldCardJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-old', 'tasbeeh-old-card', 'tasbeeh-old-card.js');
const tasbeehOldFeedJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-old', 'tasbeeh-old-feed', 'tasbeeh-old-feed.js');
const tasbeehOldFormJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-old', 'tasbeeh-old-form', 'tasbeeh-old-form.js');
const tasbeehOldPageJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-old', 'tasbeeh-old-page', 'tasbeeh-old-page.js');

// Modular History submodules
const tasbeehHistCardJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-history', 'tasbeeh-history-card', 'tasbeeh-history-card.js');
const tasbeehHistFeedJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-history', 'tasbeeh-history-feed', 'tasbeeh-history-feed.js');
const tasbeehHistFormJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-history', 'tasbeeh-history-form', 'tasbeeh-history-form.js');
const tasbeehHistPageJsPath = path.join(ROOT, 'features', 'tasbeeh', 'tasbeeh-history', 'tasbeeh-history-page', 'tasbeeh-history-page.js');

// Quran decomposed submodules
const quranServiceJsPath = path.join(ROOT, 'features', 'quran', 'quran-service.js');
const quranMainCardJsPath = path.join(ROOT, 'features', 'quran', 'quran-main', 'quran-main-card', 'quran-main-card.js');
const quranMainFeedJsPath = path.join(ROOT, 'features', 'quran', 'quran-main', 'quran-main-feed', 'quran-main-feed.js');
const quranMainPageJsPath = path.join(ROOT, 'features', 'quran', 'quran-main', 'quran-main-page', 'quran-main-page.js');
const quranMainJsPath = path.join(ROOT, 'features', 'quran', 'quran-main', 'quran-main.js');
const quranOpenCardJsPath = path.join(ROOT, 'features', 'quran', 'quran-open', 'quran-open-card', 'quran-open-card.js');
const quranOpenFeedJsPath = path.join(ROOT, 'features', 'quran', 'quran-open', 'quran-open-feed', 'quran-open-feed.js');
const quranOpenPageJsPath = path.join(ROOT, 'features', 'quran', 'quran-open', 'quran-open-page', 'quran-open-page.js');
const quranOpenJsPath = path.join(ROOT, 'features', 'quran', 'quran-open', 'quran-open.js');
const quranBookmarkCardJsPath = path.join(ROOT, 'features', 'quran', 'quran-bookmark', 'quran-bookmark-card', 'quran-bookmark-card.js');
const quranBookmarkFeedJsPath = path.join(ROOT, 'features', 'quran', 'quran-bookmark', 'quran-bookmark-feed', 'quran-bookmark-feed.js');
const quranBookmarkPageJsPath = path.join(ROOT, 'features', 'quran', 'quran-bookmark', 'quran-bookmark-page', 'quran-bookmark-page.js');
const quranBookmarkJsPath = path.join(ROOT, 'features', 'quran', 'quran-bookmark', 'quran-bookmark.js');
const quranRegistrationJsPath = path.join(ROOT, 'features', 'quran', 'quran-registration.js');
const quranJsPath = path.join(ROOT, 'features', 'quran', 'quran.js');

// Tracker decomposed submodules
const trackerServiceJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-service.js');
const trackerCurCardJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-current', 'tracker-current-card', 'tracker-current-card.js');
const trackerCurFeedJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-current', 'tracker-current-feed', 'tracker-current-feed.js');
const trackerCurFormJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-current', 'tracker-current-form', 'tracker-current-form.js');
const trackerCurPageJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-current', 'tracker-current-page', 'tracker-current-page.js');
const trackerCurJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-current', 'tracker-current.js');
const trackerOldCardJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-old', 'tracker-old-card', 'tracker-old-card.js');
const trackerOldFeedJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-old', 'tracker-old-feed', 'tracker-old-feed.js');
const trackerOldFormJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-old', 'tracker-old-form', 'tracker-old-form.js');
const trackerOldPageJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-old', 'tracker-old-page', 'tracker-old-page.js');
const trackerOldJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-old', 'tracker-old.js');
const trackerPerfCardJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-performance', 'tracker-performance-card', 'tracker-performance-card.js');
const trackerPerfFeedJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-performance', 'tracker-performance-feed', 'tracker-performance-feed.js');
const trackerPerfPageJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-performance', 'tracker-performance-page', 'tracker-performance-page.js');
const trackerPerfJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-performance', 'tracker-performance.js');
const trackerHistCardJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-history', 'tracker-history-card', 'tracker-history-card.js');
const trackerHistFeedJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-history', 'tracker-history-feed', 'tracker-history-feed.js');
const trackerHistPageJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-history', 'tracker-history-page', 'tracker-history-page.js');
const trackerHistJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-history', 'tracker-history.js');
const trackerRegistrationJsPath = path.join(ROOT, 'features', 'tracker', 'tracker-registration.js');
const trackerJsPath = path.join(ROOT, 'features', 'tracker', 'tracker.js');

// Dua decomposed submodules
const duaServiceJsPath = path.join(ROOT, 'features', 'dua', 'dua-service.js');
const duaAllCardJsPath = path.join(ROOT, 'features', 'dua', 'dua-all', 'dua-all-card', 'dua-all-card.js');
const duaAllFeedJsPath = path.join(ROOT, 'features', 'dua', 'dua-all', 'dua-all-feed', 'dua-all-feed.js');
const duaAllFormJsPath = path.join(ROOT, 'features', 'dua', 'dua-all', 'dua-all-form', 'dua-all-form.js');
const duaAllPageJsPath = path.join(ROOT, 'features', 'dua', 'dua-all', 'dua-all-page', 'dua-all-page.js');
const duaAllJsPath = path.join(ROOT, 'features', 'dua', 'dua-all', 'dua-all.js');
const duaPinnedCardJsPath = path.join(ROOT, 'features', 'dua', 'dua-pinned', 'dua-pinned-card', 'dua-pinned-card.js');
const duaPinnedFeedJsPath = path.join(ROOT, 'features', 'dua', 'dua-pinned', 'dua-pinned-feed', 'dua-pinned-feed.js');
const duaPinnedPageJsPath = path.join(ROOT, 'features', 'dua', 'dua-pinned', 'dua-pinned-page', 'dua-pinned-page.js');
const duaPinnedJsPath = path.join(ROOT, 'features', 'dua', 'dua-pinned', 'dua-pinned.js');
const duaFavsCardJsPath = path.join(ROOT, 'features', 'dua', 'dua-favourites', 'dua-favourites-card', 'dua-favourites-card.js');
const duaFavsFeedJsPath = path.join(ROOT, 'features', 'dua', 'dua-favourites', 'dua-favourites-feed', 'dua-favourites-feed.js');
const duaFavsPageJsPath = path.join(ROOT, 'features', 'dua', 'dua-favourites', 'dua-favourites-page', 'dua-favourites-page.js');
const duaFavsJsPath = path.join(ROOT, 'features', 'dua', 'dua-favourites', 'dua-favourites.js');
const duaRegistrationJsPath = path.join(ROOT, 'features', 'dua', 'dua-registration.js');
const duaJsModularPath = path.join(ROOT, 'features', 'dua', 'dua.js');

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
        .replace(/export\s*\*\s*from\s*['"][^'"]+['"];?/g, '') // Strip export * from '...'
        .replace(/export\s*\{[\s\S]*?\}(\s*from\s*['"][^'"]+['"])?;?/g, '') // Strip multiline export { ... } [from '...']
        .replace(/^\s*export\s+const\s+/gm, 'var ') // Convert export const to var to prevent script-scope collisions
        .replace(/^\s*export\s+let\s+/gm, 'var ') // Convert export let to var
        .replace(/^\s*export\s+var\s+/gm, 'var ') // Strip export from var
        .replace(/^\s*export\s+async\s+function\s+/gm, 'async function ') // Strip export from async function
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
        const componentHelperJs = readFile(componentHelperJsPath);
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
        const dashboardServiceJs = readFile(dashboardServiceJsPath);
        const dashboardClockJs = readFile(dashboardClockJsPath);
        const dashboardTimelineJs = readFile(dashboardTimelineJsPath);
        const dashboardFeaturesGridJs = readFile(dashboardFeaturesGridJsPath);
        const dashboardJs = readFile(dashboardJsPath);
        const dashboardRegJs = readFile(dashboardRegJsPath);
        const settingsServiceJs = readFile(settingsServiceJsPath);
        const settingsPrayerTimesJs = readFile(settingsPrayerTimesJsPath);
        const settingsStartDateJs = readFile(settingsStartDateJsPath);
        const settingsFontSizeJs = readFile(settingsFontSizeJsPath);
        const settingsBackupJs = readFile(settingsBackupJsPath);
        const settingsRegJs = readFile(settingsRegJsPath);
        const settingsJs = readFile(settingsJsPath);

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

        // Quran submodules
        const quranServiceJs = readFile(quranServiceJsPath);
        const quranMainCardJs = readFile(quranMainCardJsPath);
        const quranMainFeedJs = readFile(quranMainFeedJsPath);
        const quranMainPageJs = readFile(quranMainPageJsPath);
        const quranMainJs = readFile(quranMainJsPath);
        const quranOpenCardJs = readFile(quranOpenCardJsPath);
        const quranOpenFeedJs = readFile(quranOpenFeedJsPath);
        const quranOpenPageJs = readFile(quranOpenPageJsPath);
        const quranOpenJs = readFile(quranOpenJsPath);
        const quranBookmarkCardJs = readFile(quranBookmarkCardJsPath);
        const quranBookmarkFeedJs = readFile(quranBookmarkFeedJsPath);
        const quranBookmarkPageJs = readFile(quranBookmarkPageJsPath);
        const quranBookmarkJs = readFile(quranBookmarkJsPath);
        const quranJs = readFile(quranJsPath);
        const quranRegistrationJs = readFile(quranRegistrationJsPath);

        // Tracker submodules
        const trackerServiceJs = readFile(trackerServiceJsPath);
        const trackerCurCardJs = readFile(trackerCurCardJsPath);
        const trackerCurFeedJs = readFile(trackerCurFeedJsPath);
        const trackerCurFormJs = readFile(trackerCurFormJsPath);
        const trackerCurPageJs = readFile(trackerCurPageJsPath);
        const trackerCurJs = readFile(trackerCurJsPath);
        const trackerOldCardJs = readFile(trackerOldCardJsPath);
        const trackerOldFeedJs = readFile(trackerOldFeedJsPath);
        const trackerOldFormJs = readFile(trackerOldFormJsPath);
        const trackerOldPageJs = readFile(trackerOldPageJsPath);
        const trackerOldJs = readFile(trackerOldJsPath);
        const trackerPerfCardJs = readFile(trackerPerfCardJsPath);
        const trackerPerfFeedJs = readFile(trackerPerfFeedJsPath);
        const trackerPerfPageJs = readFile(trackerPerfPageJsPath);
        const trackerPerfJs = readFile(trackerPerfJsPath);
        const trackerHistCardJs = readFile(trackerHistCardJsPath);
        const trackerHistFeedJs = readFile(trackerHistFeedJsPath);
        const trackerHistPageJs = readFile(trackerHistPageJsPath);
        const trackerHistJs = readFile(trackerHistJsPath);
        const trackerRegistrationJs = readFile(trackerRegistrationJsPath);
        const trackerJs = readFile(trackerJsPath);

        // Dua submodules
        const duaServiceJs = readFile(duaServiceJsPath);
        const duaAllCardJs = readFile(duaAllCardJsPath);
        const duaAllFeedJs = readFile(duaAllFeedJsPath);
        const duaAllFormJs = readFile(duaAllFormJsPath);
        const duaAllPageJs = readFile(duaAllPageJsPath);
        const duaAllJs = readFile(duaAllJsPath);
        const duaPinnedCardJs = readFile(duaPinnedCardJsPath);
        const duaPinnedFeedJs = readFile(duaPinnedFeedJsPath);
        const duaPinnedPageJs = readFile(duaPinnedPageJsPath);
        const duaPinnedJs = readFile(duaPinnedJsPath);
        const duaFavsCardJs = readFile(duaFavsCardJsPath);
        const duaFavsFeedJs = readFile(duaFavsFeedJsPath);
        const duaFavsPageJs = readFile(duaFavsPageJsPath);
        const duaFavsJs = readFile(duaFavsJsPath);
        const duaRegistrationJs = readFile(duaRegistrationJsPath);
        const duaJsModular = readFile(duaJsModularPath);

        const registryJs = readFile(registryJsPath);
        const appJs = readFile(appJsPath);
        const navigationJs = readFile(navigationJsPath);
        const appViewModelJs = readFile(appViewModelJsPath);

        const combinedJs = [
            bindingsJs,
            componentHelperJs,
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
            dashboardServiceJs,
            dashboardClockJs,
            dashboardTimelineJs,
            dashboardFeaturesGridJs,
            dashboardJs,
            dashboardRegJs,
            settingsServiceJs,
            settingsPrayerTimesJs,
            settingsStartDateJs,
            settingsFontSizeJs,
            settingsBackupJs,
            settingsRegJs,
            settingsJs,
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
            quranServiceJs,
            quranMainCardJs,
            quranMainFeedJs,
            quranMainPageJs,
            quranMainJs,
            quranOpenCardJs,
            quranOpenFeedJs,
            quranOpenPageJs,
            quranOpenJs,
            quranBookmarkCardJs,
            quranBookmarkFeedJs,
            quranBookmarkPageJs,
            quranBookmarkJs,
            quranJs,
            quranRegistrationJs,
            trackerServiceJs,
            trackerCurCardJs,
            trackerCurFeedJs,
            trackerCurFormJs,
            trackerCurPageJs,
            trackerCurJs,
            trackerOldCardJs,
            trackerOldFeedJs,
            trackerOldFormJs,
            trackerOldPageJs,
            trackerOldJs,
            trackerPerfCardJs,
            trackerPerfFeedJs,
            trackerPerfPageJs,
            trackerPerfJs,
            trackerHistCardJs,
            trackerHistFeedJs,
            trackerHistPageJs,
            trackerHistJs,
            trackerRegistrationJs,
            trackerJs,
            duaServiceJs,
            duaAllCardJs,
            duaAllFeedJs,
            duaAllFormJs,
            duaAllPageJs,
            duaAllJs,
            duaPinnedCardJs,
            duaPinnedFeedJs,
            duaPinnedPageJs,
            duaPinnedJs,
            duaFavsCardJs,
            duaFavsFeedJs,
            duaFavsPageJs,
            duaFavsJs,
            duaRegistrationJs,
            duaJsModular,
            registryJs,
            appJs,
            navigationJs,
            appViewModelJs,
            'if (typeof registerAllComponents === "function") { try { registerAllComponents(); } catch (_) {} }'
        ].join('\n');

        const minifiedJs = minifyJs(combinedJs);

        // Replace script src tags with minified inlined script block
        html = html.replace(/<script[^>]*src="components\/bindings\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="components\/icon\/icon\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="components\/bottom-sheet\/bottom-sheet\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="components\/registry\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script\s+type="module"(?![^>]*src=)[^>]*>[\s\S]*?(?:registerAllComponents|registerStartupComponents)[\s\S]*?<\/script>/g, '');
        html = html.replace(/<script[^>]*src="utilities\/constant\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="utilities\/utility\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="services\/prayer-store\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="services\/tasbeeh-store\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="services\/duas-store\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="services\/settings-store\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="services\/router\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="services\/app-view-model\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="navigation\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:features\/)?(?:prayer-tracking\/)?prayer-tracking\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:features\/)?(?:tracker\/)?tracker\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:features\/)?(?:tracker\/)?tracker-registration\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:features\/)?(?:dashboard\/)?dashboard\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:features\/)?(?:dashboard\/)?dashboard-registration\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:features\/)?(?:settings\/)?settings\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:features\/)?(?:settings\/)?settings-registration\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:features\/)?(?:tasbeeh\/)?tasbeeh\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:features\/)?(?:tasbeeh\/)?tasbeeh-registration\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:features\/)?(?:duva\/|dua\/)?(?:duva|dua)\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:features\/)?(?:dua\/)?dua-registration\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:features\/)?(?:quran\/)?quran\.js"[^>]*><\/script>/g, '');
        html = html.replace(/<script[^>]*src="(?:features\/)?(?:quran\/)?quran-registration\.js"[^>]*><\/script>/g, '');
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

        // 5. Ensure production folder assets (manifest.json, favicon.svg, sw.js, icons) exist
        const manifestSrc = path.join(ROOT, 'manifest.json');
        const manifestDest = path.join(BUILD_DIR, 'manifest.json');
        if (fs.existsSync(manifestSrc)) {
            fs.copyFileSync(manifestSrc, manifestDest);
        }

        const faviconSrc = path.join(ROOT, 'favicon.svg');
        const faviconDest = path.join(BUILD_DIR, 'favicon.svg');
        if (fs.existsSync(faviconSrc)) {
            fs.copyFileSync(faviconSrc, faviconDest);
        }

        const swSrc = path.join(ROOT, 'sw.js');
        const swDest = path.join(BUILD_DIR, 'sw.js');
        if (fs.existsSync(swSrc)) {
            fs.copyFileSync(swSrc, swDest);
        }

        const iconsSrc = path.join(ROOT, 'icons');
        const iconsDest = path.join(BUILD_DIR, 'icons');
        if (fs.existsSync(iconsSrc)) {
            fs.cpSync(iconsSrc, iconsDest, { recursive: true });
        }

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
