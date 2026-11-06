/* ============================================================
   Nur Prayer — Digital Tasbeeh: Current View & Counter Overlay
   Path: tasbeeh/tasbeeh-current.js
   Handles:
     - Current tab rendering (TO DO & COMPLETED groups, daily progress)
     - Current Dhikr card generation
     - Counter Overlay Opening & Closing (Full-screen digital calendar)
     - Tab navigation coordinator (Home / Current / Old / History)
     - Keyboard navigation & event bindings
   ============================================================ */

import {
    loadItems,
    persistItems,
    checkDailyReset,
    loadCalCompletions,
    isDayCompleted,
    setDayCompleted,
    getDaysInMonth,
    getCompletedDaysInMonth,
    loadCurrentPeriod,
    saveCurrentPeriod,
    getCurrentTrackingMonth,
    removeMonthTrackingData,
    isMonthFullyCompleted,
    getBookmark,
    setBookmark,
    getBookmarkedChants,
    TASBEEH_CONSTANTS,
    ELEMENT_IDS,
    TABS
} from './tasbeeh-model.js';
import {
    renderCalendar,
    handleCalendarDayClick,
    confirmDayStatusChange,
    navigateMonth,
    advanceCurrentMonth,
    advanceOldMonth,
    confirmAction,
    pendingConfirmCallback,
    pendingToggleDate,
    confirmModalInstance
} from './tasbeeh-calendar.js';
import {
    openModal,
    saveModal,
    deleteItem,
    syncChips
} from './tasbeeh-modal.js';
import { getTasbeehViewModel, escHtml } from './tasbeeh-view-model.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var TAB_HEADERS = TASBEEH_CONSTANTS.TAB_HEADERS || {
    home: { iconClass: 'house text-brand', label: 'Digital Tasbeeh', sub: 'Home · Bookmarks' },
    current: { iconClass: 'calendar text-brand', label: 'Digital Tasbeeh' },
    old: { iconClass: 'clock-rotate-left text-warning', label: 'Old Tasbeeh' },
    history: { iconClass: 'gear text-gr-accent', label: 'Tasbeeh History', sub: 'Period & Settings' }
};

var counterOpenedFrom = null;

function getEl(id) { return document.getElementById(id); }
var td = function () { return (typeof _win.td === 'function' && _win.td !== td) ? _win.td() : new Date().toISOString().slice(0, 10); };
var formatMonthLabel = function (m) { return (typeof _win.formatMonthLabel === 'function' && _win.formatMonthLabel !== formatMonthLabel) ? _win.formatMonthLabel(m) : m; };
var renderIcon = function (opt) { return (typeof _win.renderIcon === 'function' && _win.renderIcon !== renderIcon) ? _win.renderIcon(opt) : ''; };

/* ---------- State Object ---------- */
export var state = {
    items: [],
    activeId: null,
    editingId: null,
    activeTab: 'current',
    counterMonthKey: null,
    countMode: 'finite',
    calViewYear: null,
    calViewMonth: null,
    calCompletions: {},
    getActiveItem: function () {
        if (!state.activeId) return null;
        for (var i = 0; i < state.items.length; i++) {
            if (state.items[i].id === state.activeId) return state.items[i];
        }
        return null;
    },
    render: function () { render(); },
    renderCurrentTab: function () { renderCurrentTab(); },
    renderCalendar: function () { renderCalendar(state); },
    closeCounter: function () { closeCounter(); }
};

export function getActiveItem() { return state.getActiveItem(); }
export function getItems() {
    if (!state.items || state.items.length === 0) state.items = loadItems();
    return state.items;
}
export function setItems(newItems) {
    state.items = newItems || [];
    persistItems(state.items);
}

