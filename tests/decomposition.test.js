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

        // Prayer Tracking modules
        'prayer-tracking/old-tracking.js',
        'prayer-tracking/performance-view-model.js',
        'prayer-tracking/history-view-model.js',
        'prayer-tracking/tracker-view-model.js',
        'prayer-tracking/prayer-tracking.js',

        // Tasbeeh modules
        'tasbeeh/tasbeeh-registration.js',
        'tasbeeh/tasbeeh-service.js',
        'tasbeeh/tasbeeh-view-model.js',
        'tasbeeh/tasbeeh-model.js',
        'tasbeeh/tasbeeh-calendar.js',
        'tasbeeh/tasbeeh-modal.js',
        'tasbeeh/tasbeeh-period.js',
        'tasbeeh/tasbeeh-current/tasbeeh-current.js',
        'tasbeeh/tasbeeh-old/tasbeeh-old.js',
        'tasbeeh/tasbeeh-history/tasbeeh-history.js',
        'tasbeeh/tasbeeh.js',

        // Tasbeeh Modular Component Architecture
        'tasbeeh/tasbeeh-current/tasbeeh-current-card/tasbeeh-current-card.js',
        'tasbeeh/tasbeeh-current/tasbeeh-current-feed/tasbeeh-current-feed.js',
        'tasbeeh/tasbeeh-current/tasbeeh-current-form/tasbeeh-current-form.js',
        'tasbeeh/tasbeeh-current/tasbeeh-current-page/tasbeeh-current-page.js',
        'tasbeeh/tasbeeh-old/tasbeeh-old-card/tasbeeh-old-card.js',
        'tasbeeh/tasbeeh-old/tasbeeh-old-feed/tasbeeh-old-feed.js',
        'tasbeeh/tasbeeh-old/tasbeeh-old-form/tasbeeh-old-form.js',
        'tasbeeh/tasbeeh-old/tasbeeh-old-page/tasbeeh-old-page.js',
        'tasbeeh/tasbeeh-history/tasbeeh-history-card/tasbeeh-history-card.js',
        'tasbeeh/tasbeeh-history/tasbeeh-history-feed/tasbeeh-history-feed.js',
        'tasbeeh/tasbeeh-history/tasbeeh-history-form/tasbeeh-history-form.js',
        'tasbeeh/tasbeeh-history/tasbeeh-history-page/tasbeeh-history-page.js'
    ];

    for (const file of filesToCheck) {
        const fullPath = path.join(ROOT, file);
        assert(fs.existsSync(fullPath), `Module ${file} must exist`);
        const lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
        assert(lines <= 500, `Module ${file} has ${lines} lines, exceeding 500 line limit!`);
    }

    console.log(`  ✔ Decomposition: All ${filesToCheck.length} decomposed submodules strictly under 500 lines`);
}

