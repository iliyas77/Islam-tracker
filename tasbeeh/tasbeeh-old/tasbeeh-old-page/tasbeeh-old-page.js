/* ============================================================
   Nur Prayer — Old Tasbeeh Detail / Calendar Page Component
   Path: tasbeeh/tasbeeh-old/tasbeeh-old-page/tasbeeh-old-page.js
   ============================================================ */

import {
    unwrap,
    loadCalCompletions,
    loadItems,
    setDayCompleted,
    isMonthFullyCompleted,
    formatDate,
    formatMonthYear,
    td,
    buildCalendarCells,
    confirmAction,
    animateCell,
    advanceOldMonth
} from '../../tasbeeh-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const OldPageTemplate = {
    element: 'tasbeeh-old-page-template',
    file: 'tasbeeh/tasbeeh-old/tasbeeh-old-page/tasbeeh-old-page.html'
};

export function OldPageViewModel(params) {
    if (params instanceof OldPageViewModel) return params;
    if (!(this instanceof OldPageViewModel)) return new OldPageViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function obsArr(arr) {
        return (k && k.observableArray) ? k.observableArray(arr) : function () { return arr; };
    }
    function comp(fn) {
        return (k && k.pureComputed) ? k.pureComputed(fn) : fn;
    }

    self.activeItem = p.item || null;
    var rawMonth = unwrap(p.monthKey, unwrap(p.month, '2026-09'));
    if (!rawMonth || typeof rawMonth !== 'string' || rawMonth.indexOf('-') === -1) {
        rawMonth = '2026-09';
    }
    self.monthKey = obs(rawMonth);
    self.calendarCells = obsArr([]);

    self.itemTitle = comp(function () {
        var it = unwrap(self.activeItem);
        return it ? (it.title || 'Dhikr') : '—';
    });

    self.targetLabel = comp(function () {
        var it = unwrap(self.activeItem);
        if (!it) return 'Target: 100 / day';
        var t = it.targetCount;
        return (t === 'infinite' || t === '∞') ? 'Target: ∞ / day' : ('Target: ' + t + ' / day');
    });

    self.monthLabel = comp(function () {
        var mKey = self.monthKey() || '2026-09';
        return formatMonthYear(mKey);
    });

    self.topTitle = comp(function () {
        return self.itemTitle() + ' (' + self.monthLabel() + ')';
    });

    self.isMonthDone = comp(function () {
        var comps = loadCalCompletions();
        var items = loadItems();
        var mKey = self.monthKey() || '2026-09';
        return isMonthFullyCompleted(comps, items, mKey);
    });

    self.canPrev = comp(function () {
        return self.isMonthDone();
    });

    self.buildCalendar = function () {
        var it = unwrap(self.activeItem);
        if (!it) {
            self.calendarCells([]);
            return;
        }

        var mKey = self.monthKey() || '2026-09';
        if (!mKey || typeof mKey !== 'string' || mKey.indexOf('-') === -1) {
            mKey = '2026-09';
        }
        var parts = mKey.split('-');
        var year = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10) - 1;
        var comps = loadCalCompletions();
        var cells = buildCalendarCells(year, month, it.id, comps, td(), obs);
        self.calendarCells(cells);
    };

    self.toggleDay = function (cell) {
        if (!cell || cell.isEmpty) return;
        var it = unwrap(self.activeItem);
        if (!it) return;

        var isDone = cell.isCompleted();
        var comps = loadCalCompletions();
        var items = loadItems();

        if (isDone) {
            confirmAction({
                title: 'Change Day Status',
                message: 'Mark <strong>' + formatDate(cell.dateStr) + '</strong> for “' + (it.title || 'Dhikr') + '” as incomplete?',
                btnText: 'Yes, Mark Incomplete',
                isSuccess: false
            }, function () {
                setDayCompleted(comps, items, it.id, cell.dateStr, false);
                cell.isCompleted(false);
                animateCell(cell.dateStr);
                if (typeof p.onDayChange === 'function') p.onDayChange(cell.dateStr, false);
            });
        } else {
            setDayCompleted(comps, items, it.id, cell.dateStr, true);
            cell.isCompleted(true);
            animateCell(cell.dateStr);
            if (typeof p.onDayChange === 'function') p.onDayChange(cell.dateStr, true);

            var activeMKey = self.monthKey();
            if (isMonthFullyCompleted(comps, items, activeMKey)) {
                setTimeout(function () {
                    advanceOldMonth({
                        calCompletions: comps,
                        items: items,
                        counterMonthKey: activeMKey,
                        activeId: it.id
                    });
                }, 300);
            }
        }
    };

    self.prevMonth = function () {
        var comps = loadCalCompletions();
        var items = loadItems();
        var activeMKey = self.monthKey();
        if (isMonthFullyCompleted(comps, items, activeMKey)) {
            advanceOldMonth({
                calCompletions: comps,
                items: items,
                counterMonthKey: activeMKey,
                activeId: unwrap(self.activeItem) ? unwrap(self.activeItem).id : null
            });
        } else {
            if (_win.showToast) _win.showToast('Complete all targets to move backward.');
        }
    };

    self.onBack = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onBack === 'function') {
            p.onBack();
        } else if (_win.TasbeehApp && typeof _win.TasbeehApp.closeCounter === 'function') {
            _win.TasbeehApp.closeCounter();
        }
    };

    if (p.monthKey && k && k.isObservable(p.monthKey)) {
        p.monthKey.subscribe(function (newMonth) {
            if (newMonth && typeof newMonth === 'string' && newMonth.indexOf('-') !== -1) {
                if (typeof self.monthKey === 'function') self.monthKey(newMonth);
                self.buildCalendar();
            }
        });
    }

    if (p.item && k && k.isObservable(p.item)) {
        p.item.subscribe(function () {
            self.buildCalendar();
        });
    }
    self.buildCalendar();
}

if (typeof window !== 'undefined') {
    window.OldPageViewModel = OldPageViewModel;
}

export default OldPageViewModel;

