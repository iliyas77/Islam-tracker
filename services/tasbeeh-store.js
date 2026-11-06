/* ============================================================
   Nur Prayer — Reactive Tasbeeh Store / Service
   Path: services/tasbeeh-store.js
   Responsibilities:
     - Centralized Knockout reactive store for Digital Tasbeeh
     - Observables & pure computeds: items, bookmarkedItems,
       currentTodoItems, currentDoneItems, currentDhikrsCount,
       clearedMonths, clearedMonthsCount, dailyProgress,
       activeMonth, activeOldLabel
     - Persistent synchronization with localStorage via .subscribe()
     - Seamless integration with TasbeehPageViewModel & TasbeehApp
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

function TasbeehStoreModel() {
    var self = this;

    var CONSTANTS = _win.CONSTANTS || {};
    var TASBEEH_CONSTANTS = (_win.TASBEEH_CONSTANTS || CONSTANTS.TASBEEH) || {};
    var STORAGE_KEYS = TASBEEH_CONSTANTS.STORAGE_KEYS || {};

    self.STORAGE_KEY = STORAGE_KEYS.DATA || 'app_tasbeeh_data';
    self.DAY_KEY = STORAGE_KEYS.DAY || 'app_tasbeeh_day';
    self.BM_CUR_KEY = STORAGE_KEYS.BOOKMARK_CURRENT || 'app_tasbeeh_bookmark_current';
    self.BM_OLD_KEY = STORAGE_KEYS.BOOKMARK_OLD || 'app_tasbeeh_bookmark_old';
    self.CURRENT_PERIOD_KEY = STORAGE_KEYS.CURRENT_PERIOD || 'app_tasbeeh_current_period';
    self.PERIOD_KEY = STORAGE_KEYS.PERIOD || 'app_tasbeeh_period';
    self.CAL_COMPLETION_KEY = STORAGE_KEYS.CAL_COMPLETIONS || 'app_tasbeeh_cal_completions';

    // 1. Storage Readers
    function readStoredItems() {
        try {
            var raw = _win.localStorage ? _win.localStorage.getItem(self.STORAGE_KEY) : null;
            if (raw) {
                var parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (_) {}
        if (_win.TasbeehApp && typeof _win.TasbeehApp.getItems === 'function') {
            return _win.TasbeehApp.getItems() || [];
        }
        return [];
    }

    function readStoredClearedMonths() {
        try {
            var raw = _win.localStorage ? _win.localStorage.getItem(self.PERIOD_KEY) : null;
            if (raw) {
                var p = JSON.parse(raw);
                if (p && Array.isArray(p.clearedMonths)) return p.clearedMonths;
            }
        } catch (_) {}
        return [];
    }

    function readActiveMonth() {
        if (_win.TasbeehApp && typeof _win.TasbeehApp.getCurrentTrackingMonth === 'function') {
            return _win.TasbeehApp.getCurrentTrackingMonth();
        }
        return typeof _win.getCurrentMonthKey === 'function' ? _win.getCurrentMonthKey() : new Date().toISOString().slice(0, 7);
    }

    // 2. Reactive Observables
    self.items = createObservableArray(readStoredItems());
    self.bookmarkedItems = createObservableArray([]);
    self.clearedMonths = createObservableArray(readStoredClearedMonths());
    self.activeMonth = createObservable(readActiveMonth());
    self.activeOldLabel = createObservable('All Cleared');

    // 3. Pure Computeds (with safe write fallback for legacy imperative callers)
    self.currentDhikrsCount = createComputed({
        read: function () {
            return self.items().length;
        },
        write: function () {}
    });

    self.clearedMonthsCount = createComputed({
        read: function () {
            return self.clearedMonths().length;
        },
        write: function () {}
    });

    self.currentTodoItems = createComputed({
        read: function () {
            var list = self.items() || [];
            return list.filter(function (it) {
                if (it.targetCount === 'infinite' || it.targetCount === '∞') return true;
                var target = parseInt(it.targetCount, 10) || 0;
                return (it.currentCount || 0) < target;
            });
        },
        write: function () {}
    });

    self.currentDoneItems = createComputed({
        read: function () {
            var list = self.items() || [];
            return list.filter(function (it) {
                if (it.targetCount === 'infinite' || it.targetCount === '∞') return false;
                var target = parseInt(it.targetCount, 10) || 0;
                return target > 0 && (it.currentCount || 0) >= target;
            });
        },
        write: function () {}
    });

    self.dailyProgress = createComputed({
        read: function () {
            var list = self.items() || [];
            if (!list.length) return 0;
            var validTargets = list.filter(function (it) {
                return it.targetCount !== 'infinite' && it.targetCount !== '∞' && (parseInt(it.targetCount, 10) || 0) > 0;
            });
            if (!validTargets.length) return 0;
            var done = validTargets.filter(function (it) {
                var target = parseInt(it.targetCount, 10) || 0;
                return (it.currentCount || 0) >= target;
            }).length;
            return Math.round((done / validTargets.length) * 100);
        },
        write: function () {}
    });

    // 4. Automated Reactive Persistence via .subscribe()
    if (typeof self.items.subscribe === 'function') {
        self.items.subscribe(function (val) {
            if (_win.localStorage) {
                try {
                    _win.localStorage.setItem(self.STORAGE_KEY, JSON.stringify(val || []));
                } catch (_) {}
            }
        });
    }

    if (typeof self.clearedMonths.subscribe === 'function') {
        self.clearedMonths.subscribe(function (val) {
            if (_win.localStorage) {
                try {
                    var p = {};
                    var raw = _win.localStorage.getItem(self.PERIOD_KEY);
                    if (raw) {
                        try { p = JSON.parse(raw) || {}; } catch (_) {}
                    }
                    p.clearedMonths = val || [];
                    _win.localStorage.setItem(self.PERIOD_KEY, JSON.stringify(p));
                } catch (_) {}
            }
        });
    }

    // 5. Synchronization & Actions
    self.loadAll = function () {
        var items = readStoredItems();
        self.items(items);
        self.clearedMonths(readStoredClearedMonths());
        self.activeMonth(readActiveMonth());

        if (_win.TasbeehApp && typeof _win.TasbeehApp.getBookmarkedChants === 'function') {
            try {
                var bms = _win.TasbeehApp.getBookmarkedChants();
                var bmList = [];
                if (bms && bms.current && bms.current.item) {
                    bmList.push(bms.current);
                }
                if (bms && bms.old && bms.old.item) {
                    bmList.push(bms.old);
                }
                self.bookmarkedItems(bmList);
            } catch (_) {}
        }
    };

    self.sync = function () {
        self.loadAll();
        if (_win.TasbeehApp && typeof _win.TasbeehApp.renderCurrentList === 'function') {
            try { _win.TasbeehApp.renderCurrentList(); } catch (_) {}
        }
        if (_win.TasbeehHomeApp && typeof _win.TasbeehHomeApp.render === 'function') {
            try { _win.TasbeehHomeApp.render(); } catch (_) {}
        }
        if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.render === 'function') {
            try { _win.TasbeehOldApp.render(); } catch (_) {}
        }
        if (_win.TasbeehHistoryApp && typeof _win.TasbeehHistoryApp.renderHistoryTab === 'function') {
            try { _win.TasbeehHistoryApp.renderHistoryTab(); } catch (_) {}
        }
    };

    self.addDhikr = function (title, targetCount) {
        if (!title || !title.trim()) return;
        var currentItems = self.items().slice();
        var newItem = {
            id: 'chant_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            title: title.trim(),
            targetCount: (targetCount === 'infinite' || targetCount === '∞') ? 'infinite' : (parseInt(targetCount, 10) || 100),
            currentCount: 0,
            totalCountToday: 0,
            completions: {},
            dailyCounts: {}
        };
        currentItems.push(newItem);
        self.items(currentItems);

        if (_win.TasbeehApp && typeof _win.TasbeehApp.setItems === 'function') {
            try { _win.TasbeehApp.setItems(currentItems); } catch (_) {}
        }
        self.sync();
    };

    self.updateDhikr = function (id, updates) {
        if (!id || !updates) return;
        var currentItems = self.items().slice();
        var found = false;
        for (var i = 0; i < currentItems.length; i++) {
            if (currentItems[i].id === id) {
                Object.assign(currentItems[i], updates);
                found = true;
                break;
            }
        }
        if (found) {
            self.items(currentItems);
            if (_win.TasbeehApp && typeof _win.TasbeehApp.setItems === 'function') {
                try { _win.TasbeehApp.setItems(currentItems); } catch (_) {}
            }
            self.sync();
        }
    };

    self.deleteDhikr = function (id) {
        if (!id) return;
        var filtered = self.items().filter(function (it) { return it.id !== id; });
        self.items(filtered);
        if (_win.TasbeehApp && typeof _win.TasbeehApp.setItems === 'function') {
            try { _win.TasbeehApp.setItems(filtered); } catch (_) {}
        }
        self.sync();
    };

    self.reopenLastMonth = function () {
        if (_win.TasbeehApp && typeof _win.TasbeehApp.reopenLastMonth === 'function') {
            _win.TasbeehApp.reopenLastMonth();
        }
        self.sync();
    };

    self.resetAllCompleted = function () {
        if (_win.TasbeehApp && typeof _win.TasbeehApp.resetAllCompleted === 'function') {
            _win.TasbeehApp.resetAllCompleted();
        }
        self.sync();
    };

    // Auto load initially
    self.loadAll();
}

export const TasbeehStore = new TasbeehStoreModel();

if (typeof window !== 'undefined') {
    window.TasbeehStore = TasbeehStore;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TasbeehStore: TasbeehStore };
}
