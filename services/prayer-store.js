/* ============================================================
   Nur Prayer — Reactive Prayer Store / Service
   Path: services/prayer-store.js
   Responsibilities:
     - Centralized Knockout reactive store for Prayer Tracking
     - Observables: selectedDate, trackerRecords, missedCount,
       prayerTimings, prayerTimingsStatus, prayerConfig, oldPeriod
     - Persistent synchronization with localStorage
     - Seamless integration with TrackerPageViewModel and Dashboard
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

function createObservableArray(initial) {
    if (_ko && typeof _ko.observableArray === 'function') {
        return _ko.observableArray(initial);
    }
    var arr = Array.isArray(initial) ? initial.slice() : [];
    function obs(newVal) {
        if (arguments.length > 0) {
            arr = newVal;
            return obs;
        }
        return arr;
    }
    obs.__isObservable = true;
    obs.push = function () { return arr.push.apply(arr, arguments); };
    return obs;
}

function createComputed(fn) {
    if (_ko && typeof _ko.computed === 'function') {
        return _ko.computed(fn);
    }
    return function () { return fn(); };
}

function PrayerStoreModel() {
    var self = this;

    // 1. Reference constants & keys
    var CONSTANTS = _win.CONSTANTS || {};
    var PRAYER_CONSTANTS = (_win.PRAYER_CONSTANTS || CONSTANTS.PRAYER) || {};
    var STORAGE_KEYS = PRAYER_CONSTANTS.STORAGE_KEYS || {};

    self.K = STORAGE_KEYS.TRACKER_DATA || _win.K || 'namazTrackerData';
    self.OK = STORAGE_KEYS.OLD_PERIOD || _win.OK || 'namazOldPeriod';
    self.OCK = STORAGE_KEYS.OLD_DATA || _win.OCK || 'namazOldData';
    self.PHK = STORAGE_KEYS.HISTORY || _win.PHK || 'namazPrayerHistory';
    self.PTK_CACHE = STORAGE_KEYS.TIMINGS_CACHE || _win.PTK_CACHE || 'namazPrayerTimingsCache';
    self.CONFIG_KEY = STORAGE_KEYS.CONFIG || 'namazPrayerConfig';
    self.START_DATE_KEY = STORAGE_KEYS.START_DATE || _win.SDK || 'namazStartDate';

    // 2. Helper methods for initial storage load
    function getToday() {
        return typeof _win.td === 'function' ? _win.td() : new Date().toISOString().split('T')[0];
    }

    function readStoredRecords() {
        if (typeof _win.rdK === 'function') return _win.rdK() || {};
        try {
            var raw = _win.localStorage ? _win.localStorage.getItem(self.K) : null;
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function readStoredOldPeriod() {
        if (typeof _win.rdOK === 'function') return _win.rdOK();
        try {
            var raw = _win.localStorage ? _win.localStorage.getItem(self.OK) : null;
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function readStoredOldRecords() {
        if (typeof _win.rdOC === 'function') return _win.rdOC() || {};
        try {
            var raw = _win.localStorage ? _win.localStorage.getItem(self.OCK) : null;
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function readStoredHistory() {
        if (typeof _win.rdPH === 'function') return _win.rdPH() || [];
        try {
            var raw = _win.localStorage ? _win.localStorage.getItem(self.PHK) : null;
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function readStoredTimings() {
        if (typeof _win.rdTC === 'function') return _win.rdTC();
        try {
            var raw = _win.localStorage ? _win.localStorage.getItem(self.PTK_CACHE) : null;
            if (raw) {
                var parsed = JSON.parse(raw);
                var today = getToday();
                if (parsed && parsed.date === today && parsed.timings) return parsed.timings;
            }
        } catch (e) {}
        return (_win.T || (PRAYER_CONSTANTS.DEFAULT_TIMINGS || {}));
    }

    function computeMissedCount() {
        if (typeof _win.getConsolidatedMissedCount === 'function') return _win.getConsolidatedMissedCount();
        if (typeof _win.tMT === 'function') return _win.tMT();
        return 0;
    }

    function readConfig() {
        if (typeof _win.getPrayerConfig === 'function') return _win.getPrayerConfig();
        return { city: 'Guntur', country: 'India', school: 1 };
    }

    // 3. Reactive Observables
    var initialToday = getToday();
    var initialDate = _win.sd || initialToday;

    self.selectedDate = createObservable(initialDate);
    self.today = createObservable(initialToday);
    self.isToday = createComputed(function () {
        return self.selectedDate() === self.today();
    });
    self.formattedDate = createComputed(function () {
        var d = self.selectedDate();
        return typeof _win.fr === 'function' ? _win.fr(d) : d;
    });

    self.trackerRecords = createObservable(readStoredRecords());
    self.missedCount = createObservable(computeMissedCount());
    self.hasMissed = createComputed(function () {
        return self.missedCount() > 0;
    });

    self.prayerTimings = createObservable(readStoredTimings());
    self.prayerTimingsStatus = createObservable(_win.prayerTimingsStatus || 'offline');
    self.prayerConfig = createObservable(readConfig());

    self.oldPeriod = createObservable(readStoredOldPeriod());
    self.oldRecords = createObservable(readStoredOldRecords());
    self.historyEntries = createObservableArray(readStoredHistory());

    self.currentDayRecord = createComputed(function () {
        var recs = self.trackerRecords() || {};
        var d = self.selectedDate();
        return recs[d] || {};
    });

    // 4. Action Methods
    self.selectDate = function (dateStr) {
        if (!dateStr) return;
        self.selectedDate(dateStr);
        if (typeof _win !== 'undefined') {
            _win.sd = dateStr;
        }
        if (typeof _win.rn === 'function') {
            _win.rn();
        }
    };

    self.jumpToToday = function () {
        self.selectDate(self.today());
    };

    self.getRecord = function (dateStr) {
        var d = dateStr || self.selectedDate();
        var recs = self.trackerRecords() || {};
        return recs[d] || {};
    };

    self.setPrayerStatus = function (prayerName, dateStr, isDone) {
        var d = dateStr || self.selectedDate();
        var recs = Object.assign({}, self.trackerRecords() || {});
        var dayRec = Object.assign({}, recs[d] || {});

        var wasDone = dayRec[prayerName] === false;
        // In Islam Tracker, false means completed/done, true means missed
        dayRec[prayerName] = isDone ? false : true;
        recs[d] = dayRec;

        // Persist
        self.trackerRecords(recs);
        if (_win.localStorage) {
            try {
                _win.localStorage.setItem(self.K, JSON.stringify(recs));
            } catch (e) {}
        }

        // History entry
        if (isDone && !wasDone) {
            if (typeof _win.addPrayerHistoryEntry === 'function') {
                _win.addPrayerHistoryEntry(prayerName, 'Current', d);
            }
        } else if (!isDone && wasDone) {
            if (typeof _win.removePrayerHistoryEntry === 'function') {
                _win.removePrayerHistoryEntry(prayerName, 'Current', d);
            }
        }

        // Update missed count
        self.missedCount(computeMissedCount());

        if (typeof _win.updatePerformanceTab === 'function') {
            _win.updatePerformanceTab();
        }
        if (typeof _win.rn === 'function') {
            _win.rn();
        }
    };

    self.togglePrayerStatus = function (prayerName, dateStr) {
        var d = dateStr || self.selectedDate();
        var rec = self.getRecord(d);
        var wasDone = typeof _win.isDonePrayer === 'function'
            ? _win.isDonePrayer(prayerName, d, rec)
            : (rec[prayerName] === false);
        var isDone = !wasDone;
        self.setPrayerStatus(prayerName, d, isDone);
    };

    self.selectAll = function (dateStr, markDone) {
        var d = dateStr || self.selectedDate();
        var recs = Object.assign({}, self.trackerRecords() || {});
        var dayRec = Object.assign({}, recs[d] || {});
        var prayers = PRAYER_CONSTANTS.NAMES || _win.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

        prayers.forEach(function (p) {
            var wasDone = dayRec[p] === false;
            dayRec[p] = markDone ? false : true;
            if (markDone && !wasDone) {
                if (typeof _win.addPrayerHistoryEntry === 'function') _win.addPrayerHistoryEntry(p, 'Current', d);
            } else if (!markDone && wasDone) {
                if (typeof _win.removePrayerHistoryEntry === 'function') _win.removePrayerHistoryEntry(p, 'Current', d);
            }
        });

        recs[d] = dayRec;
        self.trackerRecords(recs);
        if (_win.localStorage) {
            try {
                _win.localStorage.setItem(self.K, JSON.stringify(recs));
            } catch (e) {}
        }
        self.missedCount(computeMissedCount());

        if (typeof _win.updatePerformanceTab === 'function') _win.updatePerformanceTab();
        if (typeof _win.rn === 'function') _win.rn();
    };

    self.setTimings = function (timings, status) {
        if (timings) self.prayerTimings(timings);
        if (status) self.prayerTimingsStatus(status);
    };

    self.sync = function () {
        self.today(getToday());
        if (_win.sd) self.selectedDate(_win.sd);
        self.trackerRecords(readStoredRecords());
        self.missedCount(computeMissedCount());
        self.oldPeriod(readStoredOldPeriod());
        self.oldRecords(readStoredOldRecords());
        self.historyEntries(readStoredHistory());
        self.prayerConfig(readConfig());
    };
}

export const PrayerStore = new PrayerStoreModel();

if (typeof window !== 'undefined') {
    window.PrayerStore = PrayerStore;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PrayerStore: PrayerStore };
}

