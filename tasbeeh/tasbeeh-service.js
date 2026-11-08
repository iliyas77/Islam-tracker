/* ============================================================
   Nur Prayer — Centralized Tasbeeh Service & Utility Layer
   Path: tasbeeh/tasbeeh-service.js
   Responsibilities:
     - Centralized utility functions (dates, months, numbers, icons, toasts, unwrap)
     - Reusable data operations (CRUD Dhikrs, daily resets, calendar completions)
     - Period calculations & settings (current tracking month, old month sequence, presets)
     - Shared business logic (item classification, calendar cell builder, actions)
     - Single source of truth for all Tasbeeh components
   ============================================================ */

import {
    TASBEEH_CONSTANTS,
    ELEMENT_IDS,
    STORAGE_KEYS,
    STORAGE_KEY,
    DAY_KEY,
    CURRENT_PERIOD_KEY,
    CAL_COMPLETION_KEY,
    TABS,
    DEFAULT_PRESETS,
    normalizeItem,
    loadItems,
    persistItems,
    checkDailyReset,
    loadCalCompletions,
    persistCalCompletions,
    isDayCompleted,
    setDayCompleted,
    getDaysInMonth,
    getFirstDayOfMonth,
    makeDateStr,
    getCompletedDaysInMonth,
    loadCurrentPeriod,
    saveCurrentPeriod,
    getCurrentTrackingMonth,
    removeMonthTrackingData,
    isMonthFullyCompleted
} from './tasbeeh-model.js';

import {
    loadPeriod,
    savePeriod,
    PERIOD_PRESETS,
    PERIOD_KEY
} from './tasbeeh-period.js';

import {
    confirmAction,
    animateCell,
    advanceCurrentMonth,
    advanceOldMonth
} from './tasbeeh-calendar.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

/* Re-export model & period constants */
export {
    TASBEEH_CONSTANTS,
    ELEMENT_IDS,
    STORAGE_KEYS,
    STORAGE_KEY,
    DAY_KEY,
    CURRENT_PERIOD_KEY,
    CAL_COMPLETION_KEY,
    PERIOD_KEY,
    TABS,
    DEFAULT_PRESETS,
    PERIOD_PRESETS,
    normalizeItem,
    loadItems,
    persistItems,
    checkDailyReset,
    loadCalCompletions,
    persistCalCompletions,
    isDayCompleted,
    setDayCompleted,
    getDaysInMonth,
    getFirstDayOfMonth,
    makeDateStr,
    getCompletedDaysInMonth,
    loadCurrentPeriod,
    saveCurrentPeriod,
    getCurrentTrackingMonth,
    removeMonthTrackingData,
    isMonthFullyCompleted,
    loadPeriod,
    savePeriod,
    confirmAction,
    animateCell,
    advanceCurrentMonth,
    advanceOldMonth
};

/* ---------- General & Date Utilities ---------- */
export function unwrap(val, def) {
    var v = (typeof val === 'function') ? val() : val;
    return (v !== undefined && v !== null) ? v : def;
}

export function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
}

export function uid(prefix) {
    return (prefix || 'tb_') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}

export function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}
export var td = todayKey;

