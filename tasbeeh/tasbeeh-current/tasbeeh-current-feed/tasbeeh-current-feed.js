/* ============================================================
   Nur Prayer — Current Tasbeeh Feed Component
   Path: tasbeeh/tasbeeh-current/tasbeeh-current-feed/tasbeeh-current-feed.js
   ============================================================ */

import {
    loadItems,
    loadCalCompletions,
    getCurrentTrackingMonth,
    isMonthFullyCompleted,
    advanceCurrentMonth,
    classifyCurrentItems,
    td
} from '../../tasbeeh-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const CurrentFeedTemplate = {
    element: 'tasbeeh-current-feed-template',
    file: 'tasbeeh/tasbeeh-current/tasbeeh-current-feed/tasbeeh-current-feed.html'
};

export function CurrentFeedViewModel(params) {
    if (params instanceof CurrentFeedViewModel) return params;
    if (!(this instanceof CurrentFeedViewModel)) return new CurrentFeedViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function comp(fn) {
        return (k && k.pureComputed) ? k.pureComputed(fn) : fn;
    }

    self.refreshKey = obs(0);
    self.refresh = function () {
        if (typeof self.refreshKey === 'function') {
            self.refreshKey(self.refreshKey() + 1);
        }
    };

    self.activeTab = (p.activeTab && k && k.isObservable(p.activeTab)) ? p.activeTab : obs(p.initialTab || 'todo');

    var getRawItems = function () {
        if (p.items) {
            return (typeof p.items === 'function') ? p.items() : p.items;
        }
        if (_win.TasbeehApp && typeof _win.TasbeehApp.getItems === 'function') {
            return _win.TasbeehApp.getItems();
        }
        return loadItems();
    };

    var getRawCompletions = function () {
        if (p.calCompletions) {
            return (typeof p.calCompletions === 'function') ? p.calCompletions() : p.calCompletions;
        }
        return loadCalCompletions();
    };

    self.items = comp(function () {
        if (typeof self.refreshKey === 'function') self.refreshKey();
        return getRawItems();
    });

    self.isEmpty = comp(function () {
        var it = self.items();
        return !it || it.length === 0;
    });

    self.classified = comp(function () {
        if (typeof self.refreshKey === 'function') self.refreshKey();
        return classifyCurrentItems(self.items(), getRawCompletions(), getCurrentTrackingMonth(), td());
    });

    self.todoItems = comp(function () {
        if (p.todoItems && typeof p.todoItems === 'function') {
            var items = p.todoItems();
            var done = (p.doneItems && typeof p.doneItems === 'function') ? p.doneItems() : [];
            if ((items && items.length > 0) || (done && done.length > 0)) {
                return items || [];
            }
        }
        return self.classified().todo;
    });

    self.doneItems = comp(function () {
        if (p.doneItems && typeof p.doneItems === 'function') {
            var done = p.doneItems();
            var items = (p.todoItems && typeof p.todoItems === 'function') ? p.todoItems() : [];
            if ((done && done.length > 0) || (items && items.length > 0)) {
                return done || [];
            }
        }
        return self.classified().done;
    });

    self.isMonthCompleted = comp(function () {
        if (typeof self.refreshKey === 'function') self.refreshKey();
        var itList = self.items() || [];
        if (!itList.length) return false;
        var comps = getRawCompletions();
        var curMonthKey = getCurrentTrackingMonth();
        return isMonthFullyCompleted(comps, itList, curMonthKey);
    });

    self.switchTab = function (tab, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var targetTab = (tab === 'completed') ? 'completed' : 'todo';
        if (typeof self.activeTab === 'function') {
            self.activeTab(targetTab);
        }
        if (typeof p.onTabSwitch === 'function') {
            p.onTabSwitch(targetTab, e);
        }
    };

    self.statusTabs = comp(function () {
        return [
            {
                id: 'todo',
                label: 'TO DO',
                badge: comp(function () { return self.todoItems().length; }),
                elementId: 'tabTbCurrentTodo',
                badgeId: 'tbCurrentTodoBadge'
            },
            {
                id: 'completed',
                label: 'COMPLETED',
                badge: comp(function () { return self.doneItems().length; }),
                elementId: 'tabTbCurrentDone',
                badgeId: 'tbCurrentDoneBadge'
            }
        ];
    });

    self.statusTabsParams = {
        tabs: self.statusTabs,
        activeTab: self.activeTab,
        onTabChange: function (tabId, tabItem, event) {
            self.switchTab(tabId, event);
        },
        ariaLabel: 'Current Tasbeeh Status Tabs'
    };

    self.handleCardClick = function (item, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var it = (item && item.raw) ? item.raw : item;
        if (typeof p.onCardClick === 'function') {
            p.onCardClick(it, e);
        }
    };

    self.handleEditClick = function (item, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var it = (item && item.raw) ? item.raw : item;
        if (typeof p.onEditClick === 'function') {
            p.onEditClick(it, e);
        }
    };

    self.onCardClick = (typeof p.onCardClick === 'function') ? self.handleCardClick : null;
    self.onEditClick = (typeof p.onEditClick === 'function') ? self.handleEditClick : null;

    self.onAdvanceMonth = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onAdvanceMonth === 'function') {
            p.onAdvanceMonth(d, e);
        } else {
            advanceCurrentMonth({
                items: self.items(),
                calCompletions: getRawCompletions()
            });
        }
    };
}

if (typeof window !== 'undefined') {
    window.CurrentFeedViewModel = CurrentFeedViewModel;
}

export default CurrentFeedViewModel;

