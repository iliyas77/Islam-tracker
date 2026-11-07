/* ============================================================
   Nur Prayer — History Tasbeeh Feed Component
   Path: tasbeeh/tasbeeh-history/tasbeeh-history-feed/tasbeeh-history-feed.js
   ============================================================ */

import {
    loadPeriod,
    formatMonthLabel,
    getPreviousMonthsList,
    getNextMonthKey,
    getCurrentOldMonth,
    reopenLastMonth
} from '../../tasbeeh-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const HistoryFeedTemplate = {
    element: 'tasbeeh-history-feed-template',
    file: 'tasbeeh/tasbeeh-history/tasbeeh-history-feed/tasbeeh-history-feed.html'
};

export function HistoryFeedViewModel(params) {
    if (params instanceof HistoryFeedViewModel) return params;
    if (!(this instanceof HistoryFeedViewModel)) return new HistoryFeedViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);
    var self = this;

    function comp(fn) {
        return (k && k.pureComputed) ? k.pureComputed(fn) : fn;
    }

    self.period = comp(function () {
        return (p.period && typeof p.period === 'function') ? p.period() : loadPeriod();
    });

    self.monthsData = comp(function () {
        var period = self.period();
        var maxEnd = period.initialEnd || period.endDate;
        var allOldMonths = getPreviousMonthsList(period.startDate, maxEnd);
        var curOldMonth = getCurrentOldMonth();
        var reopenTargetMonth = (period.endDate < maxEnd) ? getNextMonthKey(period.endDate) : null;

        var completedCount = 0;
        var totalCount = allOldMonths.length;

        var mapped = allOldMonths.map(function (mKey, idx) {
            var isCompleted = (mKey > period.endDate) || (period.endDate < period.startDate);
            var isActive = (mKey === curOldMonth);
            if (isCompleted) completedCount++;

            var status = isCompleted ? 'completed' : (isActive ? 'active' : 'pending');
            var canReopen = (mKey === reopenTargetMonth);

            return {
                monthKey: mKey,
                monthLabel: formatMonthLabel(mKey),
                indexNumber: totalCount - idx,
                status: status,
                canReopen: canReopen,
                onReopen: function (m, e) {
                    self.handleReopen(m, e);
                }
            };
        });

        return {
            list: mapped,
            completedCount: completedCount,
            totalCount: totalCount
        };
    });

    self.months = comp(function () {
        return self.monthsData().list;
    });

    self.isEmpty = comp(function () {
        return self.months().length === 0;
    });

    self.hasClearedMonths = comp(function () {
        return self.monthsData().completedCount > 0;
    });

    self.handleReopen = function (monthKey, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onReopenMonth === 'function') {
            p.onReopenMonth(monthKey, e);
        } else if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.reopenLastMonth === 'function') {
            _win.TasbeehOldApp.reopenLastMonth();
        } else {
            reopenLastMonth();
        }
    };

    self.onResetCompleted = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onResetCompleted === 'function') {
            p.onResetCompleted(d, e);
        } else if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.resetAllCompleted === 'function') {
            _win.TasbeehOldApp.resetAllCompleted();
        }
    };
}

if (typeof window !== 'undefined') {
    window.HistoryFeedViewModel = HistoryFeedViewModel;
}

export default HistoryFeedViewModel;

