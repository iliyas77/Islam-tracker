/* ============================================================
   Nur Prayer — Tracker Feature Module & Root ViewModel
   Path: features/tracker/tracker.js
   Responsibilities:
     - Coordinates Tracker feature subtabs (current, old, performance, history)
     - Manages active prayer state, header parameters, and subtab switching
     - Provides TrackerApp and PrayerTrackingApp global interfaces
     - Re-exports all submodules, templates, services, and registration
   ============================================================ */
'use strict';

import {
    TrackerService, unwrap, getTotalMissedCount, td, fr,
    clearPrayerHistory, formatPrayerDate, datesInRange
} from './tracker-service.js';

import { registerTrackerComponents } from './tracker-registration.js';
import { TrackerCurrentPageViewModel } from './tracker-current/tracker-current.js';
import { TrackerOldPageViewModel } from './tracker-old/tracker-old.js';
import { TrackerPerformancePageViewModel } from './tracker-performance/tracker-performance.js';
import { TrackerHistoryPageViewModel } from './tracker-history/tracker-history.js';

// Re-export modular components and layers
export * from './tracker-service.js';
export * from './tracker-registration.js';
export * from './tracker-current/tracker-current.js';
export * from './tracker-old/tracker-old.js';
export * from './tracker-performance/tracker-performance.js';
export * from './tracker-history/tracker-history.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

/* ---------- Template Definitions (re-exported from tracker-registration.js) ---------- */
export {
    TrackerPageTemplate,
    TrackerHeaderTemplate,
    TrackerNavTabTemplate,
    PrayerTrackerCardTemplate,
    PrayerRowTemplate,
    PrayerStatCardTemplate,
    PrayerPerfRingTemplate,
    PrayerHistoryCardTemplate
} from './tracker-registration.js';

/* ---------- Backward-Compatible ViewModel Bridges ---------- */
export function PrayerRowViewModel(params) {
    if (params instanceof PrayerRowViewModel) return params;
    if (!(this instanceof PrayerRowViewModel)) return new PrayerRowViewModel(params);
    var p = params || {};
    var self = this;
    self.prayer = p.prayer || '';
    self.time = p.time || '--:--';
    self.isDone = !!p.isDone;
    self.isUpcoming = !!p.isUpcoming;
    self.isMissed = !!p.isMissed;
    self.isCurrent = !!p.isCurrent;
    self.isStandard = !self.isDone && !self.isUpcoming && !self.isMissed;
    self.prefix = p.prefix || 'page.current';
    self.actionAct = p.actionAct || 'toggle-cur';
    self.date = p.date || '';
    self.iconClass = p.iconClass || 'fa-solid fa-mosque';
    self.onToggle = function (d, e) {
        if (typeof p.onToggle === 'function') p.onToggle(self, e);
    };
}

export function PrayerTrackerCardViewModel(params) {
    if (params instanceof PrayerTrackerCardViewModel) return params;
    if (!(this instanceof PrayerTrackerCardViewModel)) return new PrayerTrackerCardViewModel(params);
    var p = params || {};
    var k = _ko;
    var self = this;
    function obs(v) { return (k && k.observable) ? k.observable(v) : function () { return v; }; }
    function obsArr(v) { return (k && k.observableArray) ? k.observableArray(v) : function () { return v || []; }; }

    self.collapsePrefix = p.collapsePrefix || 'cur';
    self.pagePrefix = p.pagePrefix || 'page.current';
    self.dateChipAct = p.dateChipAct || '';
    self.dateChipText = obs(p.dateChipText || '');
    self.badgeText = obs(p.badgeText || '');
    self.badgeAct = p.badgeAct || '';
    self.actionBtnText = obs(p.actionBtnText || '');
    self.actionBtnAct = p.actionBtnAct || '';
    self.missedGroupTitle = obs(p.missedGroupTitle || 'MISSED');
    self.missedRows = obsArr(p.missedRows || []);
    self.doneGroupTitle = obs(p.doneGroupTitle || 'DONE');
    self.doneRows = obsArr(p.doneRows || []);
    self.onDateChipClick = function (d, e) { if (typeof p.onDateChipClick === 'function') p.onDateChipClick(d, e); };
    self.onBadgeClick = function (d, e) { if (typeof p.onBadgeClick === 'function') p.onBadgeClick(d, e); };
    self.onActionBtnClick = function (d, e) { if (typeof p.onActionBtnClick === 'function') p.onActionBtnClick(d, e); };
}

