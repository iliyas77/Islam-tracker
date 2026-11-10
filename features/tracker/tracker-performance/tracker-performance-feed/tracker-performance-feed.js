/* ============================================================
   Nur Prayer — Tracker Performance Feed Component
   Path: features/tracker/tracker-performance/tracker-performance-feed/tracker-performance-feed.js
   Responsibilities:
     - Feeds circular hero progress ring, 3 stats cards, and breakdown items
     - Dispatches item click events from cards to page level
   ============================================================ */
'use strict';

import { unwrap } from '../../tracker-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const TrackerPerformanceFeedTemplate = {
    element: 'tracker-performance-feed-template',
    file: 'features/tracker/tracker-performance/tracker-performance-feed/tracker-performance-feed.html'
};

export function TrackerPerformanceFeedViewModel(params) {
    if (params instanceof TrackerPerformanceFeedViewModel) return params;
    if (!(this instanceof TrackerPerformanceFeedViewModel)) return new TrackerPerformanceFeedViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function obsArr(arr) {
        return (k && k.observableArray) ? k.observableArray(arr || []) : function () { return arr || []; };
    }

    self.hero = (p.hero && k && k.isObservable(p.hero)) ? p.hero : obs(p.hero || {});
    self.stats = (p.stats && k && k.isObservable(p.stats)) ? p.stats : obs(p.stats || {});
    self.breakdownItems = (p.breakdownItems && k && k.isObservable(p.breakdownItems))
        ? p.breakdownItems
        : obsArr(unwrap(p.breakdownItems, []));
    self.trackedDays = (p.trackedDays && k && k.isObservable(p.trackedDays))
        ? p.trackedDays
        : obs(unwrap(p.trackedDays, '0 days'));
    self.footerLabel = (p.footerLabel && k && k.isObservable(p.footerLabel))
        ? p.footerLabel
        : obs(unwrap(p.footerLabel, 'Tracking Start Date: --'));

    self.handleSettingsClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var cb = p.onSettingsClick;
        if (typeof cb === 'function') {
            cb();
        } else if (typeof _win.showPage === 'function') {
            _win.showPage('settings');
        }
    };

    self.handleCardClick = function (cardVm, event) {
        var cb = p.onPrayerClick || p.onCardClick;
        if (typeof cb === 'function') {
            cb(cardVm, event);
        }
    };
}

if (typeof window !== 'undefined') {
    window.TrackerPerformanceFeedViewModel = TrackerPerformanceFeedViewModel;
}

export default {
    template: TrackerPerformanceFeedTemplate,
    viewModel: TrackerPerformanceFeedViewModel
};

