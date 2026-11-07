/* ============================================================
   Nur Prayer — Digital Tasbeeh: Old View Module
   Path: tasbeeh/old/old.js
   Handles:
     - Sequential monthly clearance (jumps back month-by-month till start date)
     - Old tab rendering (Month banner, step-by-step progress, TO DO & COMPLETED tabs)
     - Old item interactions (edit count, toggle completed, open counter for old month)
   ============================================================ */

import {
    loadPeriod, savePeriod, openPeriodModal, savePeriodModal,
    resetPeriodModal, setPeriodPreset, updatePeriodPreview, PERIOD_PRESETS
} from '../tasbeeh-period.js';
import { getTasbeehViewModel, escHtml } from '../tasbeeh-view-model.js';

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
        var yr = parseInt(parts[0], 10), mo = parseInt(parts[1], 10) - 1;
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

    var curLabel = formatMonthLabel(curM), prevLabel = formatMonthLabel(prevMonthKey);
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
    var period = loadPeriod(), maxEnd = period.initialEnd || period.endDate;
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
    var period = loadPeriod(), maxEnd = period.initialEnd || (new Date().getFullYear() + '-09');
    savePeriod(period.startDate, maxEnd, maxEnd);
    showToast('Reset old tracking period to ' + formatMonthLabel(maxEnd));
    renderOldTab();
}

export function openCounterOld(id, monthKey) {
    if (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.openCounter === 'function') {
        _win.TasbeehCurrentApp.openCounter(id, monthKey);
    }
}

/* ---------- Old Card HTML Generator (Single-Column Row Layout) ---------- */
export function renderOldCardHtml(item, isDhikrDone, curOldMonth, monthName) {
    var isInfinite = item.targetCount === 'infinite', parts = curOldMonth.split('-');
    var yr = parseInt(parts[0], 10), mo = parseInt(parts[1], 10) - 1;
    var totalDays = (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.getDaysInMonth === 'function')
        ? _win.TasbeehCurrentApp.getDaysInMonth(yr, mo) : new Date(yr, mo + 1, 0).getDate();
    var completedDays = (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.getCompletedDaysInMonth === 'function')
        ? _win.TasbeehCurrentApp.getCompletedDaysInMonth(item.id, yr, mo) : 0;
    var targetDisplay = isInfinite ? '∞' : item.targetCount;

    return '<div class="tb-card bg-white border border-gray-200 rounded-3xl p-4 sm:p-5 flex flex-row gap-4 items-center cursor-pointer hover:border-gray-300 select-none transition-all w-full shadow-none ' + (isDhikrDone ? 'tb-card-done opacity-80' : '') + '" data-id="' + item.id + '" data-month="' + curOldMonth + '" role="button" tabindex="0" aria-label="' + escHtml(item.title) + '">' +
        '<div class="w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl bg-[#E8F5E9] text-[#094E3A] flex items-center justify-center text-2xl shrink-0 leading-none select-none overflow-hidden">' + renderIcon({ name: 'hands-praying' }) + '</div>' +
        '<div class="flex-1 min-w-0 flex flex-col justify-center gap-1.5">' +
        '<h6 class="tb-card-title text-[17px] font-bold text-gray-900 leading-tight m-0 truncate">' + escHtml(item.title) + '</h6>' +
        '<div class="tb-card-meta flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">' +
        '<span class="tb-meta-row inline-flex items-center gap-1.5">' + renderIcon('tb-target') + '<span>Target: <strong class="tb-val-num font-bold text-gray-900">' + targetDisplay + '</strong> <span class="text-gray-500">/day</span></span></span>' +
        '<span class="tb-meta-row inline-flex items-center gap-1.5">' + renderIcon({ name: 'calendar', prefix: 'fa-regular', color: 'text-gray-400', size: 13 }) + '<span>Total: <span class="tb-val-total text-gray-600 font-medium">' + totalDays + ' days</span></span></span>' +
        '</div>' +
        '<div class="flex items-center gap-2.5 mt-1">' +
        '<div class="inline-flex items-center gap-1.5 bg-[#094E3A] text-white text-xs font-semibold px-3 py-1 rounded-full shrink-0 leading-none shadow-none">' + renderIcon('tb-check-circle') + '<span>Done</span></div>' +
        '<span class="tb-val-done text-lg font-bold text-gray-900 leading-none">' + completedDays + '</span>' +
        (isDhikrDone ? '<span class="text-[#094E3A] font-bold inline-flex items-center gap-1 text-[11px] ml-2">' + renderIcon({ name: 'circle-check', className: 'me-1' }) + 'Month Completed</span>' : '') +
        '</div></div>' +
        '<div class="tb-card-actions flex flex-col items-center justify-between self-stretch shrink-0 py-0.5 pl-1">' +
        '<button type="button" class="tb-btn-edit w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200/80 flex items-center justify-center text-gray-600 cursor-pointer active:scale-95 transition-all p-0" data-act="tb-edit" title="Edit Dhikr" aria-label="Edit Dhikr">' + renderIcon('tb-pencil') + '</button>' +
        '<div class="text-gray-300 flex items-center justify-center">' + renderIcon('tb-chevron') + '</div>' +
        '</div></div>';
}

