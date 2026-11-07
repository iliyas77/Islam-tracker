/* ============================================================
   Nur Prayer — Digital Tasbeeh: Current View & Counter Overlay
   Path: tasbeeh/current/current.js
   Handles:
     - Current tab rendering (TO DO & COMPLETED tabs, single-column rows)
     - Current Dhikr card generation
     - Counter Overlay Opening & Closing (Full-screen digital calendar)
     - Tab navigation coordinator (Home / Current / Old / History)
     - Keyboard navigation & event bindings
   ============================================================ */

import {
    loadItems, persistItems, checkDailyReset, loadCalCompletions,
    isDayCompleted, setDayCompleted, getDaysInMonth, getCompletedDaysInMonth,
    loadCurrentPeriod, saveCurrentPeriod, getCurrentTrackingMonth,
    removeMonthTrackingData, isMonthFullyCompleted,
    TASBEEH_CONSTANTS, ELEMENT_IDS, TABS
} from '../tasbeeh-model.js';
import {
    renderCalendar, handleCalendarDayClick, confirmDayStatusChange,
    navigateMonth, advanceCurrentMonth, advanceOldMonth, confirmAction,
    pendingConfirmCallback, pendingToggleDate, confirmModalInstance
} from '../tasbeeh-calendar.js';
import { openModal, saveModal, deleteItem, syncChips } from '../tasbeeh-modal.js';
import { getTasbeehViewModel, escHtml } from '../tasbeeh-view-model.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var TAB_HEADERS = TASBEEH_CONSTANTS.TAB_HEADERS || {
    current: { iconClass: 'calendar text-brand', label: 'Digital Tasbeeh' },
    old: { iconClass: 'clock-rotate-left text-warning', label: 'Old Tasbeeh' },
    history: { iconClass: 'gear text-gr-accent', label: 'Tasbeeh History', sub: 'Period & Settings' }
};

function getEl(id) { return document.getElementById(id); }
var td = function () { return (typeof _win.td === 'function' && _win.td !== td) ? _win.td() : new Date().toISOString().slice(0, 10); };
var formatMonthLabel = function (m) { return (typeof _win.formatMonthLabel === 'function' && _win.formatMonthLabel !== formatMonthLabel) ? _win.formatMonthLabel(m) : m; };
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

