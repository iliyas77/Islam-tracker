/* ============================================================
   Nur Prayer — Reactive Duas Store / Service
   Path: services/duas-store.js
   Responsibilities:
     - Centralized Knockout reactive store for Quran Duas
     - Observables: allDuas, pins, favourites, searchQuery,
       isLoading, loadError, currentIndex, currentDua
     - Pinned & favourite computed collections
     - Synchronization with localStorage & remote JSON API
     - Integration with DuasPageViewModel
   ============================================================ */
'use strict';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

function createObservable(initial) {
    if (_ko && typeof _ko.observable === 'function') {
        return _ko.observable(initial);
    }
    var val = initial;
    function obs(newVal) {
        if (arguments.length > 0) {
            val = newVal;
            return obs;
        }
        return val;
    }
    obs.__isObservable = true;
    return obs;
}

function createObservableArray(initial) {
    if (_ko && typeof _ko.observableArray === 'function') {
        return _ko.observableArray(initial);
    }
    var arr = Array.isArray(initial) ? initial.slice() : [];
    function obs(newVal) {
        if (arguments.length > 0) {
            arr = newVal;
            return obs;
        }
        return arr;
    }
    obs.__isObservable = true;
    obs.push = function () { return arr.push.apply(arr, arguments); };
    return obs;
}

function createComputed(fn) {
    if (_ko && typeof _ko.computed === 'function') {
        return _ko.computed(fn);
    }
    return function () { return fn(); };
}

