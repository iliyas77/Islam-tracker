/* ============================================================
   Nur Prayer — Dua Favourites Feed Component
   Path: features/dua/dua-favourites/dua-favourites-feed/dua-favourites-feed.js
   Responsibilities:
     - Feeds favourite Duas to cards
     - Handles empty state when no favourites have been added
     - Dispatches item actions to parent (Page)
   ============================================================ */
'use strict';

import { unwrap } from '../../dua-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const DuaFavouritesFeedTemplate = {
    element: 'dua-favourites-feed-template',
    file: 'features/dua/dua-favourites/dua-favourites-feed/dua-favourites-feed.html'
};

export function DuaFavouritesFeedViewModel(params) {
    if (params instanceof DuaFavouritesFeedViewModel) return params;
    if (!(this instanceof DuaFavouritesFeedViewModel)) return new DuaFavouritesFeedViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obsArr(arr) {
        return (k && k.observableArray) ? k.observableArray(arr || []) : function () { return arr || []; };
    }

    self.favouriteDuas = (p.favouriteDuas && k && k.isObservable(p.favouriteDuas))
        ? p.favouriteDuas
        : obsArr(unwrap(p.favouriteDuas, []));

    self.hasFavourites = function () {
        var list = (typeof self.favouriteDuas === 'function') ? self.favouriteDuas() : self.favouriteDuas;
        return Array.isArray(list) && list.length > 0;
    };

    self.handleSelect = function (item, index, event) {
        var cb = p.onSelectDua || p.onOpenDetail;
        if (typeof cb === 'function') {
            cb(item, index, event);
        }
    };

    self.handleToggleFav = function (item, index, event) {
        var cb = p.onToggleFav;
        if (typeof cb === 'function') {
            cb(item, index, event);
        }
    };
}

if (typeof window !== 'undefined') {
    window.DuaFavouritesFeedViewModel = DuaFavouritesFeedViewModel;
}

export default {
    template: DuaFavouritesFeedTemplate,
    viewModel: DuaFavouritesFeedViewModel
};

