/* ============================================================
   Nur Prayer — Digital Tasbeeh: History & Settings Module
   Path: tasbeeh/history/history.js
   Handles:
     - History bottom tab rendering inside Digital Tasbeeh
     - Period settings (start date, end date, presets)
     - Sequential monthly clearance history & progress overview
     - Reopening completed months and resetting history
     - Modal compatibility bridges
   ============================================================ */

import {
    loadPeriod,
    savePeriod,
    PERIOD_PRESETS
} from '../tasbeeh-period.js';
import { escHtml } from '../tasbeeh-view-model.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var TASBEEH_CONSTANTS = _win.TASBEEH_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.TASBEEH) || {};
var ELEMENT_IDS = TASBEEH_CONSTANTS.ELEMENT_IDS || {};

function getEl(id) {
    return document.getElementById(id);
}

var pad2 = function (n) {
    if (typeof _win.pad2 === 'function' && _win.pad2 !== pad2) return _win.pad2(n);
    return n < 10 ? '0' + n : '' + n;
};

var td = function () {
    if (typeof _win.td === 'function' && _win.td !== td) return _win.td();
    return new Date().toISOString().slice(0, 10);
};

function showToast(msg, duration) {
    if (_win.TasbeehApp && typeof _win.TasbeehApp.showToast === 'function') {
        _win.TasbeehApp.showToast(msg, duration);
    } else if (typeof _win.showToast === 'function') {
        _win.showToast(msg, duration);
    }
}

var renderIcon = function (opt) {
    if (typeof _win.renderIcon === 'function' && _win.renderIcon !== renderIcon) return _win.renderIcon(opt);
    return '';
};

