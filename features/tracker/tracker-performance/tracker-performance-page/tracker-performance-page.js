/* ============================================================
   Nur Prayer — Tracker Performance Page Component
   Path: features/tracker/tracker-performance/tracker-performance-page/tracker-performance-page.js
   Responsibilities:
     - Owns Performance calculation pipeline
     - Feeds statistics down into tracker-performance-feed
     - Coordinates navigation to Settings
   ============================================================ */
'use strict';

import {
    calculatePrayerPerformance,
    fr, PRAYER_NAMES, DEFAULT_TIMINGS, PRAYER_CARD_ICONS
} from '../../tracker-shared/tracker-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const TrackerPerformancePageTemplate = {
    element: 'tracker-performance-page-template',
    file: 'features/tracker/tracker-performance/tracker-performance-page/tracker-performance-page.html'
};

export function TrackerPerformancePageViewModel(params) {
    if (params instanceof TrackerPerformancePageViewModel) return params;
    if (!(this instanceof TrackerPerformancePageViewModel)) return new TrackerPerformancePageViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function obsArr(arr) {
        return (k && k.observableArray) ? k.observableArray(arr || []) : function () { return arr || []; };
    }

    self.hero = {
        dashArray: obs('0, 100'),
        percentageText: obs('0%'),
        totalCompleted: obs(0),
        totalPossible: obs(0),
        datePillText: obs('0 days')
    };

    self.stats = {
        completed: obs(0),
        missed: obs(0),
        rate: obs('0%')
    };

    self.trackedDays = obs('0 days');
    self.footerLabel = obs('Tracking Start Date: --');
    self.breakdownItems = obsArr([]);

    self.refresh = function () {
        var perfStats = calculatePrayerPerformance();
        var timings = _win.T || DEFAULT_TIMINGS;

        var daysText = perfStats.totalDays + (perfStats.totalDays === 1 ? ' day' : ' days');
        var pillText = daysText + ' · ' + fr(perfStats.startDate) + ' → ' + fr(perfStats.endDate);

        self.hero.dashArray(perfStats.totalPercentage + ', 100');
        self.hero.percentageText(perfStats.totalPercentage + '%');
        self.hero.totalCompleted(perfStats.totalCompleted);
        self.hero.totalPossible(perfStats.totalPossible);
        self.hero.datePillText(pillText);

        self.stats.completed(perfStats.totalCompleted);
        self.stats.missed(perfStats.totalMissed);
        self.stats.rate(perfStats.totalPercentage + '%');

        self.trackedDays(daysText);
        self.footerLabel('Tracking Start Date: ' + fr(perfStats.startDate));

        var items = PRAYER_NAMES.map(function (name) {
            var s = (perfStats.perPrayer && perfStats.perPrayer[name]) ? perfStats.perPrayer[name] : {
                completed: 0,
                missed: 0,
                total: perfStats.totalDays,
                percentage: 0
            };
            return {
                name: name,
                time: timings[name] || '--:--',
                completed: s.completed,
                missed: s.missed,
                total: s.total,
                percentage: s.percentage,
                iconClass: PRAYER_CARD_ICONS[name] || 'fa-solid fa-mosque'
            };
        });

        self.breakdownItems(items);
    };

    self.goToSettings = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var cb = p.onNavigateToSettings || p.onSettings;
        if (typeof cb === 'function') {
            cb();
        } else if (typeof _win.showPage === 'function') {
            _win.showPage('settings');
        }
    };

    // Initial load
    self.refresh();
}

export default {
    template: TrackerPerformancePageTemplate,
    viewModel: TrackerPerformancePageViewModel
};

