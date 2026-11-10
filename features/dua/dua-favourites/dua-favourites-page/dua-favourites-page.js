/* ============================================================
   Nur Prayer — Dua Favourites Page Component
   Path: features/dua/dua-favourites/dua-favourites-page/dua-favourites-page.js
   Responsibilities:
     - Owns Favourite Duas page view
     - Integrates DuaFavouritesFeed
     - Manages favourite toggling and detail view navigation
   ============================================================ */
'use strict';

import {
    loadDuasFromStorage, loadFavourites, saveFavourites, toggleFavourite, unwrap
} from '../../dua-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const DuaFavouritesPageTemplate = {
    element: 'dua-favourites-page-template',
    file: 'features/dua/dua-favourites/dua-favourites-page/dua-favourites-page.html'
};

export function DuaFavouritesPageViewModel(params) {
    if (params instanceof DuaFavouritesPageViewModel) return params;
    if (!(this instanceof DuaFavouritesPageViewModel)) return new DuaFavouritesPageViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko || _win.ko || (typeof ko !== 'undefined' ? ko : null);
    var self = this;

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
    function cmp(fn) {
        return (k && typeof k.pureComputed === 'function') ? k.pureComputed(fn) : fn;
    }

    var store = _win.DuasStore || null;

    self.allDuas = (p.allDuas && typeof p.allDuas === 'function')
        ? p.allDuas
        : ((store && typeof store.allDuas === 'function') ? store.allDuas : obsArr(loadDuasFromStorage()));

    self.favourites = (p.favourites && typeof p.favourites === 'function')
        ? p.favourites
        : ((store && typeof store.favourites === 'function') ? store.favourites : obsArr(loadFavourites()));

    self.favouriteDuas = (p.favouriteDuas && k && typeof p.favouriteDuas === 'function')
        ? p.favouriteDuas
        : cmp(function () {
            var favList = typeof self.favourites === 'function' ? self.favourites() : self.favourites;
            var duasList = typeof self.allDuas === 'function' ? self.allDuas() : self.allDuas;
            return (favList || []).map(function (idx) {
                var d = duasList[idx];
                if (d) {
                    var clone = Object.assign({}, d);
                    clone.index = idx;
                    return clone;
                }
                return null;
            }).filter(Boolean);
        });

    self.handleSelectDua = function (item, index, event) {
        var cb = p.onSelectDua || p.onOpenDetail;
        if (typeof cb === 'function') {
            cb(item, index, event);
        } else if (_win.DuasApp && typeof _win.DuasApp.openDetail === 'function') {
            _win.DuasApp.openDetail(index);
        }
    };

    self.handleToggleFav = function (item, index, event) {
        var realIdx = (item && item.index !== undefined) ? item.index : index;
        if (store && typeof store.toggleFavourite === 'function') {
            store.toggleFavourite(realIdx);
        } else {
            var favs = toggleFavourite(realIdx);
            if (typeof self.favourites === 'function') {
                self.favourites(favs);
            }
        }
    };
}

if (typeof window !== 'undefined') {
    window.DuaFavouritesPageViewModel = DuaFavouritesPageViewModel;
}

export default {
    template: DuaFavouritesPageTemplate,
    viewModel: DuaFavouritesPageViewModel
};
