/* ============================================================
   Nur Prayer — Dua Feature Module & Root ViewModel
   Path: features/dua/dua.js
   Responsibilities:
     - Coordinates Dua feature subtabs (all, pinned, favourites, detail)
     - Manages active detail view state, reader navigation, and pinning
     - Provides DuasApp global interface for legacy/vanilla bridges
     - Re-exports all submodules, templates, services, and registration
   ============================================================ */
'use strict';

import { DuaService, unwrap, loadDuasFromStorage, loadPins, loadFavourites, togglePin, toggleFavourite } from './dua-service.js';
import { registerDuaComponents } from './dua-registration.js';

// Re-export modular components and layers
export * from './dua-service.js';
export * from './dua-registration.js';
export * from './dua-all/dua-all.js';
export * from './dua-pinned/dua-pinned.js';
export * from './dua-favourites/dua-favourites.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

/* ---------- Template Definitions ---------- */
export var DuasPageTemplate = { element: 'duas-page-template', file: 'features/dua/dua.html' };
export var DuaHeaderTemplate = { element: 'dua-header-template', file: 'features/dua/templates/dua-header.html' };
export var DuaNavTabTemplate = { element: 'dua-nav-tab-template', file: 'features/dua/templates/dua-nav-tab.html' };
export var DuaTranslationToggleTemplate = { element: 'dua-translation-toggle-template', file: 'features/dua/templates/dua-translation-toggle.html' };
export var DuvaSearchBarTemplate = { element: 'duva-search-bar-template', file: 'features/dua/dua-all/dua-all-form/dua-all-form.html' };

/* ---------- Dua Feature ViewModel ---------- */
var duasViewModelInstance = null;

export function getDuasViewModel() {
    if (!duasViewModelInstance && typeof DuasPageViewModel === 'function') {
        duasViewModelInstance = new DuasPageViewModel();
    }
    return duasViewModelInstance;
}

