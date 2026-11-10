/* ============================================================
   Nur Prayer — History Tasbeeh Goal / Period Form Component
   Path: features/tasbeeh/tasbeeh-history/tasbeeh-history-form/tasbeeh-history-form.js
   ============================================================ */

import {
    loadPeriod,
    savePeriod,
    calculatePeriodPreset,
    getPrevMonthKey,
    showToast,
    td,
    PERIOD_PRESETS
} from '../../tasbeeh-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const HistoryFormTemplate = {
    element: 'tasbeeh-history-form-template',
    file: 'features/tasbeeh/tasbeeh-history/tasbeeh-history-form/tasbeeh-history-form.html'
};

export function HistoryFormViewModel(params) {
    if (params instanceof HistoryFormViewModel) return params;
    if (!(this instanceof HistoryFormViewModel)) return new HistoryFormViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }

    var initialPeriod = loadPeriod();
    var sVal = initialPeriod.startDate ? (initialPeriod.startDate.length === 7 ? initialPeriod.startDate + '-01' : initialPeriod.startDate) : '';
    var eVal = initialPeriod.initialEnd ? (initialPeriod.initialEnd.length === 7 ? initialPeriod.initialEnd + '-01' : initialPeriod.initialEnd) : '';

    self.startDate = (p.startDate && k && k.isObservable(p.startDate)) ? p.startDate : obs(sVal);
    self.endDate = (p.endDate && k && k.isObservable(p.endDate)) ? p.endDate : obs(eVal);

    self.applyPreset = function (presetType) {
        var preset = calculatePeriodPreset(presetType);
        self.startDate(preset.startDate);
        self.endDate(preset.endDate);
    };

    self.save = function () {
        var startRaw = self.startDate();
        var endRaw = self.endDate() || td();

        if (!startRaw) {
            if (_win.alert) _win.alert('Please select a Start Date.');
            return;
        }

        var startMonth = startRaw.slice(0, 7);
        var endMonth = endRaw.slice(0, 7);

        if (endMonth < startMonth) {
            if (_win.alert) _win.alert('End Date must be on or after Start Date.');
            return;
        }

        savePeriod(startMonth, endMonth, endMonth);
        showToast('Tasbeeh period settings updated');

        if (typeof p.onSave === 'function') {
            p.onSave(startMonth, endMonth);
        }
        if (_win.TasbeehHistoryApp && typeof _win.TasbeehHistoryApp.renderHistoryTab === 'function') {
            _win.TasbeehHistoryApp.renderHistoryTab();
        }
        if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.renderOldTab === 'function') {
            _win.TasbeehOldApp.renderOldTab();
        }
    };

    self.reset = function () {
        var now = new Date();
        var curMonth = typeof _win.getCurrentMonthKey === 'function' ? _win.getCurrentMonthKey() : (now.getFullYear() + '-' + ((now.getMonth() + 1 < 10 ? '0' : '') + (now.getMonth() + 1)));
        var defaultStart = now.getFullYear() + '-01';
        var defaultEnd = getPrevMonthKey(curMonth);

        self.startDate(defaultStart + '-01');
        self.endDate(defaultEnd + '-01');

        savePeriod(defaultStart, defaultEnd, defaultEnd);
        showToast('Period reset to current year');

        if (typeof p.onReset === 'function') {
            p.onReset(defaultStart, defaultEnd);
        }
        if (_win.TasbeehHistoryApp && typeof _win.TasbeehHistoryApp.renderHistoryTab === 'function') {
            _win.TasbeehHistoryApp.renderHistoryTab();
        }
        if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.renderOldTab === 'function') {
            _win.TasbeehOldApp.renderOldTab();
        }
    };
}

if (typeof window !== 'undefined') {
    window.HistoryFormViewModel = HistoryFormViewModel;
}

export default HistoryFormViewModel;