/* ---------- Render History Tab ---------- */
export function renderHistoryTab() {
    var body = getEl(ELEMENT_IDS.HISTORY_BODY || 'tbHistoryBody');
    if (!body) return;

    var period = loadPeriod();
    var maxEnd = period.initialEnd || period.endDate;
    var allOldMonths = typeof _win.getPreviousMonthsList === 'function'
        ? _win.getPreviousMonthsList(period.startDate, maxEnd)
        : [];

    var curOldMonth = (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.getCurrentOldMonth === 'function')
        ? _win.TasbeehOldApp.getCurrentOldMonth()
        : (period.endDate >= period.startDate ? period.endDate : null);

    var totalMonthsCount = allOldMonths.length;
    var completedCount = 0;
    allOldMonths.forEach(function (m) {
        if (m > period.endDate || period.endDate < period.startDate) {
            completedCount++;
        }
    });
    var pendingCount = Math.max(0, totalMonthsCount - completedCount - (curOldMonth ? 1 : 0));
    var percent = totalMonthsCount > 0 ? Math.round((completedCount / totalMonthsCount) * 100) : 0;

    var reopenTargetMonth = null;
    if (period.endDate < maxEnd) {
        reopenTargetMonth = typeof _win.getNextMonthKey === 'function' ? _win.getNextMonthKey(period.endDate) : null;
    }

    var monthsListHtml = '';
    if (allOldMonths.length === 0) {
        monthsListHtml =
            '<div class="text-center py-4 text-muted small">' +
            '  ' + renderIcon({ name: 'calendar-xmark', size: 'fs-2', className: 'opacity-50 mb-2 d-block' }) +
            '  No past months found in this period range. Check your Start and End dates.' +
            '</div>';
    } else {
        monthsListHtml = allOldMonths.map(function (mKey, idx) {
            var isCompleted = (mKey > period.endDate) || (period.endDate < period.startDate);
            var isActive = (mKey === curOldMonth);
            var monthLabel = typeof _win.formatMonthLabel === 'function' ? _win.formatMonthLabel(mKey) : mKey;

            var badgeClass = isCompleted ? 'bg-brand-light text-brand border border-brand-subtle'
                : (isActive ? 'bg-brand text-white border-0'
                    : 'bg-surface text-secondary border');

            var badgeIcon = isCompleted ? renderIcon({ name: 'circle-check', className: 'me-1' })
                : (isActive ? renderIcon({ name: 'play', className: 'me-1' })
                    : renderIcon({ name: 'clock', className: 'me-1' }));

            var badgeText = isCompleted ? 'Completed'
                : (isActive ? 'In Progress' : 'Pending');

            var canReopenThis = (mKey === reopenTargetMonth);
            var reopenBtn = canReopenThis
                ? '<button type="button" class="inline-flex items-center justify-center bg-transparent border border-yellow-500 text-yellow-600 font-semibold rounded-full px-2 py-0 ml-auto text-[11px] hover:bg-yellow-50 transition-colors cursor-pointer select-none" data-act="tb-old-reopen" title="Reopen this month to recount">' + renderIcon({ name: 'arrow-rotate-left', className: 'mr-1' }) + ' Reopen</button>'
                : '';

            return (
                '<div class="flex items-center justify-between p-2 rounded-3 bg-white border border-borderGrey mb-2" data-month="' + mKey + '">' +
                '  <div class="flex items-center gap-2 min-w-0">' +
                '    <span class="text-muted fw-bold small" style="width: 24px; font-size: 11px;">#' + (totalMonthsCount - idx) + '</span>' +
                '    <span class="fw-bold text-gr1 small text-truncate" style="font-size: 13.5px;">' + escHtml(monthLabel) + '</span>' +
                '  </div>' +
                '  <div class="flex items-center gap-2 shrink-0">' +
                '    <span class="badge rounded-pill ' + badgeClass + ' inline-flex items-center" style="font-size: 10.5px; font-weight: 600; padding: 4px 8px;">' +
                badgeIcon + badgeText +
                '    </span>' +
                reopenBtn +
                '  </div>' +
                '</div>'
            );
        }).join('');
    }

    var startInputVal = period.startDate ? (period.startDate.length === 7 ? period.startDate + '-01' : period.startDate) : '';
    var endInputVal = maxEnd ? (maxEnd.length === 7 ? maxEnd + '-01' : maxEnd) : '';

    var percentBadge = getEl(ELEMENT_IDS.HIST_PERCENT_BADGE || 'tbHistPercentBadge');
    if (percentBadge) percentBadge.textContent = percent + '% Cleared';

    var progressBar = getEl(ELEMENT_IDS.HIST_PROGRESS_BAR || 'tbHistProgressBar');
    if (progressBar) {
        progressBar.style.width = percent + '%';
        progressBar.setAttribute('aria-valuenow', percent);
    }

    var totalMonthsEl = getEl(ELEMENT_IDS.HIST_TOTAL_MONTHS || 'tbHistTotalMonths');
    if (totalMonthsEl) totalMonthsEl.textContent = totalMonthsCount;

    var clearedMonthsEl = getEl(ELEMENT_IDS.HIST_CLEARED_MONTHS || 'tbHistClearedMonths');
    if (clearedMonthsEl) clearedMonthsEl.textContent = completedCount;

    var pendingMonthsEl = getEl(ELEMENT_IDS.HIST_PENDING_MONTHS || 'tbHistPendingMonths');
    if (pendingMonthsEl) pendingMonthsEl.textContent = pendingCount;

    var vm = typeof getTasbeehViewModel === 'function' ? getTasbeehViewModel() : null;
    if (vm && vm.historyProgress) {
        if (typeof vm.historyProgress.percentCleared === 'function') vm.historyProgress.percentCleared(percent);
        if (typeof vm.historyProgress.totalMonths === 'function') vm.historyProgress.totalMonths(totalMonthsCount);
        if (typeof vm.historyProgress.clearedMonths === 'function') vm.historyProgress.clearedMonths(completedCount);
        if (typeof vm.historyProgress.pendingMonths === 'function') vm.historyProgress.pendingMonths(pendingCount);
    }

    var startInput = getEl(ELEMENT_IDS.HIST_PERIOD_START || 'tbHistPeriodStart');
    if (startInput) startInput.value = startInputVal;

    var endInput = getEl(ELEMENT_IDS.HIST_PERIOD_END || 'tbHistPeriodEnd');
    if (endInput) endInput.value = endInputVal;

    var resetBtn = getEl(ELEMENT_IDS.HIST_RESET_COMPLETED_BTN || 'tbHistResetCompletedBtn');
    if (resetBtn) {
        if (completedCount > 0) {
            resetBtn.classList.remove('d-none');
        } else {
            resetBtn.classList.add('d-none');
        }
    }

    var listEl = getEl(ELEMENT_IDS.HISTORY_LIST || 'tbHistoryList');
    if (listEl) {
        listEl.innerHTML = monthsListHtml;
    }
}

