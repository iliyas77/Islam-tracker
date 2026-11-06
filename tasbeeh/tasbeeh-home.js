/* ============================================================
   Nur Prayer — Digital Tasbeeh: Home Tab Module
   Path: tasbeeh/tasbeeh-home.js
   Handles:
     - Home tab rendering inside Digital Tasbeeh
     - Bookmarked Current and Old counters display in 2x2 grid
     - Quick navigation to Current, Old, and History features
   ============================================================ */

import { getTasbeehViewModel, escHtml } from './tasbeeh-view-model.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var TASBEEH_CONSTANTS = _win.TASBEEH_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.TASBEEH) || {};
var ELEMENT_IDS = TASBEEH_CONSTANTS.ELEMENT_IDS || {};

function getEl(id) {
    return document.getElementById(id);
}

var renderIcon = function (opt) {
    if (typeof _win.renderIcon === 'function' && _win.renderIcon !== renderIcon) return _win.renderIcon(opt);
    return '';
};

/* ---------- Render Tasbeeh Home Tab ---------- */
export function renderHomeTab() {
    var body = getEl(ELEMENT_IDS.HOME_BODY || 'tbHomeBody');
    if (!body) return;

    var emptyEl = getEl(ELEMENT_IDS.HOME_EMPTY_STATE || 'tbHomeEmptyState');
    var contentEl = getEl(ELEMENT_IDS.HOME_CONTENT || 'tbHomeContent');

    var bmData = (_win.TasbeehApp && typeof _win.TasbeehApp.getBookmarkedChants === 'function')
        ? _win.TasbeehApp.getBookmarkedChants()
        : null;

    var items = (_win.TasbeehApp && typeof _win.TasbeehApp.getItems === 'function')
        ? _win.TasbeehApp.getItems()
        : [];

    if (!items || items.length === 0) {
        if (emptyEl) emptyEl.classList.remove('d-none');
        if (contentEl) contentEl.classList.add('d-none');
        return;
    }

    if (emptyEl) emptyEl.classList.add('d-none');
    if (contentEl) contentEl.classList.remove('d-none');

    var period = (_win.TasbeehHistoryApp && typeof _win.TasbeehHistoryApp.loadPeriod === 'function')
        ? _win.TasbeehHistoryApp.loadPeriod()
        : ((_win.TasbeehOldApp && typeof _win.TasbeehOldApp.loadPeriod === 'function') ? _win.TasbeehOldApp.loadPeriod() : null);

    var completedCount = 0;
    if (period && period.startDate && (period.initialEnd || period.endDate)) {
        var maxEnd = period.initialEnd || period.endDate;
        var allOld = typeof _win.getPreviousMonthsList === 'function' ? _win.getPreviousMonthsList(period.startDate, maxEnd) : [];
        allOld.forEach(function (m) {
            if (m > period.endDate || period.endDate < period.startDate) completedCount++;
        });
    }
    var curOldMonth = (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.getCurrentOldMonth === 'function')
        ? _win.TasbeehOldApp.getCurrentOldMonth()
        : null;
    var activeOldLabel = curOldMonth ? (_win.TasbeehApp && _win.TasbeehApp.formatMonthLabel ? _win.TasbeehApp.formatMonthLabel(curOldMonth) : curOldMonth) : 'All Cleared';

    var vm = (typeof getTasbeehViewModel === 'function') ? getTasbeehViewModel() : null;

    if (vm) {
        var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);
        var canWrite = function (target) {
            if (!target || typeof target !== 'function') return false;
            return (k && typeof k.isWriteableObservable === 'function') ? k.isWriteableObservable(target) : true;
        };
        try { if (canWrite(vm.currentDhikrsCount)) vm.currentDhikrsCount(items.length); } catch (_) {}
        try { if (canWrite(vm.clearedMonthsCount)) vm.clearedMonthsCount(completedCount); } catch (_) {}
        try { if (canWrite(vm.activeOldLabel)) vm.activeOldLabel(activeOldLabel); } catch (_) {}
    }

    var bmCards = [];
    if (bmData && bmData.current && bmData.current.item) {
        var c = bmData.current;
        bmCards.push({
            id: c.item.id,
            title: c.item.title,
            targetCount: c.targetDisplay,
            completedDays: c.completedDays,
            totalDays: c.totalDays,
            isComplete: c.completedDays >= c.totalDays,
            isTodayDone: c.isTodayDone,
            onCardClick: function (d, e) {
                if (e && e.stopPropagation) e.stopPropagation();
                if (_win.TasbeehApp && typeof _win.TasbeehApp.openCounterView === 'function') {
                    _win.TasbeehApp.openCounterView(c.item.id);
                }
            },
            onEditClick: function (d, e) {
                if (e && e.stopPropagation) e.stopPropagation();
                if (_win.TasbeehApp && typeof _win.TasbeehApp.openEditModal === 'function') {
                    _win.TasbeehApp.openEditModal(c.item.id);
                }
            }
        });
    }
    if (bmData && bmData.old && bmData.old.item) {
        var o = bmData.old;
        bmCards.push({
            id: o.item.id,
            title: o.item.title,
            month: o.monthKey,
            targetCount: o.targetDisplay,
            completedDays: o.completedDays,
            totalDays: o.totalDays,
            isComplete: !!o.isDhikrDone,
            isTodayDone: false,
            onCardClick: function (d, e) {
                if (e && e.stopPropagation) e.stopPropagation();
                if (_win.TasbeehApp && typeof _win.TasbeehApp.openCounterFromHome === 'function') {
                    _win.TasbeehApp.openCounterFromHome(o.item.id, o.monthKey, 'old');
                } else if (_win.TasbeehApp && typeof _win.TasbeehApp.openCounterView === 'function') {
                    _win.TasbeehApp.openCounterView(o.item.id, o.monthKey);
                }
            },
            onEditClick: function (d, e) {
                if (e && e.stopPropagation) e.stopPropagation();
                if (_win.TasbeehApp && typeof _win.TasbeehApp.openEditModal === 'function') {
                    _win.TasbeehApp.openEditModal(o.item.id);
                }
            }
        });
    }

    if (vm && typeof vm.bookmarkedCounters === 'function') {
        vm.bookmarkedCounters(bmCards);
    }

    var curCountEl = getEl(ELEMENT_IDS.HOME_CURRENT_COUNT || 'tbHomeCurrentCount');
    if (curCountEl) {
        curCountEl.textContent = items.length;
    }

    var histCountEl = getEl(ELEMENT_IDS.HOME_HISTORY_COUNT || 'tbHomeHistoryCount');
    if (histCountEl) {
        histCountEl.textContent = completedCount;
    }

    var activeOldLabelEl = getEl(ELEMENT_IDS.HOME_ACTIVE_OLD_LABEL || 'tbHomeActiveOldLabel');
    if (activeOldLabelEl) {
        activeOldLabelEl.textContent = activeOldLabel;
    }
}

export function init() {
    // Ready for interactions
}

export var TasbeehHomeApp = {
    init: init,
    renderHomeTab: renderHomeTab
};

if (typeof window !== 'undefined') {
    window.TasbeehHomeApp = TasbeehHomeApp;
    if (window.TasbeehApp) {
        window.TasbeehApp.renderHomeTab = renderHomeTab;
    }
}

export default TasbeehHomeApp;

