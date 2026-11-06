/* ============================================================
   Nur Prayer — Reactive Duas Store / Service
   Path: services/duas-store.js
   Responsibilities:
     - Centralized Knockout reactive store for Quran Duas
     - Observables & pure computeds: allDuas, pins, favourites,
       searchQuery, currentIndex, currentDua, isCurrentFav,
       isCurrentPinned, pinnedTitle, filteredDuas, favouriteDuas,
       pinnedDuas, isLoading, loadError
     - Persistent synchronization with localStorage via .subscribe()
     - Integration with DuasPageViewModel & DuasApp
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
    var readFn = typeof fn === 'function' ? fn : (fn && fn.read);
    var writeFn = (fn && typeof fn.write === 'function') ? fn.write : function () {};
    if (_ko && typeof _ko.pureComputed === 'function') {
        try {
            return _ko.pureComputed({ read: readFn, write: writeFn });
        } catch (_) {
            return _ko.pureComputed(readFn);
        }
    }
    if (_ko && typeof _ko.computed === 'function') {
        try {
            return _ko.computed({ read: readFn, write: writeFn });
        } catch (_) {
            return _ko.computed(readFn);
        }
    }
    var comp = function (val) {
        if (arguments.length > 0) {
            writeFn(val);
            return comp;
        }
        return readFn ? readFn() : undefined;
    };
    comp.__isComputed = true;
    return comp;
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

    // 1. Initial Storage Readers
    function readStoredDuas() {
        try {
            var raw = _win.localStorage ? _win.localStorage.getItem(self.STORAGE_KEY_DUAS) : null;
            if (raw) {
                var d = JSON.parse(raw);
                if (Array.isArray(d)) return d;
            }
        } catch (_) {}
        return [];
    }

    function readStoredFavs() {
        try {
            var raw = _win.localStorage ? _win.localStorage.getItem(self.STORAGE_KEY_FAVS) : null;
            if (raw) {
                var f = JSON.parse(raw);
                if (Array.isArray(f)) return f;
            }
        } catch (_) {}
        return [];
    }

    function readStoredPins() {
        try {
            var raw = _win.localStorage ? _win.localStorage.getItem(self.STORAGE_KEY_PINS) : null;
            if (raw) {
                var p = JSON.parse(raw);
                if (Array.isArray(p)) return p;
            }
        } catch (_) {}
        return [];
    }

    // 2. Reactive Observables
    self.allDuas = createObservableArray(readStoredDuas());
    self.pins = createObservableArray(readStoredPins());
    self.favourites = createObservableArray(readStoredFavs());
    self.searchQuery = createObservable('');
    self.isLoading = createObservable(false);
    self.loadError = createObservable(null);
    self.currentIndex = createObservable(0);

    // 3. Pure Computeds
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

    self.filteredDuas = createComputed(function () {
        var q = (self.searchQuery() || '').trim().toLowerCase();
        var list = self.allDuas() || [];
        if (!q) return list;
        return list.filter(function (d) {
            var num = String(d.number || d.id || '');
            var surah = String(d.surah || d.surah_name || '').toLowerCase();
            var ayat = String(d.ayat_number || '').toLowerCase();
            var uch = String(d.uchcharana || d.telugu_uchcharana || '').toLowerCase();
            var ard = String(d.ardham || d.telugu_ardham || '').toLowerCase();
            return (num === q) ||
                (surah.indexOf(q) !== -1) ||
                (ayat.indexOf(q) !== -1) ||
                (uch.indexOf(q) !== -1) ||
                (ard.indexOf(q) !== -1);
        });
    });

    self.favouriteDuas = createComputed(function () {
        var favs = self.favourites() || [];
        var list = self.allDuas() || [];
        return favs.map(function (idx) {
            return list[idx];
        }).filter(Boolean);
    });

    self.pinnedDuas = createComputed(function () {
        var p = self.pins() || [];
        var list = self.allDuas() || [];
        return p.map(function (idx) {
            return list[idx];
        }).filter(Boolean);
    });

    // 4. Automated Reactive Persistence via .subscribe()
    if (typeof self.allDuas.subscribe === 'function') {
        self.allDuas.subscribe(function (val) {
            if (_win.localStorage) {
                try {
                    _win.localStorage.setItem(self.STORAGE_KEY_DUAS, JSON.stringify(val || []));
                } catch (_) {}
            }
        });
    }

    if (typeof self.favourites.subscribe === 'function') {
        self.favourites.subscribe(function (val) {
            if (_win.localStorage) {
                try {
                    _win.localStorage.setItem(self.STORAGE_KEY_FAVS, JSON.stringify(val || []));
                } catch (_) {}
            }
        });
    }

    if (typeof self.pins.subscribe === 'function') {
        self.pins.subscribe(function (val) {
            if (_win.localStorage) {
                try {
                    _win.localStorage.setItem(self.STORAGE_KEY_PINS, JSON.stringify(val || []));
                } catch (_) {}
            }
        });
    }

    // 5. Actions
    self.loadFromStorage = function () {
        self.allDuas(readStoredDuas());
        self.favourites(readStoredFavs());
        self.pins(readStoredPins());
    };

    self.syncFrom = function (duas, favs, pns) {
        if (Array.isArray(duas)) self.allDuas(duas);
        if (Array.isArray(favs)) self.favourites(favs);
        if (Array.isArray(pns)) self.pins(pns);
    };

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

    // Auto load initially
    self.loadFromStorage();
}

export const DuasStore = new DuasStoreModel();

if (typeof window !== 'undefined') {
    window.DuasStore = DuasStore;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DuasStore: DuasStore };
}
