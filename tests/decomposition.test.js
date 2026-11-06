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
        // Prayer Tracking modules
        'prayer-tracking/old-tracking.js',
        'prayer-tracking/performance-view-model.js',
        'prayer-tracking/history-view-model.js',
        'prayer-tracking/tracker-view-model.js',
        'prayer-tracking/prayer-tracking.js',

        // Tasbeeh modules
        'tasbeeh/tasbeeh-view-model.js',
        'tasbeeh/tasbeeh-model.js',
        'tasbeeh/tasbeeh-calendar.js',
        'tasbeeh/tasbeeh-modal.js',
        'tasbeeh/tasbeeh-period.js',
        'tasbeeh/tasbeeh-old.js',
        'tasbeeh/tasbeeh-history.js',
        'tasbeeh/tasbeeh-home.js',
        'tasbeeh/tasbeeh-current.js',
        'tasbeeh/tasbeeh.js'
    ];

    for (const file of filesToCheck) {
        const fullPath = path.join(ROOT, file);
        assert(fs.existsSync(fullPath), `Module ${file} must exist`);
        const lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
        assert(lines <= 500, `Module ${file} has ${lines} lines, exceeding 500 line limit!`);
    }

    console.log(`  ✔ Decomposition: All ${filesToCheck.length} decomposed submodules strictly under 500 lines`);
}

