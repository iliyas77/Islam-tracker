/* ============================================================
   Nur Prayer — Settings Start Date Component
   Path: features/settings/components/settings-start-date/settings-start-date.js
   Responsibilities:
     - Owns tracking Start Date setting and datepicker
     - Validates and saves new start date
   ============================================================ */
'use strict';

import { getStartDate, saveStartDate, unwrap } from '../../settings-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const SettingsStartDateTemplate = {
    element: 'settings-start-date-template',
    file: 'features/settings/components/settings-start-date/settings-start-date.html'
};

export function SettingsStartDateViewModel(params) {
    if (params instanceof SettingsStartDateViewModel) return params;
    if (!(this instanceof SettingsStartDateViewModel)) return new SettingsStartDateViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function cmp(fn) {
        return (k && k.pureComputed) ? k.pureComputed(fn) : fn;
    }

    var store = _win.SettingsStore || null;
    self.startDate = (store && k && k.isObservable(store.startDate))
        ? store.startDate
        : obs(getStartDate());

    self.formattedDate = cmp(function () {
        var d = typeof self.startDate === 'function' ? self.startDate() : self.startDate;
        if (!d) return '--';
        if (typeof _win.fr === 'function') return _win.fr(d);
        return d;
    });

    self.saveStartDate = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var v = unwrap(self.startDate, '');
        if (!v) {
            if (typeof alert === 'function') alert('Please pick a date.');
            return;
        }

        var formatted = typeof _win.fr === 'function' ? _win.fr(v) : v;
        if (typeof confirm === 'function' && !confirm('Save Current Start Date as ' + formatted + '?')) {
            return;
        }

        saveStartDate(v);

        if (typeof p.onSave === 'function') {
            p.onSave(v);
        }

        if (_win.PrayerStore && typeof _win.PrayerStore.sync === 'function') {
            _win.PrayerStore.sync();
        }
        if (typeof _win.updatePerformanceTab === 'function') {
            _win.updatePerformanceTab();
        }
    };
}

if (typeof window !== 'undefined') {
    window.SettingsStartDateViewModel = SettingsStartDateViewModel;
}

export default {
    template: SettingsStartDateTemplate,
    viewModel: SettingsStartDateViewModel
};

