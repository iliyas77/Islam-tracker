// tests/decomposition.test.js
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export async function runDecompositionTests() {
    console.log('▶ Running File Line Count & Modular Decomposition Tests...');

    const filesToCheck = [
        // Reusable Global Components
        'components/tabs/tabs.js',
        'components/component-helper.js',

        // Tasbeeh modules
        'features/tasbeeh/tasbeeh-registration.js',
        'features/tasbeeh/tasbeeh-service.js',
        'features/tasbeeh/tasbeeh-view-model.js',
        'features/tasbeeh/tasbeeh-model.js',
        'features/tasbeeh/tasbeeh-calendar.js',
        'features/tasbeeh/tasbeeh-modal.js',
        'features/tasbeeh/tasbeeh-period.js',
        'features/tasbeeh/tasbeeh-current/tasbeeh-current.js',
        'features/tasbeeh/tasbeeh-old/tasbeeh-old.js',
        'features/tasbeeh/tasbeeh-history/tasbeeh-history.js',
        'features/tasbeeh/tasbeeh.js',

        // Tasbeeh Modular Component Architecture
        'features/tasbeeh/tasbeeh-current/tasbeeh-current-card/tasbeeh-current-card.js',
        'features/tasbeeh/tasbeeh-current/tasbeeh-current-feed/tasbeeh-current-feed.js',
        'features/tasbeeh/tasbeeh-current/tasbeeh-current-form/tasbeeh-current-form.js',
        'features/tasbeeh/tasbeeh-current/tasbeeh-current-page/tasbeeh-current-page.js',
        'features/tasbeeh/tasbeeh-old/tasbeeh-old-card/tasbeeh-old-card.js',
        'features/tasbeeh/tasbeeh-old/tasbeeh-old-feed/tasbeeh-old-feed.js',
        'features/tasbeeh/tasbeeh-old/tasbeeh-old-form/tasbeeh-old-form.js',
        'features/tasbeeh/tasbeeh-old/tasbeeh-old-page/tasbeeh-old-page.js',
        'features/tasbeeh/tasbeeh-history/tasbeeh-history-card/tasbeeh-history-card.js',
        'features/tasbeeh/tasbeeh-history/tasbeeh-history-feed/tasbeeh-history-feed.js',
        'features/tasbeeh/tasbeeh-history/tasbeeh-history-form/tasbeeh-history-form.js',
        'features/tasbeeh/tasbeeh-history/tasbeeh-history-page/tasbeeh-history-page.js',

        // Quran modules
        'features/quran/quran.js',
        'features/quran/quran-service.js',
        'features/quran/quran-registration.js',
        'features/quran/quran-main/quran-main.js',
        'features/quran/quran-main/quran-main-page/quran-main-page.js',
        'features/quran/quran-main/quran-main-feed/quran-main-feed.js',
        'features/quran/quran-main/quran-main-card/quran-main-card.js',
        'features/quran/quran-open/quran-open.js',
        'features/quran/quran-open/quran-open-page/quran-open-page.js',
        'features/quran/quran-open/quran-open-feed/quran-open-feed.js',
        'features/quran/quran-open/quran-open-card/quran-open-card.js',
        'features/quran/quran-bookmark/quran-bookmark.js',
        'features/quran/quran-bookmark/quran-bookmark-page/quran-bookmark-page.js',
        'features/quran/quran-bookmark/quran-bookmark-feed/quran-bookmark-feed.js',
        'features/quran/quran-bookmark/quran-bookmark-card/quran-bookmark-card.js',

        // Tracker Modular Component Architecture
        'features/tracker/tracker-service.js',
        'features/tracker/tracker-registration.js',
        'features/tracker/tracker.js',
        'features/tracker/tracker-main/tracker-main.js',
        'features/tracker/tracker-current/tracker-current.js',
        'features/tracker/tracker-current/tracker-current-home/tracker-current-home.js',
        'features/tracker/tracker-current/tracker-current-feed/tracker-current-feed.js',
        'features/tracker/tracker-current/tracker-current-card/tracker-current-card.js',
        'features/tracker/tracker-current/tracker-current-form/tracker-current-form.js',
        'features/tracker/tracker-old/tracker-old.js',
        'features/tracker/tracker-old/tracker-old-page/tracker-old-page.js',
        'features/tracker/tracker-old/tracker-old-feed/tracker-old-feed.js',
        'features/tracker/tracker-old/tracker-old-card/tracker-old-card.js',
        'features/tracker/tracker-old/tracker-old-form/tracker-old-form.js',
        'features/tracker/tracker-performance/tracker-performance.js',
        'features/tracker/tracker-performance/tracker-performance-page/tracker-performance-page.js',
        'features/tracker/tracker-performance/tracker-performance-feed/tracker-performance-feed.js',
        'features/tracker/tracker-performance/tracker-performance-card/tracker-performance-card.js',
        'features/tracker/tracker-history/tracker-history.js',
        'features/tracker/tracker-history/tracker-history-page/tracker-history-page.js',
        'features/tracker/tracker-history/tracker-history-feed/tracker-history-feed.js',
        'features/tracker/tracker-history/tracker-history-card/tracker-history-card.js',

        // Dua Modular Component Architecture
        'features/dua/dua-service.js',
        'features/dua/dua-registration.js',
        'features/dua/dua.js',
        'features/dua/dua-all/dua-all.js',
        'features/dua/dua-all/dua-all-page/dua-all-page.js',
        'features/dua/dua-all/dua-all-feed/dua-all-feed.js',
        'features/dua/dua-all/dua-all-card/dua-all-card.js',
        'features/dua/dua-all/dua-all-form/dua-all-form.js',
        'features/dua/dua-pinned/dua-pinned.js',
        'features/dua/dua-pinned/dua-pinned-page/dua-pinned-page.js',
        'features/dua/dua-pinned/dua-pinned-feed/dua-pinned-feed.js',
        'features/dua/dua-pinned/dua-pinned-card/dua-pinned-card.js',
        'features/dua/dua-favourites/dua-favourites.js',
        'features/dua/dua-favourites/dua-favourites-page/dua-favourites-page.js',
        'features/dua/dua-favourites/dua-favourites-feed/dua-favourites-feed.js',
        'features/dua/dua-favourites/dua-favourites-card/dua-favourites-card.js',

        // Dashboard Modular Component Architecture
        'features/dashboard/dashboard.js',
        'features/dashboard/dashboard-service.js',
        'features/dashboard/dashboard-registration.js',
        'features/dashboard/components/dashboard-clock/dashboard-clock.js',
        'features/dashboard/components/dashboard-timeline/dashboard-timeline.js',
        'features/dashboard/components/dashboard-features-grid/dashboard-features-grid.js',

        // Settings Modular Component Architecture (SB)
        'features/settings/settings-service.js',
        'features/settings/settings-registration.js',
        'features/settings/settings.js',
        'features/settings/components/settings-prayer-times/settings-prayer-times.js',
        'features/settings/components/settings-start-date/settings-start-date.js',
        'features/settings/components/settings-font-size/settings-font-size.js',
        'features/settings/components/settings-backup/settings-backup.js'
    ];

    for (const file of filesToCheck) {
        const fullPath = path.join(ROOT, file);
        assert(fs.existsSync(fullPath), `Module ${file} must exist`);
        const lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
        assert(lines <= 500, `Module ${file} has ${lines} lines, exceeding 500 line limit!`);
    }

    console.log(`  ✔ Decomposition: All ${filesToCheck.length} decomposed submodules strictly under 500 lines`);
}

