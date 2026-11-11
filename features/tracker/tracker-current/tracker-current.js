/* ============================================================
   Nur Prayer — Tracker Current Submodules & ViewModel
   Path: features/tracker/tracker-current/tracker-current.js
   Responsibilities:
     - Owns Current tracking page state (date, badge, action button)
     - Manages prayer status updates, Select All, and Jump to Today
     - Prepares data and callback pipelines for tracker-current-feed
     - Re-exports Current modular components (Card, Feed, Form)
   ============================================================ */
'use strict';

import {
    unwrap, td, fr, PRAYER_NAMES, DEFAULT_TIMINGS,
    isDonePrayer, isPrayerUpcoming, isPrayerCurrent,
    addPrayerHistoryEntry, removePrayerHistoryEntry,
    calculatePrayerPerformance
} from '../tracker-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

// Re-export modular components
export * from './tracker-current-card/tracker-current-card.js';
export * from './tracker-current-feed/tracker-current-feed.js';
export * from './tracker-current-form/tracker-current-form.js';

import { TrackerCurrentCardTemplate } from './tracker-current-card/tracker-current-card.js';

/* ---------- Template Definitions ---------- */
export const TrackerCurrentMobileViewTemplate = {
    element: 'tracker-current-mobile-view-template',
    file: 'features/tracker/tracker-mobile-view.html'
};

export const TrackerCurrentTemplate = TrackerCurrentMobileViewTemplate;

export const PrayerRowTemplate = TrackerCurrentCardTemplate;