/* ---------- State Object ---------- */
export var state = {
    items: [], activeId: null, editingId: null, activeTab: 'current',
    counterMonthKey: null, countMode: 'finite', calViewYear: null,
    calViewMonth: null, calCompletions: {},
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

/* ---------- Current Card HTML Generator (Single-Column Row Layout) ---------- */
export function renderCurrentCardHtml(item, isComplete) {
    var curMonthKey = getCurrentTrackingMonth(), parts = curMonthKey.split('-');
    var yr = parseInt(parts[0], 10), mo = parseInt(parts[1], 10) - 1;
    var totalDays = getDaysInMonth(yr, mo), completedDays = getCompletedDaysInMonth(state.calCompletions, item.id, yr, mo);
    var isTodayInCurMonth = (td().slice(0, 7) === curMonthKey);
    var isTodayDone = isTodayInCurMonth ? isDayCompleted(state.calCompletions, item.id, td()) : false;
    var targetDisplay = item.targetCount === 'infinite' ? '∞' : item.targetCount;

    return '<div class="tb-card bg-white border border-gray-200 rounded-3xl p-4 sm:p-5 flex flex-row gap-4 items-center cursor-pointer hover:border-gray-300 select-none transition-all w-full shadow-none ' + (isComplete ? 'tb-card-done opacity-80' : '') + '" data-id="' + item.id + '" data-ref="page.tasbeeh.card" role="button" tabindex="0" aria-label="' + escHtml(item.title) + '">' +
        '<div class="w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl bg-[#E8F5E9] text-[#094E3A] flex items-center justify-center text-2xl shrink-0 leading-none select-none overflow-hidden" data-ref="page.tasbeeh.card.icon">' + renderIcon({ name: 'hands-praying' }) + '</div>' +
        '<div class="flex-1 min-w-0 flex flex-col justify-center gap-1.5" data-ref="page.tasbeeh.card.info">' +
        '<h6 class="tb-card-title text-[17px] font-bold text-gray-900 leading-tight m-0 truncate" data-ref="page.tasbeeh.card.title">' + escHtml(item.title) + '</h6>' +
        '<div class="tb-card-meta flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium" data-ref="page.tasbeeh.card.meta">' +
        '<span class="tb-meta-row inline-flex items-center gap-1.5">' + renderIcon('tb-target') + '<span>Target: <strong class="tb-val-num font-bold text-gray-900">' + targetDisplay + '</strong> <span class="text-gray-500">/day</span></span></span>' +
        '<span class="tb-meta-row inline-flex items-center gap-1.5">' + renderIcon({ name: 'calendar', prefix: 'fa-regular', color: 'text-gray-400', size: 13 }) + '<span>Total: <span class="tb-val-total text-gray-600 font-medium">' + totalDays + ' days</span></span></span>' +
        '</div>' +
        '<div class="flex items-center gap-2.5 mt-1">' +
        '<div class="inline-flex items-center gap-1.5 bg-[#094E3A] text-white text-xs font-semibold px-3 py-1 rounded-full shrink-0 leading-none shadow-none">' + renderIcon('tb-check-circle') + '<span>Done</span></div>' +
        '<span class="tb-val-done text-lg font-bold text-gray-900 leading-none">' + completedDays + '</span>' +
        (isTodayDone ? '<span class="text-[#094E3A] font-bold inline-flex items-center gap-1 text-[11px] ml-2">' + renderIcon({ name: 'circle-check', className: 'me-1' }) + 'Today Completed</span>' : '') +
        '</div></div>' +
        '<div class="tb-card-actions flex flex-col items-center justify-between self-stretch shrink-0 py-0.5 pl-1" data-ref="page.tasbeeh.card.actions">' +
        '<button type="button" class="tb-btn-edit w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200/80 flex items-center justify-center text-gray-600 cursor-pointer active:scale-95 transition-all p-0" data-act="tb-edit" title="Edit Dhikr" aria-label="Edit Dhikr" data-ref="page.tasbeeh.card.edit-btn">' + renderIcon('tb-pencil') + '</button>' +
        '<div class="text-gray-300 flex items-center justify-center">' + renderIcon('tb-chevron') + '</div>' +
        '</div></div>';
}

/* ---------- Switch Current Tab (TO DO / COMPLETED) ---------- */
export function switchCurrentTab(tab, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    var t = (tab === 'completed') ? 'completed' : 'todo';
    var vm = (typeof getTasbeehViewModel === 'function') ? getTasbeehViewModel() : null;
    if (vm && typeof vm.currentActiveTab === 'function') vm.currentActiveTab(t);
    var todoBtn = getEl('tabTbCurrentTodo'), doneBtn = getEl('tabTbCurrentDone');
    var todoList = getEl('tbCurrentTodoList'), doneList = getEl('tbCurrentDoneList');
    var todoBadge = getEl('tbCurrentTodoBadge'), doneBadge = getEl('tbCurrentDoneBadge');
    if (todoBtn) {
        todoBtn.classList.toggle('border-brand', t === 'todo'); todoBtn.classList.toggle('text-brand', t === 'todo');
        todoBtn.classList.toggle('font-bold', t === 'todo'); todoBtn.classList.toggle('border-transparent', t !== 'todo');
        todoBtn.classList.toggle('text-gr-textMuted', t !== 'todo'); todoBtn.setAttribute('aria-selected', t === 'todo' ? 'true' : 'false');
    }
    if (doneBtn) {
        doneBtn.classList.toggle('border-brand', t === 'completed'); doneBtn.classList.toggle('text-brand', t === 'completed');
        doneBtn.classList.toggle('font-bold', t === 'completed'); doneBtn.classList.toggle('border-transparent', t !== 'completed');
        doneBtn.classList.toggle('text-gr-textMuted', t !== 'completed'); doneBtn.setAttribute('aria-selected', t === 'completed' ? 'true' : 'false');
    }
    if (todoBadge) {
        todoBadge.className = (t === 'todo') ? 'text-xs font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand' : 'text-xs font-bold px-2 py-0.5 rounded-full bg-surfaceBg text-gr-textMuted border border-borderGrey';
    }
    if (doneBadge) {
        doneBadge.className = (t === 'completed') ? 'text-xs font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand' : 'text-xs font-bold px-2 py-0.5 rounded-full bg-surfaceBg text-gr-textMuted border border-borderGrey';
    }
    if (todoList) { todoList.classList.toggle('d-none', t !== 'todo'); todoList.classList.toggle('hidden', t !== 'todo'); }
    if (doneList) { doneList.classList.toggle('d-none', t !== 'completed'); doneList.classList.toggle('hidden', t !== 'completed'); }
}

/* ---------- Rendering: Current Tab ---------- */
export function renderCurrentTab() {
    var listEl = getEl(ELEMENT_IDS.CURRENT_LIST || 'tbList'), emptyEl = getEl(ELEMENT_IDS.CURRENT_EMPTY_STATE || 'tbEmptyState');
    if (!listEl) return;
    if (!state.items || state.items.length === 0) state.items = loadItems();
    state.calCompletions = loadCalCompletions();

    if (state.items.length === 0) {
        if (emptyEl) emptyEl.classList.remove('d-none');
        listEl.classList.add('d-none');
        return;
    }
    if (emptyEl) emptyEl.classList.add('d-none');
    listEl.classList.remove('d-none');

    var curMonthKey = getCurrentTrackingMonth(), parts = curMonthKey.split('-');
    var yr = parseInt(parts[0], 10), mo = parseInt(parts[1], 10) - 1;
    var totalDays = getDaysInMonth(yr, mo), sub = getEl(ELEMENT_IDS.HEADER_SUB || 'tbHeaderSub');
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

    var isAllCurDone = isMonthFullyCompleted(state.calCompletions, state.items, curMonthKey);
    var advanceBanner = getEl(ELEMENT_IDS.CURRENT_ADVANCE_BANNER || 'tbCurrentAdvanceBanner');
    if (advanceBanner) {
        advanceBanner.classList.toggle('d-none', !isAllCurDone);
    }

    var todoBadge = getEl(ELEMENT_IDS.CURRENT_TODO_BADGE || 'tbCurrentTodoBadge');
    if (todoBadge) todoBadge.textContent = todoItems.length;
    var doneBadge = getEl(ELEMENT_IDS.CURRENT_DONE_BADGE || 'tbCurrentDoneBadge');
    if (doneBadge) doneBadge.textContent = doneItems.length;

    var vm = (typeof getTasbeehViewModel === 'function') ? getTasbeehViewModel() : null;
    function mapCurCard(item, isComplete) {
        var cParts = curMonthKey.split('-'), y = parseInt(cParts[0], 10), m = parseInt(cParts[1], 10) - 1;
        var tDays = getDaysInMonth(y, m), cDays = getCompletedDaysInMonth(state.calCompletions, item.id, y, m);
        var isToday = (td().slice(0, 7) === curMonthKey), tDone = isToday ? isDayCompleted(state.calCompletions, item.id, td()) : false;
        return {
            id: item.id, title: item.title, targetCount: item.targetCount === 'infinite' ? '∞' : item.targetCount,
            completedDays: cDays, totalDays: tDays, isComplete: !!isComplete, isTodayDone: tDone,
            onCardClick: function (d, e) { if (e && e.stopPropagation) e.stopPropagation(); openCounter(item.id); },
            onEditClick: function (d, e) { if (e && e.stopPropagation) e.stopPropagation(); openModal(state, item.id); }
        };
    }

    if (vm) {
        if (typeof vm.currentTodoItems === 'function') {
            vm.currentTodoItems(todoItems.map(function (it) { return mapCurCard(it, false); }));
        }
        if (typeof vm.currentDoneItems === 'function') {
            vm.currentDoneItems(doneItems.map(function (it) { return mapCurCard(it, true); }));
        }
    }

    var todoGrid = getEl('tbCurrentTodoGrid'), doneGrid = getEl('tbCurrentDoneGrid');
    if (todoGrid && (!vm || typeof ko === 'undefined')) {
        todoGrid.innerHTML = todoItems.map(function (it) { return renderCurrentCardHtml(it, false); }).join('');
    }
    if (doneGrid && (!vm || typeof ko === 'undefined')) {
        doneGrid.innerHTML = doneItems.map(function (it) { return renderCurrentCardHtml(it, true); }).join('');
    }

    var currentActive = (vm && typeof vm.currentActiveTab === 'function') ? vm.currentActiveTab() : 'todo';
    if (todoItems.length === 0 && doneItems.length > 0) switchCurrentTab('completed');
    else if (doneItems.length === 0 && todoItems.length > 0 && currentActive === 'completed') switchCurrentTab('todo');
    else switchCurrentTab(currentActive || 'todo');
}

/* ---------- Tab Navigation & Rendering ---------- */
export function render() {
    if (state.activeTab === 'old') {
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
    state.activeTab = (tab === TABS.OLD || tab === TABS.HISTORY) ? tab : TABS.CURRENT;
    var tabConfigs = [
        { key: TABS.CURRENT, btnId: 'tabTbCurrent', bodyId: 'tbCurrentBody', header: TAB_HEADERS.current },
        { key: TABS.OLD, btnId: 'tabTbOld', bodyId: 'tbOldBody', header: TAB_HEADERS.old },
        { key: TABS.HISTORY, btnId: 'tabTbHistory', bodyId: 'tbHistoryBody', header: TAB_HEADERS.history }
    ];

    tabConfigs.forEach(function (t) {
        var btn = getEl(t.btnId), body = getEl(t.bodyId);
        var isActive = (state.activeTab === t.key);
        if (btn) {
            btn.classList.toggle('active', isActive); btn.classList.toggle('text-brand', isActive);
            btn.classList.toggle('text-gr-textMuted', !isActive); btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        }
        if (body) body.classList.toggle('d-none', !isActive);
    });

    var addBtn = getEl('tbAddBtn');
    if (addBtn) addBtn.classList.toggle('d-none', state.activeTab === TABS.HISTORY);

    var curHeader = TAB_HEADERS[state.activeTab] || TAB_HEADERS.current;
    var icon = getEl('tbHeaderIcon'), label = getEl('tbHeaderLabel'), sub = getEl('tbHeaderSub');
    if (icon) {
        var parts = (curHeader.iconClass || 'calendar text-brand').split(' ');
        icon.className = 'fa-solid fa-' + parts[0] + ' text-base ' + parts.slice(1).join(' ');
    }
    if (label) label.textContent = curHeader.label || 'Digital Tasbeeh';
    if (sub) sub.textContent = state.activeTab === TABS.CURRENT ? formatMonthLabel(getCurrentTrackingMonth()) : (curHeader.sub || '');

    render();
}

/* ---------- Counter Overlay Opening & Closing ---------- */
export function openCounter(id, monthKey) {
    var item = null;
    for (var i = 0; i < state.items.length; i++) {
        if (state.items[i].id === id) { item = state.items[i]; break; }
    }
    if (!item) return;

    state.activeId = id;
    state.counterMonthKey = monthKey || getCurrentTrackingMonth();

    var view = getEl('tasbeehCounterView'), nav = getEl('tasbeehBottomNav'), fab = getEl('tbAddBtn');
    if (view) view.classList.remove('d-none');
    if (nav) nav.classList.add('d-none');
    if (fab) fab.classList.add('d-none');

    var title = getEl('tbCounterTitle'), targetLabel = getEl('tbCalTargetLabel');
    if (title) title.textContent = item.title;
    if (targetLabel) targetLabel.textContent = 'Target: ' + (item.targetCount === 'infinite' ? '∞' : item.targetCount) + ' / day';

    var parts = state.counterMonthKey.split('-');
    state.calViewYear = parseInt(parts[0], 10);
    state.calViewMonth = parseInt(parts[1], 10) - 1;
    renderCalendar(state);
}

export function openCounterOld(id, monthKey) {
    openCounter(id, monthKey);
}

export function closeCounter() {
    var view = getEl('tasbeehCounterView'), nav = getEl('tasbeehBottomNav'), fab = getEl('tbAddBtn');
    if (view) view.classList.add('d-none');
    if (nav) nav.classList.remove('d-none');
    if (fab) fab.classList.toggle('d-none', state.activeTab === TABS.HISTORY);

    var prevActiveId = state.activeId;
    state.activeId = null;

    if (state.activeTab === 'old') {
        if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.checkAndAdvanceMonth === 'function' && prevActiveId) {
            _win.TasbeehOldApp.checkAndAdvanceMonth();
        }
        if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.renderOldTab === 'function') {
            _win.TasbeehOldApp.renderOldTab();
        }
    } else {
        renderCurrentTab();
    }
}

