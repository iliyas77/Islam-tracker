/* ============================================================
   Nur Prayer — Tracker ViewModels & Components Module
   Path: prayer-tracking/tracker-view-model.js
   Responsibilities:
     - PrayerTrackerCardViewModel & PrayerRowViewModel
     - TrackerPageViewModel (Current, Old, Performance, History)
     - Component registration for Prayer Tracking feature
   ============================================================ */
'use strict';

import { calculatePrayerPerformance, renderPerformanceTab, updatePerformanceTab } from './performance-view-model.js';
import { addPrayerHistoryEntry, removePrayerHistoryEntry, renderPrayerHistoryTab, emptyPrayerHistory } from './history-view-model.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var PRAYER_CONSTANTS = _win.PRAYER_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.PRAYER) || {};
var COMMON_CONSTANTS = _win.COMMON_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.COMMON) || {};
var P = PRAYER_CONSTANTS.NAMES || _win.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
var T = _win.T || Object.assign({}, PRAYER_CONSTANTS.DEFAULT_TIMINGS || {});
var sd = _win.sd || (typeof _win.td === 'function' ? _win.td() : new Date().toISOString().slice(0, 10));

var PRAYER_CARD_ICONS = {
    Fajr: 'fa-solid fa-cloud-sun',
    Dhuhr: 'fa-solid fa-sun',
    Asr: 'fa-solid fa-sun',
    Maghrib: 'fa-solid fa-cloud-sun',
    Isha: 'fa-solid fa-moon'
};

/* ---------- Prayer Tracking Component Templates ---------- */
export const TrackerPageTemplate = { element: 'tracker-page-template', file: 'prayer-tracking/prayer-tracking.html' };
export const PrayerHeaderTemplate = { element: 'prayer-header-template', file: 'prayer-tracking/templates/prayer-header.html' };
export const PrayerTrackerCardTemplate = { element: 'prayer-tracker-card-template', file: 'prayer-tracking/templates/prayer-tracker-card.html' };
export const PrayerRowTemplate = { element: 'prayer-row-template', file: 'prayer-tracking/templates/prayer-row.html' };
export const PrayerStatCardTemplate = { element: 'prayer-stat-card-template', file: 'prayer-tracking/templates/prayer-stat-card.html' };
export const PrayerPerfRingTemplate = { element: 'prayer-perf-ring-template', file: 'prayer-tracking/templates/prayer-perf-ring.html' };
export const PrayerNavTabTemplate = { element: 'prayer-nav-tab-template', file: 'prayer-tracking/templates/prayer-nav-tab.html' };
export const PrayerHistoryCardTemplate = { element: 'prayer-history-card-template', file: 'prayer-tracking/templates/prayer-history-card.html' };

/* ---------- Knockout ViewModel & Component Registration ---------- */
var trackerViewModel = null;

