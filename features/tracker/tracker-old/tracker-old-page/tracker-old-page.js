/* ============================================================
   Nur Prayer — Tracker Old Page Component
   Path: features/tracker/tracker-old/tracker-old-page/tracker-old-page.js
   Responsibilities:
     - Owns Old tracking page state (date, period, badge, action button)
     - Manages prayer status updates, sequential completion, period settings
     - Prepares data and callback pipelines for tracker-old-feed and tracker-old-form
   ============================================================ */
'use strict';

import {
    unwrap, td, fr, formatPrayerDate, PRAYER_NAMES, DEFAULT_TIMINGS,
    addPrayerHistoryEntry, removePrayerHistoryEntry
} from '../../tracker-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const TrackerOldPageTemplate = {
    element: 'tracker-old-page-template',
    file: 'features/tracker/tracker-old/tracker-old-page/tracker-old-page.html'
};

export function TrackerOldPageViewModel(params) {
    if (params instanceof TrackerOldPageViewModel) return params;
    if (!(this instanceof TrackerOldPageViewModel)) return new TrackerOldPageViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function obsArr(arr) {
        return (k && k.observableArray) ? k.observableArray(arr || []) : function () { return arr || []; };
    }

    self.collapsePrefix = unwrap(p.collapsePrefix, 'old');
    self.pagePrefix = unwrap(p.pagePrefix, 'page.old');

    // Selected Old Date state
    var initialDate = _win.oldSd || (typeof _win.currentOldDate === 'function' ? _win.currentOldDate() : null);
    self.selectedDate = obs(initialDate || td());

    self.dateChipText = obs('');
    self.badgeText = obs('Period Info');
    self.actionBtnText = obs('');
    self.missedRows = obsArr([]);
    self.doneRows = obsArr([]);

    self.isPeriodFormOpen = obs(false);

    self.getPeriod = function () {
        return typeof _win.rdOK === 'function' ? _win.rdOK() : null;
    };

    self.getOldRecords = function () {
        return typeof _win.rdOC === 'function' ? _win.rdOC() : {};
    };

    self.refresh = function () {
        var period = self.getPeriod();
        if (!period && typeof _win.getDefaultOldPeriod === 'function') {
            period = _win.getDefaultOldPeriod();
            if (typeof _win.wrOK === 'function') _win.wrOK(period);
        }

        var currDate = unwrap(self.selectedDate, '');
        if (period) {
            if (!currDate || currDate < period.start || currDate > period.end) {
                currDate = (typeof _win.currentOldDate === 'function' ? _win.currentOldDate() : null) || period.end;
                self.selectedDate(currDate);
            }
        }

        // Date chip label
        var chipLabel = currDate ? formatPrayerDate(currDate) : 'Select Date';
        self.dateChipText(chipLabel);

        var timings = (_win.PrayerStore && typeof _win.PrayerStore.timings === 'function')
            ? _win.PrayerStore.timings()
            : (_win.T || DEFAULT_TIMINGS);

        var oldRec = {};
        if (typeof _win.grO === 'function' && currDate) {
            oldRec = _win.grO(currDate);
        }

        var mRows = [];
        var dRows = [];

        PRAYER_NAMES.forEach(function (name) {
            var time = timings[name] || '--:--';
            // In Old tracking, true or 'missed' means missed; anything else is done
            var isMissed = (oldRec[name] === true || oldRec[name] === 'missed');
            var isDone = !isMissed;

            var rowData = {
                prayer: name,
                time: time,
                isDone: isDone,
                isUpcoming: false,
                isMissed: isMissed,
                isCurrent: false,
                date: currDate,
                prefix: self.pagePrefix,
                actionAct: 'toggle-old'
            };

            if (isDone) {
                dRows.push(rowData);
            } else {
                mRows.push(rowData);
            }
        });

        self.missedRows(mRows);
        self.doneRows(dRows);

        self.actionBtnText(mRows.length > 0 ? 'Select All' : 'Reset All');

        // Sync with legacy DOM elements if present
        var oldDp = typeof _win.$ === 'function' ? _win.$('oldDp') : null;
        if (oldDp && period) {
            oldDp.min = period.start;
            oldDp.max = period.end;
            oldDp.value = currDate;
        }
    };

    self.handleTogglePrayer = function (prayerCardVm, event) {
        if (event && event.stopPropagation) event.stopPropagation();
        var prayer = unwrap(prayerCardVm.prayer, '');
        var currDate = unwrap(self.selectedDate, '');
        if (!currDate) return;

        var wasDone = !!prayerCardVm.isDone;
        var actionText = wasDone ? 'Missed' : 'Done';
        var dateFormatted = fr(currDate);

        if (typeof confirm === 'function' && !confirm('Mark ' + prayer + ' as ' + actionText + ' for ' + dateFormatted + '?')) {
            return;
        }

        var c = typeof _win.grO === 'function' ? _win.grO(currDate) : {};
        c[prayer] = wasDone ? true : false;

        if (wasDone) {
            removePrayerHistoryEntry(prayer, 'Old', currDate);
        } else {
            addPrayerHistoryEntry(prayer, 'Old', currDate);
        }

        if (typeof _win.srO === 'function') {
            _win.srO(currDate, c);
        }

        if (typeof _win.rOT === 'function') _win.rOT();
        if (typeof _win.updatePerformanceTab === 'function') _win.updatePerformanceTab();

        self.refresh();
    };

    self.handleDateChipClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onSelectDate === 'function') {
            p.onSelectDate();
        } else if (typeof _win.openOldCal === 'function') {
            _win.openOldCal();
        }
    };

    self.handleBadgeClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        self.isPeriodFormOpen(true);
    };

    self.handleActionBtnClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var currDate = unwrap(self.selectedDate, '');
        if (!currDate) return;

        var mList = (typeof self.missedRows === 'function') ? self.missedRows() : self.missedRows;
        var willMarkDone = (mList || []).length > 0;
        var action = willMarkDone ? 'Done' : 'Missed';

        if (typeof confirm === 'function' && !confirm('Mark all prayers as ' + action + ' for ' + fr(currDate) + '?')) {
            return;
        }

        var c = typeof _win.grO === 'function' ? _win.grO(currDate) : {};
        PRAYER_NAMES.forEach(function (name) {
            var wasDone = (c[name] !== true && c[name] !== 'missed');
            if (willMarkDone && !wasDone) {
                addPrayerHistoryEntry(name, 'Old', currDate);
            } else if (!willMarkDone && wasDone) {
                removePrayerHistoryEntry(name, 'Old', currDate);
            }
            c[name] = willMarkDone ? false : true;
        });

        if (typeof _win.srO === 'function') {
            _win.srO(currDate, c);
        }

        if (typeof _win.rOT === 'function') _win.rOT();
        if (typeof _win.updatePerformanceTab === 'function') _win.updatePerformanceTab();

        self.refresh();
    };

    self.handleSavePeriod = function (newPeriod) {
        if (newPeriod && typeof _win.wrOK === 'function') {
            _win.wrOK({
                start: newPeriod.start,
                end: newPeriod.end,
                initialEnd: newPeriod.end,
                created: Date.now()
            });
            if (typeof _win.ensureAllOldMissed === 'function') _win.ensureAllOldMissed();
            if (typeof _win.rOT === 'function') _win.rOT();
        }
        self.refresh();
    };

    self.closePeriodForm = function () {
        self.isPeriodFormOpen(false);
        self.refresh();
    };

    // Initial load
    self.refresh();
    _win.trackerOldPageViewModel = self;
}

export function rOT() {
    if (_win.trackerOldPageViewModel && typeof _win.trackerOldPageViewModel.refresh === 'function') {
        _win.trackerOldPageViewModel.refresh();
    }
}

if (typeof window !== 'undefined') {
    window.TrackerOldPageViewModel = TrackerOldPageViewModel;
    window.TrackerOldApp = { refresh: rOT };
    window.rOT = rOT;
}

export default {
    template: TrackerOldPageTemplate,
    viewModel: TrackerOldPageViewModel
};

