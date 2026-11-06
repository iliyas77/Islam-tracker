/* ============================================================
   Nur Prayer — Digital Tasbeeh: Old View Module
   Path: tasbeeh/tasbeeh-old.js
   Handles:
     - Sequential monthly clearance (jumps back month-by-month till start date)
     - Old tab rendering (Month banner, step-by-step progress, TO DO & COMPLETED groups)
     - Old item interactions (edit count, toggle completed, open counter for old month)
   ============================================================ */

import {
    loadPeriod,
    savePeriod,
    openPeriodModal,
    savePeriodModal,
    resetPeriodModal,
    setPeriodPreset,
    updatePeriodPreview,
    PERIOD_PRESETS
} from './tasbeeh-period.js';
import { getTasbeehViewModel, escHtml } from './tasbeeh-view-model.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var TASBEEH_CONSTANTS = _win.TASBEEH_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.TASBEEH) || {};
var ELEMENT_IDS = TASBEEH_CONSTANTS.ELEMENT_IDS || {};
var currentOldMonthKey = null;

function getEl(id) { return document.getElementById(id); }
var pad2 = function (n) {
    if (typeof _win.pad2 === 'function' && _win.pad2 !== pad2) return _win.pad2(n);
    return n < 10 ? '0' + n : '' + n;
};
function showToast(msg, d) { if (typeof _win.showToast === 'function') _win.showToast(msg, d); }
var formatMonthLabel = function (m) {
    if (typeof _win.formatMonthLabel === 'function' && _win.formatMonthLabel !== formatMonthLabel) return _win.formatMonthLabel(m);
    return m;
};
var renderIcon = function (opt) {
    if (typeof _win.renderIcon === 'function' && _win.renderIcon !== renderIcon) return _win.renderIcon(opt);
    return '';
};

function getItems() {
    if (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.getItems === 'function') {
        return _win.TasbeehCurrentApp.getItems();
    }
    if (_win.TasbeehApp && typeof _win.TasbeehApp.getItems === 'function') {
        return _win.TasbeehApp.getItems();
    }
    return [];
}

export function getCurrentOldMonth() {
    var period = loadPeriod();
    if (!period || !period.startDate || !period.endDate) return null;
    return (period.endDate < period.startDate) ? null : period.endDate;
}

export function checkAndAdvanceMonth(mKey) {
    var curM = mKey || getCurrentOldMonth();
    if (!curM) return;
    var period = loadPeriod();
    if (curM < period.startDate) return;

    var isAllDone = false;
    if (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.isMonthFullyCompleted === 'function') {
        isAllDone = _win.TasbeehCurrentApp.isMonthFullyCompleted(curM);
    } else {
        var items = getItems();
        var finiteItems = items.filter(function (it) { return it.targetCount !== 'infinite'; });
        if (finiteItems.length === 0) return;
        var parts = curM.split('-');
        var yr = parseInt(parts[0], 10);
        var mo = parseInt(parts[1], 10) - 1;
        var totalDays = (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.getDaysInMonth === 'function')
            ? _win.TasbeehCurrentApp.getDaysInMonth(yr, mo)
            : new Date(yr, mo + 1, 0).getDate();
        isAllDone = finiteItems.every(function (it) {
            var completedDays = (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.getCompletedDaysInMonth === 'function')
                ? _win.TasbeehCurrentApp.getCompletedDaysInMonth(it.id, yr, mo) : 0;
            return completedDays >= totalDays;
        });
    }

    if (!isAllDone) {
        showToast('Please complete all targets for ' + formatMonthLabel(curM) + ' before moving to previous month.');
        return;
    }

    var prevMonthKey = typeof _win.getPrevMonthKey === 'function' ? _win.getPrevMonthKey(curM) : (function (m) {
        var p = m.split('-'); var y = parseInt(p[0], 10); var mo = parseInt(p[1], 10) - 1;
        if (mo === 0) { mo = 12; y--; } return y + '-' + pad2(mo);
    })(curM);

    var curLabel = formatMonthLabel(curM);
    var prevLabel = formatMonthLabel(prevMonthKey);
    var isAllCleared = (prevMonthKey < period.startDate);

    var confirmFn = (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.confirmAction === 'function')
        ? _win.TasbeehCurrentApp.confirmAction
        : function (opt, cb) { if (_win.confirm && _win.confirm(opt.title + '\n\n' + opt.message.replace(/<[^>]+>/g, ''))) cb(); };

    confirmFn({
        title: '🎉 Month Completed!',
        message: 'All dhikr targets for <strong>' + curLabel + '</strong> are completed!<br><br>' +
            'Do you want to finalize this month, remove its tracking data, and ' +
            (isAllCleared ? 'complete all Old Tracking months?' : ('move to <strong>' + prevLabel + '</strong>?')),
        btnText: 'Finalize & Move Backward',
        isSuccess: true
    }, function () {
        if (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.removeMonthTrackingData === 'function') {
            _win.TasbeehCurrentApp.removeMonthTrackingData(curM);
        }
        savePeriod(period.startDate, prevMonthKey, period.initialEnd);
        currentOldMonthKey = null;
        renderOldTab();
        showToast('🎉 ' + curLabel + ' completed! ' + (isAllCleared ? 'All old tracking months cleared!' : ('Moved to ' + prevLabel)), 3500);
    });
}

