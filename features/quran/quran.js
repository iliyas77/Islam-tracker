/* ============================================================
   Nur Prayer — Quran Feature Module & Root ViewModel
   Path: features/quran/quran.js
   Responsibilities:
     - Coordinates Quran feature subtabs (quran: list, open: reader, bookmark: saved)
     - Manages active surah reading state and navigation between views
     - Provides QuranApp global interface for legacy/vanilla bridges
     - Re-exports all sub-components, templates, and service layer
   ============================================================ */
'use strict';

import { QuranService, unwrap } from './quran-service.js';
import { registerQuranComponents } from './quran-registration.js';

// Re-export modular components
export * from './quran-service.js';
export * from './quran-registration.js';
export * from './quran-main/quran-main.js';
export * from './quran-open/quran-open.js';
export * from './quran-bookmark/quran-bookmark.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

/* ---------- Template Definitions ---------- */
export const QuranPageTemplate = { element: 'quran-page-template', file: 'features/quran/quran.html' };
export const QuranNavTabTemplate = { element: 'quran-nav-tab-template', file: 'features/quran/templates/quran-nav-tab.html' };

/* ---------- Quran Feature ViewModel ---------- */
var quranViewModelInstance = null;

export function getQuranViewModel() {
    if (!quranViewModelInstance && typeof QuranPageViewModel === 'function') {
        quranViewModelInstance = new QuranPageViewModel();
    }
    return quranViewModelInstance;
}

export function QuranPageViewModel(params) {
    if (params instanceof QuranPageViewModel) return params;
    if (!(this instanceof QuranPageViewModel)) return new QuranPageViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }

    var initialTab = unwrap(p.initialTab || p.subTab, 'quran');
    self.currentSubTab = (p.currentSubTab && k && k.isObservable(p.currentSubTab))
        ? p.currentSubTab
        : obs(initialTab);

    self.activeSurah = obs(unwrap(p.activeSurah, 1));

    self.switchTab = function (tab, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var targetTab = tab || 'quran';
        if (typeof self.currentSubTab === 'function') {
            self.currentSubTab(targetTab);
        }
        if (_win.location && _win.location.hash) {
            var newHash = '#/quran/' + targetTab;
            if (_win.location.hash !== newHash) {
                try { _win.location.hash = newHash; } catch (_) {}
            }
        }
    };

    self.openSurah = function (surahNumber, ayahNumber) {
        var n = Number(surahNumber) || 1;
        self.activeSurah(n);
        self.switchTab('open');

        if (ayahNumber && typeof document !== 'undefined') {
            setTimeout(function () {
                var targetId = 'ayah-' + n + '-' + ayahNumber;
                var el = document.getElementById(targetId);
                if (el && typeof el.scrollIntoView === 'function') {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        }
    };

    // Sub-page parameter bundles with callbacks
    self.mainPageParams = {
        onOpenSurah: function (item) {
            var n = (typeof item === 'object' && item !== null) ? item.n : item;
            self.openSurah(n);
        },
        onHome: function () {
            if (typeof _win.showPage === 'function') {
                _win.showPage('dashboard');
            }
        },
        onSettings: function () {
            if (typeof _win.showPage === 'function') {
                _win.showPage('settings');
            }
        }
    };

    self.openPageParams = {
        surahNum: self.activeSurah,
        onBack: function () {
            self.switchTab('quran');
        },
        onSettings: function () {
            if (typeof _win.showPage === 'function') {
                _win.showPage('settings');
            }
        }
    };

    self.bookmarkPageParams = {
        onOpenSurah: function (surahNum, ayahNum) {
            self.openSurah(surahNum, ayahNum);
        },
        onBack: function () {
            self.switchTab('quran');
        },
        onSettings: function () {
            if (typeof _win.showPage === 'function') {
                _win.showPage('settings');
            }
        }
    };
}

/* ---------- Global App Bridge ---------- */
export function initQuran() {
    registerQuranComponents();
    var el = (typeof document !== 'undefined') ? document.getElementById('quranPage') : null;
    if (el && !document.getElementById('app') && typeof ko !== 'undefined') {
        var vm = getQuranViewModel();
        if (!ko.dataFor(el)) {
            ko.applyBindings(vm, el);
        }
    }
}

export const QuranApp = {
    init: initQuran,
    render: function () {
        var vm = getQuranViewModel();
        if (vm && typeof vm.currentSubTab === 'function') {
            // keep current subtab or default to quran
        }
    },
    switchTab: function (tab) {
        var vm = getQuranViewModel();
        if (vm && typeof vm.switchTab === 'function') {
            vm.switchTab(tab);
        }
    },
    openSurah: function (n, ayah) {
        var vm = getQuranViewModel();
        if (vm && typeof vm.openSurah === 'function') {
            vm.openSurah(n, ayah);
        }
    },
    getViewModel: getQuranViewModel,
    registerComponents: registerQuranComponents
};

if (typeof window !== 'undefined') {
    window.QuranApp = QuranApp;
    window.initQuran = initQuran;
    window.getQuranViewModel = getQuranViewModel;
    window.QuranPageViewModel = QuranPageViewModel;
    window.showQuranTab = function (tab) {
        QuranApp.switchTab(tab);
    };
}

export default QuranApp;