export function PrayerTrackerCardViewModel(params) {
    if (params instanceof PrayerTrackerCardViewModel) {
        return params;
    }
    if (!(this instanceof PrayerTrackerCardViewModel)) {
        return new PrayerTrackerCardViewModel(params);
    }
    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);
    var self = this;

    function unwrap(v, def) {
        if (typeof v === 'function') return v();
        return (v !== undefined && v !== null) ? v : def;
    }

    self.collapsePrefix = unwrap(p.collapsePrefix, 'cur');
    self.pagePrefix = unwrap(p.pagePrefix, 'page.current');
    self.dateChipAct = unwrap(p.dateChipAct, '');
    self.dateChipText = (k && k.isObservable(p.dateChipText)) ? p.dateChipText : ((k && k.observable) ? k.observable(unwrap(p.dateChipText, '')) : unwrap(p.dateChipText, ''));
    self.badgeText = (k && k.isObservable(p.badgeText)) ? p.badgeText : ((k && k.observable) ? k.observable(unwrap(p.badgeText, '')) : unwrap(p.badgeText, ''));
    self.badgeAct = unwrap(p.badgeAct, '');
    self.actionBtnText = (k && k.isObservable(p.actionBtnText)) ? p.actionBtnText : ((k && k.observable) ? k.observable(unwrap(p.actionBtnText, '')) : unwrap(p.actionBtnText, ''));
    self.actionBtnAct = unwrap(p.actionBtnAct, '');
    self.missedGroupTitle = (k && k.isObservable(p.missedGroupTitle)) ? p.missedGroupTitle : ((k && k.observable) ? k.observable(unwrap(p.missedGroupTitle, 'MISSED')) : unwrap(p.missedGroupTitle, 'MISSED'));
    self.missedRows = (k && k.isObservable(p.missedRows)) ? p.missedRows : ((k && k.observableArray) ? k.observableArray(unwrap(p.missedRows, [])) : function () { return unwrap(p.missedRows, []); });
    self.doneGroupTitle = (k && k.isObservable(p.doneGroupTitle)) ? p.doneGroupTitle : ((k && k.observable) ? k.observable(unwrap(p.doneGroupTitle, 'DONE')) : unwrap(p.doneGroupTitle, 'DONE'));
    self.doneRows = (k && k.isObservable(p.doneRows)) ? p.doneRows : ((k && k.observableArray) ? k.observableArray(unwrap(p.doneRows, [])) : function () { return unwrap(p.doneRows, []); });

    self.onDateChipClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (self.dateChipAct === 'old-open-cal') {
            if (typeof _win.openOldCal === 'function') _win.openOldCal();
        } else {
            if (typeof _win.openCal === 'function') _win.openCal();
        }
    };
    self.onBadgeClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (self.badgeAct === 'jump-today') {
            if (_win.PrayerStore && typeof _win.PrayerStore.jumpToToday === 'function') {
                _win.PrayerStore.jumpToToday();
            } else {
                if (typeof _win !== 'undefined') _win.sd = typeof _win.td === 'function' ? _win.td() : '';
                if (typeof _win.rn === 'function') _win.rn();
            }
        }
    };
    self.onActionBtnClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (self.actionBtnAct === 'select-all') {
            var currSd = typeof _win !== 'undefined' ? _win.sd : (typeof _win.td === 'function' ? _win.td() : '');
            var c2 = typeof _win.gr === 'function' ? _win.gr(currSd) : {};
            var isToday = currSd === (typeof _win.td === 'function' ? _win.td() : '');
            var actionable = P.filter(function (x) {
                return !isToday || (typeof _win.isPrayerUpcoming === 'function' && !_win.isPrayerUpcoming(x, currSd));
            });
            var doneCount = actionable.filter(function (x) {
                return typeof _win.isDonePrayer === 'function' ? _win.isDonePrayer(x, currSd, c2) : (c2[x] === false);
            }).length;
            var willMarkDone = doneCount < actionable.length;
            var action = willMarkDone ? 'Done' : 'Missed';
            if (typeof confirm === 'function' && !confirm('Mark available prayers as ' + action + ' for ' + (typeof _win.fr === 'function' ? _win.fr(currSd) : currSd) + '?')) return;
            if (_win.PrayerStore && typeof _win.PrayerStore.selectAll === 'function') {
                _win.PrayerStore.selectAll(currSd, willMarkDone);
            } else {
                actionable.forEach(function (x) {
                    var wasXDone = typeof _win.isDonePrayer === 'function' ? _win.isDonePrayer(x, currSd, c2) : (c2[x] === false);
                    if (willMarkDone) {
                        if (!wasXDone && typeof addPrayerHistoryEntry === 'function') {
                            addPrayerHistoryEntry(x, 'Current', currSd);
                        }
                    } else {
                        if (wasXDone && typeof removePrayerHistoryEntry === 'function') {
                            removePrayerHistoryEntry(x, 'Current', currSd);
                        }
                    }
                    c2[x] = willMarkDone ? false : true;
                });
                if (typeof _win.sr === 'function') _win.sr(currSd, c2);
                if (typeof _win.rn === 'function') _win.rn();
                if (typeof updatePerformanceTab === 'function') updatePerformanceTab();
            }
            if (typeof renderPrayerHistoryTab === 'function' && typeof _win.trackerSubTab !== 'undefined' && _win.trackerSubTab === 'history') {
                renderPrayerHistoryTab();
            }
        } else if (self.actionBtnAct === 'old-change-period') {
            if (typeof _win.rPeriod === 'function') _win.rPeriod();
        }
    };
}