/* ---------- Current Card HTML Generator ---------- */
export function renderCurrentCardHtml(item, isComplete) {
    var curMonthKey = getCurrentTrackingMonth();
    var parts = curMonthKey.split('-');
    var yr = parseInt(parts[0], 10);
    var mo = parseInt(parts[1], 10) - 1;
    var totalDays = getDaysInMonth(yr, mo);
    var completedDays = getCompletedDaysInMonth(state.calCompletions, item.id, yr, mo);
    var isTodayInCurMonth = (td().slice(0, 7) === curMonthKey);
    var isTodayDone = isTodayInCurMonth ? isDayCompleted(state.calCompletions, item.id, td()) : false;
    var targetDisplay = item.targetCount === 'infinite' ? '∞' : item.targetCount;

    return '<div class="tb-card bg-white border border-borderGrey rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:border-brand min-h-[146px] select-none transition-all ' + (isComplete ? 'tb-card-done opacity-80' : '') + '" data-id="' + item.id + '" data-ref="page.tasbeeh.card" role="button" tabindex="0" aria-label="' + escHtml(item.title) + '">' +
        '<div class="tb-card-top flex items-start justify-between w-full">' +
        '<div class="w-[46px] h-[46px] min-w-[46px] min-h-[46px] rounded-2xl bg-dash-mintBg text-brand inline-flex items-center justify-center shrink-0 leading-none select-none overflow-hidden" data-ref="page.tasbeeh.card.icon">' + renderIcon({ name: 'misbaha' }) + '</div>' +
        '<div class="tb-card-actions flex items-center gap-1.5 shrink-0 ml-auto">' +
        '<button type="button" class="tb-btn-edit w-8 h-8 rounded-lg bg-brand-light text-brand flex items-center justify-center cursor-pointer hover:bg-brand/20 active:scale-95 transition-all p-0" data-act="tb-edit" title="Edit Dhikr" aria-label="Edit Dhikr" data-ref="page.tasbeeh.card.edit-btn">' + renderIcon('tb-pencil') + '</button>' +
        renderIcon('tb-chevron') +
        '</div>' +
        '</div>' +
        '<div class="tb-card-body flex flex-col justify-end w-full mt-2.5 min-w-0" data-ref="page.tasbeeh.card.info">' +
        '<h6 class="tb-card-title text-base font-bold text-brand leading-snug mb-1 truncate" data-ref="page.tasbeeh.card.title">' + escHtml(item.title) + '</h6>' +
        '<div class="tb-card-meta flex flex-col gap-1 w-full" data-ref="page.tasbeeh.card.meta">' +
        '<div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' + renderIcon('tb-target') + '<span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs">Target: <span class="tb-val-num font-semibold text-brand">' + targetDisplay + '</span> / day</span></div>' +
        '<div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' + renderIcon('tb-check-circle') + '<span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs"><span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand text-white leading-none" style="font-size:0.72rem;padding:0.25rem 0.6rem;">Done</span><strong class="tb-val-done ml-1 font-bold text-brand">' + completedDays + '</strong></span></div>' +
        '<div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' + renderIcon({ name: 'calendar-days', color: 'text-muted', size: 13 }) + '<span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs">Total: <span class="tb-val-total text-gr-textMuted font-medium">' + totalDays + ' days</span></span></div>' +
        (isTodayDone ? '<div class="tb-meta-row tb-meta-sub-row"><span class="text-brand fw-bold" style="font-size: 11px;">' + renderIcon({ name: 'circle-check', className: 'me-1' }) + 'Today Completed</span></div>' : '') +
        '</div></div></div>';
}