function DuasStoreModel() {
    var self = this;

    var CONSTANTS = _win.CONSTANTS || {};
    var DUA_CONSTANTS = (_win.DUA_CONSTANTS || CONSTANTS.DUA || CONSTANTS.DUAS) || {};
    var STORAGE_KEYS = DUA_CONSTANTS.STORAGE_KEYS || {};

    self.STORAGE_KEY_DUAS = STORAGE_KEYS.DATA || 'quranDuas_data';
    self.STORAGE_KEY_FAVS = STORAGE_KEYS.FAVS || 'quranDuas_favourites';
    self.STORAGE_KEY_PINS = STORAGE_KEYS.PINS || 'quranDuas_pins';
    self.MAX_PINS = typeof DUA_CONSTANTS.MAX_PINS === 'number' ? DUA_CONSTANTS.MAX_PINS : 2;
    self.API_URL = DUA_CONSTANTS.API_URL || 'https://raw.githubusercontent.com/iliyas77/data.github.io/main/duas.json';

    // 1. Reactive Observables
    self.allDuas = createObservableArray([]);
    self.pins = createObservableArray([]);
    self.favourites = createObservableArray([]);
    self.searchQuery = createObservable('');
    self.isLoading = createObservable(false);
    self.loadError = createObservable(null);
    self.currentIndex = createObservable(0);

    self.pinnedTitle = createComputed(function () {
        var count = self.pins().length;
        return 'Your Pinned Duas (' + count + '/' + self.MAX_PINS + ')';
    });

    self.currentDua = createComputed(function () {
        var list = self.allDuas();
        var idx = self.currentIndex();
        return (list && list[idx]) ? list[idx] : null;
    });

    self.isCurrentFav = createComputed(function () {
        var favs = self.favourites();
        var idx = self.currentIndex();
        return favs.indexOf(idx) !== -1;
    });

    self.isCurrentPinned = createComputed(function () {
        var p = self.pins();
        var idx = self.currentIndex();
        return p.indexOf(idx) !== -1;
    });

    // 2. Storage Helpers
    self.loadFromStorage = function () {
        try {
            var rawDuas = _win.localStorage ? _win.localStorage.getItem(self.STORAGE_KEY_DUAS) : null;
            if (rawDuas) {
                var d = JSON.parse(rawDuas);
                if (Array.isArray(d)) self.allDuas(d);
            }
            var rawFavs = _win.localStorage ? _win.localStorage.getItem(self.STORAGE_KEY_FAVS) : null;
            if (rawFavs) {
                var f = JSON.parse(rawFavs);
                if (Array.isArray(f)) self.favourites(f);
            }
            var rawPins = _win.localStorage ? _win.localStorage.getItem(self.STORAGE_KEY_PINS) : null;
            if (rawPins) {
                var p = JSON.parse(rawPins);
                if (Array.isArray(p)) self.pins(p);
            }
        } catch (_) {}
    };

    self.saveToStorage = function () {
        if (!_win.localStorage) return;
        try {
            _win.localStorage.setItem(self.STORAGE_KEY_DUAS, JSON.stringify(self.allDuas()));
            _win.localStorage.setItem(self.STORAGE_KEY_FAVS, JSON.stringify(self.favourites()));
            _win.localStorage.setItem(self.STORAGE_KEY_PINS, JSON.stringify(self.pins()));
        } catch (_) {}
    };

    // 3. Actions
    self.fetchDuas = function () {
        self.isLoading(true);
        self.loadError(null);

        if (typeof fetch === 'function') {
            return fetch(self.API_URL)
                .then(function (res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.json();
                })
                .then(function (data) {
                    self.isLoading(false);
                    if (Array.isArray(data)) {
                        self.allDuas(data);
                        self.saveToStorage();
                    }
                    if (_win.DuasApp && typeof _win.DuasApp.refreshAllViews === 'function') {
                        _win.DuasApp.refreshAllViews();
                    }
                    return data;
                })
                .catch(function (err) {
                    self.isLoading(false);
                    self.loadError(err && err.message ? err.message : 'Failed to load Duas');
                    self.loadFromStorage();
                    return self.allDuas();
                });
        } else {
            self.loadFromStorage();
            self.isLoading(false);
            return Promise.resolve(self.allDuas());
        }
    };

    self.togglePin = function (index) {
        var currentPins = self.pins().slice();
        var pos = currentPins.indexOf(index);
        if (pos !== -1) {
            currentPins.splice(pos, 1);
        } else {
            if (currentPins.length >= self.MAX_PINS) {
                if (_win.DuasApp && typeof _win.DuasApp.showPinLimitModal === 'function') {
                    _win.DuasApp.showPinLimitModal(index);
                    return;
                }
                currentPins.shift(); // FIFO unpin if modal not available
            }
            currentPins.push(index);
        }
        self.pins(currentPins);
        self.saveToStorage();
        if (_win.DuasApp && typeof _win.DuasApp.refreshAllViews === 'function') {
            _win.DuasApp.refreshAllViews();
        }
    };

    self.toggleFavourite = function (index) {
        var currentFavs = self.favourites().slice();
        var pos = currentFavs.indexOf(index);
        if (pos !== -1) {
            currentFavs.splice(pos, 1);
        } else {
            currentFavs.push(index);
        }
        self.favourites(currentFavs);
        self.saveToStorage();
        if (_win.DuasApp && typeof _win.DuasApp.refreshAllViews === 'function') {
            _win.DuasApp.refreshAllViews();
        }
    };

    self.setCurrentIndex = function (index) {
        var total = self.allDuas().length;
        if (total === 0) return;
        var validIndex = Math.max(0, Math.min(total - 1, index));
        self.currentIndex(validIndex);
    };

    self.nextDua = function () {
        var total = self.allDuas().length;
        if (total === 0) return;
        self.setCurrentIndex((self.currentIndex() + 1) % total);
    };

    self.prevDua = function () {
        var total = self.allDuas().length;
        if (total === 0) return;
        self.setCurrentIndex((self.currentIndex() - 1 + total) % total);
    };

    self.togglePinCurrent = function () {
        self.togglePin(self.currentIndex());
    };

    self.toggleFavouriteCurrent = function () {
        self.toggleFavourite(self.currentIndex());
    };

    // Auto initialize from storage
    self.loadFromStorage();
}

export const DuasStore = new DuasStoreModel();

if (typeof window !== 'undefined') {
    window.DuasStore = DuasStore;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DuasStore: DuasStore };
}