export function DuasPageViewModel(params) {
    if (params instanceof DuasPageViewModel) return params;
    if (!(this instanceof DuasPageViewModel)) return new DuasPageViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        var kNow = k || _win.ko || (typeof ko !== 'undefined' ? ko : null);
        if (kNow && typeof kNow.observable === 'function') return kNow.observable(val);
        var current = val;
        function fn(newVal) {
            if (arguments.length > 0) {
                current = newVal;
                return fn;
            }
            return current;
        }
        return fn;
    }
    function obsArr(arr) {
        var kNow = k || _win.ko || (typeof ko !== 'undefined' ? ko : null);
        if (kNow && typeof kNow.observableArray === 'function') return kNow.observableArray(arr || []);
        var current = Array.isArray(arr) ? arr.slice() : [];
        function fn(newVal) {
            if (arguments.length > 0) {
                current = Array.isArray(newVal) ? newVal : [];
                return fn;
            }
            return current;
        }
        return fn;
    }
    function cmp(fn) {
        var kNow = k || _win.ko || (typeof ko !== 'undefined' ? ko : null);
        return (kNow && typeof kNow.pureComputed === 'function') ? kNow.pureComputed(fn) : fn;
    }

    var store = _win.DuasStore || null;
    var initialTab = unwrap(p.initialTab || p.subTab, 'home');

    self.currentSubTab = (p.currentSubTab && k && k.isObservable(p.currentSubTab))
        ? p.currentSubTab
        : obs(initialTab);

    self.currentIndex = (store && k && typeof store.currentIndex === 'function')
        ? store.currentIndex
        : obs(0);

    self.detailOpenedFrom = 'home';

    // Observables / Computeds for current detail dua
    self.allDuas = (store && k && typeof store.allDuas === 'function')
        ? store.allDuas
        : obsArr(loadDuasFromStorage());

    self.pins = (store && k && typeof store.pins === 'function')
        ? store.pins
        : obsArr(loadPins());

    self.favourites = (store && k && typeof store.favourites === 'function')
        ? store.favourites
        : obsArr(loadFavourites());

    self.isLoading = (store && k && typeof store.isLoading === 'function')
        ? store.isLoading
        : obs(false);

    self.loadError = (store && k && typeof store.loadError === 'function')
        ? store.loadError
        : obs(null);

    self.fetchDuas = function (forceRefresh) {
        if (typeof self.isLoading === 'function') self.isLoading(true);
        if (typeof self.loadError === 'function') self.loadError(null);
        return DuaService.fetchDuas(forceRefresh)
            .then(function (data) {
                if (typeof self.isLoading === 'function') self.isLoading(false);
                if (Array.isArray(data) && typeof self.allDuas === 'function') {
                    self.allDuas(data);
                }
                return data;
            })
            .catch(function (err) {
                if (typeof self.isLoading === 'function') self.isLoading(false);
                var msg = err && err.message ? err.message : 'Failed to load Duas';
                if (typeof self.loadError === 'function') self.loadError(msg);
                var local = loadDuasFromStorage();
                if (local.length > 0 && typeof self.allDuas === 'function') {
                    self.allDuas(local);
                }
                return local;
            });
    };

    // Auto-fetch if empty or on init
    if (!self.allDuas || (typeof self.allDuas === 'function' && self.allDuas().length === 0)) {
        self.fetchDuas();
    }

    self.currentDua = (store && k && typeof store.currentDua === 'function')
        ? store.currentDua
        : cmp(function () {
            var list = typeof self.allDuas === 'function' ? self.allDuas() : self.allDuas;
            var idx = typeof self.currentIndex === 'function' ? self.currentIndex() : self.currentIndex;
            return (list && list[idx]) ? list[idx] : null;
        });

    self.isCurrentFav = (store && k && typeof store.isCurrentFav === 'function')
        ? store.isCurrentFav
        : cmp(function () {
            var favs = typeof self.favourites === 'function' ? self.favourites() : self.favourites;
            var idx = typeof self.currentIndex === 'function' ? self.currentIndex() : self.currentIndex;
            return Array.isArray(favs) && favs.indexOf(idx) !== -1;
        });

    self.isCurrentPinned = (store && k && typeof store.isCurrentPinned === 'function')
        ? store.isCurrentPinned
        : cmp(function () {
            var pList = typeof self.pins === 'function' ? self.pins() : self.pins;
            var idx = typeof self.currentIndex === 'function' ? self.currentIndex() : self.currentIndex;
            return Array.isArray(pList) && pList.indexOf(idx) !== -1;
        });

    self.pinnedTitle = (store && k && typeof store.pinnedTitle === 'function')
        ? store.pinnedTitle
        : cmp(function () {
            var pList = typeof self.pins === 'function' ? self.pins() : self.pins;
            var count = Array.isArray(pList) ? pList.length : 0;
            return 'Your Pinned Duas (' + count + '/' + DuaService.MAX_PINS + ')';
        });

    // Detail translation params bundle
    self.detail = {
        number: cmp(function () {
            var d = typeof self.currentDua === 'function' ? self.currentDua() : self.currentDua;
            return d ? (d.number || d.id || 1) : 1;
        }),
        surah: cmp(function () {
            var d = typeof self.currentDua === 'function' ? self.currentDua() : self.currentDua;
            return d ? (d.surah || d.surah_name || '') : '';
        }),
        uchcharana: cmp(function () {
            var d = typeof self.currentDua === 'function' ? self.currentDua() : self.currentDua;
            return d ? (d.uchcharana || d.telugu_uchcharana || '') : '';
        }),
        ardham: cmp(function () {
            var d = typeof self.currentDua === 'function' ? self.currentDua() : self.currentDua;
            return d ? (d.ardham || d.telugu_ardham || '') : '';
        })
    };

    self.header = {
        title: obs('Quran Duas'),
        progressText: cmp(function () {
            var pList = typeof self.pins === 'function' ? self.pins() : self.pins;
            var count = Array.isArray(pList) ? pList.length : 0;
            return count + ' pinned';
        }),
        iconClass: obs('fa-solid fa-hands-praying text-brand'),
        goHome: function (d, e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (typeof _win.showPage === 'function') _win.showPage('dashboard');
        },
        openAdmin: function (d, e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (_win.DuasApp && typeof _win.DuasApp.openAdminModal === 'function') {
                _win.DuasApp.openAdminModal();
            }
        }
    };

    self.switchTab = function (tab, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var target = tab || 'home';
        if (target === 'pinned') target = 'home';
        if (target === 'all') target = 'duas';
        if (target === 'favourites') target = 'favs';
        if (typeof self.currentSubTab === 'function') {
            self.currentSubTab(target);
        }
    };

    self.openDetail = function (indexOrDua, maybeIndex) {
        var idx;
        if (typeof maybeIndex === 'number' && !isNaN(maybeIndex)) {
            idx = maybeIndex;
        } else if (indexOrDua && typeof indexOrDua === 'object') {
            idx = Number(indexOrDua.index !== undefined ? indexOrDua.index : (indexOrDua.number ? indexOrDua.number - 1 : 0));
        } else {
            idx = Number(indexOrDua);
        }
        if (isNaN(idx)) idx = 0;
        var currTab = typeof self.currentSubTab === 'function' ? self.currentSubTab() : 'home';
        if (currTab !== 'detail') {
            self.detailOpenedFrom = currTab;
        }
        if (typeof self.currentIndex === 'function') {
            self.currentIndex(idx);
        }
        if (typeof self.currentSubTab === 'function') {
            self.currentSubTab('detail');
        }
    };

    self.goBack = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var target = self.detailOpenedFrom || 'home';
        if (typeof self.currentSubTab === 'function') {
            self.currentSubTab(target);
        }
        if (_win.DuasApp && typeof _win.DuasApp.goBack === 'function') {
            _win.DuasApp.goBack();
        }
    };

    self.changeDua = function (offset) {
        var list = typeof self.allDuas === 'function' ? self.allDuas() : self.allDuas;
        if (!list || list.length === 0) return;
        var idx = typeof self.currentIndex === 'function' ? self.currentIndex() : self.currentIndex;
        var next = (idx + offset + list.length) % list.length;
        if (typeof self.currentIndex === 'function') {
            self.currentIndex(next);
        }
        if (_win.DuasApp && typeof _win.DuasApp.changeDua === 'function') {
            _win.DuasApp.changeDua(offset);
        }
    };

    self.prevDua = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        self.changeDua(-1);
    };

    self.nextDua = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        self.changeDua(1);
    };

    self.toggleFavCurrent = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var idx = typeof self.currentIndex === 'function' ? self.currentIndex() : self.currentIndex;
        if (store && typeof store.toggleFavourite === 'function') {
            store.toggleFavourite(idx);
        } else {
            var favs = toggleFavourite(idx);
            if (typeof self.favourites === 'function') self.favourites(favs);
        }
    };

    self.togglePinCurrent = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var idx = typeof self.currentIndex === 'function' ? self.currentIndex() : self.currentIndex;
        if (store && typeof store.togglePin === 'function') {
            store.togglePin(idx);
        } else {
            var res = togglePin(idx);
            if (res.success && typeof self.pins === 'function') {
                self.pins(res.pins);
            }
        }
    };

    // Sub-page parameters bundles
    self.pinnedPageParams = {
        allDuas: self.allDuas,
        pins: self.pins,
        isLoading: self.isLoading,
        loadError: self.loadError,
        onSelectDua: function (item, idx) {
            self.openDetail(idx);
        }
    };

    self.allPageParams = {
        allDuas: self.allDuas,
        pins: self.pins,
        favourites: self.favourites,
        isLoading: self.isLoading,
        loadError: self.loadError,
        onRetry: function (d, e) {
            self.fetchDuas(true);
        },
        onSelectDua: function (item, idx) {
            self.openDetail(idx);
        }
    };

    self.favouritesPageParams = {
        allDuas: self.allDuas,
        favourites: self.favourites,
        isLoading: self.isLoading,
        loadError: self.loadError,
        onSelectDua: function (item, idx) {
            self.openDetail(idx);
        }
    };
}

