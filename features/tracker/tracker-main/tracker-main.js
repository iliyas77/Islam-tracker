/* ============================================================
   Nur Prayer — Tracker Feature Module & Root ViewModel
   Path: features/tracker/tracker-main/tracker-main.js
   Responsibilities:
     - Coordinates Tracker feature subtabs (current, old, performance, history)
     - Manages active prayer state, header parameters, and subtab switching
     - Provides TrackerApp and PrayerTrackingApp global interfaces
     - Re-exports all submodules, templates, services, and registration
   ============================================================ */
'use strict';

import {
    unwrap, getTotalMissedCount, td, clearPrayerHistory
} from '../tracker-shared/tracker-service.js';

import { registerTrackerComponents } from '../tracker-shared/tracker-registration.js';
import { TrackerCurrentViewModel } from '../tracker-current/tracker-current-home/tracker-current-home.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

/* ---------- Backward-Compatible ViewModel Bridges ---------- */
var PRAYER_CARD_ICONS = { Fajr: 'fa-solid fa-cloud-sun', Dhuhr: 'fa-solid fa-sun', Asr: 'fa-solid fa-sun', Maghrib: 'fa-solid fa-cloud-sun', Isha: 'fa-solid fa-moon' };

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
    var rawIcon = p.iconClass || (PRAYER_CARD_ICONS && PRAYER_CARD_ICONS[self.prayer]) || 'fa-solid fa-mosque';
    if (typeof rawIcon === 'string' && rawIcon.indexOf('<') !== -1) {
        var m = rawIcon.match(/name:\s*['"]([^'"]+)['"]/);
        if (m) {
            rawIcon = m[1];
        } else {
            var m2 = rawIcon.match(/class=['"][^'"]*fa-([a-z0-9-]+)[^'"]*['"]/);
            if (m2) rawIcon = m2[1];
        }
    }
    self.iconClass = rawIcon;
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
    var currentInitParams = {
        selectedDate: (store && k && typeof store.selectedDate === 'function') ? store.selectedDate : null,
        onSelectDate: function () {
            if (typeof _win.openCal === 'function') _win.openCal();
        }
    };
    self.current = new TrackerCurrentViewModel(currentInitParams);
    self.currentParams = self.current;

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

function $(id) {
    if (typeof _win.$ === 'function' && _win.$ !== $) return _win.$(id);
    return (_win.document && typeof _win.document.getElementById === 'function')
        ? _win.document.getElementById(id)
        : null;
}

function missTile(date, p) {
    var iconHtml = typeof _win.renderIcon === 'function'
        ? _win.renderIcon(p.toLowerCase())
        : ((PRAYER_CARD_ICONS && PRAYER_CARD_ICONS[p]) ? ('<i class="' + PRAYER_CARD_ICONS[p] + '"></i>') : '<i class="fa-solid fa-mosque"></i>');
    return '<div class="rounded-3 p-2 flex flex-col items-center justify-center gap-1.5 bg-danger-subtle min-w-0" data-ref="page.current.missed-sheet.tile.' + p.toLowerCase() + '">' +
        '<span class="fs-4 flex items-center justify-center">' + iconHtml + '</span>' +
        '<span class="fw-bold text-truncate w-100 text-center fs-xs text-dark">' + p + '</span>' +
        '<span class="badge-pill-custom badge-missed inline-flex items-center fs-xs py-1 px-1.5">' +
        (typeof _win.renderIcon === 'function' ? _win.renderIcon('circle-exclamation') : '<i class="fa-solid fa-circle-exclamation"></i>') + ' Missed</span></div>';
}

function missCard(x) {
    var tiles = x.prayers.map(function (p) { return missTile(x.date, p); }).join('');
    var missedCount = x.prayers.length;
    var friendlyFn = typeof _win.friendly === 'function' ? _win.friendly : function (d) { return d; };
    var frFn = typeof _win.fr === 'function' ? _win.fr : function (d) { return d; };
    var countBadge = '<span class="badge-pill-custom badge-missed fs-xs py-1 px-2 inline-flex items-center gap-1 shrink-0">' +
        missedCount + ' Missed' +
        (typeof _win.renderIcon === 'function' ? _win.renderIcon({ name: 'chevron-right', size: 'fs-xs', className: 'opacity-75' }) : '<i class="fa-solid fa-chevron-right fs-xs opacity-75"></i>') + '</span>';

    return '<div class="card border border-borderGrey rounded-4 p-2 bg-gr cursor-pointer" role="button" data-act="jump" data-d="' + x.date + '" data-ref="page.current.missed-sheet.card.' + x.date + '">' +
        '<div class="flex items-center justify-between gap-2 mb-2 px-1" data-ref="page.current.missed-sheet.card.header">' +
        '<div class="flex items-center gap-2 min-w-0" data-ref="page.current.missed-sheet.card.info">' +
        '<div class="w-9 h-9 min-w-[36px] min-h-[36px] rounded-[10px] bg-dash-mintBg text-gr-accent inline-flex items-center justify-center shrink-0 leading-none select-none overflow-hidden" data-ref="page.current.missed-sheet.card.icon">' +
        (typeof _win.renderIcon === 'function' ? _win.renderIcon({ name: 'calendar-days', color: 'text-gr-accent' }) : '<i class="fa-solid fa-calendar-days text-gr-accent"></i>') + '</div>' +
        '<div class="min-w-0">' +
        '<div class="fw-bold text-gr1 fs-5 lh-1 text-truncate" data-ref="page.current.missed-sheet.card.title">' + friendlyFn(x.date) + '</div>' +
        '<div class="text-gr-accent fw-semibold small mt-0.5 text-truncate" data-ref="page.current.missed-sheet.card.date">' + frFn(x.date) + '</div>' +
        '</div></div>' + countBadge + '</div>' +
        '<div class="grid grid-cols-3 gap-2 w-100 missed-tiles-grid" data-ref="page.current.missed-sheet.card.tiles">' + tiles + '</div></div>';
}

export function rMS() {
    var sheetCfg = (_win.CONSTANTS && _win.CONSTANTS.PRAYER && _win.CONSTANTS.PRAYER.SHEETS && _win.CONSTANTS.PRAYER.SHEETS.MISSED_PRAYERS) || {
        iconClass: 'clipboard-list text-gr-accent',
        title: 'Missed Prayers',
        sub: 'From previous days (today excluded)'
    };
    if (_win.sheet2BS && typeof _win.sheet2BS.show === 'function') {
        _win.sheet2BS.show(sheetCfg);
    }
    var appVm = (typeof _win.getAppViewModel === 'function') ? _win.getAppViewModel() : _win.appViewModel;
    if (appVm && typeof appVm.sheet2IsOpen === 'function') {
        appVm.sheet2IsOpen(true);
        if (typeof appVm.sheet2Title === 'function') appVm.sheet2Title(sheetCfg.title);
        if (typeof appVm.sheet2Sub === 'function') appVm.sheet2Sub(sheetCfg.sub);
        if (typeof appVm.sheet2Icon === 'function') {
            var ic = sheetCfg.iconClass;
            if (ic && ic.indexOf('fa-') === -1) ic = 'fa-solid fa-' + ic;
            appVm.sheet2Icon(ic);
        }
    }
    var iconEl = $('sheet2Icon');
    if (_win.Icon && typeof _win.Icon.update === 'function' && iconEl) {
        _win.Icon.update(iconEl, sheetCfg.iconClass);
    } else if (iconEl) {
        iconEl.className = sheetCfg.iconClass;
    }
    var titleEl = $('sheet2Title');
    if (titleEl) titleEl.textContent = sheetCfg.title;
    var subEl = $('sheet2Sub');
    if (subEl) subEl.textContent = sheetCfg.sub;

    var list = (typeof _win.mBD === 'function' ? _win.mBD() : (typeof getMissedPrayersByDate === 'function' ? getMissedPrayersByDate() : [])).slice().reverse();
    var missedContent = $('sheetMissedContent');
    var periodInfoContent = $('sheetPeriodInfoContent');
    var setOldContent = $('sheetSetOldPeriodContent');
    if (periodInfoContent) periodInfoContent.classList.add('d-none');
    if (setOldContent) setOldContent.classList.add('d-none');
    if (missedContent) missedContent.classList.remove('d-none');

    var emptyEl = $('sheetMissedEmpty');
    var listEl = $('sheetMissedList');
    if (emptyEl) emptyEl.classList.toggle('d-none', list.length > 0);
    if (listEl) listEl.innerHTML = list.length ? list.map(missCard).join('') : '';
}

export function rn() {
    if (_win.trackerCurrentPageViewModel && typeof _win.trackerCurrentPageViewModel.refresh === 'function') {
        _win.trackerCurrentPageViewModel.refresh();
    }
    updateCurrentMissedBadge();
    if (typeof _win.updatePerformanceTab === 'function') _win.updatePerformanceTab();
}

export function go(date) {
    if (_win.PrayerStore && typeof _win.PrayerStore.selectedDate === 'function') {
        _win.PrayerStore.selectedDate(date);
    }
    rn();
}

export function updateCurrentMissedBadge() {
    var totalMissed = typeof _win.getConsolidatedMissedCount === 'function' ? _win.getConsolidatedMissedCount() : getTotalMissedCount();
    var vm = getTrackerViewModel();
    if (vm && typeof vm.missedCount === 'function' && vm.missedCount !== (_win.PrayerStore && _win.PrayerStore.missedCount)) {
        vm.missedCount(totalMissed);
    }
    var missedBadge = $('currentMissedBadge');
    if (missedBadge) {
        missedBadge.textContent = totalMissed > 0 ? totalMissed : '';
        missedBadge.classList.toggle('d-none', totalMissed <= 0);
    }
    var missedBtn = $('currentMissedBtn');
    if (missedBtn) {
        missedBtn.title = totalMissed > 0 ? ('Missed Prayers (' + totalMissed + ')') : 'Missed Prayers';
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
    if (_win.trackerOldPageViewModel && typeof _win.trackerOldPageViewModel.refresh === 'function') {
        _win.trackerOldPageViewModel.refresh();
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
    if (window.PrayerHistoryApp) {
        window.PrayerHistoryApp.emptyPrayerHistory = emptyPrayerHistory;
    }
}

try { registerTrackerComponents(); } catch (_) {}

export default TrackerApp;