/* ---------- Rendering: Current Tab ---------- */
export function renderCurrentTab() {
    var listEl = getEl(ELEMENT_IDS.CURRENT_LIST || 'tbList');
    var emptyEl = getEl(ELEMENT_IDS.CURRENT_EMPTY_STATE || 'tbEmptyState');
    if (!listEl) return;

    if (state.items.length === 0) {
        if (emptyEl) emptyEl.classList.remove('d-none');
        listEl.classList.add('d-none');
        return;
    }
    if (emptyEl) emptyEl.classList.add('d-none');
    listEl.classList.remove('d-none');

    var curMonthKey = getCurrentTrackingMonth();
    var parts = curMonthKey.split('-');
    var yr = parseInt(parts[0], 10);
    var mo = parseInt(parts[1], 10) - 1;
    var totalDays = getDaysInMonth(yr, mo);
    var sub = getEl(ELEMENT_IDS.HEADER_SUB || 'tbHeaderSub');
    if (sub && state.activeTab === 'current') sub.textContent = formatMonthLabel(curMonthKey);

    var todoItems = [], doneItems = [];
    var isTodayInCurMonth = (td().slice(0, 7) === curMonthKey);

    state.items.forEach(function (item) {
        var completedDays = getCompletedDaysInMonth(state.calCompletions, item.id, yr, mo);
        var isTodayDone = isTodayInCurMonth ? isDayCompleted(state.calCompletions, item.id, td()) : false;
        var isAllMonthDone = totalDays > 0 && completedDays >= totalDays;
        if (isAllMonthDone || (isTodayInCurMonth && isTodayDone)) doneItems.push(item);
        else todoItems.push(item);
    });

    var todoBadge = getEl(ELEMENT_IDS.CURRENT_TODO_BADGE || 'tbCurrentTodoBadge');
    if (todoBadge) todoBadge.textContent = todoItems.length;
    var doneBadge = getEl(ELEMENT_IDS.CURRENT_DONE_BADGE || 'tbCurrentDoneBadge');
    if (doneBadge) doneBadge.textContent = doneItems.length;

    var vm = (typeof getTasbeehViewModel === 'function') ? getTasbeehViewModel() : null;
    function mapCurCard(item, isComplete) {
        var cParts = curMonthKey.split('-');
        var y = parseInt(cParts[0], 10);
        var m = parseInt(cParts[1], 10) - 1;
        var tDays = getDaysInMonth(y, m);
        var cDays = getCompletedDaysInMonth(state.calCompletions, item.id, y, m);
        var isToday = (td().slice(0, 7) === curMonthKey);
        var tDone = isToday ? isDayCompleted(state.calCompletions, item.id, td()) : false;
        var isInf = item.targetCount === 'infinite';

        return {
            id: item.id,
            title: item.title,
            targetCount: isInf ? '∞' : item.targetCount,
            completedDays: cDays,
            totalDays: tDays,
            isComplete: !!isComplete,
            isTodayDone: tDone,
            onCardClick: function (d, e) {
                if (e && e.stopPropagation) e.stopPropagation();
                openCounter(item.id);
            },
            onEditClick: function (d, e) {
                if (e && e.stopPropagation) e.stopPropagation();
                openModal(state, item.id);
            }
        };
    }

    if (vm) {
        var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);
        var canW = function (t) { return t && typeof t === 'function' && ((k && k.isWriteableObservable) ? k.isWriteableObservable(t) : true); };
        try { if (canW(vm.currentTodoItems)) vm.currentTodoItems(todoItems.map(function (it) { return mapCurCard(it, false); })); } catch (_) {}
        try { if (canW(vm.currentDoneItems)) vm.currentDoneItems(doneItems.map(function (it) { return mapCurCard(it, true); })); } catch (_) {}
    }

    var isDoneExpanded = doneItems.length > 0;
    var doneToggle = getEl(ELEMENT_IDS.CURRENT_DONE_TOGGLE || 'tbCurrentDoneToggle');
    var doneList = getEl(ELEMENT_IDS.CURRENT_DONE_LIST || 'tbCurrentDoneList');
    if (doneToggle) {
        doneToggle.classList.toggle('collapsed', !isDoneExpanded);
        doneToggle.setAttribute('aria-expanded', isDoneExpanded ? 'true' : 'false');
    }
    if (doneList) doneList.classList.toggle('show', isDoneExpanded);
}

