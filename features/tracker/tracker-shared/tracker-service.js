/* ============================================================
   Nur Prayer — Centralized Tracker Service & Utility Layer
   Path: features/tracker/tracker-shared/tracker-service.js
   Responsibilities:
     - Centralizes prayer constants (names, default timings, icons)
     - Centralizes date utilities (today, formatted string, date ranges)
     - Centralizes prayer status helpers (isDone, isUpcoming, isCurrent)
     - Centralizes prayer performance calculation & breakdown
     - Centralizes prayer history logging, formatting & persistence
     - Centralizes missed prayer counting & categorization
     - Single source of truth for all Tracker components
   ============================================================ */
'use strict';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

/* ---------- Constants ---------- */
export var PRAYER_NAMES = (_win.CONSTANTS && _win.CONSTANTS.PRAYER && _win.CONSTANTS.PRAYER.NAMES) ||
    _win.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export var DEFAULT_TIMINGS = (_win.CONSTANTS && _win.CONSTANTS.PRAYER && _win.CONSTANTS.PRAYER.DEFAULT_TIMINGS) || {
    Fajr: '05:15',
    Dhuhr: '12:30',
    Asr: '16:15',
    Maghrib: '18:10',
    Isha: '19:45'
};

export var PRAYER_CARD_ICONS = {
    Fajr: 'fa-solid fa-cloud-sun',
    Dhuhr: 'fa-solid fa-sun',
    Asr: 'fa-solid fa-sun',
    Maghrib: 'fa-solid fa-cloud-sun',
    Isha: 'fa-solid fa-moon'
};

export var PRAYER_STORAGE_KEYS = {
    TRACKER_DATA: 'namazTrackerData',
    OLD_PERIOD: 'namazOldPeriod',
    OLD_DATA: 'namazOldData',
    HISTORY: 'namazPrayerHistory',
    START_DATE: 'namazStartDate',
    TIMINGS_CACHE: 'namazPrayerTimingsCache',
    CONFIG: 'namazPrayerConfig'
};