export function PrayerRowViewModel(params) {
    if (params instanceof PrayerRowViewModel) return params;
    if (!(this instanceof PrayerRowViewModel)) return new PrayerRowViewModel(params);
    var p = (params && typeof params === 'function') ? params() : (params || {});
    var self = this;
    self.prayer = p.prayer || '';
    self.time = p.time || '--:--';
    self.isDone = !!p.isDone;
    self.isUpcoming = !self.isDone && !!p.isUpcoming;
    self.isMissed = !self.isDone && !self.isUpcoming && !!p.isMissed;
    self.isCurrent = !self.isDone && !self.isUpcoming && !self.isMissed && !!p.isCurrent;
    self.isStandard = !self.isDone && !self.isUpcoming && !self.isMissed;
    self.prefix = p.prefix || p.pagePrefix || 'page.tracker';
    self.actionAct = p.actionAct || '';
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
        if (e && e.stopPropagation) e.stopPropagation();
        if (self.actionAct === 'toggle-cur') {
            var currSd = self.date || (typeof _win !== 'undefined' ? _win.sd : (typeof _win.td === 'function' ? _win.td() : ''));
            if (currSd === (typeof _win.td === 'function' ? _win.td() : '') && typeof _win.isPrayerUpcoming === 'function' && _win.isPrayerUpcoming(self.prayer, currSd)) {
                return;
            }
            var c1 = typeof _win.gr === 'function' ? _win.gr(currSd) : {};
            var wasDone = typeof _win.isDonePrayer === 'function' ? _win.isDonePrayer(self.prayer, currSd, c1) : (c1[self.prayer] === false);
            if (typeof confirm === 'function' && !confirm(wasDone
                ? 'Mark ' + self.prayer + ' as Missed for ' + (typeof _win.fr === 'function' ? _win.fr(currSd) : currSd) + '?'
                : 'Mark ' + self.prayer + ' as Done for ' + (typeof _win.fr === 'function' ? _win.fr(currSd) : currSd) + '?')) return;
            if (_win.PrayerStore && typeof _win.PrayerStore.setPrayerStatus === 'function') {
                _win.PrayerStore.setPrayerStatus(self.prayer, currSd, !wasDone);
            } else {
                c1[self.prayer] = wasDone ? true : false;
                if (wasDone) {
                    if (typeof removePrayerHistoryEntry === 'function') {
                        removePrayerHistoryEntry(self.prayer, 'Current', currSd);
                    }
                } else {
                    if (typeof addPrayerHistoryEntry === 'function') {
                        addPrayerHistoryEntry(self.prayer, 'Current', currSd);
                    }
                }
                if (typeof _win.sr === 'function') _win.sr(currSd, c1);
                if (typeof _win.rn === 'function') _win.rn();
                if (typeof updatePerformanceTab === 'function') updatePerformanceTab();
            }
            if (typeof renderPrayerHistoryTab === 'function' && typeof _win.trackerSubTab !== 'undefined' && _win.trackerSubTab === 'history') {
                renderPrayerHistoryTab();
            }
        } else if (self.actionAct === 'toggle-old') {
            var d2 = self.date;
            var p2 = self.prayer;
            var c3 = typeof _win.grO === 'function' ? _win.grO(d2) : {};
            var was2 = c3[p2] === true || c3[p2] === 'missed';
            if (typeof confirm === 'function' && !confirm(was2
                ? 'Mark ' + p2 + ' as Done for ' + (typeof _win.fr === 'function' ? _win.fr(d2) : d2) + '?'
                : 'Mark ' + p2 + ' as Missed for ' + (typeof _win.fr === 'function' ? _win.fr(d2) : d2) + '?')) return;
            c3[p2] = !was2;
            if (!was2) {
                if (typeof addPrayerHistoryEntry === 'function') {
                    addPrayerHistoryEntry(p2, 'Old', d2);
                }
            } else {
                if (typeof removePrayerHistoryEntry === 'function') {
                    removePrayerHistoryEntry(p2, 'Old', d2);
                }
            }
            if (typeof _win.srO === 'function') _win.srO(d2, c3);
            if (typeof _win.rOT === 'function') _win.rOT();
            if (typeof updatePerformanceTab === 'function') updatePerformanceTab();
            if (typeof renderPrayerHistoryTab === 'function' && typeof _win.trackerSubTab !== 'undefined' && _win.trackerSubTab === 'history') {
                renderPrayerHistoryTab();
            }
        }
    };
}

