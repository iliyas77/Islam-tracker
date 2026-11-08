// tests/prayer.test.js
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export async function runPrayerTests() {
    console.log('▶ Running PrayerStore & Tracking Tests...');

    // Environment Setup
    globalThis.window = globalThis;
    globalThis.localStorage = {
        _data: {},
        getItem(k) { return this._data[k] !== undefined ? this._data[k] : null; },
        setItem(k, v) { this._data[k] = String(v); },
        removeItem(k) { delete this._data[k]; },
        clear() { this._data = {}; }
    };

    // Minimal Mock for Knockout
    globalThis.ko = {
        observable(init) {
            let v = init;
            const subs = [];
            const fn = function(newVal) {
                if (arguments.length > 0) {
                    if (v !== newVal) {
                        v = newVal;
                        subs.forEach(s => s(v));
                    }
                    return fn;
                }
                return v;
            };
            fn.subscribe = function(cb) { subs.push(cb); return { dispose() {} }; };
            fn.__ko_proto__ = fn;
            return fn;
        },
        observableArray(init) {
            const obs = globalThis.ko.observable(init || []);
            obs.push = function(...args) {
                const arr = obs();
                arr.push(...args);
                obs(arr);
            };
            return obs;
        },
        pureComputed(readOrOpts) {
            const read = typeof readOrOpts === 'function' ? readOrOpts : (readOrOpts && readOrOpts.read);
            const write = (readOrOpts && typeof readOrOpts.write === 'function') ? readOrOpts.write : function() {};
            const fn = function(val) {
                if (arguments.length > 0) {
                    write(val);
                    return fn;
                }
                return read ? read() : undefined;
            };
            fn.__ko_proto__ = fn;
            fn.subscribe = function() { return { dispose() {} }; };
            return fn;
        },
        computed(read) { return globalThis.ko.pureComputed(read); },
        isObservable(fn) { return typeof fn === 'function' && !!fn.__ko_proto__; }
    };

    const { PrayerStore } = await import(path.join(ROOT, 'services', 'prayer-store.js'));

    // 1. Initial State
    assert.strictEqual(typeof PrayerStore.selectedDate(), 'string');
    assert.strictEqual(typeof PrayerStore.today(), 'string');
    assert.strictEqual(PrayerStore.isToday(), true);

    // 2. Setting Date
    PrayerStore.selectedDate('2026-11-01');
    assert.strictEqual(PrayerStore.selectedDate(), '2026-11-01');
    assert.strictEqual(PrayerStore.isToday(), false);

    // 3. Prayer Status Tracking & Reactive Persistence
    PrayerStore.selectedDate('2026-11-06');
    PrayerStore.trackerRecords({
        '2026-11-06': {
            Fajr: 1,
            Dhuhr: 1,
            Asr: 1,
            Maghrib: 1,
            Isha: 1
        }
    });

    const storedPrayers = JSON.parse(localStorage.getItem(PrayerStore.K));
    assert(storedPrayers['2026-11-06'], 'Prayer data should be reactively persisted');
    assert.strictEqual(storedPrayers['2026-11-06'].Fajr, 1);
    assert.strictEqual(storedPrayers['2026-11-06'].Isha, 1);

    // 4. Missed Count Pure Computed
    // In Nur Prayer, a missed prayer is recorded as true or 'missed'
    PrayerStore.trackerRecords({
        '2026-11-06': { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false },
        '2026-11-05': { Fajr: false, Dhuhr: true, Asr: true, Maghrib: false, Isha: false }
    });

    // 2 missed prayers on 2026-11-05
    assert.strictEqual(PrayerStore.missedCount(), 2, 'Missed count should accurately sum all missed prayers before today');

    // 5. Streak Days Pure Computed
    assert(typeof PrayerStore.streakDays() === 'number', 'Streak days should be a computed number');

    // 6. DashboardViewModel & Tracker Badge reactivity
    const { DashboardViewModel } = await import(path.join(ROOT, 'features', 'dashboard', 'dashboard-registration.js'));
    const dashVm = new DashboardViewModel();
    assert.strictEqual(typeof dashVm.updateTrackerBadge, 'function');
    dashVm.updateTrackerBadge();
    const trackerCard = dashVm.navCards.find(c => c.action === 'goto-tracker');
    assert(trackerCard, 'Dashboard must have a Tracker nav card');
    assert.strictEqual(typeof trackerCard.badgeVisible, 'function');
    assert.strictEqual(typeof trackerCard.badgeText, 'function');
    assert.strictEqual(trackerCard.badgeVisible(), true);
    assert.strictEqual(trackerCard.badgeText(), '2 missed');

    // 7. PrayerRowViewModel state exclusivity & icon resolution
    const { PrayerRowViewModel } = await import(path.join(ROOT, 'features', 'prayer-tracking', 'tracker-view-model.js'));
    const missedRow = new PrayerRowViewModel({
        prayer: 'Fajr',
        isMissed: true,
        isStandard: true // deliberate legacy conflict test
    });
    assert.strictEqual(missedRow.isMissed, true, 'Missed row should have isMissed=true');
    assert.strictEqual(missedRow.isStandard, false, 'Missed row must NOT also be isStandard=true');
    assert.strictEqual(missedRow.isDone, false);
    assert.strictEqual(missedRow.isUpcoming, false);
    assert.strictEqual(missedRow.iconClass, 'fa-solid fa-cloud-sun');

    const doneRow = new PrayerRowViewModel({
        prayer: 'Dhuhr',
        isDone: true,
        iconClass: '<app-icon params="name: \'sun\'"></app-icon>'
    });
    assert.strictEqual(doneRow.isDone, true);
    assert.strictEqual(doneRow.isMissed, false);
    assert.strictEqual(doneRow.isStandard, false);
    assert.strictEqual(doneRow.iconClass, 'sun');

    const currentRow = new PrayerRowViewModel({
        prayer: 'Isha',
        isCurrent: true,
        isStandard: true
    });
    assert.strictEqual(currentRow.isCurrent, true);
    assert.strictEqual(currentRow.isStandard, true);
    assert.strictEqual(currentRow.isMissed, false);
    assert.strictEqual(currentRow.isDone, false);
    assert.strictEqual(currentRow.iconClass, 'fa-solid fa-moon');

    // 8. IconViewModel robust error-free resolution test
    const { IconViewModel } = await import(path.join(ROOT, 'components', 'icon', 'icon.js'));
    const fajrIconVm = new IconViewModel({ name: 'fajr' });
    assert.strictEqual(fajrIconVm.computedClass(), 'fa-solid fa-cloud-sun');

    const htmlIconVm = new IconViewModel({ name: '<app-icon params="name: \'sun\'"></app-icon>' });
    assert.strictEqual(htmlIconVm.computedClass(), 'fa-solid fa-sun');

    const rawClassIconVm = new IconViewModel({ name: 'fa-solid fa-moon' });
    assert.strictEqual(rawClassIconVm.computedClass(), 'fa-solid fa-moon');

    // Defensive test with empty/null/undefined params
    const emptyIconVm = new IconViewModel({});
    assert.strictEqual(typeof emptyIconVm.computedClass(), 'string');
    assert.strictEqual(emptyIconVm.isSvg(), false);
    assert.strictEqual(emptyIconVm.computedStyle(), null);

    console.log('  ✔ PrayerStore: Observables, pure computeds, and persistence passed');
}