export var MONTH_NAMES = (_win.CONSTANTS && ((_win.CONSTANTS.COMMON && _win.CONSTANTS.COMMON.MONTH_NAMES) || (_win.CONSTANTS.DATE && _win.CONSTANTS.DATE.MONTH_NAMES))) || _win.MONTH_NAMES || [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/* ---------- Utility Helpers ---------- */
export function unwrap(val, def) {
    var res = (typeof val === 'function') ? val() : val;
    return (res !== undefined && res !== null) ? res : def;
}

export function td() {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

export function fr(dateStr) {
    if (!dateStr) return '';
    try {
        var parts = dateStr.split('-');
        if (parts.length === 3) {
            var y = parseInt(parts[0], 10);
            var m = parseInt(parts[1], 10) - 1;
            var d = parseInt(parts[2], 10);
            var dt = new Date(y, m, d);
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[dt.getDay()] + ', ' + d + ' ' + MONTH_NAMES[m] + ' ' + y;
        }
    } catch (_) {}
    return dateStr;
}

export function formatPrayerDate(dateStr) {
    if (!dateStr) return '';
    try {
        var parts = dateStr.split('-');
        if (parts.length === 3) {
            var m = parseInt(parts[1], 10) - 1;
            var d = parseInt(parts[2], 10);
            var y = parts[0];
            var shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return shortMonths[m] + ' ' + d + ', ' + y;
        }
    } catch (_) {}
    return dateStr;
}

export function datesInRange(startDate, endDate) {
    var list = [];
    if (!startDate || !endDate) return list;
    try {
        var cur = new Date(startDate + 'T00:00:00');
        var end = new Date(endDate + 'T00:00:00');
        while (cur <= end) {
            var y = cur.getFullYear();
            var m = String(cur.getMonth() + 1).padStart(2, '0');
            var d = String(cur.getDate()).padStart(2, '0');
            list.push(y + '-' + m + '-' + d);
            cur.setDate(cur.getDate() + 1);
        }
    } catch (_) {}
    return list;
}

export function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Just now';
    var now = Date.now();
    var diff = now - Number(timestamp);
    if (isNaN(diff) || diff < 0) return 'Just now';
    var seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'Just now';
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    var days = Math.floor(hours / 24);
    if (days < 7) return days + 'd ago';
    return formatPrayerDate(new Date(Number(timestamp)).toISOString().slice(0, 10));
}

/* ---------- Storage Readers & Writers ---------- */
export function getStoredRecords(key) {
    var k = key || PRAYER_STORAGE_KEYS.TRACKER_DATA;
    try {
        var raw = _win.localStorage ? _win.localStorage.getItem(k) : null;
        if (raw) {
            var parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') return parsed;
        }
    } catch (_) {}
    return {};
}

export function saveStoredRecords(records, key) {
    var k = key || PRAYER_STORAGE_KEYS.TRACKER_DATA;
    try {
        if (_win.localStorage) {
            _win.localStorage.setItem(k, JSON.stringify(records || {}));
        }
    } catch (_) {}
}

export function getPrayerStartDate() {
    try {
        var s = _win.localStorage ? _win.localStorage.getItem(PRAYER_STORAGE_KEYS.START_DATE) : null;
        if (s && /^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    } catch (_) {}
    return td();
}

/* ---------- Prayer Status Helpers ---------- */
export function isDonePrayer(prayer, date, records) {
    var rec = records;
    if (!rec) {
        var allRec = getStoredRecords();
        rec = (date && allRec) ? allRec[date] : {};
    }
    if (!rec) return true; // pruned means completed
    // In Nur Prayer: false or 'done' or 1 = completed; true or 'missed' = missed
    var val = rec[prayer];
    if (val === false || val === 'done' || val === 1) return true;
    if (val === true || val === 'missed') return false;
    return false;
}

export function isPrayerUpcoming(prayer, date, timings) {
    var todayStr = td();
    if (date !== todayStr) return false;
    var t = timings || _win.T || DEFAULT_TIMINGS;
    var prayerTime = t[prayer];
    if (!prayerTime) return false;
    var now = new Date();
    var curMinutes = now.getHours() * 60 + now.getMinutes();
    var parts = prayerTime.split(':');
    var pMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    return curMinutes < pMinutes;
}

export function isPrayerCurrent(prayer, date, timings) {
    var todayStr = td();
    if (date !== todayStr) return false;
    return false;
}

/* ---------- History Persistence ---------- */
export function getPrayerHistory() {
    if (_win.PrayerStore && typeof _win.PrayerStore.historyEntries === 'function') {
        var list = _win.PrayerStore.historyEntries();
        if (Array.isArray(list) && list.length > 0) return list;
    }
    try {
        var raw = _win.localStorage ? _win.localStorage.getItem(PRAYER_STORAGE_KEYS.HISTORY) : null;
        if (raw) {
            var parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (_) {}
    return [];
}

export function savePrayerHistory(entries) {
    var arr = Array.isArray(entries) ? entries : [];
    try {
        if (_win.localStorage) {
            _win.localStorage.setItem(PRAYER_STORAGE_KEYS.HISTORY, JSON.stringify(arr));
        }
        if (_win.PrayerStore && typeof _win.PrayerStore.historyEntries === 'function') {
            _win.PrayerStore.historyEntries(arr);
        }
        if (_win.trackerHistoryPageViewModel && typeof _win.trackerHistoryPageViewModel.refresh === 'function') {
            _win.trackerHistoryPageViewModel.refresh();
        }
    } catch (_) {}
}

export function addPrayerHistoryEntry(prayer, type, date) {
    if (!prayer) return null;
    var d = date || td();
    var pType = (type === 'Old') ? 'Old' : 'Current';
    var pName = prayer.charAt(0).toUpperCase() + prayer.slice(1);
    var entries = getPrayerHistory();
    entries = entries.filter(function (e) {
        return !(e.prayer === pName && e.type === pType && e.date === d);
    });
    var newEntry = {
        id: 'hist_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        prayer: pName,
        type: pType,
        date: d,
        timestamp: Date.now(),
        createdAt: new Date().toISOString()
    };
    entries.unshift(newEntry);
    if (entries.length > 500) entries = entries.slice(0, 500);
    savePrayerHistory(entries);
    return newEntry;
}

export function removePrayerHistoryEntry(prayerOrId, type, date) {
    var entries = getPrayerHistory();
    var filtered;
    if (type !== undefined && date !== undefined) {
        var pName = (typeof prayerOrId === 'string') ? (prayerOrId.charAt(0).toUpperCase() + prayerOrId.slice(1)) : prayerOrId;
        filtered = entries.filter(function (e) {
            return !(e.prayer === pName && e.type === type && e.date === date);
        });
    } else {
        filtered = entries.filter(function (e) { return e.id !== prayerOrId; });
    }
    savePrayerHistory(filtered);
    return filtered;
}

export function clearPrayerHistory() {
    savePrayerHistory([]);
}

/* ---------- Performance Calculation ---------- */
export function calculatePrayerPerformance() {
    var sdate = getPrayerStartDate();
    var today = td();
    if (!sdate || sdate > today) sdate = today;

    var dates = datesInRange(sdate, today);
    var totalDays = dates.length;
    var totalPossible = totalDays * PRAYER_NAMES.length;

    var curDb = getStoredRecords(PRAYER_STORAGE_KEYS.TRACKER_DATA);
    var oldDb = getStoredRecords(PRAYER_STORAGE_KEYS.OLD_DATA);

    var perPrayer = {};
    PRAYER_NAMES.forEach(function (p) {
        perPrayer[p] = {
            name: p,
            completed: 0,
            missed: 0,
            total: totalDays,
            percentage: 0
        };
    });

    var totalCompleted = 0;
    var totalMissed = 0;

    dates.forEach(function (d) {
        var curEntry = curDb[d];
        var oldEntry = oldDb[d];
        PRAYER_NAMES.forEach(function (p) {
            var isCompleted = false;
            if (curEntry) {
                isCompleted = (curEntry[p] === false || curEntry[p] === 'done' || curEntry[p] === 1);
            } else if (oldEntry) {
                isCompleted = (oldEntry[p] === false);
            } else {
                isCompleted = true; // pruned
            }

            if (isCompleted) {
                perPrayer[p].completed++;
                totalCompleted++;
            } else {
                perPrayer[p].missed++;
                totalMissed++;
            }
        });
    });

    PRAYER_NAMES.forEach(function (p) {
        perPrayer[p].percentage = totalDays > 0
            ? Math.round((perPrayer[p].completed / totalDays) * 100)
            : 0;
    });

    var totalPercentage = totalPossible > 0
        ? Math.round((totalCompleted / totalPossible) * 100)
        : 0;

    return {
        startDate: sdate,
        endDate: today,
        totalDays: totalDays,
        totalPossible: totalPossible,
        totalCompleted: totalCompleted,
        totalMissed: totalMissed,
        totalPercentage: totalPercentage,
        perPrayer: perPrayer
    };
}

/* ---------- Missed Prayers Helpers ---------- */
export function getMissedPrayersByDate() {
    var curDb = getStoredRecords(PRAYER_STORAGE_KEYS.TRACKER_DATA);
    var today = td();
    var result = [];
    Object.keys(curDb).forEach(function (d) {
        if (d >= today) return;
        var entry = curDb[d];
        if (!entry) return;
        var missed = [];
        PRAYER_NAMES.forEach(function (p) {
            if (entry[p] === true || entry[p] === 'missed') {
                missed.push(p);
            }
        });
        if (missed.length > 0) {
            result.push({ date: d, prayers: missed, count: missed.length });
        }
    });
    result.sort(function (a, b) { return a.date.localeCompare(b.date); });
    return result;
}

export function getTotalMissedCount() {
    if (_win.PrayerStore && typeof _win.PrayerStore.missedCount === 'function') {
        return _win.PrayerStore.missedCount();
    }
    var list = getMissedPrayersByDate();
    var sum = 0;
    list.forEach(function (item) { sum += item.count; });
    return sum;
}

/* ---------- Centralized Service Export ---------- */
export var TrackerService = {
    PRAYER_NAMES,
    DEFAULT_TIMINGS,
    PRAYER_CARD_ICONS,
    PRAYER_STORAGE_KEYS,
    MONTH_NAMES,
    unwrap,
    td,
    fr,
    formatPrayerDate,
    datesInRange,
    formatTimeAgo,
    getStoredRecords,
    saveStoredRecords,
    getPrayerStartDate,
    isDonePrayer,
    isPrayerUpcoming,
    isPrayerCurrent,
    getPrayerHistory,
    savePrayerHistory,
    addPrayerHistoryEntry,
    removePrayerHistoryEntry,
    clearPrayerHistory,
    calculatePrayerPerformance,
    getMissedPrayersByDate,
    getTotalMissedCount
};

if (typeof window !== 'undefined') {
    window.TrackerService = TrackerService;
    window.addPrayerHistoryEntry = addPrayerHistoryEntry;
    window.removePrayerHistoryEntry = removePrayerHistoryEntry;
    window.getPrayerHistory = getPrayerHistory;
    window.savePrayerHistory = savePrayerHistory;
    window.clearPrayerHistory = clearPrayerHistory;
    window.PrayerHistoryApp = {
        addPrayerHistoryEntry: addPrayerHistoryEntry,
        removePrayerHistoryEntry: removePrayerHistoryEntry,
        getPrayerHistory: getPrayerHistory,
        savePrayerHistory: savePrayerHistory,
        clearPrayerHistory: clearPrayerHistory
    };
}

export default TrackerService;