export function advanceOldMonth() {
    if (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.advanceOldMonth === 'function') {
        _win.TasbeehCurrentApp.advanceOldMonth();
    } else {
        checkAndAdvanceMonth(getCurrentOldMonth());
    }
}

export function markMonthCompleted(mKey) { checkAndAdvanceMonth(mKey); }

export function reopenLastMonth() {
    var period = loadPeriod();
    var maxEnd = period.initialEnd || period.endDate;
    if (period.endDate >= maxEnd) {
        showToast('Cannot reopen: already at latest month (' + formatMonthLabel(maxEnd) + ')');
        return;
    }
    var nextM = typeof _win.getNextMonthKey === 'function' ? _win.getNextMonthKey(period.endDate) : (function (m) {
        var p = m.split('-'); var y = parseInt(p[0], 10); var mo = parseInt(p[1], 10) + 1;
        if (mo > 12) { mo = 1; y++; } return y + '-' + pad2(mo);
    })(period.endDate);

    if (nextM > maxEnd) nextM = maxEnd;
    savePeriod(period.startDate, nextM, maxEnd);
    showToast('Reopened ' + formatMonthLabel(nextM));
    renderOldTab();
}

export function resetAllCompleted() {
    var period = loadPeriod();
    var maxEnd = period.initialEnd || (new Date().getFullYear() + '-09');
    savePeriod(period.startDate, maxEnd, maxEnd);
    showToast('Reset old tracking period to ' + formatMonthLabel(maxEnd));
    renderOldTab();
}

export function openCounterOld(id, monthKey) {
    if (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.openCounter === 'function') {
        _win.TasbeehCurrentApp.openCounter(id, monthKey);
    }
}

export function renderOldCardHtml(item, isDhikrDone, curOldMonth, monthName) {
    var isInfinite = item.targetCount === 'infinite';
    var parts = curOldMonth.split('-');
    var yr = parseInt(parts[0], 10);
    var mo = parseInt(parts[1], 10) - 1;
    var totalDays = (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.getDaysInMonth === 'function')
        ? _win.TasbeehCurrentApp.getDaysInMonth(yr, mo) : new Date(yr, mo + 1, 0).getDate();
    var completedDays = (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.getCompletedDaysInMonth === 'function')
        ? _win.TasbeehCurrentApp.getCompletedDaysInMonth(item.id, yr, mo) : 0;
    var targetDisplay = isInfinite ? '∞' : item.targetCount;

    return '<div class="tb-card bg-white border border-borderGrey rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:border-brand min-h-[146px] select-none transition-all ' + (isDhikrDone ? 'tb-card-done opacity-80' : '') + '" data-id="' + item.id + '" data-month="' + curOldMonth + '" role="button" tabindex="0" aria-label="' + escHtml(item.title) + '">' +
        '<div class="tb-card-top flex items-start justify-between w-full">' +
        '<div class="w-[46px] h-[46px] min-w-[46px] min-h-[46px] rounded-2xl bg-dash-mintBg text-brand inline-flex items-center justify-center shrink-0 leading-none select-none overflow-hidden">' + renderIcon({ name: 'misbaha' }) + '</div>' +
        '<div class="tb-card-actions flex items-center gap-1.5 shrink-0 ml-auto">' +
        '<button type="button" class="tb-btn-edit w-8 h-8 rounded-lg bg-brand-light text-brand flex items-center justify-center cursor-pointer hover:bg-brand/20 active:scale-95 transition-all p-0" data-act="tb-edit" title="Edit Dhikr" aria-label="Edit Dhikr">' + renderIcon('tb-pencil') + '</button>' +
        renderIcon('tb-chevron') +
        '</div>' +
        '</div>' +
        '<div class="tb-card-body flex flex-col justify-end w-full mt-2.5 min-w-0">' +
        '<h6 class="tb-card-title text-base font-bold text-brand leading-snug mb-1 truncate">' + escHtml(item.title) + '</h6>' +
        '<div class="tb-card-meta flex flex-col gap-1 w-full">' +
        '<div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' + renderIcon('tb-target') + '<span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs">Target: <span class="tb-val-num font-semibold text-brand">' + targetDisplay + '</span> / day</span></div>' +
        '<div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' + renderIcon('tb-check-circle') + '<span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs"><span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand text-white leading-none" style="font-size:0.72rem;padding:0.25rem 0.6rem;">Done</span><strong class="tb-val-done ml-1 font-bold text-brand">' + completedDays + '</strong></span></div>' +
        '<div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' + renderIcon({ name: 'calendar-days', color: 'text-muted', size: 13 }) + '<span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs">Total: <span class="tb-val-total text-gr-textMuted font-medium">' + totalDays + ' days</span></span></div>' +
        (isDhikrDone ? '<div class="tb-meta-row tb-meta-sub-row"><span class="text-brand fw-bold" style="font-size: 11px;">' + renderIcon({ name: 'circle-check', className: 'me-1' }) + 'Month Completed</span></div>' : '') +
        '</div></div></div>';
}

