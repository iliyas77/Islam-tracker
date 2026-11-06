/* ============================================================
   Nur Prayer — Digital Tasbeeh: ViewModel & Component Registry
   Path: tasbeeh/tasbeeh-view-model.js
   Handles:
     - Component templates definition
     - TasbeehPageViewModel
     - Component registration for Knockout
     - initTasbeeh bootstrap logic
   ============================================================ */

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
export const TasbeehPageTemplate = { element: 'tasbeeh-page-template', file: 'tasbeeh/tasbeeh.html' };
export const TasbeehHeaderTemplate = { element: 'tasbeeh-header-template', file: 'tasbeeh/templates/tasbeeh-header.html' };
export const TasbeehCounterCardTemplate = { element: 'tasbeeh-counter-card-template', file: 'tasbeeh/templates/tasbeeh-counter-card.html' };
export const TasbeehProgressCircleTemplate = { element: 'tasbeeh-progress-circle-template', file: 'tasbeeh/templates/tasbeeh-progress-circle.html' };
export const TasbeehGoalSetterTemplate = { element: 'tasbeeh-goal-setter-template', file: 'tasbeeh/templates/tasbeeh-goal-setter.html' };
export const TasbeehNavTabTemplate = { element: 'tasbeeh-nav-tab-template', file: 'tasbeeh/templates/tasbeeh-nav-tab.html' };

/* ---------- Tasbeeh Counter Card ViewModel ---------- */
export function TasbeehCounterCardViewModel(params) {
    if (params instanceof TasbeehCounterCardViewModel) return params;
    if (!(this instanceof TasbeehCounterCardViewModel)) return new TasbeehCounterCardViewModel(params);
    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);
    var self = this;

    function unwrap(v, def) {
        if (typeof v === 'function') return v();
        return (v !== undefined && v !== null) ? v : def;
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

    self.onCardClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onCardClick === 'function') {
            p.onCardClick(d, e);
        } else if (_win.TasbeehApp && typeof _win.TasbeehApp.openCounter === 'function') {
            _win.TasbeehApp.openCounter(self.id, self.month);
        } else if (_win.openCounter) {
            _win.openCounter(self.id, self.month);
        }
    };

    self.onEditClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onEditClick === 'function') {
            p.onEditClick(d, e);
        } else if (_win.TasbeehApp && typeof _win.TasbeehApp.openEditModal === 'function') {
            _win.TasbeehApp.openEditModal(self.id);
        } else if (_win.openEditModal) {
            _win.openEditModal(self.id);
        }
    };
}

/* ---------- Knockout ViewModel & Component Registration ---------- */
var tasbeehViewModel = null;

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

    self.currentSubTab = (k && k.observable) ? k.observable('home') : function () { return 'home'; };

    self.header = {
        title: (k && k.observable) ? k.observable('Digital Tasbeeh') : 'Digital Tasbeeh',
        subtitle: (k && k.observable) ? k.observable('Home · Bookmarks') : 'Home · Bookmarks',
        iconClass: (k && k.observable) ? k.observable('fa-solid fa-house text-brand') : 'fa-solid fa-house text-brand',
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

    self.openAddModal = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (window.TasbeehApp && typeof window.TasbeehApp.openAddModal === 'function') {
            window.TasbeehApp.openAddModal();
        }
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
    self.bookmarkedCounters = (tbStore && k && k.isObservable(tbStore.bookmarkedItems))
        ? tbStore.bookmarkedItems
        : ((k && k.observableArray) ? k.observableArray([]) : []);

    self.currentTodoItems = (tbStore && k && k.isObservable(tbStore.currentTodoItems))
        ? tbStore.currentTodoItems
        : ((k && k.observableArray) ? k.observableArray([]) : []);
    self.currentDoneItems = (tbStore && k && k.isObservable(tbStore.currentDoneItems))
        ? tbStore.currentDoneItems
        : ((k && k.observableArray) ? k.observableArray([]) : []);
    self.oldTodoItems = (tbStore && k && k.isObservable(tbStore.oldTodoItems))
        ? tbStore.oldTodoItems
        : ((k && k.observableArray) ? k.observableArray([]) : []);
    self.oldDoneItems = (tbStore && k && k.isObservable(tbStore.oldDoneItems))
        ? tbStore.oldDoneItems
        : ((k && k.observableArray) ? k.observableArray([]) : []);

    self.historyProgress = {
        percentCleared: (k && k.observable) ? k.observable(0) : 0,
        totalMonths: (k && k.observable) ? k.observable(0) : 0,
        clearedMonths: (k && k.observable) ? k.observable(0) : 0,
        pendingMonths: (k && k.observable) ? k.observable(0) : 0
    };

    self.goalSetter = {
        startDate: (k && k.observable) ? k.observable('') : '',
        endDate: (k && k.observable) ? k.observable('') : ''
    };
}

export function registerTasbeehComponents(customKo) {
    var k = customKo || (typeof ko !== 'undefined' ? ko : (_win.ko || null));
    if (!k || !k.components) return;

    if (!k.components.isRegistered('tasbeeh-header')) {
        k.components.register('tasbeeh-header', {
            viewModel: function (params) { return params || {}; },
            template: TasbeehHeaderTemplate
        });
    }

    if (!k.components.isRegistered('tasbeeh-counter-card')) {
        k.components.register('tasbeeh-counter-card', {
            viewModel: TasbeehCounterCardViewModel,
            template: TasbeehCounterCardTemplate
        });
    }

    if (!k.components.isRegistered('tasbeeh-progress-circle')) {
        k.components.register('tasbeeh-progress-circle', {
            viewModel: function (params) { return params || {}; },
            template: TasbeehProgressCircleTemplate
        });
    }

    if (!k.components.isRegistered('tasbeeh-goal-setter')) {
        k.components.register('tasbeeh-goal-setter', {
            viewModel: function (params) { return params || {}; },
            template: TasbeehGoalSetterTemplate
        });
    }

    if (!k.components.isRegistered('tasbeeh-nav-tab')) {
        k.components.register('tasbeeh-nav-tab', {
            viewModel: function (params) { return params || {}; },
            template: TasbeehNavTabTemplate
        });
    }

    if (!k.components.isRegistered('tasbeeh-page')) {
        k.components.register('tasbeeh-page', {
            viewModel: function (params) {
                if (params && params.viewModel) return params.viewModel;
                if (params && params.subTabs) return params;
                if (params && params.tasbeeh) return params.tasbeeh;
                return getTasbeehViewModel();
            },
            template: TasbeehPageTemplate
        });
    }
}

export function initTasbeeh() {
    registerTasbeehComponents();
    var el = document.getElementById('tasbeehPage');
    if (!document.getElementById('app') && el && typeof ko !== 'undefined') {
        var vm = getTasbeehViewModel();
        if (!ko.dataFor(el)) {
            ko.applyBindings(vm, el);
        }
    }
    if (_win.TasbeehHomeApp && typeof _win.TasbeehHomeApp.init === 'function') {
        _win.TasbeehHomeApp.init();
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
    window.registerTasbeehComponents = registerTasbeehComponents;
}