/* ---------- Tab Navigation & Rendering ---------- */
export function render() {
    if (state.activeTab === 'home') {
        if (_win.TasbeehHomeApp && typeof _win.TasbeehHomeApp.renderHomeTab === 'function') _win.TasbeehHomeApp.renderHomeTab();
    } else if (state.activeTab === 'old') {
        if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.renderOldTab === 'function') _win.TasbeehOldApp.renderOldTab();
    } else if (state.activeTab === 'history') {
        if (_win.TasbeehHistoryApp && typeof _win.TasbeehHistoryApp.renderHistoryTab === 'function') _win.TasbeehHistoryApp.renderHistoryTab();
    } else {
        renderCurrentTab();
    }

    var vm = (typeof getTasbeehViewModel === 'function') ? getTasbeehViewModel() : null;
    if (vm) {
        if (typeof vm.currentSubTab === 'function') vm.currentSubTab(state.activeTab);
        if (vm.header && TAB_HEADERS && TAB_HEADERS[state.activeTab]) {
            var th = TAB_HEADERS[state.activeTab];
            if (typeof vm.header.title === 'function') vm.header.title(th.label);
            if (typeof vm.header.subtitle === 'function') {
                vm.header.subtitle(state.activeTab === TABS.CURRENT ? formatMonthLabel(getCurrentTrackingMonth()) : th.sub);
            }
            if (typeof vm.header.iconClass === 'function') vm.header.iconClass(th.iconClass);
        }
    }
}

