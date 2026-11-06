/* ============================================================
   Nur Prayer — Reactive Settings Store / Service
   Path: services/settings-store.js
   Responsibilities:
     - Centralized Knockout reactive store for Application Settings
     - Observables: selectedCity, customCity, country, school, method,
       startDate, fontScale, isCustomCity, effectiveCity
     - Persistent synchronization with localStorage
     - Seamless integration with SettingsViewModel and PrayerStore
   ============================================================ */
'use strict';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

function createObservable(initial) {
    if (_ko && typeof _ko.observable === 'function') {
        return _ko.observable(initial);
    }
    var val = initial;
    function obs(newVal) {
        if (arguments.length > 0) {
            val = newVal;
            return obs;
        }
        return val;
    }
    obs.__isObservable = true;
    return obs;
}

function createComputed(fn) {
    var readFn = typeof fn === 'function' ? fn : (fn && fn.read);
    var writeFn = (fn && typeof fn.write === 'function') ? fn.write : function () {};
    if (_ko && typeof _ko.pureComputed === 'function') {
        try {
            return _ko.pureComputed({ read: readFn, write: writeFn });
        } catch (_) {
            return _ko.pureComputed(readFn);
        }
    }
    if (_ko && typeof _ko.computed === 'function') {
        try {
            return _ko.computed({ read: readFn, write: writeFn });
        } catch (_) {
            return _ko.computed(readFn);
        }
    }
    var comp = function (val) {
        if (arguments.length > 0) {
            writeFn(val);
            return comp;
        }
        return readFn ? readFn() : undefined;
    };
    comp.__isComputed = true;
    return comp;
}

