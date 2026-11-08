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

import { TrackerService, unwrap, getTotalMissedCount } from './tracker-service.js';
import { registerTrackerComponents } from './tracker-registration.js';
import { PrayerTrackerCardViewModel } from '../prayer-tracking/tracker-view-model.js';
import { emptyPrayerHistory } from '../prayer-tracking/history-view-model.js';
import { rMS, rn, go, updateCurrentMissedBadge } from '../prayer-tracking/prayer-tracking.js';
import { rOldInfo, rPeriod, openOldCal, goOld, setOldSd, getDefaultOldPeriod, rOT, oldSd } from '../prayer-tracking/old-tracking.js';

// Re-export modular components and layers
export * from './tracker-service.js';
export * from './tracker-registration.js';
export * from './tracker-current/tracker-current.js';
export * from './tracker-performance/tracker-performance.js';
export * from './tracker-history/tracker-history.js';
export { rMS, rn, go, updateCurrentMissedBadge } from '../prayer-tracking/prayer-tracking.js';
export { rOldInfo, rPeriod, openOldCal, goOld, setOldSd, getDefaultOldPeriod, rOT, oldSd } from '../prayer-tracking/old-tracking.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

/* ---------- Template Definitions ---------- */
export var TrackerPageTemplate = { element: 'tracker-page-template', file: 'features/tracker/tracker.html' };
export var TrackerHeaderTemplate = { element: 'prayer-header-template', file: 'features/prayer-tracking/templates/prayer-header.html' };
export var TrackerNavTabTemplate = { element: 'prayer-nav-tab-template', file: 'features/prayer-tracking/templates/prayer-nav-tab.html' };

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

    // Preserved Old Card for Old tracking
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
            // Handled in subpage
        }
    };

    self.subTabs = {
        activeTab: self.currentSubTab,
        switchTab: function (tab, e) {
            self.switchTab(tab, e);
        }
    };
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
    if (typeof _win.rn === 'function') {
        _win.rn();
    }
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
}

export default TrackerApp;