export function TrackerPageViewModel(params) {
    params = params || {};
    var self = this;
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);

    self.currentSubTab = (k && k.observable) ? k.observable(_win.trackerSubTab || 'current') : function () { return 'current'; };

    var store = _win.PrayerStore || null;
    var initialMissed = (store && k && typeof store.missedCount === 'function')
        ? store.missedCount()
        : (typeof _win.tMT === 'function' ? _win.tMT() : 0);
    self.missedCount = (store && k && typeof store.missedCount === 'function')
        ? store.missedCount
        : ((k && k.observable) ? k.observable(initialMissed) : function () { return 0; });
    self.hasMissed = (store && k && typeof store.hasMissed === 'function')
        ? store.hasMissed
        : ((k && k.pureComputed) ? k.pureComputed(function () {
            return (typeof self.missedCount === 'function' ? self.missedCount() : self.missedCount) > 0;
        }) : function () { return false; });

    self.header = {
        iconClass: (k && k.observable) ? k.observable('fa-regular fa-calendar-days text-gr-accent') : 'fa-regular fa-calendar-days text-gr-accent',
        label: (k && k.observable) ? k.observable('Current Prayer') : 'Current Prayer',
        subtitle: (k && k.observable) ? k.observable('Select a period to begin') : '',
        showSubtitle: (k && k.observable) ? k.observable(false) : false,
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

    self.goToSettings = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof _win.showPage === 'function') _win.showPage('settings');
    };
    self.switchTab = function (tab, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof _win.switchTrackerSubTab === 'function') _win.switchTrackerSubTab(tab);
    };

    self.currentCard = (k && k.observable) ? k.observable(new PrayerTrackerCardViewModel({
        collapsePrefix: 'cur',
        pagePrefix: 'page.current',
        dateChipAct: 'open-cal'
    })) : new PrayerTrackerCardViewModel({
        collapsePrefix: 'cur',
        pagePrefix: 'page.current',
        dateChipAct: 'open-cal'
    });

    self.oldCard = (k && k.observable) ? k.observable(new PrayerTrackerCardViewModel({
        collapsePrefix: 'old',
        pagePrefix: 'page.old',
        dateChipAct: 'old-open-cal'
    })) : new PrayerTrackerCardViewModel({
        collapsePrefix: 'old',
        pagePrefix: 'page.old',
        dateChipAct: 'old-open-cal'
    });

    self.performance = {
        hero: {
            dashArray: (k && k.observable) ? k.observable('0, 100') : '0, 100',
            percentageText: (k && k.observable) ? k.observable('0%') : '0%',
            totalCompleted: (k && k.observable) ? k.observable(0) : 0,
            totalPossible: (k && k.observable) ? k.observable(0) : 0,
            datePillText: (k && k.observable) ? k.observable('0 days') : '0 days'
        },
        stats: {
            completed: (k && k.observable) ? k.observable(0) : 0,
            missed: (k && k.observable) ? k.observable(0) : 0,
            rate: (k && k.observable) ? k.observable('0%') : '0%'
        },
        trackedDays: (k && k.observable) ? k.observable('0 days') : '0 days',
        footerLabel: (k && k.observable) ? k.observable('Tracking Start Date: --') : ''
    };

    self.historySubtitle = (k && k.observable) ? k.observable('0 completed prayers') : '0 completed prayers';
    self.historyEntries = (k && k.observableArray) ? k.observableArray([]) : function () { return []; };

    self.subTabs = {
        activeTab: self.currentSubTab,
        switchTab: function (tab, e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (typeof _win.switchTrackerSubTab === 'function') _win.switchTrackerSubTab(tab);
        }
    };
}

