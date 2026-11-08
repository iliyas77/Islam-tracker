#!/usr/bin/env node
// tests/run-all-tests.js
import { runPrayerTests } from './prayer.test.js';
import { runTasbeehTests } from './tasbeeh.test.js';
import { runTasbeehComponentTests } from './tasbeeh-components.test.js';
import { runTabsTests } from './tabs.test.js';
import { runDuasTests } from './duas.test.js';
import { runSettingsTests } from './settings.test.js';
import { runRouterTests } from './router.test.js';
import { runPwaTests } from './pwa.test.js';
import { runQuranTests } from './quran.test.js';
import { runDecompositionTests } from './decomposition.test.js';

const startTime = Date.now();

console.log('====================================================');
console.log('   NUR PRAYER — AUTOMATED TEST SUITE (PHASES 1-5)   ');
console.log('====================================================\n');

async function runAll() {
    try {
        await runPrayerTests();
        await runTasbeehTests();
        await runTasbeehComponentTests();
        await runTabsTests();
        await runDuasTests();
        await runSettingsTests();
        await runRouterTests();
        await runPwaTests();
        await runQuranTests();
        await runDecompositionTests();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('\n====================================================');
        console.log(`🎉 ALL TESTS PASSED SUCCESSFULLY in ${duration}s!`);
        console.log('====================================================\n');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ TEST SUITE FAILED:');
        console.error(err);
        process.exit(1);
    }
}

runAll();