/* ---------- Tracker Root Page ViewModel ---------- */
var trackerViewModelInstance = null;

export function getTrackerViewModel() {
    if (!trackerViewModelInstance && typeof TrackerPageViewModel === 'function') {
        trackerViewModelInstance = new TrackerPageViewModel();
    }
    return trackerViewModelInstance;
}

export function TrackerPageViewModel(params) {
    if (params instanceof TrackerPageViewModel) return params;
    if (!(this instanceof TrackerPageViewModel)) return new TrackerPageViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }

    var store = _win.PrayerStore || null;
    var initialTab = unwrap(p.subTab || _win.trackerSubTab, 'current');

    self.currentSubTab = (p.currentSubTab && k && k.isObservable(p.currentSubTab))
        ? p.currentSubTab
        : obs(initialTab);

    var initialMissed = (store && k && typeof store.missedCount === 'function')
        ? store.missedCount()
        : getTotalMissedCount();

    self.missedCount = (store && k && typeof store.missedCount === 'function')
        ? store.missedCount
        : obs(initialMissed);

    self.hasMissed = (store && k && typeof store.hasMissed === 'function')
        ? store.hasMissed
        : ((k && k.pureComputed) ? k.pureComputed(function () {
            var c = typeof self.missedCount === 'function' ? self.missedCount() : self.missedCount;
            return Number(c) > 0;
        }) : function () { return false; });

    self.header = {
        iconClass: obs('fa-regular fa-calendar-days text-gr-accent'),
        label: obs('Current Prayer'),
        subtitle: obs('Select a period to begin'),
        showSubtitle: obs(false),
        missedCount: self.missedCount,
        hasMissed: self.hasMissed,
        currentSubTab: self.currentSubTab,
        goHome: function (d, e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (typeof _win.showPage === 'function') _win.showPage('dashboard');
        },
        openMissed: function (d, e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (typeof _win.rMS === 'function') _win.rMS();
        },
        openPeriodInfo: function (d, e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (typeof _win.rOldInfo === 'function') _win.rOldInfo();
        },
        emptyHistory: function (d, e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (typeof emptyPrayerHistory === 'function') emptyPrayerHistory();
        }
    };

    self.switchTab = function (tab, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var target = tab || 'current';
        if (typeof self.currentSubTab === 'function') {
            self.currentSubTab(target);
        }
        if (typeof _win.switchTrackerSubTab === 'function') {
            _win.switchTrackerSubTab(target);
        }
    };

    self.goToSettings = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof _win.showPage === 'function') _win.showPage('settings');
    };

    // Sub-page parameters bundles
    self.currentParams = {
        selectedDate: (store && k && typeof store.selectedDate === 'function') ? store.selectedDate : null,
        onSelectDate: function () {
            if (typeof _win.openCal === 'function') _win.openCal();
        }
    };

    self.oldParams = {
        onSelectDate: function () {
            if (typeof _win.openOldCal === 'function') _win.openOldCal();
        }
    };

    // Preserved oldCard observable for legacy compatibility
    self.oldCard = (k && k.observable) ? k.observable(new PrayerTrackerCardViewModel({
        collapsePrefix: 'old',
        pagePrefix: 'page.old',
        dateChipAct: 'old-open-cal'
    })) : new PrayerTrackerCardViewModel({
        collapsePrefix: 'old',
        pagePrefix: 'page.old',
        dateChipAct: 'old-open-cal'
    });

    self.performanceParams = {
        onNavigateToSettings: function () {
            self.goToSettings();
        }
    };

    self.historyParams = {
        onDeleteEntry: function () {
            // Handled within tracker-history-page
        }
    };

    self.subTabs = {
        activeTab: self.currentSubTab,
        switchTab: function (tab, e) {
            self.switchTab(tab, e);
        }
    };
}

/* ---------- Operational Functions & Facades ---------- */
export var oldSd = null;

