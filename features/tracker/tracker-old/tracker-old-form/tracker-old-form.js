/* ============================================================
   Nur Prayer — Tracker Old Form Component
   Path: features/tracker/tracker-old/tracker-old-form/tracker-old-form.js
   Responsibilities:
     - Old Tracking Period Info and Settings modal dialog
     - Displays summary: Total Days, Total Missed, Days Missed, Prayer breakdown
     - Allows reconfiguring Start & End dates
   ============================================================ */
'use strict';

import { unwrap, fr, datesInRange, PRAYER_NAMES } from '../../tracker-shared/tracker-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const TrackerOldFormTemplate = {
    element: 'tracker-old-form-template',
    file: 'features/tracker/tracker-old/tracker-old-form/tracker-old-form.html'
};

export function TrackerOldFormViewModel(params) {
    if (params instanceof TrackerOldFormViewModel) return params;
    if (!(this instanceof TrackerOldFormViewModel)) return new TrackerOldFormViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function obsArr(arr) {
        return (k && k.observableArray) ? k.observableArray(arr || []) : function () { return arr || []; };
    }

    self.title = obs('Period Info');
    self.isOpen = (p.isOpen && k && k.isObservable(p.isOpen)) ? p.isOpen : obs(false);
    self.isEditMode = obs(false);

    self.totalDays = obs(0);
    self.totalMissed = obs(0);
    self.daysMissed = obs(0);
    self.formattedStart = obs('--');
    self.formattedEnd = obs('--');
    self.startDateInput = obs('');
    self.endDateInput = obs('');
    self.perPrayerBreakdown = obsArr([]);

    self.refresh = function () {
        var period = (typeof p.getPeriod === 'function')
            ? p.getPeriod()
            : (typeof _win.rdOK === 'function' ? _win.rdOK() : null);

        if (!period) return;

        var isComplete = period.end < period.start;
        var dates = isComplete ? [] : datesInRange(period.start, period.end);
        var oldRecords = (typeof p.getOldRecords === 'function')
            ? p.getOldRecords()
            : (typeof _win.rdOC === 'function' ? _win.rdOC() : {});

        self.formattedStart(fr(period.start));
        self.formattedEnd(isComplete ? 'Complete' : fr(period.end));
        self.startDateInput(period.start || '');
        self.endDateInput(period.end || '');
        self.totalDays(dates.length);

        var tMissed = 0;
        var dMissed = 0;
        var perPrayer = {};
        PRAYER_NAMES.forEach(function (name) { perPrayer[name] = 0; });

        dates.forEach(function (d) {
            var rec = oldRecords[d] || {};
            var missedPrayers = PRAYER_NAMES.filter(function (name) {
                return rec[name] === true || rec[name] === 'missed';
            });
            if (missedPrayers.length > 0) {
                tMissed += missedPrayers.length;
                dMissed++;
                missedPrayers.forEach(function (name) { perPrayer[name]++; });
            }
        });

        self.totalMissed(tMissed);
        self.daysMissed(dMissed);

        var breakdown = PRAYER_NAMES.map(function (name) {
            return {
                prayer: name,
                count: perPrayer[name] || 0
            };
        });
        self.perPrayerBreakdown(breakdown);
    };

    self.toggleEditMode = function () {
        if (typeof self.isEditMode === 'function') {
            self.isEditMode(!self.isEditMode());
        }
    };

    self.handleSavePeriod = function () {
        var newStart = unwrap(self.startDateInput, '');
        var newEnd = unwrap(self.endDateInput, '');
        if (!newStart || !newEnd) return;

        var cb = p.onSavePeriod;
        if (typeof cb === 'function') {
            cb({ start: newStart, end: newEnd });
        } else if (typeof _win.wrOK === 'function') {
            _win.wrOK({ start: newStart, end: newEnd, initialEnd: newEnd, created: Date.now() });
            if (typeof _win.ensureAllOldMissed === 'function') _win.ensureAllOldMissed();
            if (typeof _win.rOT === 'function') _win.rOT();
        }

        self.refresh();
        self.isEditMode(false);
    };

    self.handleClose = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof self.isOpen === 'function') self.isOpen(false);
        if (typeof p.onClose === 'function') p.onClose();
    };

    self.handleBackdropClick = function (d, e) {
        self.handleClose(d, e);
    };

    if (p.isOpen && typeof p.isOpen.subscribe === 'function') {
        p.isOpen.subscribe(function (open) {
            if (open) self.refresh();
        });
    }

    self.refresh();
}

export default {
    template: TrackerOldFormTemplate,
    viewModel: TrackerOldFormViewModel
};