/* ---------- Global App Bridge ---------- */
export function initDuas() {
    registerDuaComponents();
    var vm = getDuasViewModel();
    if (vm && typeof vm.fetchDuas === 'function') {
        vm.fetchDuas();
    }
    var el = (typeof _win.document !== 'undefined') ? _win.document.getElementById('duasPage') : null;
    if (el && !_win.document.getElementById('app') && typeof ko !== 'undefined') {
        if (!ko.dataFor(el)) {
            ko.applyBindings(vm, el);
        }
    }
}

export var DuasApp = {
    init: initDuas,
    fetchDuas: function (force) {
        var vm = getDuasViewModel();
        if (vm && typeof vm.fetchDuas === 'function') {
            return vm.fetchDuas(force);
        }
        return DuaService.fetchDuas(force);
    },
    switchTab: function (tab) {
        var vm = getDuasViewModel();
        if (vm && typeof vm.switchTab === 'function') {
            vm.switchTab(tab);
        } else if (vm && typeof vm.currentSubTab === 'function') {
            var target = tab || 'home';
            if (target === 'pinned') target = 'home';
            if (target === 'all') target = 'duas';
            if (target === 'favourites') target = 'favs';
            vm.currentSubTab(target);
        }
    },
    openDetail: function (idx) {
        var vm = getDuasViewModel();
        if (vm && typeof vm.openDetail === 'function') {
            vm.openDetail(idx);
        }
    },
    getViewModel: getDuasViewModel,
    registerComponents: registerDuaComponents
};

export var DuaApp = DuasApp;

if (typeof window !== 'undefined') {
    window.DuaApp = DuaApp;
    if (!window.DuasApp) {
        window.DuasApp = DuasApp;
    }
    window.initDuas = initDuas;
    window.getDuasViewModel = getDuasViewModel;
    window.DuasPageViewModel = DuasPageViewModel;
    window.duasViewModel = getDuasViewModel();
}

export default DuasApp;
