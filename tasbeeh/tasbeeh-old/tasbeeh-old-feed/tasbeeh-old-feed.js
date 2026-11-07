/* ============================================================
   Nur Prayer — Old Tasbeeh Feed Component
   Path: tasbeeh/tasbeeh-old/tasbeeh-old-feed/tasbeeh-old-feed.js
   ============================================================ */

import {
    loadPeriod,
    loadItems,
    loadCalCompletions,
    formatMonthLabel,
    classifyOldItems
} from '../../tasbeeh-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const OldFeedTemplate = {
    element: 'tasbeeh-old-feed-template',
    file: 'tasbeeh/tasbeeh-old/tasbeeh-old-feed/tasbeeh-old-feed.html'
};

export function OldFeedViewModel(params) {
    if (params instanceof OldFeedViewModel) return params;
    if (!(this instanceof OldFeedViewModel)) return new OldFeedViewModel(params);

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

    self.period = comp(function () {
        return loadPeriod();
    });

    self.curOldMonth = comp(function () {
        var per = self.period();
        if (!per || !per.startDate || !per.endDate) return null;
        return (per.endDate < per.startDate) ? null : per.endDate;
    });

    self.isEmptyRange = comp(function () {
        var per = self.period();
        var initEnd = per.initialEnd || per.endDate;
        return initEnd < per.startDate;
    });

    self.isAllCompleted = comp(function () {
        if (self.isEmptyRange()) return false;
        return !self.curOldMonth();
    });

    self.hasActiveOldMonth = comp(function () {
        return !self.isEmptyRange() && !self.isAllCompleted() && !!self.curOldMonth();
    });

    self.startDateLabel = comp(function () {
        var per = self.period();
        return formatMonthLabel(per.startDate);
    });

    self.curMonthName = comp(function () {
        var m = typeof _win.getCurrentMonthKey === 'function' ? _win.getCurrentMonthKey() : '';
        return formatMonthLabel(m);
    });

    self.monthName = comp(function () {
        return formatMonthLabel(self.curOldMonth());
    });

    self.classified = comp(function () {
        if (typeof self.refreshKey === 'function') self.refreshKey();
        return classifyOldItems(loadItems(), loadCalCompletions(), self.curOldMonth());
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

    self.isAllDone = comp(function () {
        var cl = self.classified();
        return cl.todo.length === 0 && (cl.done.length > 0);
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
                elementId: 'tabTbOldTodo',
                badgeId: 'tbOldTodoBadge'
            },
            {
                id: 'completed',
                label: 'COMPLETED',
                badge: comp(function () { return self.doneItems().length; }),
                elementId: 'tabTbOldDone',
                badgeId: 'tbOldDoneBadge'
            }
        ];
    });

    self.statusTabsParams = {
        tabs: self.statusTabs,
        activeTab: self.activeTab,
        onTabChange: function (tabId, tabItem, event) {
            self.switchTab(tabId, event);
        },
        ariaLabel: 'Old Tasbeeh Status Tabs'
    };

    self.handleCardClick = function (item, month, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var it = (item && item.raw) ? item.raw : item;
        var m = month || self.curOldMonth();
        if (typeof p.onCardClick === 'function') {
            p.onCardClick(it, m, e);
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
        } else if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.advanceOldMonth === 'function') {
            _win.TasbeehOldApp.advanceOldMonth();
        }
    };

    self.onReopenLastMonth = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onReopenLastMonth === 'function') {
            p.onReopenLastMonth(d, e);
        } else if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.reopenLastMonth === 'function') {
            _win.TasbeehOldApp.reopenLastMonth();
        }
    };

    self.onResetCompleted = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onResetCompleted === 'function') {
            p.onResetCompleted(d, e);
        } else if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.resetAllCompleted === 'function') {
            _win.TasbeehOldApp.resetAllCompleted();
        }
    };

    self.onAdjustStartDate = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onAdjustStartDate === 'function') {
            p.onAdjustStartDate(d, e);
        } else if (_win.TasbeehApp && typeof _win.TasbeehApp.switchTab === 'function') {
            _win.TasbeehApp.switchTab('history');
        }
    };
}

if (typeof window !== 'undefined') {
    window.OldFeedViewModel = OldFeedViewModel;
}

export default OldFeedViewModel;

