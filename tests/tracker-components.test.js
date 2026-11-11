// tests/tracker-components.test.js
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export async function runTrackerComponentTests() {
    console.log('▶ Running Tracker Modular Component Architecture Tests...');

    // Minimal Mock for Knockout
    const registeredComponents = {};
    const mockKo = {
        observable(init) {
            let v = init;
            const subs = [];
            const fn = function (newVal) {
                if (arguments.length > 0) {
                    if (v !== newVal) {
                        v = newVal;
                        subs.forEach(s => s(v));
                    }
                    return fn;
                }
                return v;
            };
            fn.subscribe = function (cb) { subs.push(cb); return { dispose() {} }; };
            fn.__ko_proto__ = fn;
            return fn;
        },
        observableArray(init) {
            const obs = mockKo.observable(init ? [...init] : []);
            obs.push = function (...args) {
                const arr = obs();
                arr.push(...args);
                obs(arr);
            };
            obs.remove = function (predicateOrItem) {
                const arr = obs();
                const filtered = typeof predicateOrItem === 'function'
                    ? arr.filter(x => !predicateOrItem(x))
                    : arr.filter(x => x !== predicateOrItem);
                obs(filtered);
                return arr.filter(x => !filtered.includes(x));
            };
            obs.removeAll = function () {
                const old = obs();
                obs([]);
                return old;
            };
            return obs;
        },
        pureComputed(readOrOpts) {
            const read = typeof readOrOpts === 'function' ? readOrOpts : (readOrOpts && readOrOpts.read);
            const write = (readOrOpts && typeof readOrOpts.write === 'function') ? readOrOpts.write : function () {};
            const fn = function (val) {
                if (arguments.length > 0) {
                    write(val);
                    return fn;
                }
                return read ? read() : undefined;
            };
            fn.__ko_proto__ = fn;
            fn.subscribe = function () { return { dispose() {} }; };
            return fn;
        },
        computed(read) { return mockKo.pureComputed(read); },
        isObservable(fn) { return typeof fn === 'function' && !!fn.__ko_proto__; },
        unwrap(val) { return typeof val === 'function' && val.__ko_proto__ ? val() : val; },
        components: {
            register(name, config) {
                registeredComponents[name] = config;
            },
            isRegistered(name) {
                return !!registeredComponents[name];
            },
            getRegistered() {
                return registeredComponents;
            }
        }
    };

    globalThis.ko = mockKo;

    // Mock localStorage
    const storageStore = {};
    globalThis.localStorage = {
        getItem(key) { return storageStore[key] || null; },
        setItem(key, val) { storageStore[key] = String(val); },
        removeItem(key) { delete storageStore[key]; },
        clear() { Object.keys(storageStore).forEach(k => delete storageStore[k]); }
    };

    // ==========================================
    // 1. TrackerService Verification
    // ==========================================
    const {
        TrackerService,
        PRAYER_NAMES,
        DEFAULT_TIMINGS,
        PRAYER_CARD_ICONS,
        PRAYER_STORAGE_KEYS,
        td,
        fr,
        formatPrayerDate,
        datesInRange,
        isDonePrayer,
        isPrayerUpcoming,
        isPrayerCurrent,
        getPrayerHistory,
        savePrayerHistory,
        addPrayerHistoryEntry,
        removePrayerHistoryEntry,
        clearPrayerHistory,
        calculatePrayerPerformance,
        getMissedPrayersByDate
    } = await import(path.join(ROOT, 'features', 'tracker', 'index.js'));

    assert(TrackerService, 'TrackerService must be exported');
    assert.strictEqual(PRAYER_NAMES.length, 5);
    assert.strictEqual(PRAYER_NAMES[0], 'Fajr');
    assert.strictEqual(PRAYER_NAMES[4], 'Isha');
    assert(PRAYER_CARD_ICONS.Fajr.includes('cloud-sun'));
    assert.strictEqual(PRAYER_STORAGE_KEYS.HISTORY, 'namazPrayerHistory');

    // Date Utilities
    const todayStr = td();
    assert(/^\d{4}-\d{2}-\d{2}$/.test(todayStr), 'td() returns YYYY-MM-DD');

    const formattedFull = fr('2026-11-08');
    assert(formattedFull.includes('Sunday') && formattedFull.includes('November') && formattedFull.includes('2026'));

    const formattedShort = formatPrayerDate('2026-11-08');
    assert.strictEqual(formattedShort, 'Nov 8, 2026');

    const range = datesInRange('2026-11-01', '2026-11-03');
    assert.deepStrictEqual(range, ['2026-11-01', '2026-11-02', '2026-11-03']);

    // Status Calculations
    const mockRecord = { Fajr: false, Dhuhr: true }; // false = completed, true = missed in Nur Prayer
    assert.strictEqual(isDonePrayer('Fajr', '2026-11-08', mockRecord), true);
    assert.strictEqual(isDonePrayer('Dhuhr', '2026-11-08', mockRecord), false);

    // History Persistence
    clearPrayerHistory();
    assert.deepStrictEqual(getPrayerHistory(), []);
    addPrayerHistoryEntry('Fajr', 'Current', '2026-11-08');
    const hist = getPrayerHistory();
    assert.strictEqual(hist.length, 1);
    assert.strictEqual(hist[0].prayer, 'Fajr');
    assert.strictEqual(hist[0].date, '2026-11-08');

    removePrayerHistoryEntry('Fajr', 'Current', '2026-11-08');
    assert.strictEqual(getPrayerHistory().length, 0);

    // Performance Calculations
    const perf = calculatePrayerPerformance();
    assert(typeof perf.totalDays === 'number');
    assert(typeof perf.totalPercentage === 'number');
    assert(perf.perPrayer.Fajr !== undefined);

    console.log('  ✔ TrackerService: Constants, dates, calculations, history, and missed prayers verified');

    // ==========================================
    // 2. Tracker Current Components Verification
    // ==========================================
    const { TrackerCurrentCardViewModel } = await import(
        path.join(ROOT, 'features', 'tracker', 'tracker-current', 'tracker-current-card', 'tracker-current-card.js')
    );
    const { TrackerCurrentFeedViewModel } = await import(
        path.join(ROOT, 'features', 'tracker', 'tracker-current', 'tracker-current-feed', 'tracker-current-feed.js')
    );
    const { TrackerCurrentFormViewModel } = await import(
        path.join(ROOT, 'features', 'tracker', 'tracker-current', 'tracker-current-form', 'tracker-current-form.js')
    );
    const { TrackerCurrentPageViewModel } = await import(
        path.join(ROOT, 'features', 'tracker', 'tracker-current', 'tracker-current-home', 'tracker-current-home.js')
    );

    // Test Current Card
    let cardToggled = null;
    const cardVm = new TrackerCurrentCardViewModel({
        item: { prayer: 'Fajr', time: '05:15', isDone: false, isUpcoming: true, isMissed: false },
        onToggle: c => { cardToggled = c; }
    });
    assert.strictEqual(cardVm.prayer, 'Fajr');
    assert.strictEqual(cardVm.time, '05:15');
    assert.strictEqual(cardVm.isDone, false);
    cardVm.onToggle();
    assert.strictEqual(cardToggled.prayer, 'Fajr', 'Card toggle executes onToggle callback');

    // Test Current Feed
    let feedToggled = null;
    const feedVm = new TrackerCurrentFeedViewModel({
        missedRows: mockKo.observableArray([]),
        doneRows: mockKo.observableArray([cardVm]),
        onTogglePrayer: c => { feedToggled = c; }
    });
    assert.strictEqual(feedVm.hasDone(), true);
    assert.strictEqual(feedVm.hasMissed(), false);
    feedVm.handleToggle(cardVm);
    assert.strictEqual(feedToggled.prayer, 'Fajr', 'Feed forwards handleToggle to parent callback');

    // Test Current Form (Catch-up / Missed prayers modal)
    let formResolved = null;
    const formVm = new TrackerCurrentFormViewModel({
        isOpen: mockKo.observable(true),
        onResolvePrayer: (d, p) => { formResolved = { date: d, prayer: p }; }
    });
    assert.strictEqual(formVm.isOpen(), true);
    formVm.handleResolve('2026-11-07', 'Asr');
    assert.deepStrictEqual(formResolved, { date: '2026-11-07', prayer: 'Asr' });

    // Test Current Page & Three-Level Communication
    globalThis.confirm = () => true;
    const mockStore = {
        trackerRecords: mockKo.observable({
            '2026-11-01': { Fajr: false, Dhuhr: true, Asr: true, Maghrib: true, Isha: true }
        }),
        timings: () => DEFAULT_TIMINGS,
        setPrayerStatus: (prayer, date, done) => {
            storeToggledPrayer = { prayer, date, done };
        }
    };
    globalThis.PrayerStore = mockStore;
    let storeToggledPrayer = null;

    const pageVm = new TrackerCurrentPageViewModel({ selectedDate: mockKo.observable('2026-11-01') });
    pageVm.refresh();
    assert.strictEqual(pageVm.doneRows().length, 1, 'Fajr is completed in mock record');
    assert.strictEqual(pageVm.missedRows().length, 4, 'Remaining 4 are missed');

    // Trigger handleTogglePrayer from card via page
    pageVm.handleTogglePrayer({ prayer: 'Dhuhr', isDone: false });
    assert.strictEqual(storeToggledPrayer.prayer, 'Dhuhr');
    assert.strictEqual(storeToggledPrayer.done, true);

    console.log('  ✔ Tracker Current: Card, Feed, Form, Page, and 3-level communication verified');

    // ==========================================
    // 3. Tracker Old Components Verification
    // ==========================================
    const { TrackerOldCardViewModel } = await import(
        path.join(ROOT, 'features', 'tracker', 'tracker-old', 'tracker-old-card', 'tracker-old-card.js')
    );
    const { TrackerOldFeedViewModel } = await import(
        path.join(ROOT, 'features', 'tracker', 'tracker-old', 'tracker-old-feed', 'tracker-old-feed.js')
    );
    const { TrackerOldFormViewModel } = await import(
        path.join(ROOT, 'features', 'tracker', 'tracker-old', 'tracker-old-form', 'tracker-old-form.js')
    );
    const { TrackerOldPageViewModel, TrackerOldHomeViewModel } = await import(
        path.join(ROOT, 'features', 'tracker', 'tracker-old', 'tracker-old-home', 'tracker-old-home.js')
    );
    assert.strictEqual(TrackerOldPageViewModel, TrackerOldHomeViewModel, 'TrackerOldPageViewModel must alias TrackerOldHomeViewModel');

    let oldCardToggled = null;
    const oldCardVm = new TrackerOldCardViewModel({
        item: { prayer: 'Fajr', time: '05:15', isDone: false, isUpcoming: false, isMissed: true },
        onToggle: c => { oldCardToggled = c; }
    });
    assert.strictEqual(oldCardVm.prayer, 'Fajr');
    assert.strictEqual(oldCardVm.isDone, false);
    assert.strictEqual(oldCardVm.isMissed, true);
    oldCardVm.onToggle();
    assert.strictEqual(oldCardToggled.prayer, 'Fajr');

    let oldFeedToggled = null;
    const oldFeedVm = new TrackerOldFeedViewModel({
        missedRows: mockKo.observableArray([oldCardVm]),
        doneRows: mockKo.observableArray([]),
        onTogglePrayer: c => { oldFeedToggled = c; }
    });
    assert.strictEqual(oldFeedVm.hasMissed(), true);
    assert.strictEqual(oldFeedVm.hasDone(), false);
    oldFeedVm.handleToggle(oldCardVm);
    assert.strictEqual(oldFeedToggled.prayer, 'Fajr');

    let oldPeriodSaved = null;
    const oldFormVm = new TrackerOldFormViewModel({
        isOpen: mockKo.observable(true),
        getPeriod: () => ({ start: '2026-10-01', end: '2026-10-31' }),
        getOldRecords: () => ({ '2026-10-15': { Fajr: true } }),
        onSavePeriod: p => { oldPeriodSaved = p; }
    });
    assert.strictEqual(oldFormVm.totalDays(), 31);
    oldFormVm.startDateInput('2026-09-01');
    oldFormVm.endDateInput('2026-09-30');
    oldFormVm.handleSavePeriod();
    assert.deepStrictEqual(oldPeriodSaved, { start: '2026-09-01', end: '2026-09-30' });

    const oldPageVm = new TrackerOldPageViewModel();
    assert(oldPageVm.dateChipText() !== '', 'Old page computes dateChipText');
    assert(Array.isArray(oldPageVm.missedRows()), 'missedRows is an array');

    console.log('  ✔ Tracker Old: Card, Feed, Form, Page, and 3-level communication verified');

    // ==========================================
    // 4. Tracker Performance Components Verification
    // ==========================================
    const { TrackerPerformanceCardViewModel } = await import(
        path.join(ROOT, 'features', 'tracker', 'tracker-performance', 'tracker-performance-card', 'tracker-performance-card.js')
    );
    const { TrackerPerformanceFeedViewModel } = await import(
        path.join(ROOT, 'features', 'tracker', 'tracker-performance', 'tracker-performance-feed', 'tracker-performance-feed.js')
    );
    const { TrackerPerformancePageViewModel } = await import(
        path.join(ROOT, 'features', 'tracker', 'tracker-performance', 'tracker-performance-page', 'tracker-performance-page.js')
    );

    let perfClicked = null;
    const perfCardVm = new TrackerPerformanceCardViewModel({
        item: { name: 'Fajr', completed: 25, missed: 5, total: 30, percentage: 83 },
        onClick: c => { perfClicked = c; }
    });
    assert.strictEqual(perfCardVm.name, 'Fajr');
    assert.strictEqual(perfCardVm.percentage, 83);
    perfCardVm.handleClick();
    assert.strictEqual(perfClicked.name, 'Fajr');

    let settingsOpened = false;
    const perfFeedVm = new TrackerPerformanceFeedViewModel({
        hero: { percentageText: mockKo.observable('85%') },
        stats: { completed: mockKo.observable(120), missed: mockKo.observable(20) },
        breakdownItems: mockKo.observableArray([perfCardVm]),
        onSettingsClick: () => { settingsOpened = true; }
    });
    perfFeedVm.handleSettingsClick({}, { stopPropagation() {} });
    assert.strictEqual(settingsOpened, true);

    const perfPageVm = new TrackerPerformancePageViewModel();
    perfPageVm.refresh();
    assert(perfPageVm.breakdownItems().length === 5, 'All 5 prayers in breakdown');

    console.log('  ✔ Tracker Performance: Card, Feed, and Page ViewModels verified');

    // ==========================================
    // 4. Tracker History Components Verification
    // ==========================================
    const { TrackerHistoryCardViewModel } = await import(
        path.join(ROOT, 'features', 'tracker', 'tracker-history', 'tracker-history-card', 'tracker-history-card.js')
    );
    const { TrackerHistoryFeedViewModel } = await import(
        path.join(ROOT, 'features', 'tracker', 'tracker-history', 'tracker-history-feed', 'tracker-history-feed.js')
    );
    const { TrackerHistoryPageViewModel } = await import(
        path.join(ROOT, 'features', 'tracker', 'tracker-history', 'tracker-history-page', 'tracker-history-page.js')
    );

    let histDeletedItem = null;
    const histCardVm = new TrackerHistoryCardViewModel({
        item: { id: 'test-1', prayer: 'Fajr', type: 'Current', date: '2026-11-08', timestamp: Date.now() },
        onDelete: item => { histDeletedItem = item; }
    });
    assert.strictEqual(histCardVm.prayer, 'Fajr');
    histCardVm.handleDelete({}, { stopPropagation() {} });
    assert.strictEqual(histDeletedItem.id, 'test-1');

    let feedDeleted = null;
    const histFeedVm = new TrackerHistoryFeedViewModel({
        entries: mockKo.observableArray([histCardVm]),
        onDeleteEntry: item => { feedDeleted = item; }
    });
    assert.strictEqual(histFeedVm.hasEntries(), true);
    histFeedVm.handleDeleteEntry(histCardVm.item, { stopPropagation() {} });
    assert.strictEqual(feedDeleted.id, 'test-1');

    const histPageVm = new TrackerHistoryPageViewModel();
    histPageVm.refresh();
    assert(Array.isArray(histPageVm.historyEntries()));

    console.log('  ✔ Tracker History: Card, Feed, and Page ViewModels verified');

    // ==========================================
    // 5. Registration Verification
    // ==========================================
    const { registerTrackerComponents } = await import(path.join(ROOT, 'features', 'tracker', 'index.js'));
    registerTrackerComponents(mockKo);

    const expectedComponents = [
        'tracker-header',
        'tracker-nav-tab',
        'tracker-page',
        'tracker-current',
        'tracker-current-mobile-view',
        'tracker-current-feed',
        'tracker-current-card',
        'tracker-current-form',
        'tracker-old-home',
        'tracker-old-page',
        'tracker-old-feed',
        'tracker-old-card',
        'tracker-old-form',
        'tracker-performance-page',
        'tracker-performance-feed',
        'tracker-performance-card',
        'tracker-history-page',
        'tracker-history-feed',
        'tracker-history-card',
        // Backward-compatibility aliases
        'prayer-header',
        'prayer-row',
        'prayer-stat-card',
        'prayer-perf-ring',
        'prayer-nav-tab',
        'prayer-history-card'
    ];

    for (const name of expectedComponents) {
        assert(mockKo.components.isRegistered(name), `Component "${name}" must be registered in Knockout`);
    }

    console.log(`  ✔ Tracker Registration: All ${expectedComponents.length} components & aliases registered in ko`);

    // ==========================================
    // 6. Root Tracker ViewModel & Subtab Switching
    // ==========================================
    const { TrackerApp, TrackerPageViewModel } = await import(path.join(ROOT, 'features', 'tracker', 'index.js'));
    assert(TrackerApp, 'TrackerApp export must be defined');

    const trackerRootVm = new TrackerPageViewModel({ prayerStore: mockStore });
    assert.strictEqual(trackerRootVm.currentSubTab(), 'current');
    trackerRootVm.switchTab('performance');
    assert.strictEqual(trackerRootVm.currentSubTab(), 'performance');
    trackerRootVm.switchTab('history');
    assert.strictEqual(trackerRootVm.currentSubTab(), 'history');
    trackerRootVm.switchTab('current');
    assert.strictEqual(trackerRootVm.currentSubTab(), 'current');

    console.log('  ✔ Tracker Root: Subtab navigation and ViewModel bridge verified');

    // ==========================================
    // 7. Regression Tests: rMS() & History Logging Flow
    // ==========================================
    let sheet2Shown = false;
    let sheet2Config = null;
    globalThis.sheet2BS = {
        show(cfg) { sheet2Shown = true; sheet2Config = cfg; },
        hide() { sheet2Shown = false; }
    };
    const { rMS } = await import(path.join(ROOT, 'features', 'tracker', 'index.js'));
    assert(typeof rMS === 'function', 'rMS must be a function');
    rMS();
    assert.strictEqual(sheet2Shown, true, 'rMS() must invoke sheet2BS.show');
    assert.strictEqual(sheet2Config.title, 'Missed Prayers');

    // Verify PrayerStore -> History Logging Flow
    const { PrayerStore } = await import(path.join(ROOT, 'services', 'prayer-store.js'));
    globalThis.PrayerStore = PrayerStore;
    clearPrayerHistory();
    PrayerStore.selectedDate('2026-11-08');
    PrayerStore.setPrayerStatus('Fajr', '2026-11-08', true); // mark Fajr as Done
    const updatedHistory = getPrayerHistory();
    assert.strictEqual(updatedHistory.length, 1, 'Marking Fajr as Done must record 1 history entry');
    assert.strictEqual(updatedHistory[0].prayer, 'Fajr');
    assert.strictEqual(updatedHistory[0].type, 'Current');

    // Unmarking Fajr (marking as Missed)
    PrayerStore.setPrayerStatus('Fajr', '2026-11-08', false);
    assert.strictEqual(getPrayerHistory().length, 0, 'Marking Fajr as Missed must remove the history entry');
    delete globalThis.sheet2BS;
    delete globalThis.PrayerStore;
    console.log('  ✔ Regression: Current Kal Missing sheet and History Logging flow verified');
}