export function renderOldTab() {
    var oldBody = getEl(ELEMENT_IDS.OLD_BODY || 'tbOldBody');
    if (!oldBody) return;

    var emptyRangeEl = getEl(ELEMENT_IDS.OLD_EMPTY_RANGE || 'tbOldEmptyRange');
    var allCompletedEl = getEl(ELEMENT_IDS.OLD_ALL_COMPLETED || 'tbOldAllCompleted');
    var contentEl = getEl(ELEMENT_IDS.OLD_CONTENT || 'tbOldContent');

    var period = loadPeriod();
    var curOldMonth = getCurrentOldMonth();
    var curMonthName = formatMonthLabel(typeof _win.getCurrentMonthKey === 'function' ? _win.getCurrentMonthKey() : '');
    var initialMaxEnd = period.initialEnd || period.endDate;

    if (initialMaxEnd < period.startDate) {
        var subNone = getEl(ELEMENT_IDS.HEADER_SUB || 'tbHeaderSub');
        if (subNone) subNone.textContent = 'None';
        if (emptyRangeEl) {
            emptyRangeEl.classList.remove('d-none');
            var startLabel = getEl(ELEMENT_IDS.OLD_EMPTY_RANGE_START || 'tbOldEmptyRangeStart');
            if (startLabel) startLabel.textContent = formatMonthLabel(period.startDate);
            var curLabel = getEl(ELEMENT_IDS.OLD_EMPTY_RANGE_CUR || 'tbOldEmptyRangeCur');
            if (curLabel) curLabel.textContent = curMonthName;
        }
        if (allCompletedEl) allCompletedEl.classList.add('d-none');
        if (contentEl) contentEl.classList.add('d-none');
        return;
    }

    if (!curOldMonth) {
        var subAll = getEl(ELEMENT_IDS.HEADER_SUB || 'tbHeaderSub');
        if (subAll) subAll.textContent = 'All Completed';
        if (allCompletedEl) {
            allCompletedEl.classList.remove('d-none');
            var startDoneLabel = getEl(ELEMENT_IDS.OLD_ALL_COMPLETED_START || 'tbOldAllCompletedStart');
            if (startDoneLabel) startDoneLabel.textContent = formatMonthLabel(period.startDate);
        }
        if (emptyRangeEl) emptyRangeEl.classList.add('d-none');
        if (contentEl) contentEl.classList.add('d-none');
        return;
    }

    if (emptyRangeEl) emptyRangeEl.classList.add('d-none');
    if (allCompletedEl) allCompletedEl.classList.add('d-none');
    if (contentEl) contentEl.classList.remove('d-none');

    var monthName = formatMonthLabel(curOldMonth);
    var sub = getEl(ELEMENT_IDS.HEADER_SUB || 'tbHeaderSub');
    if (sub) sub.textContent = monthName;

    var items = getItems();
    var parts = curOldMonth.split('-');
    var yr = parseInt(parts[0], 10);
    var mo = parseInt(parts[1], 10) - 1;
    var totalDays = (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.getDaysInMonth === 'function')
        ? _win.TasbeehCurrentApp.getDaysInMonth(yr, mo) : new Date(yr, mo + 1, 0).getDate();

    var todoOldItems = [];
    var doneOldItems = [];

    items.forEach(function (item) {
        var isInfinite = item.targetCount === 'infinite';
        var completedDays = (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.getCompletedDaysInMonth === 'function')
            ? _win.TasbeehCurrentApp.getCompletedDaysInMonth(item.id, yr, mo) : 0;
        var isDhikrDone = !isInfinite && completedDays >= totalDays;
        if (isDhikrDone) doneOldItems.push(item);
        else todoOldItems.push(item);
    });

    var isAllDone = todoOldItems.length === 0 && items.length > 0;
    var advanceBanner = getEl(ELEMENT_IDS.OLD_ADVANCE_BANNER || 'tbOldAdvanceBanner');
    var advanceMsg = getEl(ELEMENT_IDS.OLD_ADVANCE_BANNER_MSG || 'tbOldAdvanceBannerMsg');
    if (advanceBanner) {
        if (isAllDone) {
            advanceBanner.classList.remove('d-none');
            if (advanceMsg) advanceMsg.textContent = 'All targets for ' + monthName + ' are completed!';
        } else {
            advanceBanner.classList.add('d-none');
        }
    }

    var todoBadge = getEl(ELEMENT_IDS.OLD_TODO_BADGE || 'tbOldTodoBadge');
    if (todoBadge) todoBadge.textContent = todoOldItems.length;

    var doneBadge = getEl(ELEMENT_IDS.OLD_DONE_BADGE || 'tbOldDoneBadge');
    if (doneBadge) doneBadge.textContent = doneOldItems.length;

    var vm = (typeof getTasbeehViewModel === 'function') ? getTasbeehViewModel() : null;

    function mapOldCard(item, isComplete) {
        var isInfinite = item.targetCount === 'infinite';
        var pParts = curOldMonth.split('-');
        var y = parseInt(pParts[0], 10);
        var m = parseInt(pParts[1], 10) - 1;
        var tDays = (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.getDaysInMonth === 'function')
            ? _win.TasbeehCurrentApp.getDaysInMonth(y, m) : new Date(y, m + 1, 0).getDate();
        var cDays = (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.getCompletedDaysInMonth === 'function')
            ? _win.TasbeehCurrentApp.getCompletedDaysInMonth(item.id, y, m) : 0;

        return {
            id: item.id,
            title: item.title,
            month: curOldMonth,
            targetCount: isInfinite ? '∞' : item.targetCount,
            completedDays: cDays,
            totalDays: tDays,
            isComplete: !!isComplete,
            isTodayDone: false,
            onCardClick: function (d, e) {
                if (e && e.stopPropagation) e.stopPropagation();
                if (_win.TasbeehApp && typeof _win.TasbeehApp.openCounterFromHome === 'function') {
                    _win.TasbeehApp.openCounterFromHome(item.id, curOldMonth, 'old');
                } else if (_win.TasbeehApp && typeof _win.TasbeehApp.openCounterView === 'function') {
                    _win.TasbeehApp.openCounterView(item.id, curOldMonth);
                }
            },
            onEditClick: function (d, e) {
                if (e && e.stopPropagation) e.stopPropagation();
                if (_win.TasbeehApp && typeof _win.TasbeehApp.openEditModal === 'function') {
                    _win.TasbeehApp.openEditModal(item.id);
                }
            }
        };
    }

    if (vm) {
        if (typeof vm.oldTodoItems === 'function') {
            vm.oldTodoItems(todoOldItems.map(function (it) { return mapOldCard(it, false); }));
        }
        if (typeof vm.oldDoneItems === 'function') {
            vm.oldDoneItems(doneOldItems.map(function (it) { return mapOldCard(it, true); }));
        }
    }

    var isOldDoneExpanded = doneOldItems.length > 0;
    var doneToggle = getEl(ELEMENT_IDS.OLD_DONE_TOGGLE || 'tbOldDoneToggle');
    var doneList = getEl(ELEMENT_IDS.OLD_DONE_LIST || 'tbOldDoneList');
    if (doneToggle) {
        doneToggle.classList.toggle('collapsed', !isOldDoneExpanded);
        doneToggle.setAttribute('aria-expanded', isOldDoneExpanded ? 'true' : 'false');
    }
    if (doneList) {
        doneList.classList.toggle('show', isOldDoneExpanded);
    }
}

