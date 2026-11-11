/* ============================================================
   Nur Prayer — Tracker History Page Component
   Path: features/tracker/tracker-history/tracker-history-page/tracker-history-page.js
   Responsibilities:
     - Owns History activity log state and persistence
     - Manages single-entry deletion and Clear All history
     - Feeds history entries down into tracker-history-feed
   ============================================================ */
'use strict';

import {
    getPrayerHistory, removePrayerHistoryEntry, clearPrayerHistory, unwrap
} from '../../tracker-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const TrackerHistoryPageTemplate = {
    element: 'tracker-history-page-template',
    file: 'features/tracker/tracker-history/tracker-history-page/tracker-history-page.html'
};

export function TrackerHistoryPageViewModel(params) {
    if (params instanceof TrackerHistoryPageViewModel) return params;
    if (!(this instanceof TrackerHistoryPageViewModel)) return new TrackerHistoryPageViewModel(params);

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
    self.historyEntries = (p.entries && k && k.isObservable(p.entries))
        ? p.entries
        : ((store && k && k.isObservable(store.historyEntries))
            ? store.historyEntries
            : obsArr(getPrayerHistory()));

    self.subtitle = obs('0 completed prayers');

    self.updateSubtitle = function () {
        var list = (typeof self.historyEntries === 'function') ? self.historyEntries() : self.historyEntries;
        var count = Array.isArray(list) ? list.length : 0;
        if (typeof self.subtitle === 'function') {
            self.subtitle(count + (count === 1 ? ' completed prayer' : ' completed prayers'));
        }
    };

    if (k && typeof self.historyEntries === 'function' && typeof self.historyEntries.subscribe === 'function') {
        self.historyEntries.subscribe(function () {
            self.updateSubtitle();
        });
    }

    self.refresh = function () {
        var entries = getPrayerHistory();
        if (typeof self.historyEntries === 'function') {
            self.historyEntries(entries);
        }
        self.updateSubtitle();
    };

    self.handleDeleteEntry = function (entry, event) {
        if (event && event.stopPropagation) event.stopPropagation();
        var id = entry ? entry.id : null;
        if (!id) return;
        removePrayerHistoryEntry(id);
        self.refresh();
    };

    self.clearAll = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var list = (typeof self.historyEntries === 'function') ? self.historyEntries() : self.historyEntries;
        if (!list || list.length === 0) return;
        if (typeof confirm === 'function' && !confirm('Are you sure you want to empty the prayer history? This cannot be undone.')) {
            return;
        }
        clearPrayerHistory();
        self.refresh();
    };

    // Initial load
    self.refresh();
    _win.trackerHistoryPageViewModel = self;
}

export function renderPrayerHistoryTab() {
    if (_win.trackerHistoryPageViewModel && typeof _win.trackerHistoryPageViewModel.refresh === 'function') {
        _win.trackerHistoryPageViewModel.refresh();
    }
}

if (typeof window !== 'undefined') {
    window.renderPrayerHistoryTab = renderPrayerHistoryTab;
}

export default {
    template: TrackerHistoryPageTemplate,
    viewModel: TrackerHistoryPageViewModel
};

