/* ============================================================
   Nur Prayer — Tracker Old Feed Component
   Path: features/tracker/tracker-old/tracker-old-feed/tracker-old-feed.js
   Responsibilities:
     - Feeds missed and completed prayers lists into old card components
     - Manages collapsible prayer groups (Missed & Done)
     - Intermediary callback dispatcher (Card onToggle -> Feed -> Page)
   ============================================================ */
'use strict';

import { unwrap } from '../../tracker-shared/tracker-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const TrackerOldFeedTemplate = {
    element: 'tracker-old-feed-template',
    file: 'features/tracker/tracker-old/tracker-old-feed/tracker-old-feed.html'
};

export function TrackerOldFeedViewModel(params) {
    if (params instanceof TrackerOldFeedViewModel) return params;
    if (!(this instanceof TrackerOldFeedViewModel)) return new TrackerOldFeedViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function obsArr(arr) {
        return (k && k.observableArray) ? k.observableArray(arr || []) : function () { return arr || []; };
    }

    self.collapsePrefix = unwrap(p.collapsePrefix, 'old');
    self.pagePrefix = unwrap(p.pagePrefix, 'page.old');

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
    template: TrackerOldFeedTemplate,
    viewModel: TrackerOldFeedViewModel
};