export function getTrackerViewModel() {
    if (!trackerViewModel && typeof TrackerPageViewModel === 'function') {
        trackerViewModel = new TrackerPageViewModel();
    }
    return trackerViewModel;
}

export function registerPrayerTrackingComponents(customKo) {
    var k = customKo || (typeof ko !== 'undefined' ? ko : (_win.ko || null));
    if (!k || !k.components) return;

    if (!k.components.isRegistered('prayer-header')) {
        k.components.register('prayer-header', {
            viewModel: function (params) { return params || {}; },
            template: PrayerHeaderTemplate
        });
    }

    if (!k.components.isRegistered('prayer-history-card')) {
        k.components.register('prayer-history-card', {
            viewModel: function (params) { return params || {}; },
            template: PrayerHistoryCardTemplate
        });
    }

    if (!k.components.isRegistered('prayer-tracker-card')) {
        k.components.register('prayer-tracker-card', {
            viewModel: PrayerTrackerCardViewModel,
            template: PrayerTrackerCardTemplate
        });
    }

    if (!k.components.isRegistered('prayer-row')) {
        k.components.register('prayer-row', {
            viewModel: PrayerRowViewModel,
            template: PrayerRowTemplate
        });
    }

    if (!k.components.isRegistered('prayer-stat-card')) {
        k.components.register('prayer-stat-card', {
            viewModel: function (params) { return params || {}; },
            template: PrayerStatCardTemplate
        });
    }

    if (!k.components.isRegistered('prayer-perf-ring')) {
        k.components.register('prayer-perf-ring', {
            viewModel: function (params) { return params || {}; },
            template: PrayerPerfRingTemplate
        });
    }

    if (!k.components.isRegistered('prayer-nav-tab')) {
        k.components.register('prayer-nav-tab', {
            viewModel: function (params) { return params || {}; },
            template: PrayerNavTabTemplate
        });
    }

    if (!k.components.isRegistered('tracker-page')) {
        k.components.register('tracker-page', {
            viewModel: function (params) {
                if (params && params.viewModel) return params.viewModel;
                if (params && params.header && params.subTabs) return params;
                if (params && params.tracker) return params.tracker;
                return getTrackerViewModel();
            },
            template: TrackerPageTemplate
        });
    }
}

export function initTracker() {
    registerPrayerTrackingComponents();
    var el = _win.document ? _win.document.getElementById('trackerPage') : null;
    if (_win.document && !_win.document.getElementById('app') && el && typeof ko !== 'undefined') {
        var vm = getTrackerViewModel();
        if (!ko.dataFor(el)) {
            ko.applyBindings(vm, el);
        }
    }
    if (typeof _win.rn === 'function') {
        _win.rn();
    }
}

if (typeof window !== 'undefined') {
    window.TrackerPageViewModel = TrackerPageViewModel;
    window.PrayerTrackerCardViewModel = PrayerTrackerCardViewModel;
    window.PrayerRowViewModel = PrayerRowViewModel;
    window.getTrackerViewModel = getTrackerViewModel;
    window.trackerViewModel = trackerViewModel;
    window.initTracker = initTracker;
}

