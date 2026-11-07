/* ============================================================
   Nur Prayer — Digital Tasbeeh: Data Layer & Persistence Model
   Path: tasbeeh/tasbeeh-model.js
   Handles:
     - Dhikr items data layer, normalization & local storage persistence
     - Calendar completions data layer & helper calculations
     - Current period storage & month completion checks
     - Bookmark state management
   ============================================================ */

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export var TASBEEH_CONSTANTS = _win.TASBEEH_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.TASBEEH) || {};
export var ELEMENT_IDS = TASBEEH_CONSTANTS.ELEMENT_IDS || {};
export var STORAGE_KEYS = TASBEEH_CONSTANTS.STORAGE_KEYS || {};
export var STORAGE_KEY = STORAGE_KEYS.DATA || 'app_tasbeeh_data';
export var DAY_KEY = STORAGE_KEYS.DAY || 'app_tasbeeh_day';
export var BM_CUR_KEY = STORAGE_KEYS.BOOKMARK_CURRENT || 'app_tasbeeh_bookmark_current';
export var BM_OLD_KEY = STORAGE_KEYS.BOOKMARK_OLD || 'app_tasbeeh_bookmark_old';
export var CURRENT_PERIOD_KEY = STORAGE_KEYS.CURRENT_PERIOD || 'app_tasbeeh_current_period';
export var CAL_COMPLETION_KEY = STORAGE_KEYS.CAL_COMPLETIONS || 'app_tasbeeh_cal_completions';
export var TABS = TASBEEH_CONSTANTS.TABS || { CURRENT: 'current', OLD: 'old', HISTORY: 'history' };

export var DEFAULT_PRESETS = TASBEEH_CONSTANTS.DEFAULT_PRESETS || [
    { title: 'SubhanAllah', targetCount: 33 },
    { title: 'Alhamdulillah', targetCount: 33 },
    { title: 'Allahu Akbar', targetCount: 34 },
    { title: 'Astaghfirullah', targetCount: 100 }
];

/* Helper to pad numbers */
var pad2 = function (n) {
    if (typeof _win.pad2 === 'function' && _win.pad2 !== pad2) return _win.pad2(n);
    return n < 10 ? '0' + n : '' + n;
};

var uid = function () {
    if (typeof _win.uid === 'function' && _win.uid !== uid) return _win.uid();
    return 'tb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
};

var clamp = function (v, min, max) {
    if (typeof _win.clamp === 'function' && _win.clamp !== clamp) return _win.clamp(v, min, max);
    return Math.min(Math.max(v, min), max);
};

var todayKey = function () {
    if (typeof _win.todayKey === 'function' && _win.todayKey !== todayKey) return _win.todayKey();
    if (typeof _win.td === 'function') return _win.td();
    return new Date().toISOString().slice(0, 10);
};

/* ---------- Item Normalization & Storage ---------- */
export function normalizeItem(raw) {
    var defTarget = TASBEEH_CONSTANTS.DEFAULT_TARGET || 33;
    var norm = {
        id: raw.id || uid(),
        title: raw.title || 'Dhikr',
        targetCount: raw.targetCount === 'infinite' ? 'infinite' : clamp(parseInt(raw.targetCount, 10) || defTarget, 1, 9999),
        icon: raw.icon || 'ring',
        updatedAt: raw.updatedAt || Date.now(),
        dailyHistory: (raw.dailyHistory && typeof raw.dailyHistory === 'object') ? Object.assign({}, raw.dailyHistory) : {},
        monthlyHistory: (raw.monthlyHistory && typeof raw.monthlyHistory === 'object') ? Object.assign({}, raw.monthlyHistory) : {}
    };

    if (raw.targetCycles !== undefined) norm.targetCycles = raw.targetCycles;
    if (raw.currentCycle !== undefined) norm.currentCycle = raw.currentCycle;
    if (raw.currentCount !== undefined) norm.currentCount = raw.currentCount;
    if (raw.totalCountToday !== undefined) norm.totalCountToday = raw.totalCountToday;
    if (raw.oldTotalCount !== undefined) norm.oldTotalCount = raw.oldTotalCount;

    return norm;
}

export function loadItems() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
        return DEFAULT_PRESETS.map(function (p) {
            return normalizeItem({
                title: p.title,
                targetCount: p.targetCount
            });
        });
    }
    try {
        var parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            return DEFAULT_PRESETS.map(function (p) { return normalizeItem(p); });
        }
        return parsed.map(normalizeItem);
    } catch (_) {
        return DEFAULT_PRESETS.map(function (p) { return normalizeItem(p); });
    }
}

export function persistItems(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (_) { }
    if (typeof window !== 'undefined' && window.TasbeehStore && typeof window.TasbeehStore.items === 'function') {
        window.TasbeehStore.items(items);
    }
}

export function checkDailyReset() {
    var today = todayKey();
    var last = localStorage.getItem(DAY_KEY);
    if (last !== today) {
        localStorage.setItem(DAY_KEY, today);
    }
}

/* ---------- Calendar Completions Storage & Helpers ---------- */
export function loadCalCompletions() {
    try {
        var raw = localStorage.getItem(CAL_COMPLETION_KEY);
        if (raw) {
            var parsed = JSON.parse(raw);
            if (typeof parsed === 'object' && parsed !== null) {
                return parsed;
            }
        }
    } catch (_) { }
    return {};
}

export function persistCalCompletions(calCompletions) {
    try {
        localStorage.setItem(CAL_COMPLETION_KEY, JSON.stringify(calCompletions));
    } catch (_) { }
}

export function isDayCompleted(calCompletions, itemId, dateStr) {
    return !!(calCompletions && calCompletions[itemId] && calCompletions[itemId][dateStr] === true);
}

