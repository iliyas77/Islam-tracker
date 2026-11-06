/* ============================================================
   Nur Prayer — Reactive Prayer Store / Service
   Path: services/prayer-store.js
   Responsibilities:
     - Centralized Knockout reactive store for Prayer Tracking
     - Observables & pure computeds: selectedDate, today, timings,
       activePrayer, trackerRecords, missedCount, streakDays,
       hasMissed, prayerTimingsStatus, prayerConfig, oldPeriod,
       oldRecords, historyEntries
     - Persistent synchronization with localStorage via .subscribe()
     - Seamless integration with TrackerPageViewModel and Dashboard
     - Safe backward-compatibility bridges for legacy globals (sd, T, P)
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

    self.prayers = PRAYER_CONSTANTS.NAMES || _win.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    // 2. Helper methods for initial storage load
    function getTodayStr() {
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
                var today = getTodayStr();
                if (parsed && parsed.date === today && parsed.timings) return parsed.timings;
            }
        } catch (e) {}
        return (_win.T || (PRAYER_CONSTANTS.DEFAULT_TIMINGS || {}));
    }

    function readConfig() {
        if (typeof _win.getPrayerConfig === 'function') return _win.getPrayerConfig();
        return { city: 'Guntur', country: 'India', school: 1 };
    }

    // 3. Reactive Observables & Pure Computeds
    var initialToday = getTodayStr();
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
    self.oldPeriod = createObservable(readStoredOldPeriod());
    self.oldRecords = createObservable(readStoredOldRecords());
    self.historyEntries = createObservableArray(readStoredHistory());

    self.prayerTimings = createObservable(readStoredTimings());
    self.timings = self.prayerTimings; // Descriptive alias
    self.prayerTimingsStatus = createObservable(_win.prayerTimingsStatus || 'offline');
    self.prayerConfig = createObservable(readConfig());

    self.activePrayer = createComputed(function () {
        return typeof _win.getActivePrayerInfo === 'function' ? _win.getActivePrayerInfo() : null;
    });

    self.currentDayRecord = createComputed(function () {
        var recs = self.trackerRecords() || {};
        var d = self.selectedDate();
        return recs[d] || {};
    });

    // Pure Computed: Missed Prayers Count
    self.missedCount = createComputed({
        read: function () {
            var recs = self.trackerRecords() || {};
            var today = self.today();
            var prayers = self.prayers;

            // 1. Count past missed prayers
            var pastMissed = 0;
            Object.keys(recs).forEach(function (d) {
                if (d >= today) return;
                var dayRec = recs[d] || {};
                prayers.forEach(function (p) {
                    if (dayRec[p] === true || dayRec[p] === 'missed') {
                        pastMissed++;
                    }
                });
            });

            // 2. Count today's missed prayers
            var todayMissed = 0;
            if (typeof _win.getTodayMissedCount === 'function') {
                todayMissed = _win.getTodayMissedCount();
            } else {
                var todayRec = recs[today] || {};
                prayers.forEach(function (p) {
                    if (todayRec[p] === false) return;
                    if (todayRec[p] === true || todayRec[p] === 'missed') {
                        todayMissed++;
                    }
                });
            }

            return pastMissed + todayMissed;
        },
        write: function () {}
    });

    self.hasMissed = createComputed(function () {
        return self.missedCount() > 0;
    });

    // Pure Computed: Streak Days
    self.streakDays = createComputed(function () {
        var recs = self.trackerRecords() || {};
        var today = self.today();
        var prayers = self.prayers;
        var streak = 0;

        var todayRec = recs[today] || {};
        var todayHasMissed = prayers.some(function (p) {
            return todayRec[p] === true || todayRec[p] === 'missed';
        });

        var d = new Date(today + 'T00:00:00');
        if (todayHasMissed) {
            d.setDate(d.getDate() - 1);
        }

        for (var i = 0; i < 365; i++) {
            var y = d.getFullYear();
            var m = String(d.getMonth() + 1);
            if (m.length < 2) m = '0' + m;
            var day = String(d.getDate());
            if (day.length < 2) day = '0' + day;
            var ds = y + '-' + m + '-' + day;

            var rec = recs[ds];
            if (!rec) {
                // In Nur Prayer, completed dates are pruned from storage
                streak++;
            } else {
                var hasMissedPrayer = prayers.some(function (p) {
                    return rec[p] === true || rec[p] === 'missed';
                });
                if (!hasMissedPrayer) {
                    streak++;
                } else {
                    break;
                }
            }
            d.setDate(d.getDate() - 1);
        }
        return streak;
    });

    // 4. Automated Reactive Persistence via .subscribe()
    if (typeof self.trackerRecords.subscribe === 'function') {
        self.trackerRecords.subscribe(function (recs) {
            if (_win.localStorage) {
                try {
                    _win.localStorage.setItem(self.K, JSON.stringify(recs || {}));
                } catch (e) {}
            }
            // Trigger automatic reactive view updates
            if (typeof _win.rn === 'function') {
                try { _win.rn(); } catch (_) {}
            }
            if (typeof _win.updatePerformanceTab === 'function') {
                try { _win.updatePerformanceTab(); } catch (_) {}
            }
        });
    }

    if (typeof self.oldPeriod.subscribe === 'function') {
        self.oldPeriod.subscribe(function (val) {
            if (_win.localStorage && val !== null && val !== undefined) {
                try {
                    _win.localStorage.setItem(self.OK, JSON.stringify(val));
                } catch (e) {}
            }
        });
    }

    if (typeof self.oldRecords.subscribe === 'function') {
        self.oldRecords.subscribe(function (val) {
            if (_win.localStorage) {
                try {
                    _win.localStorage.setItem(self.OCK, JSON.stringify(val || {}));
                } catch (e) {}
            }
        });
    }

    if (typeof self.historyEntries.subscribe === 'function') {
        self.historyEntries.subscribe(function (val) {
            if (_win.localStorage) {
                try {
                    _win.localStorage.setItem(self.PHK, JSON.stringify(val || []));
                } catch (e) {}
            }
        });
    }

    if (typeof self.prayerConfig.subscribe === 'function') {
        self.prayerConfig.subscribe(function (val) {
            if (_win.localStorage && val) {
                try {
                    _win.localStorage.setItem(self.CONFIG_KEY, JSON.stringify(val));
                } catch (e) {}
            }
        });
    }

    if (typeof self.selectedDate.subscribe === 'function') {
        self.selectedDate.subscribe(function (d) {
            if (typeof _win.rn === 'function') {
                try { _win.rn(); } catch (_) {}
            }
        });
    }

    if (typeof self.prayerTimings.subscribe === 'function') {
        self.prayerTimings.subscribe(function () {
            if (typeof _win.rn === 'function') {
                try { _win.rn(); } catch (_) {}
            }
        });
    }

    // 5. Action Methods
    self.selectDate = function (dateStr) {
        if (!dateStr) return;
        self.selectedDate(dateStr);
    };

    self.jumpToToday = function () {
        self.selectDate(self.today());
    };

    self.getRecord = function (dateStr) {
        var d = dateStr || self.selectedDate();
        var recs = self.trackerRecords() || {};
        var r = recs[d];
        var out = {};
        if (r) {
            self.prayers.forEach(function (p) {
                out[p] = (r[p] === true || r[p] === 'missed');
            });
        } else {
            self.prayers.forEach(function (p) {
                out[p] = false;
            });
        }
        return out;
    };

    self.setRecord = function (dateStr, rec) {
        var d = dateStr || self.selectedDate();
        var recs = Object.assign({}, self.trackerRecords() || {});
        var cleaned = {};
        var hasMissed = false;
        self.prayers.forEach(function (p) {
            var val = (rec && (rec[p] === true || rec[p] === 'missed'));
            cleaned[p] = val;
            if (val) hasMissed = true;
        });

        if (!hasMissed) {
            delete recs[d];
        } else {
            recs[d] = cleaned;
        }
        self.trackerRecords(recs);
    };

    self.setPrayerStatus = function (prayerName, dateStr, isDone) {
        var d = dateStr || self.selectedDate();
        var recs = Object.assign({}, self.trackerRecords() || {});
        var dayRec = Object.assign({}, recs[d] || {});

        var wasDone = dayRec[prayerName] === false;
        // In Islam Tracker, false means completed/done, true means missed
        dayRec[prayerName] = isDone ? false : true;

        var hasMissed = self.prayers.some(function (p) {
            return dayRec[p] === true || dayRec[p] === 'missed';
        });

        if (!hasMissed) {
            delete recs[d];
        } else {
            recs[d] = dayRec;
        }

        // Updating trackerRecords triggers automated localStorage persistence & subscribers
        self.trackerRecords(recs);

        // History entries
        if (isDone && !wasDone) {
            if (typeof _win.addPrayerHistoryEntry === 'function') {
                _win.addPrayerHistoryEntry(prayerName, 'Current', d);
            }
        } else if (!isDone && wasDone) {
            if (typeof _win.removePrayerHistoryEntry === 'function') {
                _win.removePrayerHistoryEntry(prayerName, 'Current', d);
            }
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
        var prayers = self.prayers;

        prayers.forEach(function (p) {
            var wasDone = dayRec[p] === false;
            dayRec[p] = markDone ? false : true;
            if (markDone && !wasDone) {
                if (typeof _win.addPrayerHistoryEntry === 'function') _win.addPrayerHistoryEntry(p, 'Current', d);
            } else if (!markDone && wasDone) {
                if (typeof _win.removePrayerHistoryEntry === 'function') _win.removePrayerHistoryEntry(p, 'Current', d);
            }
        });

        var hasMissed = prayers.some(function (p) {
            return dayRec[p] === true || dayRec[p] === 'missed';
        });

        if (!hasMissed) {
            delete recs[d];
        } else {
            recs[d] = dayRec;
        }

        self.trackerRecords(recs);
    };

    self.setTimings = function (timings, status) {
        if (timings) self.prayerTimings(timings);
        if (status) self.prayerTimingsStatus(status);
    };

    self.sync = function () {
        self.today(getTodayStr());
        self.trackerRecords(readStoredRecords());
        self.oldPeriod(readStoredOldPeriod());
        self.oldRecords(readStoredOldRecords());
        self.historyEntries(readStoredHistory());
        self.prayerConfig(readConfig());
    };
}

export const PrayerStore = new PrayerStoreModel();

// Backward compatibility bridges for window.sd, window.T, window.P
if (typeof window !== 'undefined') {
    window.PrayerStore = PrayerStore;

    try {
        Object.defineProperty(window, 'sd', {
            get: function () { return PrayerStore.selectedDate(); },
            set: function (val) { PrayerStore.selectDate(val); },
            configurable: true,
            enumerable: true
        });
    } catch (_) {
        window.sd = PrayerStore.selectedDate();
    }

    try {
        Object.defineProperty(window, 'T', {
            get: function () { return PrayerStore.timings(); },
            set: function (val) { PrayerStore.setTimings(val); },
            configurable: true,
            enumerable: true
        });
    } catch (_) {
        window.T = PrayerStore.timings();
    }

    try {
        Object.defineProperty(window, 'P', {
            get: function () { return PrayerStore.prayers; },
            set: function (val) { if (Array.isArray(val)) PrayerStore.prayers = val; },
            configurable: true,
            enumerable: true
        });
    } catch (_) {
        window.P = PrayerStore.prayers;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PrayerStore: PrayerStore };
}
