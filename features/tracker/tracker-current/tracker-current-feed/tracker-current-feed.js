/* ============================================================
   Nur Prayer — Tracker Current Feed Component
   Path: features/tracker/tracker-current/tracker-current-feed/tracker-current-feed.js
   Responsibilities:
     - Feeds missed and completed prayers lists into card components
     - Manages collapsible prayer groups (Missed & Done)
     - Intermediary callback dispatcher (Card onToggle -> Feed -> Page)
   ============================================================ */
'use strict';

import { unwrap } from '../../tracker-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const TrackerCurrentFeedTemplate = {
    element: 'tracker-current-feed-template',
    file: 'features/tracker/tracker-current/tracker-current-feed/tracker-current-feed.html'
};

export function TrackerCurrentFeedViewModel(params) {
    if (params instanceof TrackerCurrentFeedViewModel) return params;
    if (!(this instanceof TrackerCurrentFeedViewModel)) return new TrackerCurrentFeedViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function obsArr(arr) {
        return (k && k.observableArray) ? k.observableArray(arr || []) : function () { return arr || []; };
    }

    self.collapsePrefix = unwrap(p.collapsePrefix, 'cur');
    self.pagePrefix = unwrap(p.pagePrefix, 'page.current');

    self.missedGroupTitle = (p.missedGroupTitle && k && k.isObservable(p.missedGroupTitle))
        ? p.missedGroupTitle
        : obs(unwrap(p.missedGroupTitle, 'MISSED'));

    self.doneGroupTitle = (p.doneGroupTitle && k && k.isObservable(p.doneGroupTitle))
        ? p.doneGroupTitle
        : obs(unwrap(p.doneGroupTitle, 'DONE'));

    self.missedRows = (p.missedRows && k && k.isObservable(p.missedRows))
        ? p.missedRows
        : obsArr(unwrap(p.missedRows, []));

    self.doneRows = (p.doneRows && k && k.isObservable(p.doneRows))
        ? p.doneRows
        : obsArr(unwrap(p.doneRows, []));

    self.hasMissed = function () {
        var list = (typeof self.missedRows === 'function') ? self.missedRows() : self.missedRows;
        return Array.isArray(list) && list.length > 0;
    };

    self.hasDone = function () {
        var list = (typeof self.doneRows === 'function') ? self.doneRows() : self.doneRows;
        return Array.isArray(list) && list.length > 0;
    };

    self.handleToggle = function (prayerCardVm, event) {
        var cb = p.onTogglePrayer || p.onToggle;
        if (typeof cb === 'function') {
            cb(prayerCardVm, event);
        }
    };
}

export default {
    template: TrackerCurrentFeedTemplate,
    viewModel: TrackerCurrentFeedViewModel
};

