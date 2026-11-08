/* ============================================================
   Nur Prayer — Dua Pinned Page Component
   Path: features/dua/dua-pinned/dua-pinned-page/dua-pinned-page.js
   Responsibilities:
     - Owns Pinned Duas page view
     - Integrates DuaPinnedFeed
     - Manages unpin actions and detail view navigation
   ============================================================ */
'use strict';

import {
    loadDuasFromStorage, loadPins, savePins, togglePin, unwrap, MAX_PINS
} from '../../dua-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const DuaPinnedPageTemplate = {
    element: 'dua-pinned-page-template',
    file: 'features/dua/dua-pinned/dua-pinned-page/dua-pinned-page.html'
};

export function DuaPinnedPageViewModel(params) {
    if (params instanceof DuaPinnedPageViewModel) return params;
    if (!(this instanceof DuaPinnedPageViewModel)) return new DuaPinnedPageViewModel(params);

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

    self.allDuas = (p.allDuas && typeof p.allDuas === 'function')
        ? p.allDuas
        : ((store && typeof store.allDuas === 'function') ? store.allDuas : obsArr(loadDuasFromStorage()));

    self.pins = (p.pins && typeof p.pins === 'function')
        ? p.pins
        : ((store && typeof store.pins === 'function') ? store.pins : obsArr(loadPins()));

    self.pinnedDuas = (p.pinnedDuas && k && typeof p.pinnedDuas === 'function')
        ? p.pinnedDuas
        : cmp(function () {
            var pinList = typeof self.pins === 'function' ? self.pins() : self.pins;
            var duasList = typeof self.allDuas === 'function' ? self.allDuas() : self.allDuas;
            return (pinList || []).map(function (idx) {
                var d = duasList[idx];
                if (d) {
                    var clone = Object.assign({}, d);
                    clone.index = idx;
                    return clone;
                }
                return null;
            }).filter(Boolean);
        });

    self.pinnedTitle = (store && k && typeof store.pinnedTitle === 'function')
        ? store.pinnedTitle
        : cmp(function () {
            var pinList = typeof self.pins === 'function' ? self.pins() : self.pins;
            var count = Array.isArray(pinList) ? pinList.length : 0;
            return 'Your Pinned Duas (' + count + '/' + MAX_PINS + ')';
        });

    self.handleSelectDua = function (item, index, event) {
        var cb = p.onSelectDua || p.onOpenDetail;
        if (typeof cb === 'function') {
            cb(item, index, event);
        } else if (_win.DuasApp && typeof _win.DuasApp.openDetail === 'function') {
            _win.DuasApp.openDetail(index);
        }
    };

    self.handleUnpinDua = function (item, index, event) {
        var realIdx = (item && item.index !== undefined) ? item.index : index;
        if (store && typeof store.togglePin === 'function') {
            store.togglePin(realIdx);
        } else {
            var res = togglePin(realIdx);
            if (res.success && typeof self.pins === 'function') {
                self.pins(res.pins);
            }
        }
    };
}

if (typeof window !== 'undefined') {
    window.DuaPinnedPageViewModel = DuaPinnedPageViewModel;
}

export default {
    template: DuaPinnedPageTemplate,
    viewModel: DuaPinnedPageViewModel
};
