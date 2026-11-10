/* ============================================================
   Nur Prayer — Settings Service & Business Logic Layer
   Path: features/settings/settings-service.js
   Responsibilities:
     - Pure business logic layer for application settings
     - Prayer configuration (City, Country, School, Method)
     - Start date persistence
     - Font size scaling and root styling
     - Storage & Backup (JSON export, import, database reset)
     - Zero direct DOM manipulation in business methods
   ============================================================ */
'use strict';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export var SETTINGS_STORAGE_KEYS = {
    CONFIG: 'namazPrayerConfig',
    START_DATE: 'namazStartDate',
    FONT_SIZE: 'namazFontSize',
    TIMINGS_CACHE: 'namazPrayerTimingsCache',
    TRACKER_DATA: 'namazTrackerData',
    OLD_DATA: 'namazOldData',
    OLD_PERIOD: 'namazOldPeriod',
    HISTORY: 'namazPrayerHistory',
    TASBEEH: 'tasbeeh_items',
    DUAS_PINS: 'quran_duas_pins',
    DUAS_FAVS: 'quran_duas_favs',
    QURAN_BOOKMARKS: 'quran_bookmarks'
};

export var DEFAULT_SETTINGS_CONFIG = {
    city: 'Guntur',
    country: 'India',
    school: 1,
    method: 1
};

export var INDIAN_CITIES = [
    { name: 'Guntur', state: 'AP' },
    { name: 'Vijayawada', state: 'AP' },
    { name: 'Hyderabad', state: 'Telangana' },
    { name: 'Tenali', state: 'AP' },
    { name: 'Visakhapatnam', state: 'AP' },
    { name: 'Tirupati', state: 'AP' },
    { name: 'Kurnool', state: 'AP' },
    { name: 'Bengaluru', state: 'Karnataka' },
    { name: 'Chennai', state: 'Tamil Nadu' },
    { name: 'Mumbai', state: 'Maharashtra' },
    { name: 'Delhi', state: 'Delhi' },
    { name: 'Kolkata', state: 'West Bengal' }
];

export var CUSTOM_CITY_VALUE = '__custom__';

export var FONT_SIZE_OPTIONS = [
    { value: 0.9, label: 'Small', key: 'small' },
    { value: 1.0, label: 'Medium', key: 'medium' },
    { value: 1.15, label: 'Large', key: 'large' }
];

export var JURISTIC_SCHOOLS = [
    { value: '1', label: 'Hanafi (Standard in South Asia)' },
    { value: '0', label: 'Shafi / Maliki / Hanbali' }
];

/* ---------- Helper Functions ---------- */
export function unwrap(val, def) {
    var res = (typeof val === 'function') ? val() : val;
    return (res !== undefined && res !== null) ? res : def;
}

export function getPrayerConfig() {
    try {
        var raw = _win.localStorage ? _win.localStorage.getItem(SETTINGS_STORAGE_KEYS.CONFIG) : null;
        if (raw) {
            var parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                return Object.assign({}, DEFAULT_SETTINGS_CONFIG, parsed);
            }
        }
    } catch (_) {}
    return Object.assign({}, DEFAULT_SETTINGS_CONFIG);
}

export function savePrayerConfig(cfg) {
    if (!cfg || typeof cfg !== 'object') return;
    var merged = Object.assign(getPrayerConfig(), cfg);
    try {
        if (_win.localStorage) {
            _win.localStorage.setItem(SETTINGS_STORAGE_KEYS.CONFIG, JSON.stringify(merged));
            _win.localStorage.removeItem(SETTINGS_STORAGE_KEYS.TIMINGS_CACHE);
        }
    } catch (_) {}
    if (_win.SettingsStore && typeof _win.SettingsStore.sync === 'function') {
        _win.SettingsStore.sync();
    }
    return merged;
}

export function getStartDate() {
    try {
        var raw = _win.localStorage ? _win.localStorage.getItem(SETTINGS_STORAGE_KEYS.START_DATE) : null;
        if (raw) return raw;
    } catch (_) {}
    return (typeof _win.td === 'function' ? _win.td() : new Date().toISOString().slice(0, 10));
}

export function saveStartDate(dateStr) {
    if (!dateStr) return;
    try {
        if (_win.localStorage) {
            _win.localStorage.setItem(SETTINGS_STORAGE_KEYS.START_DATE, dateStr);
        }
    } catch (_) {}
    if (_win.SettingsStore && typeof _win.SettingsStore.sync === 'function') {
        _win.SettingsStore.sync();
    }
    return dateStr;
}