/* ---------- Setting Handlers ---------- */
export function applyPreset(presetType) {
    var now = new Date();
    var curMonth = typeof _win.getCurrentMonthKey === 'function' ? _win.getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
    var prevMonth = typeof _win.getPrevMonthKey === 'function' ? _win.getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');
    var startInp = getEl('tbHistPeriodStart');
    var endInp = getEl('tbHistPeriodEnd');
    if (!startInp || !endInp) return;

    var startStr = '';
    var endStr = prevMonth + '-01';

    if (presetType === PERIOD_PRESETS.THIS_YEAR) {
        startStr = now.getFullYear() + '-01-01';
    } else if (presetType === PERIOD_PRESETS.LAST_6_MONTHS) {
        var d6 = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        startStr = d6.getFullYear() + '-' + pad2(d6.getMonth() + 1) + '-01';
    } else if (presetType === PERIOD_PRESETS.LAST_1_YEAR) {
        var d12 = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        startStr = d12.getFullYear() + '-' + pad2(d12.getMonth() + 1) + '-01';
    }

    startInp.value = startStr;
    endInp.value = endStr;
}

export function saveHistoryPeriod() {
    var startInp = getEl('tbHistPeriodStart');
    var endInp = getEl('tbHistPeriodEnd');
    if (!startInp) return;

    var startRaw = startInp.value;
    var endRaw = (endInp && endInp.value) ? endInp.value : td();

    if (!startRaw) {
        if (_win.alert) _win.alert('Please select a Start Date.');
        startInp.focus();
        return;
    }

    var startMonth = typeof _win.normalizeMonthKey === 'function' ? _win.normalizeMonthKey(startRaw) : startRaw.slice(0, 7);
    var endMonth = typeof _win.normalizeMonthKey === 'function' ? _win.normalizeMonthKey(endRaw) : endRaw.slice(0, 7);

    if (endMonth < startMonth) {
        if (_win.alert) _win.alert('End Date must be on or after Start Date.');
        if (endInp) endInp.focus();
        return;
    }

    savePeriod(startMonth, endMonth, endMonth);
    showToast('Tasbeeh period settings updated');
    renderHistoryTab();

    if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.renderOldTab === 'function') {
        _win.TasbeehOldApp.renderOldTab();
    }
}

export function resetHistoryPeriod() {
    var now = new Date();
    var curMonth = typeof _win.getCurrentMonthKey === 'function' ? _win.getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
    var defaultStart = now.getFullYear() + '-01';
    var defaultEnd = typeof _win.getPrevMonthKey === 'function' ? _win.getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');

    savePeriod(defaultStart, defaultEnd, defaultEnd);
    showToast('Period reset to current year');
    renderHistoryTab();

    if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.renderOldTab === 'function') {
        _win.TasbeehOldApp.renderOldTab();
    }
}

export function init() {
    loadPeriod();
}

export var TasbeehHistoryApp = {
    init: init,
    loadPeriod: loadPeriod,
    savePeriod: savePeriod,
    renderHistoryTab: renderHistoryTab,
    applyPreset: applyPreset,
    saveHistoryPeriod: saveHistoryPeriod,
    resetHistoryPeriod: resetHistoryPeriod
};

if (typeof window !== 'undefined') {
    window.TasbeehHistoryApp = TasbeehHistoryApp;
    if (window.TasbeehApp) {
        window.TasbeehApp.renderHistoryTab = renderHistoryTab;
        window.TasbeehApp.loadPeriod = loadPeriod;
        window.TasbeehApp.savePeriod = savePeriod;
    }
}

export default TasbeehHistoryApp;

