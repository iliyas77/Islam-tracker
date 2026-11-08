/* ============================================================
   Nur Prayer — Digital Tasbeeh: ViewModel & Component Registry
   Path: features/tasbeeh/tasbeeh-view-model.js
   Handles:
     - Component templates definition
     - TasbeehPageViewModel
     - Component registration for Knockout
     - initTasbeeh bootstrap logic
   ============================================================ */

import { getCurrentTrackingMonth } from './tasbeeh-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
if (typeof window === 'undefined') {
    globalThis.window = _win;
}

export function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

if (typeof window !== 'undefined') {
    window.escHtml = escHtml;
}

/* ---------- Digital Tasbeeh Component Templates ---------- */
export const TasbeehPageTemplate = { element: 'tasbeeh-page-template', file: 'features/tasbeeh/tasbeeh.html' };
export const TasbeehHeaderTemplate = { element: 'tasbeeh-header-template', file: 'features/tasbeeh/templates/tasbeeh-header.html' };
export const TasbeehCounterCardTemplate = { element: 'tasbeeh-counter-card-template', file: 'features/tasbeeh/templates/tasbeeh-counter-card.html' };
export const TasbeehProgressCircleTemplate = { element: 'tasbeeh-progress-circle-template', file: 'features/tasbeeh/templates/tasbeeh-progress-circle.html' };
export const TasbeehNavTabTemplate = { element: 'tasbeeh-nav-tab-template', file: 'features/tasbeeh/templates/tasbeeh-nav-tab.html' };

/* ---------- Tasbeeh Counter Card ViewModel ---------- */
export function TasbeehCounterCardViewModel(params) {
    if (params instanceof TasbeehCounterCardViewModel) return params;
    if (!(this instanceof TasbeehCounterCardViewModel)) return new TasbeehCounterCardViewModel(params);
    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);
    var self = this;

    function unwrap(v, def) {
        var res = (typeof v === 'function') ? v() : v;
        return (res !== undefined && res !== null) ? res : def;
    }

    self.id = unwrap(p.id, '');
    self.title = unwrap(p.title, 'Dhikr');
    self.month = unwrap(p.month, null);
    self.targetCount = unwrap(p.targetCount, 33);
    self.completedDays = unwrap(p.completedDays, 0);
    self.totalDays = unwrap(p.totalDays, 30);
    var rawComplete = unwrap(p.isComplete, unwrap(p.isCompleted, false));
    self.isComplete = (k && k.isObservable(p.isComplete)) ? p.isComplete : ((k && k.isObservable(p.isCompleted)) ? p.isCompleted : rawComplete);
    self.isCompleted = self.isComplete;
    self.isTodayDone = unwrap(p.isTodayDone, false);

    self.handleClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var targetItem = (p.item && typeof p.item === 'function') ? p.item() : (p.item || self);
        var cb = p.onClick || p.onCardClick;
        if (typeof cb === 'function') {
            cb(targetItem, e);
        }
    };
    self.onCardClick = self.handleClick;

    self.handleEditClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var targetItem = (p.item && typeof p.item === 'function') ? p.item() : (p.item || self);
        var cb = p.onEditClick || p.onEdit;
        if (typeof cb === 'function') {
            cb(targetItem, e);
        }
    };
    self.onEditClick = self.handleEditClick;
}

/* ---------- Knockout ViewModel & Component Registration ---------- */
var tasbeehViewModel = null;

