/* ============================================================
   Nur Prayer — Root Application ViewModel (MVVM)
   Path: services/app-view-model.js
   Orchestrates global navigation, shared stores, and page ViewModels.
   ============================================================ */

'use strict';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export function AppViewModel() {
    var self = this;

    function obs(val) {
        return (_ko && typeof _ko.observable === 'function') ? _ko.observable(val) : function () { return val; };
    }
    function cmp(fn) {
        return (_ko && typeof _ko.computed === 'function') ? _ko.computed(fn) : fn;
    }

    // 1. Navigation & Routing
    self.nav = _win.NavigationState || null;
    self.activePage = (self.nav && _ko && _ko.isObservable(self.nav.activePage))
        ? self.nav.activePage
        : obs('dashboard');

    self.trackerSubTab = (self.nav && _ko && _ko.isObservable(self.nav.trackerSubTab))
        ? self.nav.trackerSubTab
        : obs('current');

    self.isDashboardVisible = cmp(function () {
        return self.activePage() === 'dashboard';
    });
    self.isTrackerVisible = cmp(function () {
        var page = self.activePage();
        return page === 'tracker' || page === 'current' || page === 'old' || page === 'performance' || page === 'history';
    });
    self.isSettingsVisible = cmp(function () {
        return self.activePage() === 'settings';
    });
    self.isTasbeehVisible = cmp(function () {
        return self.activePage() === 'tasbeeh';
    });
    self.isDuasVisible = cmp(function () {
        return self.activePage() === 'duas';
    });

    self.navigateTo = function (page) {
        if (typeof _win.showPage === 'function') {
            _win.showPage(page);
        } else if (self.nav && typeof self.nav.navigateTo === 'function') {
            self.nav.navigateTo(page);
        } else if (typeof self.activePage === 'function') {
            self.activePage(page);
        }
    };

    // 2. Reactive Domain Stores
    self.prayerStore = _win.PrayerStore || null;
    self.tasbeehStore = _win.TasbeehStore || null;
    self.duasStore = _win.DuasStore || null;

    // 3. Child Feature ViewModels (singletons)
    self.getDashboard = function () {
        if (typeof _win.getDashboardViewModel === 'function') return _win.getDashboardViewModel();
        return _win.dashboardViewModel || null;
    };
    self.getTracker = function () {
        if (typeof _win.getTrackerViewModel === 'function') return _win.getTrackerViewModel();
        return _win.trackerViewModel || null;
    };
    self.getSettings = function () {
        if (typeof _win.getSettingsViewModel === 'function') return _win.getSettingsViewModel();
        return _win.settingsViewModel || null;
    };
    self.getTasbeeh = function () {
        if (typeof _win.getTasbeehViewModel === 'function') return _win.getTasbeehViewModel();
        return _win.tasbeehViewModel || null;
    };
    self.getDuas = function () {
        if (typeof _win.getDuasViewModel === 'function') return _win.getDuasViewModel();
        return _win.duasViewModel || null;
    };

    self.dashboard = self.getDashboard();
    self.tracker = self.getTracker();
    self.settings = self.getSettings();
    self.tasbeeh = self.getTasbeeh();
    self.duas = self.getDuas();

    // 4. Layered Bottom Sheet 2
    self.sheet2IsOpen = (typeof _win.sheet2IsOpen !== 'undefined') ? _win.sheet2IsOpen : obs(false);
    self.sheet2Title = (typeof _win.sheet2Title !== 'undefined') ? _win.sheet2Title : obs('—');
    self.sheet2Sub = (typeof _win.sheet2Sub !== 'undefined') ? _win.sheet2Sub : obs('');
    self.sheet2Icon = (typeof _win.sheet2Icon !== 'undefined') ? _win.sheet2Icon : obs('fa-solid fa-list-check text-gr-accent');
    self.onSheet2Close = function () {
        if (_win.sheet2BS && typeof _win.sheet2BS.hide === 'function') {
            _win.sheet2BS.hide();
        } else if (typeof self.sheet2IsOpen === 'function') {
            self.sheet2IsOpen(false);
        }
    };

    // 5. Global Actions
    self.showSheet2 = function (cfg) {
        if (_win.sheet2BS && typeof _win.sheet2BS.show === 'function') {
            _win.sheet2BS.show(cfg);
        }
    };
    self.hideSheet2 = function () {
        self.onSheet2Close();
    };
}

var _appViewModel = null;

export function getAppViewModel() {
    if (!_appViewModel) {
        _appViewModel = new AppViewModel();
    }
    if (!_appViewModel.dashboard) _appViewModel.dashboard = _appViewModel.getDashboard();
    if (!_appViewModel.tracker) _appViewModel.tracker = _appViewModel.getTracker();
    if (!_appViewModel.settings) _appViewModel.settings = _appViewModel.getSettings();
    if (!_appViewModel.tasbeeh) _appViewModel.tasbeeh = _appViewModel.getTasbeeh();
    if (!_appViewModel.duas) _appViewModel.duas = _appViewModel.getDuas();
    return _appViewModel;
}

export function initApp() {
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);
    if (!k) return null;
    if (typeof _win.registerAllComponents === 'function') {
        try { _win.registerAllComponents(); } catch (_) {}
    }
    var appEl = (_win.document && typeof _win.document.getElementById === 'function')
        ? _win.document.getElementById('app')
        : null;
    var vm = getAppViewModel();
    if (appEl && !k.dataFor(appEl)) {
        k.applyBindings(vm, appEl);
    }
    return vm;
}

if (typeof window !== 'undefined') {
    window.AppViewModel = AppViewModel;
    window.getAppViewModel = getAppViewModel;
    window.initApp = initApp;
    window.appViewModel = _appViewModel;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppViewModel: AppViewModel,
        getAppViewModel: getAppViewModel,
        initApp: initApp
    };
}

