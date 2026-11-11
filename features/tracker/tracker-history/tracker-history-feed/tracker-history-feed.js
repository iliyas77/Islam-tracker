/* ============================================================
   Nur Prayer — Tracker History Feed Component
   Path: features/tracker/tracker-history/tracker-history-feed/tracker-history-feed.js
   Responsibilities:
     - Feeds history entries into cards
     - Handles empty state when no activity has been logged
     - Intermediary callback dispatcher for entry deletion
   ============================================================ */
'use strict';

import { unwrap } from '../../tracker-shared/tracker-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const TrackerHistoryFeedTemplate = {
    element: 'tracker-history-feed-template',
    file: 'features/tracker/tracker-history/tracker-history-feed/tracker-history-feed.html'
};

export function TrackerHistoryFeedViewModel(params) {
    if (params instanceof TrackerHistoryFeedViewModel) return params;
    if (!(this instanceof TrackerHistoryFeedViewModel)) return new TrackerHistoryFeedViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function obsArr(arr) {
        return (k && k.observableArray) ? k.observableArray(arr || []) : function () { return arr || []; };
    }

    self.entries = (p.entries && k && k.isObservable(p.entries))
        ? p.entries
        : obsArr(unwrap(p.entries, []));

    self.subtitle = (p.subtitle && k && k.isObservable(p.subtitle))
        ? p.subtitle
        : obs(unwrap(p.subtitle, '0 completed prayers'));

    self.hasEntries = (k && k.pureComputed) ? k.pureComputed(function () {
        var list = (typeof self.entries === 'function') ? self.entries() : self.entries;
        return Array.isArray(list) && list.length > 0;
    }) : function () {
        var list = (typeof self.entries === 'function') ? self.entries() : self.entries;
        return Array.isArray(list) && list.length > 0;
    };

    self.handleDeleteEntry = function (entry, event) {
        var cb = p.onDeleteEntry || p.onDelete;
        if (typeof cb === 'function') {
            cb(entry, event);
        }
    };
}

export default {
    template: TrackerHistoryFeedTemplate,
    viewModel: TrackerHistoryFeedViewModel
};