function bindEvents() {
    var settingsBtn = getEl('tbSettingsBtn');
    if (settingsBtn) settingsBtn.onclick = openPeriodModal;

    var btnSavePeriod = getEl('tbBtnSavePeriod');
    if (btnSavePeriod) {
        btnSavePeriod.onclick = function () {
            savePeriodModal(function () {
                currentOldMonthKey = null;
                renderOldTab();
            });
        };
    }

    var btnResetPeriod = getEl('tbBtnResetPeriod');
    if (btnResetPeriod) {
        btnResetPeriod.onclick = function () {
            resetPeriodModal(function () {
                currentOldMonthKey = null;
                renderOldTab();
            });
        };
    }

    var presetThisYear = getEl('tbPresetThisYear');
    if (presetThisYear) presetThisYear.onclick = function () { setPeriodPreset(PERIOD_PRESETS.THIS_YEAR); };

    var preset6M = getEl('tbPreset6Months');
    if (preset6M) preset6M.onclick = function () { setPeriodPreset(PERIOD_PRESETS.LAST_6_MONTHS); };

    var preset1Y = getEl('tbPreset1Year');
    if (preset1Y) preset1Y.onclick = function () { setPeriodPreset(PERIOD_PRESETS.LAST_1_YEAR); };

    var pStart = getEl('tbPeriodStart');
    var pEnd = getEl('tbPeriodEnd');
    if (pStart) pStart.oninput = updatePeriodPreview;
    if (pEnd) pEnd.oninput = updatePeriodPreview;

    var oldBody = getEl('tbOldBody');
    if (oldBody) {
        oldBody.onclick = function (e) {
            var btn = e.target.closest('button[data-act]');
            if (btn) {
                var act = btn.dataset.act;
                if (act === 'tb-old-advance') advanceOldMonth();
                else if (act === 'tb-old-reopen') reopenLastMonth();
                else if (act === 'tb-reset-all-completed') resetAllCompleted();
                else if (act === 'tb-open-settings' || act === 'tb-change-period') openPeriodModal();
                return;
            }

            var editBtn = e.target.closest('button[data-act="tb-edit"]');
            if (editBtn) {
                var cardForEdit = editBtn.closest('.tb-card[data-id]');
                if (cardForEdit) {
                    e.stopPropagation();
                    if (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.openModal === 'function') {
                        _win.TasbeehCurrentApp.openModal(cardForEdit.dataset.id);
                    }
                }
                return;
            }

            var card = e.target.closest('.tb-card[data-id]');
            if (card) {
                openCounterOld(card.dataset.id, card.dataset.month);
            }
        };

        oldBody.onkeydown = function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                var btn = e.target.closest('button[data-act]');
                if (btn) return;
                var card = e.target.closest('.tb-card[data-id]');
                if (card) {
                    e.preventDefault();
                    openCounterOld(card.dataset.id, card.dataset.month);
                }
            }
        };
    }
}