export function formatMonthLabel(m) {
    if (!m) return '';
    var parts = m.split('-');
    if (parts.length < 2) return m;
    var yr = parseInt(parts[0], 10), mo = parseInt(parts[1], 10) - 1;
    var d = new Date(yr, mo, 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatDate(d) {
    if (!d) return '';
    var parts = d.split('-');
    if (parts.length === 3) {
        var dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return dt.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return d;
}

export function formatMonthYear(mKey) {
    return formatMonthLabel(mKey);
}

export function getPrevMonthKey(monthKey) {
    var p = (monthKey || todayKey().slice(0, 7)).split('-');
    var yr = parseInt(p[0], 10), mo = parseInt(p[1], 10) - 1;
    if (mo < 1) { mo = 12; yr--; }
    return yr + '-' + pad2(mo);
}

export function getNextMonthKey(monthKey) {
    var p = (monthKey || todayKey().slice(0, 7)).split('-');
    var yr = parseInt(p[0], 10), mo = parseInt(p[1], 10) + 1;
    if (mo > 12) { mo = 1; yr++; }
    return yr + '-' + pad2(mo);
}

export function getPreviousMonthsList(startDate, endDate) {
    var list = [];
    if (!startDate || !endDate || startDate > endDate) return list;
    var sParts = startDate.split('-'), eParts = endDate.split('-');
    var sYr = parseInt(sParts[0], 10), sMo = parseInt(sParts[1], 10);
    var curY = parseInt(eParts[0], 10), curM = parseInt(eParts[1], 10);
    while (curY > sYr || (curY === sYr && curM >= sMo)) {
        list.push(curY + '-' + pad2(curM));
        curM--;
        if (curM < 1) { curM = 12; curY--; }
    }
    return list;
}

export function renderIcon(opt) {
    if (typeof _win.renderIcon === 'function' && _win.renderIcon !== renderIcon) return _win.renderIcon(opt);
    if (typeof opt === 'string') {
        if (opt === 'tb-target') return '<app-icon params="name: \'bullseye\', color: \'text-gray-400\', size: \'xs\'"></app-icon>';
        if (opt === 'tb-pencil') return '<app-icon params="name: \'pencil\', size: \'xs\'"></app-icon>';
        if (opt === 'tb-chevron') return '<app-icon params="name: \'chevron-right\', size: \'xs\'"></app-icon>';
        if (opt === 'tb-check-circle') return '<app-icon params="name: \'check\', size: \'xs\'"></app-icon>';
        return '<i class="fa-solid fa-' + opt + '"></i>';
    }
    if (opt && opt.name) {
        var prefix = opt.prefix || 'fa-solid', col = opt.color || '';
        return '<i class="' + prefix + ' fa-' + opt.name + ' ' + col + '"></i>';
    }
    return '';
}

export function showToast(msg, duration) {
    if (typeof _win.showToast === 'function') {
        _win.showToast(msg, duration);
    } else if (_win.TasbeehApp && typeof _win.TasbeehApp.showToast === 'function') {
        _win.TasbeehApp.showToast(msg, duration);
    }
}

export function escHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, function (m) {
        switch (m) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return m;
        }
    });
}

/* ---------- Dhikr Item Operations ---------- */
export function getDhikrById(id) {
    if (!id) return null;
    var list = loadItems();
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) return list[i];
    }
    return null;
}

export function saveDhikrItem(data) {
    if (!data || !data.title) return null;
    if (_win.TasbeehStore && typeof _win.TasbeehStore.addDhikr === 'function' && typeof _win.TasbeehStore.updateDhikr === 'function') {
        if (data.id) {
            _win.TasbeehStore.updateDhikr(data.id, { title: data.title, targetCount: data.targetCount });
        } else {
            _win.TasbeehStore.addDhikr(data.title, data.targetCount);
        }
        return getDhikrById(data.id);
    }
    var items = loadItems();
    var targetNum = (data.targetCount === 'infinite' || data.targetCount === '∞')
        ? 'infinite'
        : clamp(parseInt(data.targetCount, 10) || 33, 1, 9999);
    var saved = null;
    if (data.id) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === data.id) {
                items[i].title = data.title;
                items[i].targetCount = targetNum;
                items[i].updatedAt = Date.now();
                saved = items[i];
                break;
            }
        }
    } else {
        saved = normalizeItem({ id: uid(), title: data.title, targetCount: targetNum });
        items.push(saved);
    }
    persistItems(items);
    if (_win.TasbeehApp && typeof _win.TasbeehApp.setItems === 'function') _win.TasbeehApp.setItems(items);
    if (_win.TasbeehApp && typeof _win.TasbeehApp.render === 'function') _win.TasbeehApp.render();
    return saved;
}

export function deleteDhikrItem(id) {
    if (!id) return;
    if (_win.TasbeehStore && typeof _win.TasbeehStore.deleteDhikr === 'function') {
        _win.TasbeehStore.deleteDhikr(id);
    }
    var items = loadItems().filter(function (it) { return it.id !== id; });
    persistItems(items);
    if (_win.TasbeehApp && typeof _win.TasbeehApp.setItems === 'function') _win.TasbeehApp.setItems(items);
    if (_win.TasbeehApp && typeof _win.TasbeehApp.render === 'function') _win.TasbeehApp.render();
}