export function setOldSd(date) {
    oldSd = date;
    if (typeof _win !== 'undefined') _win.oldSd = date;
}

export function getDefaultOldPeriod() {
    var today = td();
    var yesterday = typeof _win.prevDate === 'function' ? _win.prevDate(today) : today;
    var start = (typeof _win.rdSD === 'function' ? _win.rdSD() : null) || null;
    if (!start || start >= today) {
        var d = new Date();
        d.setDate(d.getDate() - 30);
        var pad2 = function (n) { return n < 10 ? '0' + n : n; };
        start = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }
    if (start > yesterday) start = yesterday;
    return {
        start: start,
        end: yesterday,
        initialEnd: yesterday,
        created: Date.now()
    };
}

export function rMS() {
    var vm = getTrackerViewModel();
    if (vm && typeof vm.switchTab === 'function') {
        vm.switchTab('current');
    }
}

export function rn() {
    var vm = getTrackerViewModel();
    if (vm && typeof vm.switchTab === 'function') {
        // refreshes current subtab
    }
}

export function go(date) {
    if (_win.PrayerStore && typeof _win.PrayerStore.selectedDate === 'function') {
        _win.PrayerStore.selectedDate(date);
    }
    rn();
}

export function updateCurrentMissedBadge() {
    var vm = getTrackerViewModel();
    if (vm && typeof vm.missedCount === 'function') {
        vm.missedCount(getTotalMissedCount());
    }
}

export function rOldInfo() {
    var vm = getTrackerViewModel();
    if (vm && typeof vm.switchTab === 'function') {
        vm.switchTab('old');
    }
}

export function rPeriod() {
    rOldInfo();
}

export function openOldCal() {
    var dp = typeof _win.$ === 'function' ? _win.$('oldDp') : null;
    if (dp && typeof dp.showPicker === 'function') {
        try { dp.showPicker(); return; } catch (_) {}
    }
    if (dp) dp.click();
}

export function goOld(date) {
    setOldSd(date);
    rOT();
}

export function rOT() {
    var vm = getTrackerViewModel();
    if (vm && typeof vm.switchTab === 'function') {
        // refreshes old subtab
    }
}

export function emptyPrayerHistory() {
    clearPrayerHistory();
    rn();
}

/* ---------- Global App Bridge ---------- */
export function initTracker() {
    registerTrackerComponents();
    var el = (typeof _win.document !== 'undefined') ? _win.document.getElementById('trackerPage') : null;
    if (el && !_win.document.getElementById('app') && typeof ko !== 'undefined') {
        var vm = getTrackerViewModel();
        if (!ko.dataFor(el)) {
            ko.applyBindings(vm, el);
        }
    }
    rn();
}

export var TrackerApp = {
    init: initTracker,
    switchTab: function (tab) {
        var vm = getTrackerViewModel();
        if (vm && typeof vm.switchTab === 'function') {
            vm.switchTab(tab);
        }
    },
    getViewModel: getTrackerViewModel,
    registerComponents: registerTrackerComponents
};

export var PrayerTrackingApp = TrackerApp;

if (typeof window !== 'undefined') {
    window.TrackerApp = TrackerApp;
    window.PrayerTrackingApp = PrayerTrackingApp;
    window.initTracker = initTracker;
    window.getTrackerViewModel = getTrackerViewModel;
    window.TrackerPageViewModel = TrackerPageViewModel;
    window.PrayerTrackerCardViewModel = PrayerTrackerCardViewModel;
    window.PrayerRowViewModel = PrayerRowViewModel;
    window.trackerViewModel = getTrackerViewModel();
    window.rMS = rMS;
    window.rn = rn;
    window.go = go;
    window.updateCurrentMissedBadge = updateCurrentMissedBadge;
    window.rOldInfo = rOldInfo;
    window.rPeriod = rPeriod;
    window.openOldCal = openOldCal;
    window.goOld = goOld;
    window.setOldSd = setOldSd;
    window.getDefaultOldPeriod = getDefaultOldPeriod;
    window.rOT = rOT;
    window.oldSd = oldSd;
    window.emptyPrayerHistory = emptyPrayerHistory;
}

try { registerTrackerComponents(); } catch (_) {}

export default TrackerApp;
