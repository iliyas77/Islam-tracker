/* ============================================================
   Nur Prayer — Root Application ViewModel (MVVM)
   Path: services/app-view-model.js
   Orchestrates global navigation, shared stores, and page ViewModels.
   ============================================================ */

'use strict';

import { PrayerStore } from './prayer-store.js';
import { TasbeehStore } from './tasbeeh-store.js';
import { DuasStore } from './duas-store.js';
import { SettingsStore } from './settings-store.js';
import { AppRouter } from './router.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export function AppViewModel() {
    var self = this;

    function obs(val) {
        return (_ko && typeof _ko.observable === 'function') ? _ko.observable(val) : function () { return val; };
    }
    function cmp(fn, writeFn) {
        if (typeof fn === 'object' && fn !== null) {
            writeFn = fn.write;
            fn = fn.read;
        }
        if (_ko && typeof _ko.pureComputed === 'function' && !writeFn) {
            return _ko.pureComputed(fn);
        }
        if (_ko && typeof _ko.computed === 'function') {
            if (writeFn) {
                return _ko.computed({ read: fn, write: writeFn });
            }
            return _ko.computed(fn);
        }
        return fn;
    }
    function isObs(target) {
        return (_ko && typeof _ko.isObservable === 'function')
            ? _ko.isObservable(target)
            : (typeof target === 'function');
    }

    // 1. Child Feature ViewModels (singletons) & Getters (defined first so computeds can safely call them)
    self.getDashboard = function () {
        if (typeof _win.getDashboardViewModel === 'function') {
            try { return _win.getDashboardViewModel(); } catch (_) {}
        }
        return _win.dashboardViewModel || null;
    };
    self.getTracker = function () {
        if (typeof _win.getTrackerViewModel === 'function') {
            try { return _win.getTrackerViewModel(); } catch (_) {}
        }
        return _win.trackerViewModel || null;
    };
    self.getSettings = function () {
        if (typeof _win.getSettingsViewModel === 'function') {
            try { return _win.getSettingsViewModel(); } catch (_) {}
        }
        return _win.settingsViewModel || null;
    };
    self.getTasbeeh = function () {
        if (typeof _win.getTasbeehViewModel === 'function') {
            try { return _win.getTasbeehViewModel(); } catch (_) {}
        }
        return _win.tasbeehViewModel || null;
    };
    self.getDuas = function () {
        if (typeof _win.getDuasViewModel === 'function') {
            try { return _win.getDuasViewModel(); } catch (_) {}
        }
        return _win.duasViewModel || null;
    };
    self.getQuran = function () {
        if (typeof _win.getQuranViewModel === 'function') {
            try { return _win.getQuranViewModel(); } catch (_) {}
        }
        return _win.quranViewModel || null;
    };

    self.dashboard = self.getDashboard();
    self.tracker = self.getTracker();
    self.settings = self.getSettings();
    self.tasbeeh = self.getTasbeeh();
    self.duas = self.getDuas();
    self.quran = self.getQuran();

    // 2. Reactive Domain Stores
    self.prayerStore = (typeof PrayerStore !== 'undefined' ? PrayerStore : null) || _win.PrayerStore || null;
    self.tasbeehStore = (typeof TasbeehStore !== 'undefined' ? TasbeehStore : null) || _win.TasbeehStore || null;
    self.duasStore = (typeof DuasStore !== 'undefined' ? DuasStore : null) || _win.DuasStore || null;
    self.settingsStore = (typeof SettingsStore !== 'undefined' ? SettingsStore : null) || _win.SettingsStore || null;

    // 3. Navigation & Routing
    var routerInst = null;
    try {
        if (typeof AppRouter !== 'undefined') routerInst = AppRouter;
    } catch (_) {}
    self.router = routerInst || _win.AppRouter || null;
    self.nav = _win.NavigationState || null;
    self.activePage = (self.router && isObs(self.router.activePage))
        ? self.router.activePage
        : ((self.nav && isObs(self.nav.activePage)) ? self.nav.activePage : obs('dashboard'));

    self.trackerSubTab = (self.router && isObs(self.router.trackerSubTab))
        ? self.router.trackerSubTab
        : ((self.nav && isObs(self.nav.trackerSubTab)) ? self.nav.trackerSubTab : obs('current'));

    self.tasbeehSubTab = (self.router && isObs(self.router.tasbeehSubTab))
        ? self.router.tasbeehSubTab
        : ((self.nav && isObs(self.nav.tasbeehSubTab)) ? self.nav.tasbeehSubTab : obs('home'));

    self.duasSubTab = (self.router && isObs(self.router.duasSubTab))
        ? self.router.duasSubTab
        : ((self.nav && isObs(self.nav.duasSubTab)) ? self.nav.duasSubTab : obs('home'));

    self.quranSubTab = (self.router && isObs(self.router.quranSubTab))
        ? self.router.quranSubTab
        : ((self.nav && isObs(self.nav.quranSubTab)) ? self.nav.quranSubTab : obs('quran'));

    self.isDashboardVisible = cmp(function () {
        return self.activePage() === 'dashboard';
    });
    self.isTrackerVisible = cmp(function () {
        var page = self.activePage();
        return page === 'tracker' || page === 'current' || page === 'old' || page === 'history';
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
    self.isQuranVisible = cmp(function () {
        return self.activePage() === 'quran';
    });

    self.currentRoute = cmp(function () {
        var page = self.activePage();
        switch (page) {
            case 'tracker':
            case 'current':
            case 'old':
            case 'history':
                return { name: 'tracker-page', params: self.getTracker() };
            case 'settings':
                return { name: 'settings-page', params: self.getSettings() };
            case 'tasbeeh':
                return { name: 'tasbeeh-page', params: self.getTasbeeh() };
            case 'duas':
                return { name: 'duas-page', params: self.getDuas() };
            case 'quran':
                return { name: 'quran-page', params: self.getQuran() };
            default:
                return { name: 'dashboard-page', params: self.getDashboard() };
        }
    });

    self.navigateTo = function (page, subTab) {
        if (self.router && typeof self.router.navigate === 'function') {
            self.router.navigate('#/' + page + (subTab ? '/' + subTab : ''));
        } else if (typeof _win.showPage === 'function') {
            _win.showPage(page);
        } else if (self.nav && typeof self.nav.navigateTo === 'function') {
            self.nav.navigateTo(page);
        } else if (typeof self.activePage === 'function') {
            self.activePage(page);
        }
    };

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
    if (!_appViewModel.quran) _appViewModel.quran = _appViewModel.getQuran();
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
    var routerToInit = null;
    try {
        if (typeof AppRouter !== 'undefined') routerToInit = AppRouter;
    } catch (_) {}
    routerToInit = routerToInit || _win.AppRouter || null;
    if (routerToInit && typeof routerToInit.init === 'function') {
        try { routerToInit.init(); } catch (_) {}
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