/* ---------- Event Bindings ---------- */
function bindEvents() {
    var formTitle = getEl('tbModalTitleInput'), formCount = getEl('tbModalCountInput'), countChips = getEl('tbCountChips');
    if (countChips) {
        countChips.onclick = function (e) {
            var chip = e.target.closest('.chip-btn');
            if (!chip) return;
            var c = chip.dataset.count;
            state.countMode = (c === 'infinite') ? 'infinite' : 'finite';
            if (formCount) formCount.value = (c === 'infinite') ? '' : c;
            syncChips(state.countMode);
        };
    }
    if (formCount) {
        formCount.oninput = function () {
            if (formCount.value !== '') state.countMode = 'finite';
            syncChips(state.countMode);
        };
    }

    var listEl = getEl('tbList');
    if (listEl) {
        listEl.onclick = function (e) {
            var tabBtn = e.target.closest('#tabTbCurrentTodo, #tabTbCurrentDone');
            if (tabBtn) { switchCurrentTab(tabBtn.id === 'tabTbCurrentTodo' ? 'todo' : 'completed', e); return; }
            var btn = e.target.closest('button[data-act]');
            if (btn && btn.dataset.act === 'tb-current-advance') { e.stopPropagation(); advanceCurrentMonth(state); return; }
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

    var btnBack = getEl('tbBtnBack');
    if (btnBack) {
        btnBack.onclick = function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            closeCounter();
        };
    }

    var counterView = getEl('tasbeehCounterView');
    if (counterView) {
        counterView.onclick = function (e) {
            var b = e.target.closest('#tbBtnBack, [data-act="tb-back"]');
            if (b) {
                if (e && e.stopPropagation) e.stopPropagation();
                closeCounter();
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

    var prevMonth = getEl('tbCalPrevMonth'), nextMonth = getEl('tbCalNextMonth');
    if (prevMonth) prevMonth.onclick = function () { navigateMonth(state, -1); };
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
    switchTab('current');
}

export var TasbeehCurrentApp = {
    init: init, render: render, switchTab: switchTab, renderCurrentTab: renderCurrentTab,
    switchCurrentTab: switchCurrentTab,
    openCounter: openCounter, openCounterOld: openCounterOld, closeCounter: closeCounter,
    openModal: function (id) { openModal(state, id); }, openAddModal: function () { openModal(state, null); },
    openEditModal: function (id) { openModal(state, id); }, saveModal: function () { saveModal(state); },
    deleteItem: function (id) { return deleteItem(state, id); }, getItems: getItems, setItems: setItems,
    persist: function () { persistItems(state.items); }, loadCurrentPeriod: loadCurrentPeriod, saveCurrentPeriod: saveCurrentPeriod,
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
    window.switchCurrentTab = switchCurrentTab;
}

export default TasbeehCurrentApp;