export function init() {
    loadPeriod();
    bindEvents();
}

export var TasbeehOldApp = {
    init: init,
    renderOldTab: renderOldTab,
    getCurrentOldMonth: getCurrentOldMonth,
    checkAndAdvanceMonth: checkAndAdvanceMonth,
    advanceOldMonth: advanceOldMonth,
    markMonthCompleted: markMonthCompleted,
    markCurrentMonthCompleted: markMonthCompleted,
    reopenLastMonth: reopenLastMonth,
    resetAllCompleted: resetAllCompleted,
    openPeriodModal: openPeriodModal,
    savePeriodModal: savePeriodModal,
    resetPeriodModal: resetPeriodModal,
    loadPeriod: loadPeriod,
    savePeriod: savePeriod,
    openCounterOld: openCounterOld
};

if (typeof window !== 'undefined') {
    window.TasbeehOldApp = TasbeehOldApp;
    if (window.TasbeehApp) {
        window.TasbeehApp.openPeriodModal = openPeriodModal;
        window.TasbeehApp.checkAndAdvanceMonth = checkAndAdvanceMonth;
        window.TasbeehApp.advanceOldMonth = advanceOldMonth;
        window.TasbeehApp.markCurrentMonthCompleted = markMonthCompleted;
        window.TasbeehApp.reopenLastMonth = reopenLastMonth;
        window.TasbeehApp.resetAllCompleted = resetAllCompleted;
        window.TasbeehApp.getCurrentOldMonth = getCurrentOldMonth;
        window.TasbeehApp.loadPeriod = loadPeriod;
        window.TasbeehApp.savePeriod = savePeriod;
        window.TasbeehApp.renderOldTab = renderOldTab;
    }
}

export default TasbeehOldApp;
