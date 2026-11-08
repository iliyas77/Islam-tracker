/* ============================================================
   Nur Prayer — Dua All Page Component
   Path: features/dua/dua-all/dua-all-page/dua-all-page.js
   Responsibilities:
     - Owns All Duas list page view
     - Integrates Search Bar, DuaAllFeed, and Add Dua Form
     - Manages search query filtering and item selection
   ============================================================ */
'use strict';

import {
    filterDuas, loadDuasFromStorage, saveDuasToStorage,
    loadFavourites, saveFavourites, loadPins, savePins,
    togglePin, toggleFavourite, unwrap
} from '../../dua-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const DuaAllPageTemplate = {
    element: 'dua-all-page-template',
    file: 'features/dua/dua-all/dua-all-page/dua-all-page.html'
};

export function DuaAllPageViewModel(params) {
    if (params instanceof DuaAllPageViewModel) return params;
    if (!(this instanceof DuaAllPageViewModel)) return new DuaAllPageViewModel(params);

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
    function cmp(fn) {
        return (k && typeof k.pureComputed === 'function') ? k.pureComputed(fn) : fn;
    }

    var store = _win.DuasStore || null;

    self.searchQuery = (p.searchQuery && typeof p.searchQuery === 'function')
        ? p.searchQuery
        : ((store && typeof store.searchQuery === 'function') ? store.searchQuery : obs(''));

    self.allDuas = (p.allDuas && typeof p.allDuas === 'function')
        ? p.allDuas
        : ((store && typeof store.allDuas === 'function') ? store.allDuas : obsArr(loadDuasFromStorage()));

    self.favourites = (p.favourites && typeof p.favourites === 'function')
        ? p.favourites
        : ((store && typeof store.favourites === 'function') ? store.favourites : obsArr(loadFavourites()));

    self.pins = (p.pins && typeof p.pins === 'function')
        ? p.pins
        : ((store && typeof store.pins === 'function') ? store.pins : obsArr(loadPins()));

    self.isLoading = (p.isLoading && typeof p.isLoading === 'function')
        ? p.isLoading
        : ((store && typeof store.isLoading === 'function') ? store.isLoading : obs(false));

    self.loadError = (p.loadError && typeof p.loadError === 'function')
        ? p.loadError
        : ((store && typeof store.loadError === 'function') ? store.loadError : obs(null));

    self.handleRetry = function (d, e) {
        if (typeof p.onRetry === 'function') {
            p.onRetry(d, e);
        } else if (_win.DuasApp && typeof _win.DuasApp.fetchDuas === 'function') {
            _win.DuasApp.fetchDuas(true);
        }
    };

    self.isAddOpen = obs(false);

    self.filteredDuas = cmp(function () {
        var q = typeof self.searchQuery === 'function' ? self.searchQuery() : '';
        var list = typeof self.allDuas === 'function' ? self.allDuas() : self.allDuas;
        return filterDuas(q, list);
    });

    self.nextNumber = cmp(function () {
        var list = typeof self.allDuas === 'function' ? self.allDuas() : self.allDuas;
        if (!Array.isArray(list) || list.length === 0) return 1;
        var max = 0;
        list.forEach(function (d) {
            var n = Number(d.number || d.id);
            if (n > max) max = n;
        });
        return max + 1;
    });

    self.clearSearch = function () {
        self.searchQuery('');
    };

    self.handleSelectDua = function (dua, idx, event) {
        var cb = p.onSelectDua || p.onOpenDetail;
        if (typeof cb === 'function') {
            cb(dua, idx, event);
        } else if (_win.DuasApp && typeof _win.DuasApp.openDetail === 'function') {
            _win.DuasApp.openDetail(idx);
        }
    };

    self.handleTogglePin = function (dua, idx, event) {
        var realIdx = (dua && dua.index !== undefined) ? dua.index : idx;
        if (store && typeof store.togglePin === 'function') {
            store.togglePin(realIdx);
        } else {
            var res = togglePin(realIdx);
            if (res.success && typeof self.pins === 'function') {
                self.pins(res.pins);
            }
        }
    };

    self.handleToggleFav = function (dua, idx, event) {
        var realIdx = (dua && dua.index !== undefined) ? dua.index : idx;
        if (store && typeof store.toggleFavourite === 'function') {
            store.toggleFavourite(realIdx);
        } else {
            var favs = toggleFavourite(realIdx);
            if (typeof self.favourites === 'function') {
                self.favourites(favs);
            }
        }
    };

    self.openAdd = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof self.isAddOpen === 'function') self.isAddOpen(true);
    };

    self.closeAdd = function () {
        if (typeof self.isAddOpen === 'function') self.isAddOpen(false);
    };

    self.handleSaveNewDua = function (newDua) {
        if (store && typeof store.addDua === 'function') {
            store.addDua(newDua);
        } else {
            var list = typeof self.allDuas === 'function' ? self.allDuas() : [];
            list.push(newDua);
            saveDuasToStorage(list);
            if (typeof self.allDuas === 'function') self.allDuas(list);
        }
        self.closeAdd();
    };
}

if (typeof window !== 'undefined') {
    window.DuaAllPageViewModel = DuaAllPageViewModel;
}

export default {
    template: DuaAllPageTemplate,
    viewModel: DuaAllPageViewModel
};