export function renderOldTab() {
    var oldBody = getEl(ELEMENT_IDS.OLD_BODY || 'tbOldBody');
    if (!oldBody) return;

    var emptyRangeEl = getEl(ELEMENT_IDS.OLD_EMPTY_RANGE || 'tbOldEmptyRange');
    var allCompletedEl = getEl(ELEMENT_IDS.OLD_ALL_COMPLETED || 'tbOldAllCompleted');
    var contentEl = getEl(ELEMENT_IDS.OLD_CONTENT || 'tbOldContent');

    var period = loadPeriod(), curOldMonth = getCurrentOldMonth();
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

    var items = getItems(), parts = curOldMonth.split('-');
    var yr = parseInt(parts[0], 10), mo = parseInt(parts[1], 10) - 1;
    var totalDays = (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.getDaysInMonth === 'function')
        ? _win.TasbeehCurrentApp.getDaysInMonth(yr, mo) : new Date(yr, mo + 1, 0).getDate();

    var todoOldItems = [], doneOldItems = [];
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
        advanceBanner.classList.toggle('d-none', !isAllDone);
        if (isAllDone && advanceMsg) advanceMsg.textContent = 'All targets for ' + monthName + ' are completed!';
    }

    var todoBadge = getEl(ELEMENT_IDS.OLD_TODO_BADGE || 'tbOldTodoBadge');
    if (todoBadge) todoBadge.textContent = todoOldItems.length;
    var doneBadge = getEl(ELEMENT_IDS.OLD_DONE_BADGE || 'tbOldDoneBadge');
    if (doneBadge) doneBadge.textContent = doneOldItems.length;

    var vm = (typeof getTasbeehViewModel === 'function') ? getTasbeehViewModel() : null;
    function mapOldCard(item, isComplete) {
        var isInfinite = item.targetCount === 'infinite', pParts = curOldMonth.split('-');
        var y = parseInt(pParts[0], 10), m = parseInt(pParts[1], 10) - 1;
        var tDays = (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.getDaysInMonth === 'function')
            ? _win.TasbeehCurrentApp.getDaysInMonth(y, m) : new Date(y, m + 1, 0).getDate();
        var cDays = (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.getCompletedDaysInMonth === 'function')
            ? _win.TasbeehCurrentApp.getCompletedDaysInMonth(item.id, y, m) : 0;
        return {
            id: item.id, title: item.title, month: curOldMonth,
            targetCount: isInfinite ? '∞' : item.targetCount, completedDays: cDays,
            totalDays: tDays, isComplete: !!isComplete, isTodayDone: false,
            onCardClick: function (d, e) {
                if (e && e.stopPropagation) e.stopPropagation();
                if (_win.TasbeehApp && typeof _win.TasbeehApp.openCounterOld === 'function') {
                    _win.TasbeehApp.openCounterOld(item.id, curOldMonth);
                } else if (_win.TasbeehApp && typeof _win.TasbeehApp.openCounter === 'function') {
                    _win.TasbeehApp.openCounter(item.id, curOldMonth);
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
        if (typeof vm.oldTodoItems === 'function') vm.oldTodoItems(todoOldItems.map(function (it) { return mapOldCard(it, false); }));
        if (typeof vm.oldDoneItems === 'function') vm.oldDoneItems(doneOldItems.map(function (it) { return mapOldCard(it, true); }));
    }

    var currentActive = (vm && typeof vm.oldActiveTab === 'function') ? vm.oldActiveTab() : 'todo';
    if (todoOldItems.length === 0 && doneOldItems.length > 0) switchOldTab('completed');
    else switchOldTab(currentActive || 'todo');
}

export function switchOldTab(tabName, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    var todoTab = getEl('tabTbOldTodo'), doneTab = getEl('tabTbOldDone');
    var todoList = getEl('tbOldTodoList'), doneList = getEl('tbOldDoneList');
    var todoBadge = getEl('tbOldTodoBadge'), doneBadge = getEl('tbOldDoneBadge');
    var vm = (typeof getTasbeehViewModel === 'function') ? getTasbeehViewModel() : null;
    if (vm && typeof vm.oldActiveTab === 'function') vm.oldActiveTab(tabName);
    var isTodo = tabName === 'todo';
    if (todoList) { todoList.classList.toggle('d-none', !isTodo); todoList.classList.toggle('hidden', !isTodo); }
    if (doneList) { doneList.classList.toggle('d-none', isTodo); doneList.classList.toggle('hidden', isTodo); }
    var actCls = 'flex-1 py-3 flex items-center justify-center gap-2 border-b-2 border-brand text-brand font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer select-none';
    var inactCls = 'flex-1 py-3 flex items-center justify-center gap-2 border-b-2 border-transparent text-gr-textMuted font-semibold text-xs uppercase tracking-wider hover:text-gr-text transition-colors cursor-pointer select-none';
    if (todoTab) { todoTab.setAttribute('aria-selected', isTodo ? 'true' : 'false'); todoTab.className = isTodo ? actCls : inactCls; }
    if (doneTab) { doneTab.setAttribute('aria-selected', !isTodo ? 'true' : 'false'); doneTab.className = !isTodo ? actCls : inactCls; }
    if (todoBadge) todoBadge.className = isTodo ? 'text-xs font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand' : 'text-xs font-bold px-2 py-0.5 rounded-full bg-surfaceBg text-gr-textMuted border border-borderGrey';
    if (doneBadge) doneBadge.className = !isTodo ? 'text-xs font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand' : 'text-xs font-bold px-2 py-0.5 rounded-full bg-surfaceBg text-gr-textMuted border border-borderGrey';
}
_win.switchOldTab = switchOldTab;

function bindEvents() {
    var settingsBtn = getEl('tbSettingsBtn');
    if (settingsBtn) settingsBtn.onclick = openPeriodModal;

    var btnSavePeriod = getEl('tbBtnSavePeriod');
    if (btnSavePeriod) {
        btnSavePeriod.onclick = function () {
            savePeriodModal(function () { currentOldMonthKey = null; renderOldTab(); });
        };
    }

    var btnResetPeriod = getEl('tbBtnResetPeriod');
    if (btnResetPeriod) {
        btnResetPeriod.onclick = function () {
            resetPeriodModal(function () { currentOldMonthKey = null; renderOldTab(); });
        };
    }

    var presetThisYear = getEl('tbPresetThisYear');
    if (presetThisYear) presetThisYear.onclick = function () { setPeriodPreset(PERIOD_PRESETS.THIS_YEAR); };
    var preset6M = getEl('tbPreset6Months');
    if (preset6M) preset6M.onclick = function () { setPeriodPreset(PERIOD_PRESETS.LAST_6_MONTHS); };
    var preset1Y = getEl('tbPreset1Year');
    if (preset1Y) preset1Y.onclick = function () { setPeriodPreset(PERIOD_PRESETS.LAST_1_YEAR); };

    var pStart = getEl('tbPeriodStart'), pEnd = getEl('tbPeriodEnd');
    if (pStart) pStart.oninput = updatePeriodPreview;
    if (pEnd) pEnd.oninput = updatePeriodPreview;

    var oldBody = getEl('tbOldBody');
    if (oldBody) {
        oldBody.onclick = function (e) {
            var tabBtn = e.target.closest('#tabTbOldTodo, #tabTbOldDone');
            if (tabBtn) { switchOldTab(tabBtn.id === 'tabTbOldTodo' ? 'todo' : 'completed', e); return; }
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
            if (card) openCounterOld(card.dataset.id, card.dataset.month);
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
    init: init, renderOldTab: renderOldTab, getCurrentOldMonth: getCurrentOldMonth,
    checkAndAdvanceMonth: checkAndAdvanceMonth, advanceOldMonth: advanceOldMonth,
    markMonthCompleted: markMonthCompleted, markCurrentMonthCompleted: markMonthCompleted,
    reopenLastMonth: reopenLastMonth, resetAllCompleted: resetAllCompleted,
    openPeriodModal: openPeriodModal, savePeriodModal: savePeriodModal,
    resetPeriodModal: resetPeriodModal, loadPeriod: loadPeriod, savePeriod: savePeriod,
    openCounterOld: openCounterOld, switchOldTab: switchOldTab
};

if (typeof window !== 'undefined') {
    window.TasbeehOldApp = TasbeehOldApp;
    if (window.TasbeehApp) {
        window.TasbeehApp.switchOldTab = switchOldTab;
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

