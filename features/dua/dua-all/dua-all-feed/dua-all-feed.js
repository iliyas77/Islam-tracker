/* ============================================================
   Nur Prayer — Dua All Feed Component
   Path: features/dua/dua-all/dua-all-feed/dua-all-feed.js
   Responsibilities:
     - Feeds all and filtered Duas to dua-all-card components
     - Manages loading and empty states
     - Dispatches item actions to parent (Page)
   ============================================================ */
'use strict';

import { unwrap } from '../../dua-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const DuaAllFeedTemplate = {
    element: 'dua-all-feed-template',
    file: 'features/dua/dua-all/dua-all-feed/dua-all-feed.html'
};

export function DuaAllFeedViewModel(params) {
    if (params instanceof DuaAllFeedViewModel) return params;
    if (!(this instanceof DuaAllFeedViewModel)) return new DuaAllFeedViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko || _win.ko || (typeof ko !== 'undefined' ? ko : null);
    var self = this;

    function obs(val) {
        if (k && typeof k.observable === 'function') return k.observable(val);
        var current = val;
        function fn(newVal) {
            if (arguments.length > 0) {
                current = newVal;
                return fn;
            }
            return current;
        }
        return fn;
    }
    function obsArr(arr) {
        if (k && typeof k.observableArray === 'function') return k.observableArray(arr || []);
        var current = Array.isArray(arr) ? arr.slice() : [];
        function fn(newVal) {
            if (arguments.length > 0) {
                current = Array.isArray(newVal) ? newVal : [];
                return fn;
            }
            return current;
        }
        return fn;
    }

    self.isLoading = (p.isLoading && typeof p.isLoading === 'function') ? p.isLoading : obs(false);
    self.loadError = (p.loadError && typeof p.loadError === 'function') ? p.loadError : obs(null);
    self.duas = (p.duas && typeof p.duas === 'function') ? p.duas : obsArr(unwrap(p.duas, []));
    self.favourites = (p.favourites && typeof p.favourites === 'function') ? p.favourites : obsArr(unwrap(p.favourites, []));
    self.pins = (p.pins && typeof p.pins === 'function') ? p.pins : obsArr(unwrap(p.pins, []));

    self.handleRetry = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var cb = p.onRetry;
        if (typeof cb === 'function') {
            cb(d, e);
        } else if (_win.DuasApp && typeof _win.DuasApp.fetchDuas === 'function') {
            _win.DuasApp.fetchDuas(true);
        }
    };

    self.hasResults = function () {
        var list = (typeof self.duas === 'function') ? self.duas() : self.duas;
        return Array.isArray(list) && list.length > 0;
    };

    self.isFav = function (dua, idx) {
        var favs = (typeof self.favourites === 'function') ? self.favourites() : self.favourites;
        var realIdx = (dua && dua.index !== undefined) ? dua.index : idx;
        return Array.isArray(favs) && favs.indexOf(realIdx) !== -1;
    };

    self.isPinned = function (dua, idx) {
        var pList = (typeof self.pins === 'function') ? self.pins() : self.pins;
        var realIdx = (dua && dua.index !== undefined) ? dua.index : idx;
        return Array.isArray(pList) && pList.indexOf(realIdx) !== -1;
    };

    self.handleSelect = function (dua, idx, event) {
        var cb = p.onSelectDua || p.onOpenDetail;
        if (typeof cb === 'function') {
            cb(dua, idx, event);
        }
    };

    self.handleTogglePin = function (dua, idx, event) {
        var cb = p.onTogglePin;
        if (typeof cb === 'function') {
            cb(dua, idx, event);
        }
    };

    self.handleToggleFav = function (dua, idx, event) {
        var cb = p.onToggleFav;
        if (typeof cb === 'function') {
            cb(dua, idx, event);
        }
    };
}

if (typeof window !== 'undefined') {
    window.DuaAllFeedViewModel = DuaAllFeedViewModel;
}

export default {
    template: DuaAllFeedTemplate,
    viewModel: DuaAllFeedViewModel
};