export function getFontSize() {
    try {
        var raw = _win.localStorage ? _win.localStorage.getItem(SETTINGS_STORAGE_KEYS.FONT_SIZE) : null;
        if (raw) {
            var n = parseFloat(raw);
            if (!isNaN(n) && n > 0) return n;
        }
    } catch (_) {}
    return 1.0;
}

export function applyFontSize(size) {
    var val = parseFloat(size);
    if (isNaN(val) || val <= 0) val = 1.0;
    try {
        if (_win.localStorage) {
            _win.localStorage.setItem(SETTINGS_STORAGE_KEYS.FONT_SIZE, String(val));
        }
    } catch (_) {}
    if (_win.document && _win.document.documentElement) {
        _win.document.documentElement.style.fontSize = (val * 16) + 'px';
    }
    return val;
}

export function resetDatabase() {
    try {
        if (_win.localStorage) {
            _win.localStorage.removeItem(SETTINGS_STORAGE_KEYS.TRACKER_DATA);
            _win.localStorage.removeItem(SETTINGS_STORAGE_KEYS.OLD_DATA);
            _win.localStorage.removeItem(SETTINGS_STORAGE_KEYS.OLD_PERIOD);
            _win.localStorage.removeItem(SETTINGS_STORAGE_KEYS.HISTORY);
            _win.localStorage.removeItem(SETTINGS_STORAGE_KEYS.TIMINGS_CACHE);
        }
    } catch (_) {}

    var todayStr = (typeof _win.td === 'function' ? _win.td() : new Date().toISOString().slice(0, 10));
    saveStartDate(todayStr);

    if (_win.PrayerStore && typeof _win.PrayerStore.sync === 'function') {
        _win.PrayerStore.sync();
    }
    if (_win.SettingsStore && typeof _win.SettingsStore.sync === 'function') {
        _win.SettingsStore.sync();
    }
}

export function exportBackupData() {
    var backup = {
        app: 'Nur Prayer',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        data: {}
    };

    if (_win.localStorage) {
        Object.keys(SETTINGS_STORAGE_KEYS).forEach(function (k) {
            var key = SETTINGS_STORAGE_KEYS[k];
            var val = _win.localStorage.getItem(key);
            if (val !== null) {
                try {
                    backup.data[key] = JSON.parse(val);
                } catch (_) {
                    backup.data[key] = val;
                }
            }
        });
    }

    return backup;
}

export function importBackupData(jsonOrObj) {
    var payload = jsonOrObj;
    if (typeof jsonOrObj === 'string') {
        try {
            payload = JSON.parse(jsonOrObj);
        } catch (e) {
            return { success: false, message: 'Invalid JSON format' };
        }
    }

    if (!payload || typeof payload !== 'object' || !payload.data) {
        return { success: false, message: 'Invalid backup structure' };
    }

    try {
        if (_win.localStorage) {
            Object.keys(payload.data).forEach(function (key) {
                var val = payload.data[key];
                if (typeof val === 'object' && val !== null) {
                    _win.localStorage.setItem(key, JSON.stringify(val));
                } else if (val !== undefined && val !== null) {
                    _win.localStorage.setItem(key, String(val));
                }
            });
        }

        if (_win.PrayerStore && typeof _win.PrayerStore.sync === 'function') _win.PrayerStore.sync();
        if (_win.SettingsStore && typeof _win.SettingsStore.sync === 'function') _win.SettingsStore.sync();
        if (_win.TasbeehStore && typeof _win.TasbeehStore.sync === 'function') _win.TasbeehStore.sync();
        if (_win.DuasStore && typeof _win.DuasStore.sync === 'function') _win.DuasStore.sync();

        return { success: true, message: 'Backup restored successfully' };
    } catch (err) {
        return { success: false, message: err.message || 'Error restoring backup' };
    }
}

export const SettingsService = {
    SETTINGS_STORAGE_KEYS: SETTINGS_STORAGE_KEYS,
    DEFAULT_SETTINGS_CONFIG: DEFAULT_SETTINGS_CONFIG,
    INDIAN_CITIES: INDIAN_CITIES,
    CUSTOM_CITY_VALUE: CUSTOM_CITY_VALUE,
    FONT_SIZE_OPTIONS: FONT_SIZE_OPTIONS,
    JURISTIC_SCHOOLS: JURISTIC_SCHOOLS,
    unwrap: unwrap,
    getPrayerConfig: getPrayerConfig,
    savePrayerConfig: savePrayerConfig,
    getStartDate: getStartDate,
    saveStartDate: saveStartDate,
    getFontSize: getFontSize,
    applyFontSize: applyFontSize,
    resetDatabase: resetDatabase,
    exportBackupData: exportBackupData,
    importBackupData: importBackupData
};

export default SettingsService;

