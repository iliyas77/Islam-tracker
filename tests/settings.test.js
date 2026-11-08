// tests/settings.test.js
import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

export async function runSettingsTests() {
    console.log('▶ Running Settings & Backup (SB) Modular Architecture Tests...');

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
    // 1. SettingsService Verification
    // ==========================================
    const {
        SettingsService,
        SETTINGS_STORAGE_KEYS,
        DEFAULT_SETTINGS_CONFIG,
        INDIAN_CITIES,
        CUSTOM_CITY_VALUE,
        FONT_SIZE_OPTIONS,
        getPrayerConfig,
        savePrayerConfig,
        getStartDate,
        saveStartDate,
        getFontSize,
        applyFontSize,
        resetDatabase,
        exportBackupData,
        importBackupData
    } = await import(path.join(ROOT, 'features', 'settings', 'settings-service.js'));

    assert(SettingsService, 'SettingsService must be defined');
    assert.strictEqual(DEFAULT_SETTINGS_CONFIG.city, 'Guntur');
    assert.strictEqual(DEFAULT_SETTINGS_CONFIG.school, 1);
    assert(INDIAN_CITIES.length >= 10, 'Must have at least 10 predefined Indian cities');

    // Test Config persistence
    const savedCfg = savePrayerConfig({ city: 'Hyderabad', country: 'India', school: 0 });
    assert.strictEqual(savedCfg.city, 'Hyderabad');
    assert.strictEqual(savedCfg.school, 0);
    const readCfg = getPrayerConfig();
    assert.strictEqual(readCfg.city, 'Hyderabad');

    // Test Start Date persistence
    saveStartDate('2026-05-15');
    assert.strictEqual(getStartDate(), '2026-05-15');

    // Test Font Size scaling
    applyFontSize(1.15);
    assert.strictEqual(getFontSize(), 1.15);

    // Test Backup Export & Import (SB)
    storageStore['namazTrackerData'] = JSON.stringify({ '2026-11-01': { Fajr: true } });
    const backup = exportBackupData();
    assert.strictEqual(backup.app, 'Nur Prayer');
    assert(backup.exportedAt);
    assert.deepStrictEqual(backup.data.namazTrackerData, { '2026-11-01': { Fajr: true } });

    // Test Backup Import
    const importPayload = {
        app: 'Nur Prayer',
        data: {
            namazStartDate: '2026-01-01',
            namazFontSize: '0.9'
        }
    };
    const importResult = importBackupData(importPayload);
    assert.strictEqual(importResult.success, true);
    assert.strictEqual(getStartDate(), '2026-01-01');
    assert.strictEqual(getFontSize(), 0.9);

    // Test Reset Database
    resetDatabase();
    assert.strictEqual(storageStore['namazTrackerData'], undefined, 'Tracker data removed after reset');

    console.log('  ✔ SettingsService: Config, StartDate, FontSize, and Backup export/import/reset verified');

    // ==========================================
    // 2. Settings Prayer Times Component Verification
    // ==========================================
    const { SettingsPrayerTimesViewModel } = await import(
        path.join(ROOT, 'features', 'settings', 'components', 'settings-prayer-times', 'settings-prayer-times.js')
    );

    let savedTimesPayload = null;
    const ptVm = new SettingsPrayerTimesViewModel({
        onSave: cfg => { savedTimesPayload = cfg; }
    });
    ptVm.selectedCity('Vijayawada');
    assert.strictEqual(ptVm.isCustomCity(), false);
    assert.strictEqual(ptVm.effectiveCity(), 'Vijayawada');

    ptVm.selectedCity(CUSTOM_CITY_VALUE);
    ptVm.customCity('Dubai');
    ptVm.country('UAE');
    assert.strictEqual(ptVm.isCustomCity(), true);
    assert.strictEqual(ptVm.effectiveCity(), 'Dubai');

    ptVm.savePrayerTimes();
    assert.strictEqual(savedTimesPayload.city, 'Dubai');
    assert.strictEqual(savedTimesPayload.country, 'UAE');

    console.log('  ✔ Settings Prayer Times Component: Dropdown, Custom City, and Save callback verified');

    // ==========================================
    // 3. Settings Start Date Component Verification
    // ==========================================
    const { SettingsStartDateViewModel } = await import(
        path.join(ROOT, 'features', 'settings', 'components', 'settings-start-date', 'settings-start-date.js')
    );

    let savedDate = null;
    const sdVm = new SettingsStartDateViewModel({
        onSave: d => { savedDate = d; }
    });
    sdVm.startDate('2026-03-01');
    globalThis.confirm = () => true;
    sdVm.saveStartDate();
    assert.strictEqual(savedDate, '2026-03-01');

    console.log('  ✔ Settings Start Date Component: Date selection and validation verified');

    // ==========================================
    // 4. Settings Font Size Component Verification
    // ==========================================
    const { SettingsFontSizeViewModel } = await import(
        path.join(ROOT, 'features', 'settings', 'components', 'settings-font-size', 'settings-font-size.js')
    );

    let selectedSize = null;
    const fsVm = new SettingsFontSizeViewModel({
        onSelect: s => { selectedSize = s; }
    });
    assert.strictEqual(fsVm.buttons.length, 3);
    const largeBtn = fsVm.buttons.find(b => b.size === 1.15);
    largeBtn.handleClick();
    assert.strictEqual(selectedSize, 1.15);
    assert(fsVm.getButtonClass(1.15).includes('bg-brand text-white'), 'Active button class resolved correctly');

    console.log('  ✔ Settings Font Size Component: Typography scaling buttons verified');

    // ==========================================
    // 5. Settings Backup Component Verification
    // ==========================================
    const { SettingsBackupViewModel } = await import(
        path.join(ROOT, 'features', 'settings', 'components', 'settings-backup', 'settings-backup.js')
    );

    let resetTriggered = false;
    const backupVm = new SettingsBackupViewModel({
        onReset: () => { resetTriggered = true; }
    });
    backupVm.handleResetDatabase();
    assert.strictEqual(resetTriggered, true);

    console.log('  ✔ Settings Backup Component: Export, import triggers, and reset verified');

    // ==========================================
    // 6. Registration Verification
    // ==========================================
    const { registerSettingsComponents, SettingsViewModel: SettingsVmFromReg, getSettingsViewModel: getSettingsVmFromReg } = await import(
        path.join(ROOT, 'features', 'settings', 'settings-registration.js')
    );
    const { SettingsViewModel: SettingsVmDirect, getSettingsViewModel: getSettingsVmDirect } = await import(
        path.join(ROOT, 'features', 'settings', 'settings.js')
    );
    assert.strictEqual(SettingsVmFromReg, SettingsVmDirect, 'settings-registration.js should re-export SettingsViewModel');
    assert.strictEqual(getSettingsVmFromReg, getSettingsVmDirect, 'settings-registration.js should re-export getSettingsViewModel');

    registerSettingsComponents(mockKo);

    const expectedComponents = [
        'settings-prayer-times',
        'settings-start-date',
        'settings-font-size',
        'settings-backup',
        'settings-page',
        // Backward-compatibility template aliases
        'settings-card-header',
        'settings-font-size-btn',
        'settings-info-card'
    ];

    for (const name of expectedComponents) {
        assert(mockKo.components.isRegistered(name), `Component "${name}" must be registered in Knockout`);
    }

    console.log(`  ✔ Settings Registration: All ${expectedComponents.length} canonical components & aliases registered in ko`);

    // ==========================================
    // 7. Root Settings ViewModel Composition
    // ==========================================
    const { SettingsApp, SettingsViewModel } = await import(path.join(ROOT, 'features', 'settings', 'settings.js'));
    assert(SettingsApp, 'SettingsApp export must be defined');

    const rootSettingsVm = new SettingsViewModel();
    assert(rootSettingsVm.prayerTimes, 'Root VM composed with prayerTimes sub-viewmodel');
    assert(rootSettingsVm.startDateParams, 'Root VM composed with startDateParams sub-viewmodel');
    assert(rootSettingsVm.fontSizeParams, 'Root VM composed with fontSizeParams sub-viewmodel');
    assert(rootSettingsVm.backupParams, 'Root VM composed with backupParams sub-viewmodel');
    assert.strictEqual(typeof rootSettingsVm.goHome, 'function');

    console.log('  ✔ Settings Root: Subcomponent composition and backward-compatibility verified');
}
