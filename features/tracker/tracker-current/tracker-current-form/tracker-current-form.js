/* ============================================================
   Nur Prayer — Tracker Current Form Component
   Path: features/tracker/tracker-current/tracker-current-form/tracker-current-form.js
   Responsibilities:
     - Form & resolution sheet for missed prayers from past dates
     - Date navigation & quick-action catch up modal
   ============================================================ */
'use strict';

import { unwrap, getMissedPrayersByDate, fr, PRAYER_CARD_ICONS } from '../../tracker-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const TrackerCurrentFormTemplate = {
    element: 'tracker-current-form-template',
    file: 'features/tracker/tracker-current/tracker-current-form/tracker-current-form.html'
};

export function TrackerCurrentFormViewModel(params) {
    if (params instanceof TrackerCurrentFormViewModel) return params;
    if (!(this instanceof TrackerCurrentFormViewModel)) return new TrackerCurrentFormViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }

    self.isOpen = (p.isOpen && k && k.isObservable(p.isOpen)) ? p.isOpen : obs(unwrap(p.isOpen, false));

    self.missedItems = (k && k.observableArray) ? k.observableArray(getMissedPrayersByDate()) : function () { return getMissedPrayersByDate(); };

    self.refresh = function () {
        if (typeof self.missedItems === 'function' && self.missedItems.push) {
            self.missedItems(getMissedPrayersByDate());
        }
    };

    self.formatDate = function (dateStr) {
        return fr(dateStr);
    };

    self.getPrayerIcon = function (name) {
        return PRAYER_CARD_ICONS[name] || 'fa-solid fa-mosque';
    };

    self.handleResolve = function (date, prayer, event) {
        if (event && event.stopPropagation) event.stopPropagation();
        var cb = p.onResolvePrayer || p.onResolve;
        if (typeof cb === 'function') {
            cb(date, prayer);
        } else if (typeof _win.PrayerStore !== 'undefined' && typeof _win.PrayerStore.setPrayerStatus === 'function') {
            _win.PrayerStore.setPrayerStatus(prayer, date, true);
        }
        self.refresh();
    };

    self.handleClose = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof self.isOpen === 'function') {
            self.isOpen(false);
        }
        var cb = p.onClose;
        if (typeof cb === 'function') {
            cb();
        }
    };
}

export default {
    template: TrackerCurrentFormTemplate,
    viewModel: TrackerCurrentFormViewModel
};