function SettingsStoreModel() {
    var self = this;

    var CONSTANTS = _win.CONSTANTS || {};
    var SETTINGS_CONSTANTS = (_win.SETTINGS_CONSTANTS || CONSTANTS.SETTINGS) || {};
    var PRAYER_CONSTANTS = (_win.PRAYER_CONSTANTS || CONSTANTS.PRAYER) || {};
    var STORAGE_KEYS = PRAYER_CONSTANTS.STORAGE_KEYS || {};

    self.CONFIG_KEY = STORAGE_KEYS.CONFIG || _win.PTK_CONFIG || 'namazPrayerConfig';
    self.START_DATE_KEY = STORAGE_KEYS.START_DATE || _win.SDK || 'namazStartDate';
    self.FONT_KEY = SETTINGS_CONSTANTS.STORAGE_KEYS ? SETTINGS_CONSTANTS.STORAGE_KEYS.FONT_SIZE : 'namazFontSize';

    var DEFAULT_CONFIG = {
        city: 'Guntur',
        country: 'India',
        school: 1,
        method: 1
    };

    function readStoredConfig() {
        try {
            var raw = _win.localStorage ? _win.localStorage.getItem(self.CONFIG_KEY) : null;
            if (raw) {
                var parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    return Object.assign({}, DEFAULT_CONFIG, parsed);
                }
            }
        } catch (_) {}
        if (typeof _win.getPrayerConfig === 'function') {
            return _win.getPrayerConfig();
        }
        return Object.assign({}, DEFAULT_CONFIG);
    }

    function readStoredStartDate() {
        try {
            var raw = _win.localStorage ? _win.localStorage.getItem(self.START_DATE_KEY) : null;
            if (raw) return raw;
        } catch (_) {}
        return (typeof _win.td === 'function' ? _win.td() : new Date().toISOString().split('T')[0]);
    }

    function readStoredFontScale() {
        try {
            var raw = _win.localStorage ? _win.localStorage.getItem(self.FONT_KEY) : null;
            if (raw) {
                var n = parseFloat(raw);
                if (!isNaN(n) && n > 0) return n;
            }
        } catch (_) {}
        return 1;
    }

    var initialConfig = readStoredConfig();
    var knownCities = ['Guntur', 'Vijayawada', 'Hyderabad', 'Tenali', 'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata'];
    var isInitCustom = initialConfig.city && knownCities.indexOf(initialConfig.city) === -1;

    // 1. Reactive Observables
    self.selectedCity = createObservable(isInitCustom ? '__custom__' : (initialConfig.city || 'Guntur'));
    self.customCity = createObservable(isInitCustom ? initialConfig.city : '');
    self.country = createObservable(initialConfig.country || 'India');
    self.school = createObservable(typeof initialConfig.school === 'number' ? initialConfig.school : 1);
    self.method = createObservable(typeof initialConfig.method === 'number' ? initialConfig.method : 1);
    self.startDate = createObservable(readStoredStartDate());
    self.fontScale = createObservable(readStoredFontScale());

    // 2. Pure Computeds
    self.isCustomCity = createComputed(function () {
        return self.selectedCity() === '__custom__';
    });

    self.effectiveCity = createComputed(function () {
        return self.isCustomCity() ? (self.customCity() || '').trim() : self.selectedCity();
    });

    self.config = createComputed(function () {
        return {
            city: self.effectiveCity(),
            country: (self.country() || '').trim() || 'India',
            school: parseInt(self.school(), 10) || 1,
            method: parseInt(self.method(), 10) || 1
        };
    });

    function persistConfig() {
        if (_win.localStorage) {
            try {
                _win.localStorage.setItem(self.CONFIG_KEY, JSON.stringify(self.config()));
            } catch (_) {}
        }
    }

    // 3. Automated Reactive Persistence via .subscribe()
    if (typeof self.selectedCity.subscribe === 'function') self.selectedCity.subscribe(persistConfig);
    if (typeof self.customCity.subscribe === 'function') self.customCity.subscribe(persistConfig);
    if (typeof self.country.subscribe === 'function') self.country.subscribe(persistConfig);
    if (typeof self.school.subscribe === 'function') self.school.subscribe(persistConfig);
    if (typeof self.method.subscribe === 'function') self.method.subscribe(persistConfig);

    if (typeof self.config.subscribe === 'function') {
        self.config.subscribe(function (cfg) {
            if (_win.localStorage && cfg) {
                try {
                    _win.localStorage.setItem(self.CONFIG_KEY, JSON.stringify(cfg));
                } catch (_) {}
            }
        });
    }

    if (typeof self.startDate.subscribe === 'function') {
        self.startDate.subscribe(function (d) {
            if (_win.localStorage && d) {
                try {
                    _win.localStorage.setItem(self.START_DATE_KEY, d);
                } catch (_) {}
            }
        });
    }

    if (typeof self.fontScale.subscribe === 'function') {
        self.fontScale.subscribe(function (scale) {
            if (_win.localStorage && scale) {
                try {
                    _win.localStorage.setItem(self.FONT_KEY, String(scale));
                } catch (_) {}
            }
            if (_win.document && _win.document.documentElement) {
                _win.document.documentElement.style.fontSize = (scale * 16) + 'px';
            }
        });
    }

    // 4. Action Methods
    self.savePrayerConfig = function (cfg) {
        if (!cfg) return;
        if (cfg.city) {
            if (knownCities.indexOf(cfg.city) !== -1) {
                self.selectedCity(cfg.city);
                self.customCity('');
            } else {
                self.selectedCity('__custom__');
                self.customCity(cfg.city);
            }
        }
        if (cfg.country) self.country(cfg.country);
        if (typeof cfg.school !== 'undefined') self.school(parseInt(cfg.school, 10));
        if (typeof cfg.method !== 'undefined') self.method(parseInt(cfg.method, 10));

        // Invalidate timing cache and re-fetch if available
        if (_win.localStorage && _win.PTK_CACHE) {
            try { _win.localStorage.removeItem(_win.PTK_CACHE); } catch (_) {}
        }
        if (typeof _win.fetchPrayerTimings === 'function') {
            var curDate = typeof _win.td === 'function' ? _win.td() : (self.startDate() || '');
            _win.fetchPrayerTimings(curDate, function () {
                if (typeof _win.rn === 'function') _win.rn();
                if (typeof _win.updateTimelinePrayerStatuses === 'function') _win.updateTimelinePrayerStatuses();
            });
        }
    };

    self.saveStartDate = function (newDate) {
        if (!newDate) return;
        self.startDate(newDate);
        if (typeof _win.renderPerformanceTab === 'function') {
            _win.renderPerformanceTab();
        }
    };

    self.setFontScale = function (scale) {
        var n = parseFloat(scale);
        if (!isNaN(n) && n > 0) {
            self.fontScale(n);
        }
    };

    self.sync = function () {
        var cfg = readStoredConfig();
        var custom = cfg.city && knownCities.indexOf(cfg.city) === -1;
        self.selectedCity(custom ? '__custom__' : (cfg.city || 'Guntur'));
        self.customCity(custom ? cfg.city : '');
        self.country(cfg.country || 'India');
        self.school(typeof cfg.school === 'number' ? cfg.school : 1);
        self.method(typeof cfg.method === 'number' ? cfg.method : 1);
        self.startDate(readStoredStartDate());
        self.fontScale(readStoredFontScale());
    };
}

export const SettingsStore = new SettingsStoreModel();

if (typeof window !== 'undefined') {
    window.SettingsStore = SettingsStore;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SettingsStore: SettingsStore };
}
