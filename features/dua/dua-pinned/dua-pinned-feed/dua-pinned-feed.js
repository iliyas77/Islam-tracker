/* ============================================================
   Nur Prayer — Dua Pinned Feed Component
   Path: features/dua/dua-pinned/dua-pinned-feed/dua-pinned-feed.js
   Responsibilities:
     - Feeds pinned Duas to dua-pinned-card components
     - Handles empty pinned state and pinned count title
     - Dispatches item actions to parent (Page)
   ============================================================ */
'use strict';

import { unwrap } from '../../dua-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const DuaPinnedFeedTemplate = {
    element: 'dua-pinned-feed-template',
    file: 'features/dua/dua-pinned/dua-pinned-feed/dua-pinned-feed.html'
};

export function DuaPinnedFeedViewModel(params) {
    if (params instanceof DuaPinnedFeedViewModel) return params;
    if (!(this instanceof DuaPinnedFeedViewModel)) return new DuaPinnedFeedViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function obsArr(arr) {
        return (k && k.observableArray) ? k.observableArray(arr || []) : function () { return arr || []; };
    }

    self.pinnedDuas = (p.pinnedDuas && k && k.isObservable(p.pinnedDuas))
        ? p.pinnedDuas
        : obsArr(unwrap(p.pinnedDuas, []));

    self.pinnedTitle = (p.pinnedTitle && k && k.isObservable(p.pinnedTitle))
        ? p.pinnedTitle
        : obs(unwrap(p.pinnedTitle, 'Your Pinned Duas (0/2)'));

    self.hasPinned = function () {
        var list = (typeof self.pinnedDuas === 'function') ? self.pinnedDuas() : self.pinnedDuas;
        return Array.isArray(list) && list.length > 0;
    };

    self.handleSelect = function (item, index, event) {
        var cb = p.onSelectDua || p.onOpenDetail;
        if (typeof cb === 'function') {
            cb(item, index, event);
        }
    };

    self.handleUnpin = function (item, index, event) {
        var cb = p.onUnpinDua || p.onUnpin || p.onTogglePin;
        if (typeof cb === 'function') {
            cb(item, index, event);
        }
    };
}

if (typeof window !== 'undefined') {
    window.DuaPinnedFeedViewModel = DuaPinnedFeedViewModel;
}

export default {
    template: DuaPinnedFeedTemplate,
    viewModel: DuaPinnedFeedViewModel
};