export function switchCurrentTab(tabName) {
    var vm = (typeof getTasbeehViewModel === 'function') ? getTasbeehViewModel() : null;
    if (vm && typeof vm.currentActiveTab === 'function') vm.currentActiveTab(tabName);
    if (typeof document === 'undefined') return;
    var todoTab = document.getElementById('tabTbCurrentTodo'), doneTab = document.getElementById('tabTbCurrentDone');
    var todoList = document.getElementById('tbCurrentTodoList'), doneList = document.getElementById('tbCurrentDoneList');
    var todoBadge = document.getElementById('tbCurrentTodoBadge'), doneBadge = document.getElementById('tbCurrentDoneBadge');
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
_win.switchCurrentTab = switchCurrentTab;

export function getTasbeehViewModel() {
    if (!tasbeehViewModel && typeof TasbeehPageViewModel === 'function') {
        tasbeehViewModel = new TasbeehPageViewModel();
    }
    return tasbeehViewModel;
}

export function TasbeehPageViewModel(params) {
    params = params || {};
    var self = this;
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);

    self.currentSubTab = (k && k.observable) ? k.observable('current') : function () { return 'current'; };
    self.currentActiveTab = (k && k.observable) ? k.observable('todo') : function () { return 'todo'; };
    self.currentTodoItems = (k && k.observableArray) ? k.observableArray([]) : [];
    self.currentDoneItems = (k && k.observableArray) ? k.observableArray([]) : [];
    self.oldActiveTab = (k && k.observable) ? k.observable('todo') : function () { return 'todo'; };
    self.oldTodoItems = (k && k.observableArray) ? k.observableArray([]) : [];
    self.oldDoneItems = (k && k.observableArray) ? k.observableArray([]) : [];
    self.switchCurrentTab = function (tab, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (k && k.isObservable(self.currentActiveTab)) {
            self.currentActiveTab(tab);
        }
        if (typeof _win.switchCurrentTab === 'function') {
            _win.switchCurrentTab(tab);
        }
    };

    self.oldActiveTab = (k && k.observable) ? k.observable('todo') : function () { return 'todo'; };
    self.switchOldTab = function (tab, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (k && k.isObservable(self.oldActiveTab)) {
            self.oldActiveTab(tab);
        }
        if (typeof _win.switchOldTab === 'function') {
            _win.switchOldTab(tab);
        }
    };

    self.header = {
        title: (k && k.observable) ? k.observable('Digital Tasbeeh') : 'Digital Tasbeeh',
        subtitle: (k && k.observable) ? k.observable('') : '',
        iconClass: (k && k.observable) ? k.observable('fa-solid fa-calendar text-brand') : 'fa-solid fa-calendar text-brand',
        goHome: function (d, e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (typeof showPage === 'function') showPage('dashboard');
        }
    };

    self.switchTab = function (tab, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (window.TasbeehApp && typeof window.TasbeehApp.switchTab === 'function') {
            window.TasbeehApp.switchTab(tab);
        }
    };

    self.closeCounter = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        self.closeCalendar();
        if (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.closeCounter === 'function') {
            _win.TasbeehCurrentApp.closeCounter();
        } else if (_win.TasbeehApp && typeof _win.TasbeehApp.closeCounter === 'function') {
            _win.TasbeehApp.closeCounter();
        }
    };

    self.openAddModal = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        self.openAddForm();
        if (window.TasbeehApp && typeof window.TasbeehApp.openAddModal === 'function') {
            window.TasbeehApp.openAddModal();
        }
    };

    // Calendar detail page & form coordination
    self.activeCalendarItem = (k && k.observable) ? k.observable(null) : function () { return null; };
    var defaultMonth = (typeof getCurrentTrackingMonth === 'function') ? getCurrentTrackingMonth() : null;
    self.calendarMonth = (k && k.observable) ? k.observable(defaultMonth) : function () { return defaultMonth; };
    self.isCalendarOpen = (k && k.pureComputed) ? k.pureComputed(function () {
        return !!self.activeCalendarItem();
    }) : function () { return false; };

    self.isFormOpen = (k && k.observable) ? k.observable(false) : function () { return false; };
    self.editingItem = (k && k.observable) ? k.observable(null) : function () { return null; };

    self.openCalendar = function (item, month) {
        var m = month || ((typeof getCurrentTrackingMonth === 'function') ? getCurrentTrackingMonth() : null);
        if (typeof self.calendarMonth === 'function') self.calendarMonth(m);
        if (typeof self.activeCalendarItem === 'function') self.activeCalendarItem(item || null);
    };

    self.closeCalendar = function () {
        if (typeof self.activeCalendarItem === 'function') self.activeCalendarItem(null);
    };

    self.openAddForm = function () {
        if (typeof self.editingItem === 'function') self.editingItem(null);
        if (typeof self.isFormOpen === 'function') self.isFormOpen(true);
    };

    self.openEditForm = function (item) {
        if (typeof self.editingItem === 'function') self.editingItem(item || null);
        if (typeof self.isFormOpen === 'function') self.isFormOpen(true);
    };

    self.closeForm = function () {
        if (typeof self.isFormOpen === 'function') self.isFormOpen(false);
        if (typeof self.editingItem === 'function') self.editingItem(null);
    };

    // Explicit parameters for child components
    var refreshCur = function () { if (typeof _win.renderCurrentTab === 'function') _win.renderCurrentTab(); };
    var refreshOld = function () { if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.renderOldTab === 'function') _win.TasbeehOldApp.renderOldTab(); };

    // Level 1: Named business action handlers for Current, Old, and History
    self.handleCurrentCardClick = function (item) {
        self.openCalendar(item, typeof getCurrentTrackingMonth === 'function' ? getCurrentTrackingMonth() : null);
    };

    self.handleCurrentEditClick = function (item) {
        self.openEditForm(item);
    };

    self.handleOldCardClick = function (item, month) {
        self.openCalendar(item, month);
    };

    self.handleOldEditClick = function (item) {
        self.openEditForm(item);
    };

    self.handleReopenMonth = function (m, e) {
        self.reopenLastMonth(m, e);
    };

    self.handleResetCompleted = function (d, e) {
        self.resetAllCompleted(d, e);
    };

    self.currentFeedParams = {
        activeTab: self.currentActiveTab,
        todoItems: self.currentTodoItems,
        doneItems: self.currentDoneItems,
        onTabSwitch: function (tab, e) { self.switchCurrentTab(tab, e); },
        onCardClick: self.handleCurrentCardClick,
        onClick: self.handleCurrentCardClick,
        onEditClick: self.handleCurrentEditClick
    };

    self.currentCalendarParams = {
        item: self.activeCalendarItem,
        monthKey: self.calendarMonth,
        onBack: function () { self.closeCalendar(); refreshCur(); },
        onDayChange: function () { refreshCur(); }
    };

    self.currentFormParams = {
        isOpen: self.isFormOpen,
        item: self.editingItem,
        onClose: function () { self.closeForm(); refreshCur(); },
        onSave: function () { self.closeForm(); refreshCur(); }
    };

    self.oldFeedParams = {
        activeTab: self.oldActiveTab,
        todoItems: self.oldTodoItems,
        doneItems: self.oldDoneItems,
        onTabSwitch: function (tab, e) { self.switchOldTab(tab, e); },
        onCardClick: self.handleOldCardClick,
        onClick: self.handleOldCardClick,
        onEditClick: self.handleOldEditClick,
        onAdjustStartDate: function () { self.switchTab('history'); }
    };

    self.oldCalendarParams = {
        item: self.activeCalendarItem,
        monthKey: self.calendarMonth,
        onBack: function () { self.closeCalendar(); refreshOld(); },
        onDayChange: function () { refreshOld(); }
    };

    self.oldFormParams = {
        isOpen: self.isFormOpen,
        item: self.editingItem,
        onClose: function () { self.closeForm(); refreshOld(); },
        onSave: function () { self.closeForm(); refreshOld(); }
    };

    self.historyPageParams = {
        onReopenMonth: self.handleReopenMonth,
        onClick: self.handleReopenMonth,
        onResetCompleted: self.handleResetCompleted
    };

    self.reopenLastMonth = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (window.TasbeehApp && typeof window.TasbeehApp.reopenLastMonth === 'function') {
            window.TasbeehApp.reopenLastMonth();
        }
        if (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.renderHistoryTab === 'function') {
            window.TasbeehHistoryApp.renderHistoryTab();
        }
    };

    self.resetAllCompleted = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (window.TasbeehApp && typeof window.TasbeehApp.resetAllCompleted === 'function') {
            window.TasbeehApp.resetAllCompleted();
        }
        if (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.renderHistoryTab === 'function') {
            window.TasbeehHistoryApp.renderHistoryTab();
        }
    };

    var tbStore = _win.TasbeehStore || null;

    self.currentDhikrsCount = (tbStore && k && k.isObservable(tbStore.currentDhikrsCount))
        ? tbStore.currentDhikrsCount
        : ((k && k.observable) ? k.observable(0) : 0);
    self.clearedMonthsCount = (tbStore && k && k.isObservable(tbStore.clearedMonthsCount))
        ? tbStore.clearedMonthsCount
        : ((k && k.observable) ? k.observable(0) : 0);
    self.activeOldLabel = (tbStore && k && k.isObservable(tbStore.activeOldLabel))
        ? tbStore.activeOldLabel
        : ((k && k.observable) ? k.observable('All Cleared') : 'All Cleared');

    self.historyProgress = {
        percentCleared: (k && k.observable) ? k.observable(0) : 0,
        totalMonths: (k && k.observable) ? k.observable(0) : 0,
        clearedMonths: (k && k.observable) ? k.observable(0) : 0,
        pendingMonths: (k && k.observable) ? k.observable(0) : 0
    };
}

export function initTasbeeh() {
    if (typeof _win.registerAllComponents === 'function') {
        _win.registerAllComponents();
    }
    var el = document.getElementById('tasbeehPage');
    if (!document.getElementById('app') && el && typeof ko !== 'undefined') {
        var vm = getTasbeehViewModel();
        if (!ko.dataFor(el)) {
            ko.applyBindings(vm, el);
        }
    }
    if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.init === 'function') {
        _win.TasbeehOldApp.init();
    }
    if (_win.TasbeehHistoryApp && typeof _win.TasbeehHistoryApp.init === 'function') {
        _win.TasbeehHistoryApp.init();
    }
    if (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.init === 'function') {
        _win.TasbeehCurrentApp.init();
    } else if (_win.TasbeehApp && typeof _win.TasbeehApp.init === 'function' && _win.TasbeehApp.init !== initTasbeeh) {
        _win.TasbeehApp.init();
    }
}

if (typeof window !== 'undefined') {
    window.TasbeehPageViewModel = TasbeehPageViewModel;
    window.getTasbeehViewModel = getTasbeehViewModel;
    window.initTasbeeh = initTasbeeh;
}

