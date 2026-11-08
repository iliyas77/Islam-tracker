/* ============================================================
   Nur Prayer — History Tasbeeh Page Component
   Path: tasbeeh/tasbeeh-history/tasbeeh-history-page/tasbeeh-history-page.js
   ============================================================ */

import {
    loadPeriod,
    calculateHistoryStats
} from '../../tasbeeh-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const HistoryPageTemplate = {
    element: 'tasbeeh-history-page-template',
    file: 'tasbeeh/tasbeeh-history/tasbeeh-history-page/tasbeeh-history-page.html'
};

export function HistoryPageViewModel(params) {
    if (params instanceof HistoryPageViewModel) return params;
    if (!(this instanceof HistoryPageViewModel)) return new HistoryPageViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function comp(fn) {
        return (k && k.pureComputed) ? k.pureComputed(fn) : fn;
    }

    self.period = obs(loadPeriod());

    self.stats = comp(function () {
        return calculateHistoryStats(self.period());
    });

    self.progressStats = {
        percentCleared: comp(function () { return self.stats().percentCleared; }),
        totalMonths: comp(function () { return self.stats().totalMonths; }),
        clearedMonths: comp(function () { return self.stats().clearedMonths; }),
        pendingMonths: comp(function () { return self.stats().pendingMonths; })
    };

    self.formParams = {
        onSave: function () {
            self.period(loadPeriod());
            if (typeof p.onSave === 'function') p.onSave();
        },
        onReset: function () {
            self.period(loadPeriod());
            if (typeof p.onReset === 'function') p.onReset();
        }
    };

    // Level 1: Named business action handlers for History
    self.handleReopenMonth = function (monthKey, e) {
        var cb = p.onReopenMonth || p.onClick;
        if (typeof cb === 'function') {
            cb(monthKey, e);
        } else if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.reopenLastMonth === 'function') {
            _win.TasbeehOldApp.reopenLastMonth();
        }
        self.period(loadPeriod());
    };

    self.handleResetCompleted = function (d, e) {
        if (typeof p.onResetCompleted === 'function') {
            p.onResetCompleted(d, e);
        } else if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.resetAllCompleted === 'function') {
            _win.TasbeehOldApp.resetAllCompleted();
        }
        self.period(loadPeriod());
    };

    self.feedParams = {
        period: self.period,
        onReopenMonth: self.handleReopenMonth,
        onClick: self.handleReopenMonth,
        onCardClick: self.handleReopenMonth,
        onResetCompleted: self.handleResetCompleted
    };
}

if (typeof window !== 'undefined') {
    window.HistoryPageViewModel = HistoryPageViewModel;
}

export default HistoryPageViewModel;