/* ---------- Period Operations ---------- */
export function getCurrentOldMonth() {
    var period = loadPeriod();
    if (!period || !period.startDate || !period.endDate) return null;
    return (period.endDate < period.startDate) ? null : period.endDate;
}

export function calculateHistoryStats(period, curOldMonth) {
    var p = period || loadPeriod();
    var maxEnd = p.initialEnd || p.endDate;
    var allOldMonths = getPreviousMonthsList(p.startDate, maxEnd);
    var activeOld = (curOldMonth !== undefined) ? curOldMonth : getCurrentOldMonth();

    var totalMonthsCount = allOldMonths.length;
    var completedCount = 0;
    allOldMonths.forEach(function (m) {
        if (m > p.endDate || p.endDate < p.startDate) completedCount++;
    });
    var pendingCount = Math.max(0, totalMonthsCount - completedCount - (activeOld ? 1 : 0));
    var percent = totalMonthsCount > 0 ? Math.round((completedCount / totalMonthsCount) * 100) : 0;

    return {
        percentCleared: percent,
        totalMonths: totalMonthsCount,
        clearedMonths: completedCount,
        pendingMonths: pendingCount,
        allOldMonths: allOldMonths
    };
}

export function calculatePeriodPreset(presetType) {
    var now = new Date();
    var curMonth = typeof _win.getCurrentMonthKey === 'function' ? _win.getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
    var prevMonth = getPrevMonthKey(curMonth);
    var startStr = '', endStr = prevMonth + '-01';

    if (presetType === 'this-year' || presetType === PERIOD_PRESETS.THIS_YEAR) {
        startStr = now.getFullYear() + '-01-01';
    } else if (presetType === '6-months' || presetType === PERIOD_PRESETS.LAST_6_MONTHS) {
        var d6 = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        startStr = d6.getFullYear() + '-' + pad2(d6.getMonth() + 1) + '-01';
    } else if (presetType === '1-year' || presetType === PERIOD_PRESETS.LAST_1_YEAR) {
        var d12 = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        startStr = d12.getFullYear() + '-' + pad2(d12.getMonth() + 1) + '-01';
    }

    return { startDate: startStr, endDate: endStr };
}

/* ---------- Item Classification & Calendar Grid Helpers ---------- */
export function classifyCurrentItems(items, calCompletions, curMonthKey, todayStr) {
    var itList = items || [];
    var comps = calCompletions || {};
    var mKey = curMonthKey || getCurrentTrackingMonth();
    var tStr = todayStr || td();
    var parts = mKey.split('-');
    var yr = parseInt(parts[0], 10), mo = parseInt(parts[1], 10) - 1;
    var totalDays = getDaysInMonth(yr, mo);
    var isTodayInCurMonth = (tStr.slice(0, 7) === mKey);

    var todo = [], done = [];
    itList.forEach(function (it) {
        var completedDays = getCompletedDaysInMonth(comps, it.id, yr, mo);
        var isTodayDone = isTodayInCurMonth ? isDayCompleted(comps, it.id, tStr) : false;
        var isAllMonthDone = totalDays > 0 && completedDays >= totalDays;
        var isComplete = isAllMonthDone || (isTodayInCurMonth && isTodayDone);

        var cardRecord = {
            id: it.id,
            title: it.title,
            targetCount: it.targetCount === 'infinite' ? '∞' : it.targetCount,
            completedDays: completedDays,
            totalDays: totalDays,
            isComplete: isComplete,
            isCompleted: isComplete,
            isTodayDone: isTodayDone,
            raw: it
        };

        if (isComplete) done.push(cardRecord);
        else todo.push(cardRecord);
    });

    return { todo: todo, done: done, curMonthKey: mKey };
}