export function setDayCompleted(calCompletions, items, itemId, dateStr, completed) {
    if (!itemId || !dateStr) return;
    if (!calCompletions[itemId]) {
        calCompletions[itemId] = {};
    }
    if (completed) {
        calCompletions[itemId][dateStr] = true;
    } else {
        delete calCompletions[itemId][dateStr];
    }
    persistCalCompletions(calCompletions);

    var item = null;
    for (var i = 0; i < items.length; i++) {
        if (items[i].id === itemId) { item = items[i]; break; }
    }
    if (item) {
        var monthKey = dateStr.slice(0, 7);
        var parts = monthKey.split('-');
        var yr = parseInt(parts[0], 10);
        var mo = parseInt(parts[1], 10) - 1;
        var completedDays = getCompletedDaysInMonth(calCompletions, itemId, yr, mo);
        var targetNum = item.targetCount === 'infinite' ? 100 : item.targetCount;

        item.dailyHistory = item.dailyHistory || {};
        if (completed) {
            item.dailyHistory[dateStr] = targetNum;
        } else {
            delete item.dailyHistory[dateStr];
        }

        if (dateStr === todayKey()) {
            item.currentCount = completed ? targetNum : 0;
        }

        item.monthlyHistory = item.monthlyHistory || {};
        item.monthlyHistory[monthKey] = completedDays * targetNum;
        item.updatedAt = Date.now();
        persistItems(items);
    }
}

export function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

export function makeDateStr(year, month, day) {
    return year + '-' + pad2(month + 1) + '-' + pad2(day);
}

export function getCompletedDaysInMonth(calCompletions, itemId, year, month) {
    if (!calCompletions || !calCompletions[itemId]) return 0;
    var prefix = year + '-' + pad2(month + 1) + '-';
    var count = 0;
    var daysInM = getDaysInMonth(year, month);
    for (var d = 1; d <= daysInM; d++) {
        var ds = prefix + pad2(d);
        if (calCompletions[itemId][ds] === true) {
            count++;
        }
    }
    return count;
}

/* ---------- Current Period Storage Layer (Month-by-Month) ---------- */
export function loadCurrentPeriod() {
    var defaultStartMonth = typeof _win.getCurrentMonthKey === 'function' ? _win.getCurrentMonthKey() : (new Date().getFullYear() + '-' + pad2(new Date().getMonth() + 1));
    try {
        var raw = localStorage.getItem(CURRENT_PERIOD_KEY);
        if (!raw) {
            var initial = { startDate: defaultStartMonth, updatedAt: Date.now() };
            localStorage.setItem(CURRENT_PERIOD_KEY, JSON.stringify(initial));
            return initial;
        }
        var p = JSON.parse(raw);
        if (!p || !p.startDate) {
            return { startDate: defaultStartMonth, updatedAt: Date.now() };
        }
        var norm = (typeof _win.normalizeMonthKey === 'function' ? _win.normalizeMonthKey(p.startDate) : String(p.startDate).slice(0, 7)) || defaultStartMonth;
        return {
            startDate: norm,
            updatedAt: p.updatedAt || Date.now()
        };
    } catch (_) {
        return { startDate: defaultStartMonth, updatedAt: Date.now() };
    }
}

export function saveCurrentPeriod(startMonth) {
    var defaultStartMonth = typeof _win.getCurrentMonthKey === 'function' ? _win.getCurrentMonthKey() : (new Date().getFullYear() + '-' + pad2(new Date().getMonth() + 1));
    var norm = (typeof _win.normalizeMonthKey === 'function' ? _win.normalizeMonthKey(startMonth) : String(startMonth).slice(0, 7)) || defaultStartMonth;
    var p = {
        startDate: norm,
        updatedAt: Date.now()
    };
    try {
        localStorage.setItem(CURRENT_PERIOD_KEY, JSON.stringify(p));
    } catch (_) { }
    return p;
}

export function getCurrentTrackingMonth() {
    return loadCurrentPeriod().startDate;
}

export function removeMonthTrackingData(calCompletions, items, mKey) {
    if (!mKey) return;
    var prefix = mKey + '-';
    for (var itemId in calCompletions) {
        if (Object.prototype.hasOwnProperty.call(calCompletions, itemId)) {
            var dayMap = calCompletions[itemId];
            if (dayMap && typeof dayMap === 'object') {
                for (var d in dayMap) {
                    if (d.indexOf(prefix) === 0) {
                        delete dayMap[d];
                    }
                }
            }
        }
    }
    persistCalCompletions(calCompletions);

    items.forEach(function (it) {
        if (it.dailyHistory && typeof it.dailyHistory === 'object') {
            for (var d2 in it.dailyHistory) {
                if (d2.indexOf(prefix) === 0) {
                    delete it.dailyHistory[d2];
                }
            }
        }
        if (it.monthlyHistory && typeof it.monthlyHistory === 'object') {
            delete it.monthlyHistory[mKey];
        }
        it.updatedAt = Date.now();
    });
    persistItems(items);
}

export function isMonthFullyCompleted(calCompletions, items, mKey) {
    if (!mKey || !items) return false;
    var finiteItems = items.filter(function (it) { return it.targetCount !== 'infinite'; });
    if (finiteItems.length === 0) return false;
    var parts = mKey.split('-');
    var yr = parseInt(parts[0], 10);
    var mo = parseInt(parts[1], 10) - 1;
    var totalDays = getDaysInMonth(yr, mo);
    if (totalDays <= 0) return false;

    return finiteItems.every(function (it) {
        var completedDays = getCompletedDaysInMonth(calCompletions, it.id, yr, mo);
        return completedDays >= totalDays;
    });
}