export function switchTab(tab) {
    state.activeTab = (tab === TABS.OLD || tab === TABS.HISTORY || tab === TABS.HOME) ? tab : TABS.CURRENT;
    var tabConfigs = [
        { key: TABS.HOME, btnId: 'tabTbHome', bodyId: 'tbHomeBody', header: TAB_HEADERS.home },
        { key: TABS.CURRENT, btnId: 'tabTbCurrent', bodyId: 'tbCurrentBody', header: TAB_HEADERS.current },
        { key: TABS.OLD, btnId: 'tabTbOld', bodyId: 'tbOldBody', header: TAB_HEADERS.old },
        { key: TABS.HISTORY, btnId: 'tabTbHistory', bodyId: 'tbHistoryBody', header: TAB_HEADERS.history }
    ];

    tabConfigs.forEach(function (t) {
        var btn = getEl(t.btnId);
        var body = getEl(t.bodyId);
        var isActive = (state.activeTab === t.key);
        if (btn) {
            btn.classList.toggle('active', isActive);
            btn.classList.toggle('text-brand', isActive);
            btn.classList.toggle('text-gr-textMuted', !isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        }
        if (body) body.classList.toggle('d-none', !isActive);
    });

    var addBtn = getEl('tbAddBtn');
    if (addBtn) addBtn.classList.toggle('d-none', state.activeTab === TABS.HOME || state.activeTab === TABS.HISTORY);

    var curHeader = TAB_HEADERS[state.activeTab] || TAB_HEADERS.current;
    var icon = getEl('tbHeaderIcon');
    var label = getEl('tbHeaderLabel');
    var sub = getEl('tbHeaderSub');
    if (icon) {
        if (_win.Icon && typeof _win.Icon.update === 'function') _win.Icon.update(icon, curHeader.iconClass);
        else icon.className = curHeader.iconClass;
    }
    if (label) label.textContent = curHeader.label;
    if (sub) {
        if (state.activeTab === TABS.OLD) {
            var curOldM = _win.TasbeehOldApp && typeof _win.TasbeehOldApp.getCurrentOldMonth === 'function' ? _win.TasbeehOldApp.getCurrentOldMonth() : null;
            sub.textContent = curOldM ? formatMonthLabel(curOldM) : 'All Completed';
        } else if (state.activeTab === TABS.CURRENT) {
            sub.textContent = formatMonthLabel(getCurrentTrackingMonth());
        } else {
            sub.textContent = curHeader.sub || '';
        }
    }

    render();
}

/* ---------- Counter Overlay Opening & Closing ---------- */
export function openCounter(id, oldMonthKey) {
    var item = null;
    for (var i = 0; i < state.items.length; i++) {
        if (state.items[i].id === id) { item = state.items[i]; break; }
    }
    if (!item) return;

    if (oldMonthKey) setBookmark('old', id, oldMonthKey);
    else setBookmark('current', id);

    state.activeId = id;
    state.counterMonthKey = oldMonthKey || null;

    var curMKey = state.counterMonthKey || getCurrentTrackingMonth();
    var parts = curMKey.split('-');
    state.calViewYear = parseInt(parts[0], 10);
    state.calViewMonth = parseInt(parts[1], 10) - 1;

    var topTitle = item.title + (state.counterMonthKey ? (' (' + formatMonthLabel(state.counterMonthKey) + ')') : '');
    var topTitleEl = getEl('tbCounterTopTitle');
    if (topTitleEl) topTitleEl.textContent = topTitle;
    var titleEl = getEl('tbCounterTitle');
    if (titleEl) titleEl.textContent = item.title;

    renderCalendar(state);

    var counterView = getEl('tasbeehCounterView');
    if (counterView) {
        counterView.classList.remove('d-none');
        counterView.classList.add('flex');
    }
}

export function openCounterOld(id, monthKey) { openCounter(id, monthKey); }

export function closeCounter() {
    state.activeId = null;
    var prevCM = state.counterMonthKey;
    state.counterMonthKey = null;

    var counterView = getEl('tasbeehCounterView');
    if (counterView) {
        counterView.classList.add('d-none');
        counterView.classList.remove('flex');
    }

    if (prevCM && _win.TasbeehOldApp && typeof _win.TasbeehOldApp.checkAndAdvanceMonth === 'function') {
        _win.TasbeehOldApp.checkAndAdvanceMonth(prevCM);
    }

    render();

    if (counterOpenedFrom === 'home') {
        counterOpenedFrom = null;
        switchTab('home');
    }
}

export function openCounterFromHome(id, monthKey, type) {
    counterOpenedFrom = 'home';
    if (typeof _win.showPage === 'function') _win.showPage('tasbeeh');
    if (type === 'old') {
        switchTab('old');
        openCounterOld(id, monthKey);
    } else {
        switchTab('current');
        openCounter(id);
    }
}

/* ---------- Event Bindings ---------- */
function bindEvents() {
    var addBtn = getEl('tbAddBtn');
    if (addBtn) addBtn.onclick = function () { openModal(state, null); };
    var saveBtn = getEl('tbModalSaveBtn');
    if (saveBtn) saveBtn.onclick = function () { saveModal(state); };
    var modalDelBtn = getEl('tbModalDelBtn');
    if (modalDelBtn) modalDelBtn.onclick = function () { if (state.editingId) deleteItem(state, state.editingId); };
    var btnBack = getEl('tbBtnBack');
    if (btnBack) btnBack.onclick = closeCounter;
    var btnEditActive = getEl('tbBtnEditActive');
    if (btnEditActive) btnEditActive.onclick = function () { if (state.activeId) openModal(state, state.activeId); };

    ['Home', 'Current', 'Old', 'History'].forEach(function (t) {
        var tabBtn = getEl('tabTb' + t);
        if (tabBtn) tabBtn.onclick = function () { switchTab(t.toLowerCase()); };
    });

    var chipsBox = getEl('tbCountChips');
    if (chipsBox) {
        chipsBox.onclick = function (e) {
            var btn = e.target.closest('button[data-count]');
            if (!btn) return;
            var val = btn.dataset.count;
            var inp = getEl('tbFormCount');
            if (val === 'infinite') {
                state.countMode = 'infinite';
                if (inp) inp.disabled = true;
            } else {
                state.countMode = 'finite';
                if (inp) { inp.disabled = false; inp.value = val; }
            }
            syncChips(state.countMode);
        };
    }

    var formCount = getEl('tbFormCount');
    if (formCount) {
        formCount.oninput = function () {
            if (formCount.value !== '') state.countMode = 'finite';
            syncChips(state.countMode);
        };
    }

    var listEl = getEl('tbList');
    if (listEl) {
        listEl.onclick = function (e) {
            var btn = e.target.closest('button[data-act]');
            if (btn && btn.dataset.act === 'tb-current-advance') {
                e.stopPropagation();
                advanceCurrentMonth(state);
                return;
            }
            var card = e.target.closest('[data-id]');
            if (!card) return;
            e.stopPropagation();
            var id = card.dataset.id;
            if (btn) {
                var act = btn.dataset.act;
                if (act === 'tb-open') openCounter(id);
                else if (act === 'tb-edit') openModal(state, id);
                else if (act === 'tb-del') deleteItem(state, id);
            } else {
                openCounter(id);
            }
        };
    }

    var calGrid = getEl('tbCalGrid');
    if (calGrid) {
        calGrid.onclick = function (e) {
            var cell = e.target.closest('.tb-cal-cell[data-date]');
            if (!cell || cell.classList.contains('tb-cal-empty')) return;
            handleCalendarDayClick(state, cell.dataset.date);
        };
    }

    var prevMonth = getEl('tbCalPrevMonth');
    if (prevMonth) prevMonth.onclick = function () { navigateMonth(state, -1); };
    var nextMonth = getEl('tbCalNextMonth');
    if (nextMonth) nextMonth.onclick = function () { navigateMonth(state, 1); };

    var btnConfirmChange = getEl('tbBtnConfirmChange');
    if (btnConfirmChange) {
        btnConfirmChange.onclick = function () {
            if (typeof pendingConfirmCallback === 'function') {
                var cb = pendingConfirmCallback;
                if (confirmModalInstance) confirmModalInstance.hide();
                cb();
                return;
            }
            if (pendingToggleDate) confirmDayStatusChange(state);
        };
    }
}

/* ---------- Public API ---------- */
export function init() {
    state.items = loadItems();
    state.calCompletions = loadCalCompletions();
    loadCurrentPeriod();
    checkDailyReset();
    persistItems(state.items);
    bindEvents();
    switchTab('home');
}

export var TasbeehCurrentApp = {
    init: init, render: render, switchTab: switchTab, renderCurrentTab: renderCurrentTab,
    openCounter: openCounter, openCounterOld: openCounterOld, closeCounter: closeCounter,
    openModal: function (id) { openModal(state, id); }, openAddModal: function () { openModal(state, null); },
    openEditModal: function (id) { openModal(state, id); }, saveModal: function () { saveModal(state); },
    deleteItem: function (id) { return deleteItem(state, id); }, getItems: getItems, setItems: setItems,
    persist: function () { persistItems(state.items); }, getBookmark: getBookmark, setBookmark: setBookmark,
    getBookmarkedChants: function () { return getBookmarkedChants(state.items, state.calCompletions); },
    openCounterFromHome: openCounterFromHome, loadCurrentPeriod: loadCurrentPeriod, saveCurrentPeriod: saveCurrentPeriod,
    getCurrentTrackingMonth: getCurrentTrackingMonth,
    removeMonthTrackingData: function (mKey) { removeMonthTrackingData(state.calCompletions, state.items, mKey); },
    isMonthFullyCompleted: function (mKey) { return isMonthFullyCompleted(state.calCompletions, state.items, mKey); },
    advanceCurrentMonth: function () { advanceCurrentMonth(state); }, advanceOldMonth: function () { advanceOldMonth(state); },
    confirmAction: confirmAction, isDayCompleted: function (itemId, dStr) { return isDayCompleted(state.calCompletions, itemId, dStr); },
    setDayCompleted: function (itemId, dStr, c) { setDayCompleted(state.calCompletions, state.items, itemId, dStr, c); },
    getDaysInMonth: getDaysInMonth,
    getCompletedDaysInMonth: function (itemId, y, m) { return getCompletedDaysInMonth(state.calCompletions, itemId, y, m); },
    renderCalendar: function () { renderCalendar(state); }
};

if (typeof window !== 'undefined') {
    window.TasbeehCurrentApp = TasbeehCurrentApp;
    window.TasbeehApp = TasbeehCurrentApp;
}

export default TasbeehCurrentApp;
