/* ============================================================
   Nur Prayer — Client-Side Hash Router (MVVM)
   Path: services/router.js
   Responsibilities:
     - Zero-dependency client-side router for Knockout.js
     - Hash-based navigation (#/dashboard, #/tracker/current, #/settings, etc.)
     - Synchronizes with browser history (back/forward buttons)
     - Deep-linking and bookmarking support
     - Reactive route state observables
   ============================================================ */
'use strict';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

function createObservable(initial) {
    if (_ko && typeof _ko.observable === 'function') {
        return _ko.observable(initial);
    }
    var val = initial;
    function obs(newVal) {
        if (arguments.length > 0) {
            val = newVal;
            return obs;
        }
        return val;
    }
    obs.__isObservable = true;
    return obs;
}

export function Router() {
    var self = this;

    // 1. Reactive Route State
    self.activePage = createObservable('dashboard');
    self.trackerSubTab = createObservable('current');
    self.tasbeehSubTab = createObservable('home');
    self.duasSubTab = createObservable('home');
    self.quranSubTab = createObservable('quran');
    self.currentPath = createObservable('#/dashboard');

    var isUpdatingHash = false;

    // 2. Route Parsers
    function parseHash(hash) {
        var raw = (hash || '').trim();
        if (raw.charAt(0) === '#') raw = raw.slice(1);
        if (raw.charAt(0) === '/') raw = raw.slice(1);
        if (!raw) {
            return { page: 'dashboard', subTab: null, path: '#/dashboard' };
        }

        var parts = raw.split('/');
        var page = parts[0] || 'dashboard';
        var subTab = parts[1] || null;

        // Normalize legacy aliases
        if (page === 'current') {
            page = 'tracker';
            subTab = 'current';
        } else if (page === 'old') {
            page = 'tracker';
            subTab = 'old';
        } else if (page === 'performance') {
            page = 'tracker';
            subTab = 'performance';
        } else if (page === 'history') {
            page = 'tracker';
            subTab = 'history';
        }

        // Subtab defaults
        if (page === 'tracker' && !subTab) subTab = 'current';
        if (page === 'tasbeeh' && !subTab) subTab = 'home';
        if (page === 'duas' && !subTab) subTab = 'home';
        if (page === 'quran' && !subTab) subTab = 'quran';

        var path = '#/' + page + (subTab ? ('/' + subTab) : '');
        return { page: page, subTab: subTab, path: path };
    }

    // 3. Navigation Actions
    self.navigate = function (target, replace) {
        var parsed = parseHash(target);

        // Update observables
        self.activePage(parsed.page);
        if (parsed.page === 'tracker' && parsed.subTab) {
            self.trackerSubTab(parsed.subTab);
        } else if (parsed.page === 'tasbeeh' && parsed.subTab) {
            self.tasbeehSubTab(parsed.subTab);
        } else if (parsed.page === 'duas' && parsed.subTab) {
            self.duasSubTab(parsed.subTab);
        } else if (parsed.page === 'quran' && parsed.subTab) {
            self.quranSubTab(parsed.subTab);
        }
        self.currentPath(parsed.path);

        // Update URL hash without re-triggering hashchange loop
        isUpdatingHash = true;
        try {
            if (_win.location) {
                if (replace && _win.history && typeof _win.history.replaceState === 'function') {
                    _win.history.replaceState(null, '', parsed.path);
                } else if (_win.location.hash !== parsed.path) {
                    _win.location.hash = parsed.path;
                }
            }

            // Notify legacy handlers
            if (typeof _win.showPage === 'function') {
                _win.showPage(parsed.page);
            }
            if (parsed.page === 'tracker' && parsed.subTab && typeof _win.switchTrackerSubTab === 'function') {
                _win.switchTrackerSubTab(parsed.subTab);
            }
            if (parsed.page === 'quran' && parsed.subTab && _win.QuranApp && typeof _win.QuranApp.switchTab === 'function') {
                _win.QuranApp.switchTab(parsed.subTab);
            }
        } finally {
            isUpdatingHash = false;
        }
    };

    // 4. Hash Listener for Browser Back / Forward buttons & deep-links
    self.handleHashChange = function () {
        if (isUpdatingHash) return;
        isUpdatingHash = true;
        try {
            var currentHash = (_win.location && _win.location.hash) ? _win.location.hash : '#/dashboard';
            var parsed = parseHash(currentHash);

            self.activePage(parsed.page);
            if (parsed.page === 'tracker' && parsed.subTab) {
                self.trackerSubTab(parsed.subTab);
            } else if (parsed.page === 'tasbeeh' && parsed.subTab) {
                self.tasbeehSubTab(parsed.subTab);
            } else if (parsed.page === 'duas' && parsed.subTab) {
                self.duasSubTab(parsed.subTab);
            } else if (parsed.page === 'quran' && parsed.subTab) {
                self.quranSubTab(parsed.subTab);
            }
            self.currentPath(parsed.path);

            if (typeof _win.showPage === 'function') {
                _win.showPage(parsed.page);
            }
            if (parsed.page === 'tracker' && parsed.subTab && typeof _win.switchTrackerSubTab === 'function') {
                _win.switchTrackerSubTab(parsed.subTab);
            }
            if (parsed.page === 'quran' && parsed.subTab && _win.QuranApp && typeof _win.QuranApp.switchTab === 'function') {
                _win.QuranApp.switchTab(parsed.subTab);
            }
        } finally {
            isUpdatingHash = false;
        }
    };

    // 5. Initialize Router Listener
    self.init = function () {
        if (_win.addEventListener) {
            _win.addEventListener('hashchange', self.handleHashChange, false);
            _win.addEventListener('popstate', self.handleHashChange, false);
        }
        // Process initial URL hash (deep-linking)
        var initialHash = (_win.location && _win.location.hash) ? _win.location.hash : '';
        if (initialHash) {
            self.handleHashChange();
        } else {
            self.navigate('#/dashboard', true);
        }
    };

    // Helper: test if current route matches
    self.isRoute = function (page, subTab) {
        if (self.activePage() !== page) return false;
        if (subTab) {
            if (page === 'tracker') return self.trackerSubTab() === subTab;
            if (page === 'tasbeeh') return self.tasbeehSubTab() === subTab;
            if (page === 'duas') return self.duasSubTab() === subTab;
            if (page === 'quran') return self.quranSubTab() === subTab;
        }
        return true;
    };
}

export var AppRouter = new Router();

if (typeof window !== 'undefined') {
    window.AppRouter = AppRouter;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppRouter: AppRouter, Router: Router };
}