/* ---------- Current Tracking ViewModel ---------- */
export function TrackerCurrentViewModel(params) {
    if (params instanceof TrackerCurrentViewModel) return params;
    if (typeof TrackerCurrentPageViewModel === 'function' && params instanceof TrackerCurrentPageViewModel) return params;
    if (!(this instanceof TrackerCurrentViewModel)) return new TrackerCurrentViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function obsArr(arr) {
        return (k && k.observableArray) ? k.observableArray(arr || []) : function () { return arr || []; };
    }

    var store = _win.PrayerStore || null;

    function isObservable(fn) {
        return (k && typeof k.isObservable === 'function') ? k.isObservable(fn) : (typeof fn === 'function');
    }

    // Date state
    self.selectedDate = (store && k && isObservable(store.selectedDate))
        ? store.selectedDate
        : ((p.selectedDate && k && isObservable(p.selectedDate)) ? p.selectedDate : obs(td()));

    self.collapsePrefix = unwrap(p.collapsePrefix, 'cur');
    self.pagePrefix = unwrap(p.pagePrefix, 'page.current');

    self.missedRows = (p.missedRows && k && k.isObservable(p.missedRows)) ? p.missedRows : obsArr([]);
    self.doneRows = (p.doneRows && k && k.isObservable(p.doneRows)) ? p.doneRows : obsArr([]);
    self.dateChipText = (p.dateChipText && k && k.isObservable(p.dateChipText)) ? p.dateChipText : obs('');
    self.badgeText = (p.badgeText && k && k.isObservable(p.badgeText)) ? p.badgeText : obs('');
    self.actionBtnText = (p.actionBtnText && k && k.isObservable(p.actionBtnText)) ? p.actionBtnText : obs('');

    self.isMissedFormOpen = obs(false);

    self.refresh = function () {
        var currSd = unwrap(self.selectedDate, td());
        var isToday = (currSd === td());
        var timings = (store && typeof store.timings === 'function') ? store.timings() : (_win.T || DEFAULT_TIMINGS);

        // Date chip label
        var chipLabel = isToday ? 'Today' : fr(currSd);
        if (typeof self.dateChipText === 'function') self.dateChipText(chipLabel);

        // Badge & Action Btn
        if (typeof self.badgeText === 'function') {
            self.badgeText(isToday ? '' : 'Jump to Today');
        }

        var mRows = [];
        var dRows = [];

        var records = {};
        if (store && typeof store.trackerRecords === 'function') {
            var allRecs = store.trackerRecords();
            records = (allRecs && allRecs[currSd]) ? allRecs[currSd] : {};
        } else if (typeof _win.gr === 'function') {
            records = _win.gr(currSd);
        }

        PRAYER_NAMES.forEach(function (name) {
            var time = timings[name] || '--:--';
            var done = isDonePrayer(name, currSd, records);
            var upcoming = !done && isPrayerUpcoming(name, currSd, timings);
            var current = !done && !upcoming && isPrayerCurrent(name, currSd, timings);
            var missed = !done && !upcoming;

            var rowData = {
                prayer: name,
                time: time,
                isDone: done,
                isUpcoming: upcoming,
                isMissed: missed,
                isCurrent: current,
                date: currSd,
                prefix: self.pagePrefix,
                actionAct: 'toggle-cur'
            };

            if (done) {
                dRows.push(rowData);
            } else {
                mRows.push(rowData);
            }
        });

        if (typeof self.missedRows === 'function') self.missedRows(mRows);
        if (typeof self.doneRows === 'function') self.doneRows(dRows);

        var totalActionable = mRows.filter(function (r) { return !r.isUpcoming; }).length;
        if (typeof self.actionBtnText === 'function') {
            self.actionBtnText(totalActionable > 0 ? 'Select All' : 'Reset All');
        }
    };

    // Card/Feed toggle handling
    self.handleTogglePrayer = function (prayerCardVm, event) {
        if (event && event.stopPropagation) event.stopPropagation();
        var prayer = unwrap(prayerCardVm.prayer, '');
        var currSd = unwrap(self.selectedDate, td());

        if (currSd === td() && isPrayerUpcoming(prayer, currSd)) {
            return;
        }

        var wasDone = !!prayerCardVm.isDone;
        var actionText = wasDone ? 'Missed' : 'Done';
        var dateFormatted = fr(currSd);

        if (typeof confirm === 'function' && !confirm('Mark ' + prayer + ' as ' + actionText + ' for ' + dateFormatted + '?')) {
            return;
        }

        if (store && typeof store.setPrayerStatus === 'function') {
            store.setPrayerStatus(prayer, currSd, !wasDone);
        } else {
            var c = typeof _win.gr === 'function' ? _win.gr(currSd) : {};
            c[prayer] = wasDone ? true : false;
            if (wasDone) {
                removePrayerHistoryEntry(prayer, 'Current', currSd);
            } else {
                addPrayerHistoryEntry(prayer, 'Current', currSd);
            }
            if (typeof _win.sr === 'function') _win.sr(currSd, c);
        }

        if (typeof _win.rn === 'function') _win.rn();
        if (typeof _win.updatePerformanceTab === 'function') _win.updatePerformanceTab();
        self.refresh();
    };

    self.handleDateChipClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onSelectDate === 'function') {
            p.onSelectDate();
        } else if (typeof _win.openCal === 'function') {
            _win.openCal();
        }
    };

    self.handleBadgeClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (store && typeof store.jumpToToday === 'function') {
            store.jumpToToday();
        } else if (typeof _win.td === 'function') {
            _win.sd = _win.td();
            if (typeof _win.rn === 'function') _win.rn();
        }
        self.refresh();
    };

    self.handleActionBtnClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var currSd = unwrap(self.selectedDate, td());
        var mList = (typeof self.missedRows === 'function') ? self.missedRows() : self.missedRows;
        var actionable = (mList || []).filter(function (r) { return !r.isUpcoming; });
        var willMarkDone = actionable.length > 0;
        var action = willMarkDone ? 'Done' : 'Missed';

        if (typeof confirm === 'function' && !confirm('Mark available prayers as ' + action + ' for ' + fr(currSd) + '?')) {
            return;
        }

        if (store && typeof store.selectAll === 'function') {
            store.selectAll(currSd, willMarkDone);
        } else {
            var c = typeof _win.gr === 'function' ? _win.gr(currSd) : {};
            PRAYER_NAMES.forEach(function (name) {
                if (currSd === td() && isPrayerUpcoming(name, currSd)) return;
                var was = isDonePrayer(name, currSd, c);
                if (willMarkDone && !was) {
                    addPrayerHistoryEntry(name, 'Current', currSd);
                } else if (!willMarkDone && was) {
                    removePrayerHistoryEntry(name, 'Current', currSd);
                }
                c[name] = willMarkDone ? false : true;
            });
            if (typeof _win.sr === 'function') _win.sr(currSd, c);
        }

        if (typeof _win.rn === 'function') _win.rn();
        if (typeof _win.updatePerformanceTab === 'function') _win.updatePerformanceTab();
        self.refresh();
    };

    self.openMissedForm = function () {
        if (typeof self.isMissedFormOpen === 'function') self.isMissedFormOpen(true);
    };

    self.closeMissedForm = function () {
        if (typeof self.isMissedFormOpen === 'function') self.isMissedFormOpen(false);
        self.refresh();
    };

    // Initial load
    self.refresh();
    _win.trackerCurrentPageViewModel = self;
    _win.trackerCurrentViewModel = self;
}

export const TrackerCurrentPageViewModel = TrackerCurrentViewModel;

if (typeof window !== 'undefined') {
    window.trackerCurrentPageViewModel = _win.trackerCurrentPageViewModel;
    window.trackerCurrentViewModel = _win.trackerCurrentViewModel;
}

export default {
    template: TrackerCurrentMobileViewTemplate,
    viewModel: TrackerCurrentViewModel
};