export function classifyOldItems(items, calCompletions, oldMonthKey) {
    var itList = items || [];
    var comps = calCompletions || {};
    var m = oldMonthKey;
    if (!m) return { todo: [], done: [] };

    var parts = m.split('-');
    var yr = parseInt(parts[0], 10), mo = parseInt(parts[1], 10) - 1;
    var totalDays = getDaysInMonth(yr, mo);

    var todo = [], done = [];
    itList.forEach(function (it) {
        var isInf = it.targetCount === 'infinite' || it.targetCount === '∞';
        var completedDays = getCompletedDaysInMonth(comps, it.id, yr, mo);
        var isDhikrDone = !isInf && completedDays >= totalDays;

        var record = {
            id: it.id,
            title: it.title,
            targetCount: isInf ? '∞' : it.targetCount,
            completedDays: completedDays,
            totalDays: totalDays,
            isComplete: isDhikrDone,
            isCompleted: isDhikrDone,
            month: m,
            raw: it
        };

        if (isDhikrDone) done.push(record);
        else todo.push(record);
    });

    return { todo: todo, done: done };
}

export function buildCalendarCells(year, month, itemId, calCompletions, todayStr, obsFactory) {
    var daysInMonth = getDaysInMonth(year, month);
    var firstDay = getFirstDayOfMonth(year, month);
    var tStr = todayStr || td();
    var comps = calCompletions || {};
    var makeObs = typeof obsFactory === 'function' ? obsFactory : function (val) {
        if (typeof ko !== 'undefined' && ko.observable) return ko.observable(val);
        return function () { return val; };
    };

    var cells = [];
    for (var e = 0; e < firstDay; e++) {
        cells.push({ isEmpty: true });
    }

    for (var d = 1; d <= daysInMonth; d++) {
        var dateStr = makeDateStr(year, month, d);
        var isToday = (dateStr === tStr);
        var isDone = isDayCompleted(comps, itemId, dateStr);

        cells.push({
            isEmpty: false,
            dayNumber: d,
            dateStr: dateStr,
            isToday: isToday,
            isCompleted: makeObs(isDone)
        });
    }

    return cells;
}

export function reopenLastMonth() {
    if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.reopenLastMonth === 'function') {
        return _win.TasbeehOldApp.reopenLastMonth();
    }
    var period = loadPeriod();
    var maxEnd = period.initialEnd || period.endDate;
    if (period.endDate >= maxEnd) return;
    var target = getNextMonthKey(period.endDate);
    savePeriod(period.startDate, target, maxEnd);
    showToast('Reopened ' + formatMonthLabel(target));
}

export const TasbeehService = {
    TASBEEH_CONSTANTS, ELEMENT_IDS, STORAGE_KEYS, STORAGE_KEY, DAY_KEY,
    CURRENT_PERIOD_KEY, CAL_COMPLETION_KEY, PERIOD_KEY, TABS,
    DEFAULT_PRESETS, PERIOD_PRESETS,
    unwrap, pad2, uid, clamp, todayKey, td, formatMonthLabel, formatDate,
    formatMonthYear, getDaysInMonth, getFirstDayOfMonth, makeDateStr,
    getPrevMonthKey, getNextMonthKey, getPreviousMonthsList, renderIcon,
    showToast, escHtml, normalizeItem, loadItems, persistItems, getDhikrById,
    saveDhikrItem, deleteDhikrItem, checkDailyReset, loadCalCompletions,
    persistCalCompletions, isDayCompleted, setDayCompleted, getCompletedDaysInMonth,
    isMonthFullyCompleted, removeMonthTrackingData, loadCurrentPeriod,
    saveCurrentPeriod, getCurrentTrackingMonth, loadPeriod, savePeriod,
    getCurrentOldMonth, calculateHistoryStats, calculatePeriodPreset,
    classifyCurrentItems, classifyOldItems, buildCalendarCells, confirmAction,
    animateCell, advanceCurrentMonth, advanceOldMonth, reopenLastMonth
};

if (typeof window !== 'undefined') {
    window.TasbeehService = TasbeehService;
    if (!window.getCurrentTrackingMonth) {
        window.getCurrentTrackingMonth = getCurrentTrackingMonth;
    }
    window.getPrevMonthKey = getPrevMonthKey;
    window.getNextMonthKey = getNextMonthKey;
    window.getPreviousMonthsList = getPreviousMonthsList;
}

export default TasbeehService;
