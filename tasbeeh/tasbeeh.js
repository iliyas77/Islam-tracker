/* ============================================================
   Nur Prayer — Digital Tasbeeh Feature Module
   Path: tasbeeh.js
   Consolidated Module (Home, Current, Old, History)
   ============================================================ */

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
if (typeof window === 'undefined') {
    globalThis.window = _win;
}

function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

if (typeof window !== 'undefined') {
    window.escHtml = escHtml;
}

/* ---------- Digital Tasbeeh Component Templates ---------- */
export const TasbeehPageTemplate = { element: 'tasbeeh-page-template', file: 'tasbeeh/tasbeeh.html' };
export const TasbeehHeaderTemplate = { element: 'tasbeeh-header-template', file: 'tasbeeh/templates/tasbeeh-header.html' };
export const TasbeehCounterCardTemplate = { element: 'tasbeeh-counter-card-template', file: 'tasbeeh/templates/tasbeeh-counter-card.html' };
export const TasbeehProgressCircleTemplate = { element: 'tasbeeh-progress-circle-template', file: 'tasbeeh/templates/tasbeeh-progress-circle.html' };
export const TasbeehGoalSetterTemplate = { element: 'tasbeeh-goal-setter-template', file: 'tasbeeh/templates/tasbeeh-goal-setter.html' };
export const TasbeehNavTabTemplate = { element: 'tasbeeh-nav-tab-template', file: 'tasbeeh/templates/tasbeeh-nav-tab.html' };

/* ---------- Knockout ViewModel & Component Registration ---------- */
var tasbeehViewModel = null;

export function getTasbeehViewModel() {
    if (!tasbeehViewModel && typeof TasbeehPageViewModel === 'function') {
        tasbeehViewModel = new TasbeehPageViewModel();
    }
    return tasbeehViewModel;
}

export function TasbeehPageViewModel(params) {
    params = params || {};
    var self = this;
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);

    self.currentSubTab = (k && k.observable) ? k.observable('home') : function () { return 'home'; };

    self.header = {
        title: (k && k.observable) ? k.observable('Digital Tasbeeh') : 'Digital Tasbeeh',
        subtitle: (k && k.observable) ? k.observable('Home · Bookmarks') : 'Home · Bookmarks',
        iconClass: (k && k.observable) ? k.observable('fa-solid fa-house text-brand') : 'fa-solid fa-house text-brand',
        goHome: function (d, e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (typeof showPage === 'function') showPage('dashboard');
        }
    };

    self.switchTab = function (tab, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (window.TasbeehApp && typeof window.TasbeehApp.switchTab === 'function') {
            window.TasbeehApp.switchTab(tab);
        }
    };

    self.openAddModal = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (window.TasbeehApp && typeof window.TasbeehApp.openAddModal === 'function') {
            window.TasbeehApp.openAddModal();
        }
    };

    self.reopenLastMonth = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (window.TasbeehApp && typeof window.TasbeehApp.reopenLastMonth === 'function') {
            window.TasbeehApp.reopenLastMonth();
        }
        if (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.renderHistoryTab === 'function') {
            window.TasbeehHistoryApp.renderHistoryTab();
        }
    };

    self.resetAllCompleted = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (window.TasbeehApp && typeof window.TasbeehApp.resetAllCompleted === 'function') {
            window.TasbeehApp.resetAllCompleted();
        }
        if (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.renderHistoryTab === 'function') {
            window.TasbeehHistoryApp.renderHistoryTab();
        }
    };

    self.currentDhikrsCount = (k && k.observable) ? k.observable(0) : 0;
    self.clearedMonthsCount = (k && k.observable) ? k.observable(0) : 0;
    self.activeOldLabel = (k && k.observable) ? k.observable('All Cleared') : 'All Cleared';
    self.bookmarkedCounters = (k && k.observableArray) ? k.observableArray([]) : [];

    self.currentTodoItems = (k && k.observableArray) ? k.observableArray([]) : [];
    self.currentDoneItems = (k && k.observableArray) ? k.observableArray([]) : [];
    self.oldTodoItems = (k && k.observableArray) ? k.observableArray([]) : [];
    self.oldDoneItems = (k && k.observableArray) ? k.observableArray([]) : [];

    self.historyProgress = {
        percentCleared: (k && k.observable) ? k.observable(0) : 0,
        totalMonths: (k && k.observable) ? k.observable(0) : 0,
        clearedMonths: (k && k.observable) ? k.observable(0) : 0,
        pendingMonths: (k && k.observable) ? k.observable(0) : 0
    };

    self.goalSetter = {
        startDate: (k && k.observable) ? k.observable('') : '',
        endDate: (k && k.observable) ? k.observable('') : ''
    };
}

export function registerTasbeehComponents(customKo) {
    var k = customKo || (typeof ko !== 'undefined' ? ko : (_win.ko || null));
    if (!k || !k.components) return;

    if (!k.components.isRegistered('tasbeeh-header')) {
        k.components.register('tasbeeh-header', {
            viewModel: function (params) { return params || {}; },
            template: TasbeehHeaderTemplate
        });
    }

    if (!k.components.isRegistered('tasbeeh-counter-card')) {
        k.components.register('tasbeeh-counter-card', {
            viewModel: function (params) { return params || {}; },
            template: TasbeehCounterCardTemplate
        });
    }

    if (!k.components.isRegistered('tasbeeh-progress-circle')) {
        k.components.register('tasbeeh-progress-circle', {
            viewModel: function (params) { return params || {}; },
            template: TasbeehProgressCircleTemplate
        });
    }

    if (!k.components.isRegistered('tasbeeh-goal-setter')) {
        k.components.register('tasbeeh-goal-setter', {
            viewModel: function (params) { return params || {}; },
            template: TasbeehGoalSetterTemplate
        });
    }

    if (!k.components.isRegistered('tasbeeh-nav-tab')) {
        k.components.register('tasbeeh-nav-tab', {
            viewModel: function (params) { return params || {}; },
            template: TasbeehNavTabTemplate
        });
    }

    if (!k.components.isRegistered('tasbeeh-page')) {
        k.components.register('tasbeeh-page', {
            viewModel: function (params) {
                return (params && params.viewModel) ? params.viewModel : getTasbeehViewModel();
            },
            template: TasbeehPageTemplate
        });
    }
}

export function initTasbeeh() {
    registerTasbeehComponents();
    var el = document.getElementById('tasbeehPage');
    if (el && typeof ko !== 'undefined') {
        var vm = getTasbeehViewModel();
        if (!ko.dataFor(el)) {
            ko.applyBindings(vm, el);
        }
    }
    if (_win.TasbeehHomeApp && typeof _win.TasbeehHomeApp.init === 'function') {
        _win.TasbeehHomeApp.init();
    }
    if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.init === 'function') {
        _win.TasbeehOldApp.init();
    }
    if (_win.TasbeehHistoryApp && typeof _win.TasbeehHistoryApp.init === 'function') {
        _win.TasbeehHistoryApp.init();
    }
    if (_win.TasbeehCurrentApp && typeof _win.TasbeehCurrentApp.init === 'function') {
        _win.TasbeehCurrentApp.init();
    } else if (_win.TasbeehApp && typeof _win.TasbeehApp.init === 'function' && _win.TasbeehApp.init !== initTasbeeh) {
        _win.TasbeehApp.init();
    }
}

/* ============================================================
   Nur Prayer — Digital Tasbeeh: Home Tab Module
   Submodule: Tasbeeh Home Tab
   Handles:
     - Home tab rendering inside Digital Tasbeeh
     - Bookmarked Current and Old counters display in 2x2 grid
     - Quick navigation to Current, Old, and History features
   ============================================================ */
'use strict';

window.TasbeehHomeApp = (function () {
    var TASBEEH_CONSTANTS = window.TASBEEH_CONSTANTS || (window.CONSTANTS && window.CONSTANTS.TASBEEH) || {};
    var ELEMENT_IDS = TASBEEH_CONSTANTS.ELEMENT_IDS || {};

    function getEl(id) {
        return document.getElementById(id);
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /* ---------- Render Tasbeeh Home Tab ---------- */
    function renderHomeTab() {
        var body = getEl(ELEMENT_IDS.HOME_BODY || 'tbHomeBody');
        if (!body) return;

        var emptyEl = getEl(ELEMENT_IDS.HOME_EMPTY_STATE || 'tbHomeEmptyState');
        var contentEl = getEl(ELEMENT_IDS.HOME_CONTENT || 'tbHomeContent');

        var bmData = (window.TasbeehApp && typeof window.TasbeehApp.getBookmarkedChants === 'function')
            ? window.TasbeehApp.getBookmarkedChants()
            : null;

        var items = (window.TasbeehApp && typeof window.TasbeehApp.getItems === 'function')
            ? window.TasbeehApp.getItems()
            : [];

        if (!items || items.length === 0) {
            if (emptyEl) emptyEl.classList.remove('d-none');
            if (contentEl) contentEl.classList.add('d-none');
            return;
        }

        if (emptyEl) emptyEl.classList.add('d-none');
        if (contentEl) contentEl.classList.remove('d-none');

        var icons = (window.CONSTANTS && window.CONSTANTS.TASBEEH && window.CONSTANTS.TASBEEH.ICONS) || {};
        var misbahaIcon = renderIcon('misbaha');
        var targetIcon = renderIcon('tb-target');
        var checkIcon = renderIcon('tb-check-circle');
        var tbChevron = renderIcon('tb-chevron');
        var calendarDaysIcon = renderIcon({ name: 'calendar-days', color: 'text-muted', size: 13 });

        // 1. Current Bookmark Card
        var curHtml = '';
        if (bmData && bmData.current && bmData.current.item) {
            var c = bmData.current;
            curHtml =
                '<div class="tb-card tb-card-bookmark bg-white border border-borderGrey rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:border-brand min-h-[152px] select-none transition-all shadow-none" role="button" tabindex="0" data-act="tb-open-bookmark" data-type="current" data-id="' + c.item.id + '" data-ref="page.tasbeeh.home.bookmark-current" aria-label="Open Current Tasbeeh ' + escHtml(c.item.title) + '">' +
                '  <div class="tb-card-top flex items-start justify-between w-full">' +
                '    <div class="w-[46px] h-[46px] min-w-[46px] min-h-[46px] rounded-2xl bg-dash-mintBg text-brand inline-flex items-center justify-center shrink-0 leading-none select-none overflow-hidden">' + (typeof renderIcon === 'function' ? renderIcon({ name: 'misbaha' }) : '') + '</div>' +
                '    <div class="tb-card-actions flex items-center gap-1.5 shrink-0 ml-auto">' +
                '      <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-light text-brand border border-brand/20">Current</span>' +
                '      ' + tbChevron +
                '    </div>' +
                '  </div>' +
                '  <div class="tb-card-body flex flex-col justify-end w-full mt-2.5 min-w-0">' +
                '    <h6 class="tb-card-title text-base font-bold text-brand leading-snug mb-1 truncate">' + escHtml(c.item.title) + '</h6>' +
                '    <div class="tb-card-meta flex flex-col gap-1 w-full">' +
                '      <div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' +
                targetIcon +
                '        <span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs">Target: <span class="tb-val-num font-semibold text-brand">' + c.targetDisplay + '</span> / day</span>' +
                '      </div>' +
                '      <div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' +
                checkIcon +
                '        <span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs"><span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand text-white leading-none" style="font-size:0.72rem;padding:0.25rem 0.6rem;">Done</span><strong class="tb-val-done ml-1 font-bold text-brand">' + (c.completedDays || 0) + '</strong></span>' +
                '      </div>' +
                '      <div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' +
                calendarDaysIcon +
                '        <span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs">Total: <span class="tb-val-total text-gr-textMuted font-medium">' + (c.totalDays || 0) + ' days</span></span>' +
                '      </div>' +
                '      <div class="tb-meta-row tb-meta-sub-row">' +
                '        <span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs">' + escHtml(c.monthName || 'Current Month') + (c.isTodayDone ? ' · <span class="text-brand fw-bold">Today ✓</span>' : '') + '</span>' +
                '      </div>' +
                '    </div>' +
                '  </div>' +
                '</div>';
        }

        // 2. Old Bookmark Card
        var oldHtml = '';
        if (bmData && bmData.old && bmData.old.item) {
            var o = bmData.old;
            oldHtml =
                '<div class="tb-card tb-card-bookmark bg-white border border-borderGrey rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:border-brand min-h-[152px] select-none transition-all shadow-none" role="button" tabindex="0" data-act="tb-open-bookmark" data-type="old" data-id="' + o.item.id + '" data-month="' + (o.monthKey || '') + '" data-ref="page.tasbeeh.home.bookmark-old" aria-label="Open Old Tasbeeh ' + escHtml(o.item.title) + '">' +
                '  <div class="tb-card-top flex items-start justify-between w-full">' +
                '    <div class="w-[46px] h-[46px] min-w-[46px] min-h-[46px] rounded-2xl bg-dash-mintBg text-brand inline-flex items-center justify-center shrink-0 leading-none select-none overflow-hidden">' + (typeof renderIcon === 'function' ? renderIcon({ name: 'misbaha' }) : '') + '</div>' +
                '    <div class="tb-card-actions flex items-center gap-1.5 shrink-0 ml-auto">' +
                '      <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-warningBg text-warningText border border-warningBorder">Old</span>' +
                '      ' + tbChevron +
                '    </div>' +
                '  </div>' +
                '  <div class="tb-card-body flex flex-col justify-end w-full mt-2.5 min-w-0">' +
                '    <h6 class="tb-card-title text-base font-bold text-brand leading-snug mb-1 truncate">' + escHtml(o.item.title) + '</h6>' +
                '    <div class="tb-card-meta flex flex-col gap-1 w-full">' +
                '      <div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' +
                targetIcon +
                '        <span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs">Target: <span class="tb-val-num font-semibold text-brand">' + o.targetDisplay + '</span> / day</span>' +
                '      </div>' +
                '      <div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' +
                checkIcon +
                '        <span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs"><span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand text-white leading-none" style="font-size:0.72rem;padding:0.25rem 0.6rem;">Done</span><strong class="tb-val-done ml-1 font-bold text-brand">' + (o.completedDays || 0) + '</strong></span>' +
                '      </div>' +
                '      <div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' +
                calendarDaysIcon +
                '        <span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs">Total: <span class="tb-val-total text-gr-textMuted font-medium">' + (o.totalDays || 0) + ' days</span></span>' +
                '      </div>' +
                '      <div class="tb-meta-row tb-meta-sub-row">' +
                '        <span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs">' + escHtml(o.monthName) + '</span>' +
                '      </div>' +
                '    </div>' +
                '  </div>' +
                '</div>';
        }

        // Period & History stats overview
        var period = (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.loadPeriod === 'function')
            ? window.TasbeehHistoryApp.loadPeriod()
            : ((window.TasbeehOldApp && typeof window.TasbeehOldApp.loadPeriod === 'function') ? window.TasbeehOldApp.loadPeriod() : null);

        var completedCount = 0;
        if (period && period.startDate && (period.initialEnd || period.endDate)) {
            var maxEnd = period.initialEnd || period.endDate;
            var allOld = typeof getPreviousMonthsList === 'function' ? getPreviousMonthsList(period.startDate, maxEnd) : [];
            allOld.forEach(function (m) {
                if (m > period.endDate || period.endDate < period.startDate) completedCount++;
            });
        }
        var curOldMonth = (window.TasbeehOldApp && typeof window.TasbeehOldApp.getCurrentOldMonth === 'function')
            ? window.TasbeehOldApp.getCurrentOldMonth()
            : null;
        var activeOldLabel = curOldMonth ? (window.TasbeehApp && window.TasbeehApp.formatMonthLabel ? window.TasbeehApp.formatMonthLabel(curOldMonth) : curOldMonth) : 'All Cleared';

        var vm = (typeof getTasbeehViewModel === 'function') ? getTasbeehViewModel() : null;
        var hasKo = typeof ko !== 'undefined' && vm && typeof vm.bookmarkedCounters === 'function';

        if (vm) {
            if (typeof vm.currentDhikrsCount === 'function') vm.currentDhikrsCount(items.length);
            if (typeof vm.clearedMonthsCount === 'function') vm.clearedMonthsCount(completedCount);
            if (typeof vm.activeOldLabel === 'function') vm.activeOldLabel(activeOldLabel);
        }

        var bmCards = [];
        if (bmData && bmData.current && bmData.current.item) {
            var c = bmData.current;
            bmCards.push({
                id: c.item.id,
                title: c.item.title,
                targetCount: c.targetDisplay,
                completedDays: c.completedDays,
                totalDays: c.totalDays,
                isComplete: c.completedDays >= c.totalDays,
                isTodayDone: c.isTodayDone,
                onCardClick: function (d, e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                    if (window.TasbeehApp && typeof window.TasbeehApp.openCounterView === 'function') {
                        window.TasbeehApp.openCounterView(c.item.id);
                    }
                },
                onEditClick: function (d, e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                    if (window.TasbeehApp && typeof window.TasbeehApp.openEditModal === 'function') {
                        window.TasbeehApp.openEditModal(c.item.id);
                    }
                }
            });
        }
        if (bmData && bmData.old && bmData.old.item) {
            var o = bmData.old;
            bmCards.push({
                id: o.item.id,
                title: o.item.title,
                month: o.monthKey,
                targetCount: o.targetDisplay,
                completedDays: o.completedDays,
                totalDays: o.totalDays,
                isComplete: !!o.isDhikrDone,
                isTodayDone: false,
                onCardClick: function (d, e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                    if (window.TasbeehApp && typeof window.TasbeehApp.openCounterFromHome === 'function') {
                        window.TasbeehApp.openCounterFromHome(o.item.id, o.monthKey, 'old');
                    } else if (window.TasbeehApp && typeof window.TasbeehApp.openCounterView === 'function') {
                        window.TasbeehApp.openCounterView(o.item.id, o.monthKey);
                    }
                },
                onEditClick: function (d, e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                    if (window.TasbeehApp && typeof window.TasbeehApp.openEditModal === 'function') {
                        window.TasbeehApp.openEditModal(o.item.id);
                    }
                }
            });
        }

        if (hasKo) {
            vm.bookmarkedCounters(bmCards);
        } else {
            // Fallback for non-Knockout environments
            var gridEl = getEl(ELEMENT_IDS.HOME_GRID || 'tbHomeGrid');
            if (gridEl) {
                gridEl.innerHTML = curHtml + oldHtml;
            }
        }

        var curCountEl = getEl(ELEMENT_IDS.HOME_CURRENT_COUNT || 'tbHomeCurrentCount');
        if (curCountEl) {
            curCountEl.textContent = items.length;
        }

        var histCountEl = getEl(ELEMENT_IDS.HOME_HISTORY_COUNT || 'tbHomeHistoryCount');
        if (histCountEl) {
            histCountEl.textContent = completedCount;
        }

        var activeOldLabelEl = getEl(ELEMENT_IDS.HOME_ACTIVE_OLD_LABEL || 'tbHomeActiveOldLabel');
        if (activeOldLabelEl) {
            activeOldLabelEl.textContent = activeOldLabel;
        }
    }

    function init() {
        // Ready for interactions
    }

    var api = {
        init: init,
        renderHomeTab: renderHomeTab
    };

    if (window.TasbeehApp) {
        window.TasbeehApp.renderHomeTab = renderHomeTab;
    }

    return api;
})();


/* ============================================================
   Nur Prayer — Digital Tasbeeh: Current View Module
   Submodule: Tasbeeh Current View
   Handles:
     - Dhikr items data layer & local storage persistence
     - Calendar Tracker overlay (monthly calendar with day-by-day target completion)
     - Calendar completions data layer & daily tracking
     - Current tab rendering (TO DO & COMPLETED groups, daily progress)
     - Add / Edit Dhikr modal (Title & Daily Target Count)
     - Tab navigation coordinator (Home / Current / Old / History)
   ============================================================ */
'use strict';

window.TasbeehCurrentApp = (function () {
    /* ---------- Constants & Presets (Referenced from utilities/tasbeeh-constants.js) ---------- */
    var TASBEEH_CONSTANTS = window.TASBEEH_CONSTANTS || (window.CONSTANTS && window.CONSTANTS.TASBEEH) || {};
    var ELEMENT_IDS = TASBEEH_CONSTANTS.ELEMENT_IDS || {};
    var STORAGE_KEYS = TASBEEH_CONSTANTS.STORAGE_KEYS || {};
    var STORAGE_KEY = STORAGE_KEYS.DATA || 'app_tasbeeh_data';
    var DAY_KEY = STORAGE_KEYS.DAY || 'app_tasbeeh_day';
    var BM_CUR_KEY = STORAGE_KEYS.BOOKMARK_CURRENT || 'app_tasbeeh_bookmark_current';
    var BM_OLD_KEY = STORAGE_KEYS.BOOKMARK_OLD || 'app_tasbeeh_bookmark_old';
    var CURRENT_PERIOD_KEY = STORAGE_KEYS.CURRENT_PERIOD || 'app_tasbeeh_current_period';
    var CAL_COMPLETION_KEY = STORAGE_KEYS.CAL_COMPLETIONS || 'app_tasbeeh_cal_completions';
    var TABS = TASBEEH_CONSTANTS.TABS || { HOME: 'home', CURRENT: 'current', OLD: 'old', HISTORY: 'history' };
    var TAB_HEADERS = TASBEEH_CONSTANTS.TAB_HEADERS || {
        home: { iconClass: 'house text-brand', label: 'Digital Tasbeeh', sub: 'Home · Bookmarks' },
        current: { iconClass: 'calendar text-brand', label: 'Digital Tasbeeh' },
        old: { iconClass: 'clock-rotate-left text-warning', label: 'Old Tasbeeh' },
        history: { iconClass: 'gear text-gr-accent', label: 'Tasbeeh History', sub: 'Period & Settings' }
    };
    var counterOpenedFrom = null;

    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    var DEFAULT_PRESETS = TASBEEH_CONSTANTS.DEFAULT_PRESETS || [
        { title: 'SubhanAllah', targetCount: 33 },
        { title: 'Alhamdulillah', targetCount: 33 },
        { title: 'Allahu Akbar', targetCount: 34 },
        { title: 'Astaghfirullah', targetCount: 100 }
    ];

    /* ---------- State ---------- */
    var items = [];
    var activeId = null;
    var editingId = null;
    var activeTab = 'current'; // 'home', 'current', 'old', 'history'
    var counterMonthKey = null; // When tracking for a specific old month, e.g. "2026-09"
    var countMode = 'finite';

    /* Calendar State */
    var calViewYear = null;
    var calViewMonth = null; // 0-indexed: 0 = Jan, 11 = Dec
    var pendingToggleDate = null; // Stored date when confirmation modal is shown
    var pendingConfirmCallback = null; // Callback for month completion confirmation

    /* Modal Instances */
    var editModalInstance = null;
    var confirmModalInstance = null;

    /* Calendar completions map: { [itemId]: { "2026-10-15": true, ... } } */
    var calCompletions = {};

    /* ---------- Calendar Completions Storage & Helpers ---------- */
    function loadCalCompletions() {
        try {
            var raw = localStorage.getItem(CAL_COMPLETION_KEY);
            if (raw) {
                calCompletions = JSON.parse(raw);
                if (typeof calCompletions !== 'object' || calCompletions === null) {
                    calCompletions = {};
                }
            }
        } catch (_) {
            calCompletions = {};
        }
    }

    function persistCalCompletions() {
        try {
            localStorage.setItem(CAL_COMPLETION_KEY, JSON.stringify(calCompletions));
        } catch (_) { }
    }

    function isDayCompleted(itemId, dateStr) {
        return !!(calCompletions[itemId] && calCompletions[itemId][dateStr] === true);
    }

    function setDayCompleted(itemId, dateStr, completed) {
        if (!itemId || !dateStr) return;
        if (!calCompletions[itemId]) {
            calCompletions[itemId] = {};
        }
        if (completed) {
            calCompletions[itemId][dateStr] = true;
        } else {
            delete calCompletions[itemId][dateStr];
        }
        persistCalCompletions();

        // Synchronize item history for stats and backwards compatibility
        var item = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === itemId) { item = items[i]; break; }
        }
        if (item) {
            var monthKey = dateStr.slice(0, 7);
            var parts = monthKey.split('-');
            var yr = parseInt(parts[0], 10);
            var mo = parseInt(parts[1], 10) - 1;
            var completedDays = getCompletedDaysInMonth(itemId, yr, mo);
            var targetNum = item.targetCount === 'infinite' ? 100 : item.targetCount;

            item.dailyHistory = item.dailyHistory || {};
            if (completed) {
                item.dailyHistory[dateStr] = targetNum;
            } else {
                delete item.dailyHistory[dateStr];
            }

            item.monthlyHistory = item.monthlyHistory || {};
            item.monthlyHistory[monthKey] = completedDays * targetNum;
            item.updatedAt = Date.now();
            persist();
        }
    }

    function getDaysInMonth(year, month) {
        // month is 0-indexed (0=Jan, 11=Dec)
        return new Date(year, month + 1, 0).getDate();
    }

    function getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay(); // 0=Sun, 6=Sat
    }

    function makeDateStr(year, month, day) {
        return year + '-' + pad2(month + 1) + '-' + pad2(day);
    }

    function getCompletedDaysInMonth(itemId, year, month) {
        if (!calCompletions[itemId]) return 0;
        var prefix = year + '-' + pad2(month + 1) + '-';
        var count = 0;
        var daysInM = getDaysInMonth(year, month);
        for (var d = 1; d <= daysInM; d++) {
            var ds = prefix + pad2(d);
            if (calCompletions[itemId][ds] === true) {
                count++;
            }
        }
        return count;
    }

    /* ---------- Current Period Storage Layer (Month-by-Month) ---------- */
    function loadCurrentPeriod() {
        var defaultStartMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (new Date().getFullYear() + '-' + pad2(new Date().getMonth() + 1));
        try {
            var raw = localStorage.getItem(CURRENT_PERIOD_KEY);
            if (!raw) {
                var initial = { startDate: defaultStartMonth, updatedAt: Date.now() };
                localStorage.setItem(CURRENT_PERIOD_KEY, JSON.stringify(initial));
                return initial;
            }
            var p = JSON.parse(raw);
            if (!p || !p.startDate) {
                return { startDate: defaultStartMonth, updatedAt: Date.now() };
            }
            var norm = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(p.startDate) : String(p.startDate).slice(0, 7)) || defaultStartMonth;
            return {
                startDate: norm,
                updatedAt: p.updatedAt || Date.now()
            };
        } catch (_) {
            return { startDate: defaultStartMonth, updatedAt: Date.now() };
        }
    }

    function saveCurrentPeriod(startMonth) {
        var defaultStartMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (new Date().getFullYear() + '-' + pad2(new Date().getMonth() + 1));
        var norm = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(startMonth) : String(startMonth).slice(0, 7)) || defaultStartMonth;
        var p = {
            startDate: norm,
            updatedAt: Date.now()
        };
        try {
            localStorage.setItem(CURRENT_PERIOD_KEY, JSON.stringify(p));
        } catch (_) { }
        return p;
    }

    function getCurrentTrackingMonth() {
        return loadCurrentPeriod().startDate;
    }

    /* ---------- Month Data Removal & Completion Check ---------- */
    function removeMonthTrackingData(mKey) {
        if (!mKey) return;
        var prefix = mKey + '-';
        // 1. Remove calendar completions for this month
        for (var itemId in calCompletions) {
            if (Object.prototype.hasOwnProperty.call(calCompletions, itemId)) {
                var dayMap = calCompletions[itemId];
                if (dayMap && typeof dayMap === 'object') {
                    for (var d in dayMap) {
                        if (d.indexOf(prefix) === 0) {
                            delete dayMap[d];
                        }
                    }
                }
            }
        }
        persistCalCompletions();

        // 2. Remove daily and monthly history for this month
        items.forEach(function (it) {
            if (it.dailyHistory && typeof it.dailyHistory === 'object') {
                for (var d2 in it.dailyHistory) {
                    if (d2.indexOf(prefix) === 0) {
                        delete it.dailyHistory[d2];
                    }
                }
            }
            if (it.monthlyHistory && typeof it.monthlyHistory === 'object') {
                delete it.monthlyHistory[mKey];
            }
            it.updatedAt = Date.now();
        });
        persist();
    }

    function isMonthFullyCompleted(mKey) {
        if (!mKey) return false;
        var finiteItems = items.filter(function (it) { return it.targetCount !== 'infinite'; });
        if (finiteItems.length === 0) return false;
        var parts = mKey.split('-');
        var yr = parseInt(parts[0], 10);
        var mo = parseInt(parts[1], 10) - 1;
        var totalDays = getDaysInMonth(yr, mo);
        if (totalDays <= 0) return false;

        return finiteItems.every(function (it) {
            var completedDays = getCompletedDaysInMonth(it.id, yr, mo);
            return completedDays >= totalDays;
        });
    }

    /* ---------- Confirmation Action Dialog (Vanilla Modal + Fallback) ---------- */
    function confirmAction(options, onConfirm) {
        pendingConfirmCallback = onConfirm || null;
        pendingToggleDate = null;

        var confirmModalEl = getEl('tasbeehConfirmModal');
        var titleEl = getEl('tbConfirmModalTitle');
        var msgEl = getEl('tbConfirmModalMsg');
        var btnEl = getEl('tbBtnConfirmChange');
        var iconEl = getEl('tbConfirmModalIcon');
        var badgeEl = getEl('tbConfirmModalBadge');

        if (titleEl) titleEl.textContent = options.title || 'Confirm';
        if (msgEl) msgEl.innerHTML = options.message || '';
        if (btnEl) btnEl.textContent = options.btnText || 'Confirm';

        if (iconEl && badgeEl) {
            if (options.isSuccess) {
                badgeEl.className = 'icon-box icon-box-lg bg-brand-light';
                Icon.update(iconEl, { name: 'circle-check', size: 'fs-3', color: 'text-brand' });
            } else {
                badgeEl.className = 'icon-box icon-box-lg bg-warning-subtle';
                Icon.update(iconEl, { name: 'triangle-exclamation', size: 'fs-3', color: 'text-warning' });
            }
        }

        var ModalClass = window.UIModal || (window.bootstrap && window.bootstrap.Modal);
        if (confirmModalEl && ModalClass) {
            if (!confirmModalInstance) {
                confirmModalInstance = ModalClass.getOrCreateInstance(confirmModalEl);
                confirmModalEl.addEventListener('hidden.bs.modal', function () {
                    pendingToggleDate = null;
                    pendingConfirmCallback = null;
                });
            }
            confirmModalInstance.show();
        } else {
            var plain = (options.message || '').replace(/<br\s*[\/]?>/gi, '\n').replace(/<[^>]+>/g, '');
            if (window.confirm((options.title || 'Confirm') + '\n\n' + plain)) {
                if (typeof pendingConfirmCallback === 'function') {
                    var cb = pendingConfirmCallback;
                    pendingConfirmCallback = null;
                    cb();
                }
            } else {
                pendingConfirmCallback = null;
            }
        }
    }

    function advanceCurrentMonth() {
        var curMonthKey = getCurrentTrackingMonth();
        if (!isMonthFullyCompleted(curMonthKey)) {
            showToast('Please complete all targets for ' + formatMonthLabel(curMonthKey) + ' before moving to next month.');
            return;
        }
        var nextMonthKey = typeof getNextMonthKey === 'function' ? getNextMonthKey(curMonthKey) : (function (m) {
            var p = m.split('-'); var y = parseInt(p[0], 10); var mo = parseInt(p[1], 10) + 1;
            if (mo > 12) { mo = 1; y++; } return y + '-' + pad2(mo);
        })(curMonthKey);

        var curLabel = formatMonthLabel(curMonthKey);
        var nextLabel = formatMonthLabel(nextMonthKey);

        confirmAction({
            title: '🎉 Month Completed!',
            message: 'All dhikr targets for <strong>' + curLabel + '</strong> are completed!<br><br>' +
                     'Do you want to finalize this month, remove its tracking data, and advance to <strong>' + nextLabel + '</strong>?',
            btnText: 'Finalize & Advance',
            isSuccess: true
        }, function () {
            removeMonthTrackingData(curMonthKey);
            saveCurrentPeriod(nextMonthKey);

            if (counterMonthKey === null && activeId) {
                var parts = nextMonthKey.split('-');
                calViewYear = parseInt(parts[0], 10);
                calViewMonth = parseInt(parts[1], 10) - 1;
                renderCalendar();
            }
            renderCurrentTab();
            showToast('🎉 ' + curLabel + ' completed! Advanced to ' + nextLabel, 3500);
        });
    }

    function advanceOldMonth() {
        if (!window.TasbeehOldApp || typeof window.TasbeehOldApp.getCurrentOldMonth !== 'function') return;
        var curOldMonth = window.TasbeehOldApp.getCurrentOldMonth();
        if (!curOldMonth) return;

        if (!isMonthFullyCompleted(curOldMonth)) {
            showToast('Please complete all targets for ' + formatMonthLabel(curOldMonth) + ' before moving to previous month.');
            return;
        }

        var prevMonthKey = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curOldMonth) : (function (m) {
            var p = m.split('-'); var y = parseInt(p[0], 10); var mo = parseInt(p[1], 10) - 1;
            if (mo === 0) { mo = 12; y--; } return y + '-' + pad2(mo);
        })(curOldMonth);

        var curLabel = formatMonthLabel(curOldMonth);
        var prevLabel = formatMonthLabel(prevMonthKey);
        var period = window.TasbeehOldApp.loadPeriod();
        var isAllCleared = (prevMonthKey < period.startDate);

        confirmAction({
            title: '🎉 Month Completed!',
            message: 'All dhikr targets for <strong>' + curLabel + '</strong> are completed!<br><br>' +
                     'Do you want to finalize this month, remove its tracking data, and ' +
                     (isAllCleared ? 'complete all Old Tracking months?' : ('move to <strong>' + prevLabel + '</strong>?')),
            btnText: 'Finalize & Move Backward',
            isSuccess: true
        }, function () {
            removeMonthTrackingData(curOldMonth);
            window.TasbeehOldApp.savePeriod(period.startDate, prevMonthKey, period.initialEnd);

            if (counterMonthKey !== null && activeId) {
                if (isAllCleared) {
                    closeCounter();
                } else {
                    counterMonthKey = prevMonthKey;
                    var parts = prevMonthKey.split('-');
                    calViewYear = parseInt(parts[0], 10);
                    calViewMonth = parseInt(parts[1], 10) - 1;
                    renderCalendar();
                    var act = getActiveItem();
                    var topTitle = (act ? act.title : 'Chant') + ' (' + formatMonthLabel(prevMonthKey) + ')';
                    var topTitleEl = getEl('tbCounterTopTitle');
                    if (topTitleEl) topTitleEl.textContent = topTitle;
                }
            }
            if (window.TasbeehOldApp && typeof window.TasbeehOldApp.renderOldTab === 'function') {
                window.TasbeehOldApp.renderOldTab();
            }
            if (isAllCleared) {
                showToast('🎉 ' + curLabel + ' completed! All old tracking months cleared!', 3500);
            } else {
                showToast('🎉 ' + curLabel + ' completed! Moved to ' + prevLabel, 3500);
            }
        });
    }

    /* ---------- Storage Layer ---------- */
    function normalizeItem(raw) {
        var defTarget = TASBEEH_CONSTANTS.DEFAULT_TARGET || 33;
        var norm = {
            id: raw.id || uid(),
            title: raw.title || 'Dhikr',
            targetCount: raw.targetCount === 'infinite' ? 'infinite' : clamp(parseInt(raw.targetCount, 10) || defTarget, 1, 9999),
            icon: raw.icon || 'ring',
            updatedAt: raw.updatedAt || Date.now(),
            dailyHistory: (raw.dailyHistory && typeof raw.dailyHistory === 'object') ? Object.assign({}, raw.dailyHistory) : {},
            monthlyHistory: (raw.monthlyHistory && typeof raw.monthlyHistory === 'object') ? Object.assign({}, raw.monthlyHistory) : {}
        };

        // Preserve legacy fields if present so no data is lost
        if (raw.targetCycles !== undefined) norm.targetCycles = raw.targetCycles;
        if (raw.currentCycle !== undefined) norm.currentCycle = raw.currentCycle;
        if (raw.currentCount !== undefined) norm.currentCount = raw.currentCount;
        if (raw.totalCountToday !== undefined) norm.totalCountToday = raw.totalCountToday;
        if (raw.oldTotalCount !== undefined) norm.oldTotalCount = raw.oldTotalCount;

        return norm;
    }

    function loadItems() {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
            return DEFAULT_PRESETS.map(function (p) {
                return normalizeItem({
                    title: p.title,
                    targetCount: p.targetCount
                });
            });
        }
        try {
            var parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                return DEFAULT_PRESETS.map(function (p) { return normalizeItem(p); });
            }
            return parsed.map(normalizeItem);
        } catch (_) {
            return DEFAULT_PRESETS.map(function (p) { return normalizeItem(p); });
        }
    }

    function persist() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (_) { }
    }

    function checkDailyReset() {
        var today = todayKey();
        var last = localStorage.getItem(DAY_KEY);
        if (last !== today) {
            localStorage.setItem(DAY_KEY, today);
        }
    }

    function getActiveItem() {
        if (!activeId) return null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === activeId) return items[i];
        }
        return null;
    }

    function getItems() {
        if (!items || items.length === 0) {
            items = loadItems();
        }
        return items;
    }

    function setItems(newItems) {
        items = newItems || [];
        persist();
    }

    /* ---------- Bookmark Storage & Retrieval ---------- */
    function getBookmark(type) {
        var key = type === 'old' ? BM_OLD_KEY : BM_CUR_KEY;
        try {
            var raw = localStorage.getItem(key);
            if (!raw) return null;
            if (raw.charAt(0) === '{') {
                return JSON.parse(raw);
            }
            return { id: raw };
        } catch (_) {
            return null;
        }
    }

    function setBookmark(type, id, monthKey) {
        if (!id) return;
        var key = type === 'old' ? BM_OLD_KEY : BM_CUR_KEY;
        try {
            if (type === 'old') {
                localStorage.setItem(key, JSON.stringify({ id: id, month: monthKey || null }));
            } else {
                localStorage.setItem(key, JSON.stringify({ id: id }));
            }
        } catch (_) { }
    }

    function getBookmarkedChants() {
        if (!items || items.length === 0) {
            items = loadItems();
        }

        var curMonthKey = getCurrentTrackingMonth();
        var curParts = curMonthKey.split('-');
        var curYear = parseInt(curParts[0], 10);
        var curMonth = parseInt(curParts[1], 10) - 1;
        var curTotalDays = getDaysInMonth(curYear, curMonth);

        // 1. Current Tracking Bookmark
        var curBm = getBookmark('current');
        var curItem = null;
        if (curBm && curBm.id) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === curBm.id) { curItem = items[i]; break; }
            }
        }
        if (!curItem && items.length > 0) {
            curItem = items[0];
            setBookmark('current', curItem.id);
        }

        var curCompletedDays = curItem ? getCompletedDaysInMonth(curItem.id, curYear, curMonth) : 0;
        var curTargetDisplay = curItem ? (curItem.targetCount === 'infinite' ? '∞' : curItem.targetCount) : '—';
        var isTodayInCurMonth = (td().slice(0, 7) === curMonthKey);
        var curIsTodayDone = (curItem && isTodayInCurMonth) ? isDayCompleted(curItem.id, td()) : false;
        var curMonthName = formatMonthLabel(curMonthKey);

        // 2. Old Tracking Bookmark
        var oldBm = getBookmark('old');
        var oldItem = null;
        var oldMonthKey = (window.TasbeehOldApp && typeof window.TasbeehOldApp.getCurrentOldMonth === 'function')
            ? window.TasbeehOldApp.getCurrentOldMonth()
            : (oldBm ? oldBm.month : null);

        if (oldBm && oldBm.id) {
            for (var j = 0; j < items.length; j++) {
                if (items[j].id === oldBm.id) { oldItem = items[j]; break; }
            }
        }
        if (!oldItem && items.length > 0) {
            oldItem = items.length > 1 ? items[1] : items[0];
        }

        var oldYear = curYear;
        var oldMonth = curMonth - 1;
        if (oldMonthKey) {
            var p = oldMonthKey.split('-');
            oldYear = parseInt(p[0], 10);
            oldMonth = parseInt(p[1], 10) - 1;
        }
        var oldTotalDays = getDaysInMonth(oldYear, oldMonth);
        var oldCompletedDays = (oldItem && oldMonthKey) ? getCompletedDaysInMonth(oldItem.id, oldYear, oldMonth) : 0;
        var oldTargetDisplay = oldItem ? (oldItem.targetCount === 'infinite' ? '∞' : oldItem.targetCount) : '—';
        var oldMonthName = oldMonthKey ? formatMonthLabel(oldMonthKey) : 'All Completed';

        return {
            current: curItem ? {
                item: curItem,
                monthKey: curMonthKey,
                monthName: curMonthName,
                completedDays: curCompletedDays,
                totalDays: curTotalDays,
                targetDisplay: curTargetDisplay,
                isTodayDone: curIsTodayDone
            } : null,
            old: oldItem ? {
                item: oldItem,
                monthKey: oldMonthKey,
                monthName: oldMonthName,
                completedDays: oldCompletedDays,
                totalDays: oldTotalDays,
                targetDisplay: oldTargetDisplay
            } : null
        };
    }

    function openCounterFromHome(id, monthKey, type) {
        counterOpenedFrom = 'home';
        if (typeof showPage === 'function') {
            showPage('tasbeeh');
        }
        if (type === 'old') {
            switchTab('old');
            openCounterOld(id, monthKey);
        } else {
            switchTab('current');
            openCounter(id);
        }
    }

    /* ---------- Current Card HTML Generator ---------- */
    function renderCurrentCardHtml(item, isComplete) {
        var curMonthKey = getCurrentTrackingMonth();
        var parts = curMonthKey.split('-');
        var yr = parseInt(parts[0], 10);
        var mo = parseInt(parts[1], 10) - 1;
        var totalDays = getDaysInMonth(yr, mo);
        var completedDays = getCompletedDaysInMonth(item.id, yr, mo);
        var isTodayInCurMonth = (td().slice(0, 7) === curMonthKey);
        var isTodayDone = isTodayInCurMonth ? isDayCompleted(item.id, td()) : false;
        var isInfinite = item.targetCount === 'infinite';
        var targetDisplay = isInfinite ? '∞' : item.targetCount;
        var icons = (window.CONSTANTS && window.CONSTANTS.TASBEEH && window.CONSTANTS.TASBEEH.ICONS) || {};

        var misbahaIcon = renderIcon('misbaha');
        var pencilIcon = renderIcon('tb-pencil');
        var chevronIcon = renderIcon('tb-chevron');
        var targetIcon = renderIcon('tb-target');
        var checkCircleIcon = renderIcon('tb-check-circle');
        var calendarDaysIcon = renderIcon({ name: 'calendar-days', color: 'text-muted', size: 13 });

        return '<div class="tb-card bg-white border border-borderGrey rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:border-brand min-h-[146px] select-none transition-all ' + (isComplete ? 'tb-card-done opacity-80' : '') + '" data-id="' + item.id + '" data-ref="page.tasbeeh.card" role="button" tabindex="0" aria-label="' + escHtml(item.title) + '">' +
            '<div class="tb-card-top flex items-start justify-between w-full">' +
            '<div class="w-[46px] h-[46px] min-w-[46px] min-h-[46px] rounded-2xl bg-dash-mintBg text-brand inline-flex items-center justify-center shrink-0 leading-none select-none overflow-hidden" data-ref="page.tasbeeh.card.icon">' + (typeof renderIcon === 'function' ? renderIcon({ name: 'misbaha' }) : '') + '</div>' +
            '<div class="tb-card-actions flex items-center gap-1.5 shrink-0 ml-auto">' +
            '<button type="button" class="tb-btn-edit w-8 h-8 rounded-lg bg-brand-light text-brand flex items-center justify-center cursor-pointer hover:bg-brand/20 active:scale-95 transition-all p-0" data-act="tb-edit" title="Edit Dhikr" aria-label="Edit Dhikr" data-ref="page.tasbeeh.card.edit-btn">' + pencilIcon + '</button>' +
            chevronIcon +
            '</div>' +
            '</div>' +
            '<div class="tb-card-body flex flex-col justify-end w-full mt-2.5 min-w-0" data-ref="page.tasbeeh.card.info">' +
            '<h6 class="tb-card-title text-base font-bold text-brand leading-snug mb-1 truncate" data-ref="page.tasbeeh.card.title">' + escHtml(item.title) + '</h6>' +
            '<div class="tb-card-meta flex flex-col gap-1 w-full" data-ref="page.tasbeeh.card.meta">' +
            '<div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' +
            targetIcon +
            '<span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs">Target: <span class="tb-val-num font-semibold text-brand">' + targetDisplay + '</span> / day</span>' +
            '</div>' +
            '<div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' +
            checkCircleIcon +
            '<span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs"><span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand text-white leading-none" style="font-size:0.72rem;padding:0.25rem 0.6rem;">Done</span><strong class="tb-val-done ml-1 font-bold text-brand">' + completedDays + '</strong></span>' +
            '</div>' +
            '<div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' +
            calendarDaysIcon +
            '<span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs">Total: <span class="tb-val-total text-gr-textMuted font-medium">' + totalDays + ' days</span></span>' +
            '</div>' +
            (isTodayDone
                ? '<div class="tb-meta-row tb-meta-sub-row"><span class="text-brand fw-bold" style="font-size: 11px;">' + renderIcon({ name: 'circle-check', className: 'me-1' }) + 'Today Completed</span></div>'
                : '') +
            '</div>' +
            '</div>' +
            '</div>';
    }

    /* ---------- Rendering: Current Tab (Month-by-Month) ---------- */
    function renderCurrentTab() {
        var listEl = getEl(ELEMENT_IDS.CURRENT_LIST || 'tbList');
        var emptyEl = getEl(ELEMENT_IDS.CURRENT_EMPTY_STATE || 'tbEmptyState');

        if (!listEl) return;

        if (items.length === 0) {
            if (emptyEl) emptyEl.classList.remove('d-none');
            listEl.classList.add('d-none');
            return;
        }

        if (emptyEl) emptyEl.classList.add('d-none');
        listEl.classList.remove('d-none');

        var curMonthKey = getCurrentTrackingMonth();
        var parts = curMonthKey.split('-');
        var yr = parseInt(parts[0], 10);
        var mo = parseInt(parts[1], 10) - 1;
        var totalDays = getDaysInMonth(yr, mo);
        var curMonthName = formatMonthLabel(curMonthKey);

        var sub = getEl(ELEMENT_IDS.HEADER_SUB || 'tbHeaderSub');
        if (sub && activeTab === 'current') {
            sub.textContent = curMonthName;
        }

        var todoItems = [];
        var doneItems = [];
        var isTodayInCurMonth = (td().slice(0, 7) === curMonthKey);

        items.forEach(function (item) {
            var completedDays = getCompletedDaysInMonth(item.id, yr, mo);
            var isTodayDone = isTodayInCurMonth ? isDayCompleted(item.id, td()) : false;
            var isAllMonthDone = totalDays > 0 && completedDays >= totalDays;

            // Dhikr is in COMPLETED group if all month is complete or today's target is complete
            if (isAllMonthDone || (isTodayInCurMonth && isTodayDone)) {
                doneItems.push(item);
            } else {
                todoItems.push(item);
            }
        });

        var isMonthComplete = isMonthFullyCompleted(curMonthKey);
        var todoCardsHtml = todoItems.length > 0
            ? todoItems.map(function (it) { return renderCurrentCardHtml(it, false); }).join('')
            : (isMonthComplete
                ? '<div class="col-span-2 border border-borderGrey p-4 text-center rounded-2xl bg-white">' +
                  renderIcon({ name: 'circle-check', color: 'text-brand', size: 'fs-3', className: 'mb-2' }) +
                  '<div class="fw-bold text-gr1">All Dhikrs for ' + curMonthName + ' Completed!</div>' +
                  '<div class="text-muted small mb-3">All daily targets for this month have been achieved.</div>' +
                  '<button type="button" class="inline-flex items-center justify-center bg-brand text-white font-bold rounded-full px-4 py-2 mx-auto text-xs hover:bg-brand-hover transition-colors cursor-pointer" data-act="tb-current-advance">' + renderIcon({ name: 'arrow-right', className: 'mr-1' }) + ' Finalize & Advance to Next Month</button>' +
                  '</div>'
                : '<div class="col-span-2 border border-borderGrey p-4 text-center rounded-2xl bg-white">' +
                  renderIcon({ name: 'circle-check', color: 'text-brand', size: 'fs-3', className: 'mb-2' }) +
                  '<div class="fw-bold text-gr1">All Dhikrs Completed Today!</div>' +
                  '<div class="text-muted small">You have met today’s targets for all your chants.</div>' +
                  '</div>');

        var doneCardsHtml = doneItems.length > 0
            ? doneItems.map(function (it) { return renderCurrentCardHtml(it, true); }).join('')
            : '<div class="col-span-2 border border-borderGrey p-4 text-center rounded-2xl bg-white">' +
              '<div class="text-muted small">No completed Dhikrs for ' + curMonthName + ' yet. Mark your daily targets to see them here.</div>' +
              '</div>';

        var isDoneExpanded = doneItems.length > 0;

        // Update counts on badges
        var todoBadge = getEl(ELEMENT_IDS.CURRENT_TODO_BADGE || 'tbCurrentTodoBadge');
        if (todoBadge) todoBadge.textContent = todoItems.length;

        var doneBadge = getEl(ELEMENT_IDS.CURRENT_DONE_BADGE || 'tbCurrentDoneBadge');
        if (doneBadge) doneBadge.textContent = doneItems.length;

        var vm = (typeof getTasbeehViewModel === 'function') ? getTasbeehViewModel() : null;
        var hasKo = typeof ko !== 'undefined' && vm && typeof vm.currentTodoItems === 'function';

        function mapCurCard(item, isComplete) {
            var parts = curMonthKey.split('-');
            var yr = parseInt(parts[0], 10);
            var mo = parseInt(parts[1], 10) - 1;
            var totalDays = getDaysInMonth(yr, mo);
            var completedDays = getCompletedDaysInMonth(item.id, yr, mo);
            var isTodayInCurMonth = (td().slice(0, 7) === curMonthKey);
            var isTodayDone = isTodayInCurMonth ? isDayCompleted(item.id, td()) : false;
            var isInfinite = item.targetCount === 'infinite';
            var targetDisplay = isInfinite ? '∞' : item.targetCount;

            return {
                id: item.id,
                title: item.title,
                targetCount: targetDisplay,
                completedDays: completedDays,
                totalDays: totalDays,
                isComplete: !!isComplete,
                isTodayDone: isTodayDone,
                onCardClick: function (d, e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                    if (window.TasbeehApp && typeof window.TasbeehApp.openCounterView === 'function') {
                        window.TasbeehApp.openCounterView(item.id);
                    }
                },
                onEditClick: function (d, e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                    if (window.TasbeehApp && typeof window.TasbeehApp.openEditModal === 'function') {
                        window.TasbeehApp.openEditModal(item.id);
                    }
                }
            };
        }

        // Populate grids
        var todoGrid = getEl(ELEMENT_IDS.CURRENT_TODO_GRID || 'tbCurrentTodoGrid');
        var doneGrid = getEl(ELEMENT_IDS.CURRENT_DONE_GRID || 'tbCurrentDoneGrid');

        if (hasKo) {
            vm.currentTodoItems(todoItems.map(function (it) { return mapCurCard(it, false); }));
            vm.currentDoneItems(doneItems.map(function (it) { return mapCurCard(it, true); }));
        } else {
            if (todoGrid) todoGrid.innerHTML = todoCardsHtml;
            if (doneGrid) doneGrid.innerHTML = doneCardsHtml;
        }

        // Update Done collapse expansion state
        var doneToggle = getEl(ELEMENT_IDS.CURRENT_DONE_TOGGLE || 'tbCurrentDoneToggle');
        var doneList = getEl(ELEMENT_IDS.CURRENT_DONE_LIST || 'tbCurrentDoneList');
        if (doneToggle) {
            if (isDoneExpanded) {
                doneToggle.classList.remove('collapsed');
                doneToggle.setAttribute('aria-expanded', 'true');
            } else {
                doneToggle.classList.add('collapsed');
                doneToggle.setAttribute('aria-expanded', 'false');
            }
        }
        if (doneList) {
            if (isDoneExpanded) {
                doneList.classList.add('show');
            } else {
                doneList.classList.remove('show');
            }
        }
    }

    /* ---------- Tab Navigation & Rendering ---------- */
    function render() {
        var pageEl = document.getElementById('tasbeehPage');
        if (pageEl && typeof ko !== 'undefined' && !ko.dataFor(pageEl)) {
            initTasbeeh();
        }

        var isDomReady = (activeTab === 'home' && getEl(ELEMENT_IDS.HOME_BODY || 'tbHomeBody')) ||
                         (activeTab === 'old' && getEl(ELEMENT_IDS.OLD_BODY || 'tbOldBody')) ||
                         (activeTab === 'history' && getEl(ELEMENT_IDS.HISTORY_BODY || 'tbHistoryBody')) ||
                         (activeTab === 'current' && getEl(ELEMENT_IDS.CURRENT_LIST || 'tbList'));
        if (!isDomReady) {
            setTimeout(function () {
                render();
            }, 30);
            return;
        }

        if (activeTab === 'home') {
            if (window.TasbeehHomeApp && typeof window.TasbeehHomeApp.renderHomeTab === 'function') {
                window.TasbeehHomeApp.renderHomeTab();
            }
        } else if (activeTab === 'old') {
            if (window.TasbeehOldApp && typeof window.TasbeehOldApp.renderOldTab === 'function') {
                window.TasbeehOldApp.renderOldTab();
            }
        } else if (activeTab === 'history') {
            if (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.renderHistoryTab === 'function') {
                window.TasbeehHistoryApp.renderHistoryTab();
            }
        } else {
            renderCurrentTab();
        }

        if (window.NavigationState && typeof window.NavigationState.tasbeehSubTab === 'function') {
            window.NavigationState.tasbeehSubTab(activeTab);
        }
        if (tasbeehViewModel) {
            if (typeof tasbeehViewModel.currentSubTab === 'function') {
                tasbeehViewModel.currentSubTab(activeTab);
            }
            if (tasbeehViewModel.header && TAB_HEADERS && TAB_HEADERS[activeTab]) {
                var th = TAB_HEADERS[activeTab];
                if (typeof tasbeehViewModel.header.title === 'function') tasbeehViewModel.header.title(th.label);
                if (typeof tasbeehViewModel.header.subtitle === 'function') {
                    tasbeehViewModel.header.subtitle(activeTab === TABS.CURRENT ? formatMonthLabel(getCurrentTrackingMonth()) : th.sub);
                }
                if (typeof tasbeehViewModel.header.iconClass === 'function') tasbeehViewModel.header.iconClass(th.iconClass);
            }
        }
    }

    function switchTab(tab) {
        activeTab = (tab === TABS.OLD || tab === TABS.HISTORY || tab === TABS.HOME) ? tab : TABS.CURRENT;
        var btnHome = getEl('tabTbHome');
        var btnCur = getEl('tabTbCurrent');
        var btnOld = getEl('tabTbOld');
        var btnHist = getEl('tabTbHistory');

        var bodyHome = getEl('tbHomeBody');
        var bodyCur = getEl('tbCurrentBody');
        var bodyOld = getEl('tbOldBody');
        var bodyHist = getEl('tbHistoryBody');

        var addBtn = getEl('tbAddBtn');
        var icon = getEl('tbHeaderIcon');
        var label = getEl('tbHeaderLabel');
        var sub = getEl('tbHeaderSub');

        // Reset all tabs
        var allBtns = [btnHome, btnCur, btnOld, btnHist];
        for (var i = 0; i < allBtns.length; i++) {
            if (allBtns[i]) {
                allBtns[i].classList.remove('active', 'text-brand');
                allBtns[i].classList.add('text-gr-textMuted');
                allBtns[i].setAttribute('aria-selected', 'false');
            }
        }

        // Hide all body containers
        var allBodies = [bodyHome, bodyCur, bodyOld, bodyHist];
        for (var j = 0; j < allBodies.length; j++) {
            if (allBodies[j]) {
                allBodies[j].classList.add('d-none');
            }
        }

        if (activeTab === TABS.HOME) {
            if (btnHome) {
                btnHome.classList.add('active', 'text-brand');
                btnHome.classList.remove('text-gr-textMuted');
                btnHome.setAttribute('aria-selected', 'true');
            }
            if (bodyHome) bodyHome.classList.remove('d-none');
            if (addBtn) addBtn.classList.add('d-none');
            if (icon) { if (window.Icon && typeof Icon.update === 'function') Icon.update(icon, TAB_HEADERS.home.iconClass); else icon.className = TAB_HEADERS.home.iconClass; }
            if (label) label.textContent = TAB_HEADERS.home.label;
            if (sub) sub.textContent = TAB_HEADERS.home.sub;

            if (window.TasbeehHomeApp && typeof window.TasbeehHomeApp.renderHomeTab === 'function') {
                window.TasbeehHomeApp.renderHomeTab();
            }
        } else if (activeTab === TABS.OLD) {
            if (btnOld) {
                btnOld.classList.add('active', 'text-brand');
                btnOld.classList.remove('text-gr-textMuted');
                btnOld.setAttribute('aria-selected', 'true');
            }
            if (bodyOld) bodyOld.classList.remove('d-none');
            if (addBtn) addBtn.classList.remove('d-none');
            if (icon) { if (window.Icon && typeof Icon.update === 'function') Icon.update(icon, TAB_HEADERS.old.iconClass); else icon.className = TAB_HEADERS.old.iconClass; }
            if (label) label.textContent = TAB_HEADERS.old.label;

            var curOldM = window.TasbeehOldApp && typeof window.TasbeehOldApp.getCurrentOldMonth === 'function'
                ? window.TasbeehOldApp.getCurrentOldMonth()
                : null;

            if (sub) {
                sub.textContent = curOldM ? formatMonthLabel(curOldM) : 'All Completed';
            }

            if (window.TasbeehOldApp && typeof window.TasbeehOldApp.renderOldTab === 'function') {
                window.TasbeehOldApp.renderOldTab();
            }
        } else if (activeTab === TABS.HISTORY) {
            if (btnHist) {
                btnHist.classList.add('active', 'text-brand');
                btnHist.classList.remove('text-gr-textMuted');
                btnHist.setAttribute('aria-selected', 'true');
            }
            if (bodyHist) bodyHist.classList.remove('d-none');
            if (addBtn) addBtn.classList.add('d-none');
            if (icon) { if (window.Icon && typeof Icon.update === 'function') Icon.update(icon, TAB_HEADERS.history.iconClass); else icon.className = TAB_HEADERS.history.iconClass; }
            if (label) label.textContent = TAB_HEADERS.history.label;
            if (sub) sub.textContent = TAB_HEADERS.history.sub;

            if (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.renderHistoryTab === 'function') {
                window.TasbeehHistoryApp.renderHistoryTab();
            }
        } else {
            if (btnCur) {
                btnCur.classList.add('active', 'text-brand');
                btnCur.classList.remove('text-gr-textMuted');
                btnCur.setAttribute('aria-selected', 'true');
            }
            if (bodyCur) bodyCur.classList.remove('d-none');
            if (addBtn) addBtn.classList.remove('d-none');
            if (icon) { if (window.Icon && typeof Icon.update === 'function') Icon.update(icon, TAB_HEADERS.current.iconClass); else icon.className = TAB_HEADERS.current.iconClass; }
            if (label) label.textContent = TAB_HEADERS.current.label;
            if (sub) sub.textContent = formatMonthLabel(getCurrentTrackingMonth());

            renderCurrentTab();
        }

        if (window.NavigationState && typeof window.NavigationState.tasbeehSubTab === 'function') {
            window.NavigationState.tasbeehSubTab(activeTab);
        }
        if (tasbeehViewModel) {
            if (typeof tasbeehViewModel.currentSubTab === 'function') {
                tasbeehViewModel.currentSubTab(activeTab);
            }
            if (tasbeehViewModel.header && TAB_HEADERS && TAB_HEADERS[activeTab]) {
                var th = TAB_HEADERS[activeTab];
                if (typeof tasbeehViewModel.header.title === 'function') tasbeehViewModel.header.title(th.label);
                if (typeof tasbeehViewModel.header.subtitle === 'function') {
                    tasbeehViewModel.header.subtitle(activeTab === TABS.CURRENT ? formatMonthLabel(getCurrentTrackingMonth()) : th.sub);
                }
                if (typeof tasbeehViewModel.header.iconClass === 'function') tasbeehViewModel.header.iconClass(th.iconClass);
            }
        }
    }

    /* ---------- Monthly Calendar Tracker ---------- */
    function renderCalendar() {
        var item = getActiveItem();
        if (!item) return;

        var grid = getEl('tbCalGrid');
        if (!grid) return;

        var year = calViewYear;
        var month = calViewMonth;
        var daysInMonth = getDaysInMonth(year, month);
        var firstDay = getFirstDayOfMonth(year, month);

        var isInfinite = item.targetCount === 'infinite';
        var targetDisplay = isInfinite ? '∞' : item.targetCount;

        var todayStr = td();

        var html = '';
        var completedCount = 0;
        var totalDays = daysInMonth;

        // Empty offset cells for days before the 1st
        for (var e = 0; e < firstDay; e++) {
            html += '<div class="tb-cal-cell tb-cal-empty aspect-square rounded-xl bg-transparent border-0" aria-hidden="true"></div>';
        }

        // Calendar day cells
        for (var d = 1; d <= daysInMonth; d++) {
            var dateStr = makeDateStr(year, month, d);
            var isToday = (dateStr === todayStr);
            var isCompleted = isDayCompleted(item.id, dateStr);

            if (isCompleted) completedCount++;

            var classes = 'tb-cal-cell';
            if (isCompleted) classes += ' tb-cal-done';
            if (isToday) classes += ' tb-cal-today';

            html += '<div class="' + classes + ' aspect-square rounded-xl flex items-center justify-center cursor-pointer border-2 border-transparent bg-white relative select-none transition-all hover:border-brand" data-date="' + dateStr + '" role="button" tabindex="0" ' +
                'aria-label="' + d + ' ' + (isCompleted ? 'Completed' : 'Pending') + '">' +
                '<span class="tb-cal-date text-lg font-bold text-brand leading-none inline-flex items-center justify-center">' + d + '</span>' +
                '</div>';
        }

        grid.innerHTML = html;

        // Month & Year header label
        var monthLabel = getEl('tbCalMonthLabel');
        if (monthLabel) {
            var dateObj = new Date(year, month, 1);
            monthLabel.textContent = dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        }

        // Target pill label
        var targetLabel = getEl('tbCalTargetLabel');
        if (targetLabel) {
            targetLabel.textContent = isInfinite ? 'Target: ∞ / day' : ('Target: ' + item.targetCount + ' / day');
        }

        // Update progress summary bar
        var remaining = Math.max(0, totalDays - completedCount);
        var pct = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

        var completedEl = getEl('tbCalCompletedCount');
        var remainingEl = getEl('tbCalRemainingCount');
        var pctEl = getEl('tbCalProgressPct');

        if (completedEl) completedEl.textContent = completedCount;
        if (remainingEl) remainingEl.textContent = remaining;
        if (pctEl) pctEl.textContent = pct + '%';

        // Setup Month Navigation Controls (Current vs Old)
        var activeMKey = counterMonthKey || getCurrentTrackingMonth();
        var isOldTracking = !!counterMonthKey;
        var isFullyDone = isMonthFullyCompleted(activeMKey);

        var prevBtn = getEl('tbCalPrevMonth');
        var nextBtn = getEl('tbCalNextMonth');

        if (isOldTracking) {
            // Old Tracking: navigates backward into the past
            if (nextBtn) {
                nextBtn.style.opacity = '0.2';
                nextBtn.style.pointerEvents = 'none';
                nextBtn.title = 'Next month unavailable in Old Tracking';
            }
            if (prevBtn) {
                prevBtn.style.pointerEvents = 'auto';
                if (isFullyDone) {
                    prevBtn.style.opacity = '1';
                    prevBtn.className = 'tb-cal-nav-btn text-brand border-brand';
                    prevBtn.title = 'All targets complete: tap to move to previous month';
                } else {
                    prevBtn.style.opacity = '0.5';
                    prevBtn.className = 'tb-cal-nav-btn';
                    prevBtn.title = 'Complete all targets to move backward';
                }
            }
        } else {
            // Current Tracking: navigates forward into the future
            if (prevBtn) {
                prevBtn.style.opacity = '0.2';
                prevBtn.style.pointerEvents = 'none';
                prevBtn.title = 'Previous month unavailable in Current Tracking';
            }
            if (nextBtn) {
                nextBtn.style.pointerEvents = 'auto';
                if (isFullyDone) {
                    nextBtn.style.opacity = '1';
                    nextBtn.className = 'tb-cal-nav-btn text-brand border-brand';
                    nextBtn.title = 'All targets complete: tap to advance to next month';
                } else {
                    nextBtn.style.opacity = '0.5';
                    nextBtn.className = 'tb-cal-nav-btn';
                    nextBtn.title = 'Complete all targets to advance forward';
                }
            }
        }
    }

    function handleCalendarDayClick(dateStr) {
        var item = getActiveItem();
        if (!item || !dateStr) return;

        var isCompleted = isDayCompleted(item.id, dateStr);

        if (isCompleted) {
            // Already completed: clicking again shows confirmation before changing status
            confirmAction({
                title: 'Change Day Status',
                message: 'Mark <strong>' + formatDate(dateStr) + '</strong> for “' + escHtml(item.title) + '” as incomplete?',
                btnText: 'Yes, Mark Incomplete',
                isSuccess: false
            }, function () {
                setDayCompleted(item.id, dateStr, false);
                animateCell(dateStr);
                renderCalendar();
            });
        } else {
            // Mark target as completed immediately
            setDayCompleted(item.id, dateStr, true);
            animateCell(dateStr);
            renderCalendar();

            // Check if this action completed the entire month's targets
            var activeMKey = counterMonthKey || getCurrentTrackingMonth();
            if (isMonthFullyCompleted(activeMKey)) {
                setTimeout(function () {
                    if (counterMonthKey) {
                        advanceOldMonth();
                    } else {
                        advanceCurrentMonth();
                    }
                }, 300);
            }
        }
    }

    function confirmDayStatusChange() {
        if (!pendingToggleDate) return;
        var item = getActiveItem();
        if (item) {
            setDayCompleted(item.id, pendingToggleDate, false);
            animateCell(pendingToggleDate);
            renderCalendar();
        }
        if (confirmModalInstance) {
            confirmModalInstance.hide();
        }
        pendingToggleDate = null;
    }

    function animateCell(dateStr) {
        setTimeout(function () {
            var grid = getEl('tbCalGrid');
            if (!grid) return;
            var cell = grid.querySelector('[data-date="' + dateStr + '"]');
            if (cell) {
                cell.classList.remove('tb-cal-pop');
                void cell.offsetWidth;
                cell.classList.add('tb-cal-pop');
            }
        }, 10);
    }

    function navigateMonth(delta) {
        if (counterMonthKey) {
            if (delta < 0) {
                advanceOldMonth();
            } else {
                showToast('Next month is not available in Old tracking.');
            }
        } else {
            if (delta > 0) {
                advanceCurrentMonth();
            } else {
                showToast('Previous month is not available in Current tracking.');
            }
        }
    }

    /* ---------- Counter Overlay Opening & Closing ---------- */
    function openCounter(id, oldMonthKey) {
        var item = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) { item = items[i]; break; }
        }
        if (!item) return;

        // Automatically update bookmark
        if (oldMonthKey) {
            setBookmark('old', id, oldMonthKey);
        } else {
            setBookmark('current', id);
        }

        activeId = id;
        counterMonthKey = oldMonthKey || null;

        // Determine which month to show in the calendar
        if (counterMonthKey) {
            // Old month: parse the month key (e.g., "2026-09")
            var parts = counterMonthKey.split('-');
            calViewYear = parseInt(parts[0], 10);
            calViewMonth = parseInt(parts[1], 10) - 1; // 0-indexed
        } else {
            // Current month: display current tracking month
            var curMonthKey = getCurrentTrackingMonth();
            var curParts = curMonthKey.split('-');
            calViewYear = parseInt(curParts[0], 10);
            calViewMonth = parseInt(curParts[1], 10) - 1;
        }

        // Header titles
        var topTitle = item.title;
        if (counterMonthKey) {
            topTitle += ' (' + formatMonthLabel(counterMonthKey) + ')';
        }

        var topTitleEl = getEl('tbCounterTopTitle');
        if (topTitleEl) topTitleEl.textContent = topTitle;

        var titleEl = getEl('tbCounterTitle');
        if (titleEl) titleEl.textContent = item.title;

        renderCalendar();

        var counterView = getEl('tasbeehCounterView');
        if (counterView) {
            counterView.classList.remove('d-none');
            counterView.classList.add('flex');
        }
    }

    function openCounterOld(id, monthKey) {
        openCounter(id, monthKey);
    }

    function closeCounter() {
        activeId = null;
        var prevCM = counterMonthKey;
        counterMonthKey = null;

        var counterView = getEl('tasbeehCounterView');
        if (counterView) {
            counterView.classList.add('d-none');
            counterView.classList.remove('flex');
        }

        if (prevCM && window.TasbeehOldApp && typeof window.TasbeehOldApp.checkAndAdvanceMonth === 'function') {
            window.TasbeehOldApp.checkAndAdvanceMonth(prevCM);
        }

        render();

        if (counterOpenedFrom === 'home') {
            counterOpenedFrom = null;
            switchTab('home');
        }
    }

    /* ---------- Add / Edit Dhikr Modal ---------- */
    function syncChips() {
        var chips = document.querySelectorAll('#tbCountChips button');
        var formCount = getEl('tbFormCount');
        var curVal = formCount ? Number(formCount.value) : 33;

        chips.forEach(function (btn) {
            var v = btn.dataset.count;
            var isOn = (v === 'infinite')
                ? countMode === 'infinite'
                : (countMode === 'finite' && Number(v) === curVal);
            btn.classList.toggle('active', isOn);
        });
    }

    function openModal(id) {
        editingId = id || null;
        var item = null;
        if (id) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === id) { item = items[i]; break; }
            }
        }

        var modalTitle = getEl('tbModalTitle');
        if (modalTitle) modalTitle.textContent = item ? 'Edit Dhikr' : 'Add New Dhikr';

        var formTitle = getEl('tbFormTitle');
        if (formTitle) formTitle.value = item ? item.title : '';

        countMode = (item && item.targetCount === 'infinite') ? 'infinite' : 'finite';
        var formCount = getEl('tbFormCount');
        if (formCount) {
            formCount.value = (item && item.targetCount !== 'infinite') ? item.targetCount : (TASBEEH_CONSTANTS.DEFAULT_TARGET || 33);
            formCount.disabled = (countMode === 'infinite');
        }

        syncChips();

        var delBtn = getEl('tbModalDelBtn');
        if (delBtn) {
            if (item) {
                delBtn.classList.remove('d-none');
            } else {
                delBtn.classList.add('d-none');
            }
        }

        var modalEl = getEl('tasbeehModal');
        if (modalEl) {
            if (!editModalInstance) {
                var ModalClass = window.UIModal || (window.bootstrap && window.bootstrap.Modal);
                editModalInstance = ModalClass ? ModalClass.getOrCreateInstance(modalEl) : null;
                modalEl.addEventListener('hidden.bs.modal', function () {
                    editingId = null;
                    var b = getEl('tbModalDelBtn');
                    if (b) b.classList.add('d-none');
                });
            }
            if (editModalInstance) editModalInstance.show();
        }
    }

    function saveModal() {
        var formTitle = getEl('tbFormTitle');
        var title = formTitle ? formTitle.value.trim() : '';
        if (!title) {
            alert('Please enter a chant title.');
            if (formTitle) formTitle.focus();
            return;
        }

        var targetCount = (countMode === 'infinite')
            ? 'infinite'
            : clamp(parseInt(getEl('tbFormCount').value, 10) || 33, 1, 9999);

        if (editingId) {
            var item = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === editingId) { item = items[i]; break; }
            }
            if (item) {
                item.title = title;
                item.targetCount = targetCount;
                item.updatedAt = Date.now();
                showToast('Dhikr updated');
            }
        } else {
            items.push(normalizeItem({
                id: uid(),
                title: title,
                targetCount: targetCount,
                updatedAt: Date.now()
            }));
            showToast('Dhikr added');
        }

        persist();
        render();

        if (activeId && activeId === editingId) {
            var act = getActiveItem();
            if (act) {
                var topTitleEl = getEl('tbCounterTopTitle');
                if (topTitleEl) topTitleEl.textContent = act.title;
                var titleEl = getEl('tbCounterTitle');
                if (titleEl) titleEl.textContent = act.title;
                renderCalendar();
            }
        }

        if (editModalInstance) editModalInstance.hide();
        editingId = null;
    }

    function deleteItem(id) {
        var item = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) { item = items[i]; break; }
        }
        if (!item) return false;

        if (!confirm('Delete “' + item.title + '”? This will remove its recorded progress.')) {
            return false;
        }

        items = items.filter(function (it) { return it.id !== id; });

        if (activeId === id) {
            closeCounter();
        }

        // Clean up calendar completions for this item
        if (calCompletions[id]) {
            delete calCompletions[id];
            persistCalCompletions();
        }

        persist();
        render();
        showToast('Dhikr deleted');
        return true;
    }

    /* ---------- Event Bindings ---------- */
    function bindEvents() {
        /* Open Dhikr Add Modal */
        var addBtn = getEl('tbAddBtn');
        if (addBtn) {
            addBtn.onclick = function () { openModal(null); };
        }

        var saveBtn = getEl('tbModalSaveBtn');
        if (saveBtn) {
            saveBtn.onclick = saveModal;
        }

        var modalDelBtn = getEl('tbModalDelBtn');
        if (modalDelBtn) {
            modalDelBtn.onclick = function () {
                if (editingId) {
                    var targetId = editingId;
                    if (deleteItem(targetId)) {
                        if (editModalInstance) editModalInstance.hide();
                        editingId = null;
                    }
                }
            };
        }

        /* Subtab Switching */
        var tabHome = getEl('tabTbHome');
        if (tabHome) {
            tabHome.onclick = function () { switchTab('home'); };
        }

        var tabCurrent = getEl('tabTbCurrent');
        if (tabCurrent) {
            tabCurrent.onclick = function () { switchTab('current'); };
        }

        var tabOld = getEl('tabTbOld');
        if (tabOld) {
            tabOld.onclick = function () { switchTab('old'); };
        }

        var tabHistory = getEl('tabTbHistory');
        if (tabHistory) {
            tabHistory.onclick = function () { switchTab('history'); };
        }

        /* Target Count Chips */
        var chipsBox = getEl('tbCountChips');
        if (chipsBox) {
            chipsBox.onclick = function (e) {
                var btn = e.target.closest('button[data-count]');
                if (!btn) return;
                var val = btn.dataset.count;
                var countInput = getEl('tbFormCount');
                if (val === 'infinite') {
                    countMode = 'infinite';
                    if (countInput) countInput.disabled = true;
                } else {
                    countMode = 'finite';
                    if (countInput) {
                        countInput.disabled = false;
                        countInput.value = val;
                    }
                }
                syncChips();
            };
        }

        var formCount = getEl('tbFormCount');
        if (formCount) {
            formCount.oninput = function () {
                if (formCount.value !== '') countMode = 'finite';
                syncChips();
            };
        }

        /* Current List Card Delegations */
        var listEl = getEl('tbList');
        if (listEl) {
            listEl.onclick = function (e) {
                var btn = e.target.closest('button[data-act]');
                if (btn && btn.dataset.act === 'tb-current-advance') {
                    e.stopPropagation();
                    advanceCurrentMonth();
                    return;
                }
                var card = e.target.closest('[data-id]');
                if (!card) return;
                e.stopPropagation();
                var id = card.dataset.id;
                if (btn) {
                    var act = btn.dataset.act;
                    if (act === 'tb-open') openCounter(id);
                    else if (act === 'tb-edit') openModal(id);
                    else if (act === 'tb-del') deleteItem(id);
                } else {
                    openCounter(id);
                }
            };

            listEl.onkeydown = function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    var btn = e.target.closest('button[data-act]');
                    if (btn) return;
                    var card = e.target.closest('[data-id]');
                    if (card) {
                        e.preventDefault();
                        openCounter(card.dataset.id);
                    }
                }
            };
        }

        /* Counter View Navigation & Controls */
        var btnBack = getEl('tbBtnBack');
        if (btnBack) btnBack.onclick = closeCounter;

        var btnEditActive = getEl('tbBtnEditActive');
        if (btnEditActive) {
            btnEditActive.onclick = function () {
                if (activeId) openModal(activeId);
            };
        }

        /* Calendar Grid: Day Click Delegation */
        var calGrid = getEl('tbCalGrid');
        if (calGrid) {
            calGrid.onclick = function (e) {
                var cell = e.target.closest('.tb-cal-cell[data-date]');
                if (!cell) return;
                if (cell.classList.contains('tb-cal-empty')) return;
                handleCalendarDayClick(cell.dataset.date);
            };

            calGrid.onkeydown = function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    var cell = e.target.closest('.tb-cal-cell[data-date]');
                    if (!cell || cell.classList.contains('tb-cal-empty')) return;
                    e.preventDefault();
                    handleCalendarDayClick(cell.dataset.date);
                }
            };
        }

        /* Calendar Month Navigation Buttons */
        var prevMonth = getEl('tbCalPrevMonth');
        if (prevMonth) {
            prevMonth.onclick = function () { navigateMonth(-1); };
        }

        var nextMonth = getEl('tbCalNextMonth');
        if (nextMonth) {
            nextMonth.onclick = function () { navigateMonth(1); };
        }

        /* Confirmation Modal Button */
        var btnConfirmChange = getEl('tbBtnConfirmChange');
        if (btnConfirmChange) {
            btnConfirmChange.onclick = function () {
                if (typeof pendingConfirmCallback === 'function') {
                    var cb = pendingConfirmCallback;
                    pendingConfirmCallback = null;
                    if (confirmModalInstance) confirmModalInstance.hide();
                    cb();
                    return;
                }
                if (pendingToggleDate) {
                    confirmDayStatusChange();
                }
            };
        }

        /* Keyboard Shortcuts */
        document.addEventListener('keydown', function (e) {
            var counterView = getEl('tasbeehCounterView');
            var isOverlayOpen = counterView && !counterView.classList.contains('d-none');
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (isOverlayOpen) {
                if (e.code === 'Escape') {
                    closeCounter();
                } else if (e.code === 'ArrowLeft') {
                    e.preventDefault();
                    navigateMonth(-1);
                } else if (e.code === 'ArrowRight') {
                    e.preventDefault();
                    navigateMonth(1);
                }
            }
        });
    }

    /* ---------- Public API ---------- */
    function init() {
        var pageEl = document.getElementById('tasbeehPage');
        if (pageEl && typeof ko !== 'undefined') {
            registerTasbeehComponents();
            var vm = (typeof getTasbeehViewModel === 'function') ? getTasbeehViewModel() : null;
            if (vm && !ko.dataFor(pageEl)) {
                ko.applyBindings(vm, pageEl);
            }
        }
        items = loadItems();
        loadCalCompletions();
        loadCurrentPeriod();
        checkDailyReset();
        persist();
        bindEvents();
        switchTab('home');
    }

    return {
        init: init,
        render: render,
        switchTab: switchTab,
        renderCurrentTab: renderCurrentTab,
        openCounter: openCounter,
        openCounterOld: openCounterOld,
        closeCounter: closeCounter,
        openModal: openModal,
        saveModal: saveModal,
        deleteItem: deleteItem,
        getItems: getItems,
        setItems: setItems,
        persist: persist,
        formatDate: typeof formatDate === 'function' ? formatDate : (window.formatDate || function (d) { return d; }),
        formatMonthLabel: typeof formatMonthLabel === 'function' ? formatMonthLabel : (window.formatMonthLabel || function (m) { return m; }),
        getCurrentMonthKey: typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey : (window.getCurrentMonthKey || function () { return ''; }),
        showToast: typeof showToast === 'function' ? showToast : (window.showToast || function () { }),
        getBookmark: getBookmark,
        setBookmark: setBookmark,
        getBookmarkedChants: getBookmarkedChants,
        openCounterFromHome: openCounterFromHome,
        // Current Period Management
        loadCurrentPeriod: loadCurrentPeriod,
        saveCurrentPeriod: saveCurrentPeriod,
        getCurrentTrackingMonth: getCurrentTrackingMonth,
        removeMonthTrackingData: removeMonthTrackingData,
        isMonthFullyCompleted: isMonthFullyCompleted,
        advanceCurrentMonth: advanceCurrentMonth,
        advanceOldMonth: advanceOldMonth,
        confirmAction: confirmAction,
        // Calendar & Completion Helpers
        isDayCompleted: isDayCompleted,
        setDayCompleted: setDayCompleted,
        getDaysInMonth: getDaysInMonth,
        getCompletedDaysInMonth: getCompletedDaysInMonth,
        renderCalendar: renderCalendar
    };
})();

// Alias to window.TasbeehApp as primary coordinator
window.TasbeehApp = window.TasbeehCurrentApp;


/* ============================================================
   Nur Prayer — Digital Tasbeeh: Old View Module
   Submodule: Tasbeeh Old View
   Handles:
     - Old Tasbeeh period settings & local storage persistence
     - Sequential monthly clearance (jumps back month-by-month till start date)
     - Old tab rendering (Month banner, step-by-step progress, TO DO & COMPLETED groups)
     - Old item interactions (edit count, toggle completed, open counter for old month)
     - Period settings modal (presets, start date & end date picker, timeline preview)
   ============================================================ */
'use strict';

window.TasbeehOldApp = (function () {
    /* ---------- Constants (Referenced from utilities/tasbeeh-constants.js) ---------- */
    var TASBEEH_CONSTANTS = window.TASBEEH_CONSTANTS || (window.CONSTANTS && window.CONSTANTS.TASBEEH) || {};
    var ELEMENT_IDS = TASBEEH_CONSTANTS.ELEMENT_IDS || {};
    var PERIOD_KEY = (TASBEEH_CONSTANTS.STORAGE_KEYS && TASBEEH_CONSTANTS.STORAGE_KEYS.PERIOD) || 'app_tasbeeh_period';
    var PERIOD_PRESETS = TASBEEH_CONSTANTS.PERIOD_PRESETS || {
        THIS_YEAR: 'this-year',
        LAST_6_MONTHS: '6-months',
        LAST_1_YEAR: '1-year'
    };

    /* ---------- State ---------- */
    var currentOldMonthKey = null; // Currently active / displayed old month
    var periodModalInstance = null;

    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /* ---------- Data Access Bridges ---------- */
    function getItems() {
        if (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getItems === 'function') {
            return window.TasbeehCurrentApp.getItems();
        }
        if (window.TasbeehApp && typeof window.TasbeehApp.getItems === 'function') {
            return window.TasbeehApp.getItems();
        }
        return [];
    }

    /* ---------- Period Storage Layer (YYYY-MM) ---------- */
    function loadPeriod() {
        var raw = localStorage.getItem(PERIOD_KEY);
        var now = new Date();
        var curMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
        var defaultStart = now.getFullYear() + '-01';
        var defaultEnd = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');

        if (!raw) {
            var initial = { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
            try { localStorage.setItem(PERIOD_KEY, JSON.stringify(initial)); } catch (_) {}
            return initial;
        }
        try {
            var p = JSON.parse(raw);
            if (!p || !p.startDate) {
                return { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
            }
            var s = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(p.startDate) : String(p.startDate).slice(0, 7)) || defaultStart;
            var e = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(p.endDate) : String(p.endDate).slice(0, 7)) || defaultEnd;
            var initE = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(p.initialEnd) : String(p.initialEnd || '').slice(0, 7)) || e;
            if (e >= curMonth) {
                e = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curMonth) : e;
            }
            return {
                startDate: s,
                endDate: e,
                initialEnd: initE,
                updatedAt: p.updatedAt || Date.now()
            };
        } catch (_) {
            return { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
        }
    }

    function savePeriod(start, end, initialEnd) {
        var cur = loadPeriod();
        var s = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(start) : String(start).slice(0, 7));
        var e = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(end) : String(end).slice(0, 7));
        var initE = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(initialEnd) : String(initialEnd || '').slice(0, 7)) || cur.initialEnd || e;
        var p = {
            startDate: s,
            endDate: e,
            initialEnd: initE,
            updatedAt: Date.now()
        };
        try { localStorage.setItem(PERIOD_KEY, JSON.stringify(p)); } catch (_) {}
        return p;
    }

    /* ---------- Old Tracking Month Selection Logic ---------- */
    function getCurrentOldMonth() {
        var period = loadPeriod();
        if (!period || !period.startDate || !period.endDate) return null;
        if (period.endDate < period.startDate) {
            return null; // All old months completed
        }
        return period.endDate;
    }

    function checkAndAdvanceMonth(mKey) {
        var curM = mKey || getCurrentOldMonth();
        if (!curM) return;
        var period = loadPeriod();
        if (curM < period.startDate) return;

        // Verify if all targets for curM are completed
        var isAllDone = false;
        if (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.isMonthFullyCompleted === 'function') {
            isAllDone = window.TasbeehCurrentApp.isMonthFullyCompleted(curM);
        } else {
            var items = getItems();
            var finiteItems = items.filter(function (it) { return it.targetCount !== 'infinite'; });
            if (finiteItems.length === 0) return;
            var parts = curM.split('-');
            var yr = parseInt(parts[0], 10);
            var mo = parseInt(parts[1], 10) - 1;
            var totalDays = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getDaysInMonth === 'function')
                ? window.TasbeehCurrentApp.getDaysInMonth(yr, mo)
                : new Date(yr, mo + 1, 0).getDate();
            isAllDone = finiteItems.every(function (it) {
                var completedDays = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getCompletedDaysInMonth === 'function')
                    ? window.TasbeehCurrentApp.getCompletedDaysInMonth(it.id, yr, mo)
                    : 0;
                return completedDays >= totalDays;
            });
        }

        if (!isAllDone) {
            showToast('Please complete all targets for ' + formatMonthLabel(curM) + ' before moving to previous month.');
            return;
        }

        var prevMonthKey = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curM) : (function (m) {
            var p = m.split('-'); var y = parseInt(p[0], 10); var mo = parseInt(p[1], 10) - 1;
            if (mo === 0) { mo = 12; y--; } return y + '-' + pad2(mo);
        })(curM);

        var curLabel = formatMonthLabel(curM);
        var prevLabel = formatMonthLabel(prevMonthKey);
        var isAllCleared = (prevMonthKey < period.startDate);

        var confirmFn = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.confirmAction === 'function')
            ? window.TasbeehCurrentApp.confirmAction
            : function (opt, cb) { if (confirm(opt.title + '\n\n' + opt.message.replace(/<[^>]+>/g, ''))) cb(); };

        confirmFn({
            title: '🎉 Month Completed!',
            message: 'All dhikr targets for <strong>' + curLabel + '</strong> are completed!<br><br>' +
                     'Do you want to finalize this month, remove its tracking data, and ' +
                     (isAllCleared ? 'complete all Old Tracking months?' : ('move to <strong>' + prevLabel + '</strong>?')),
            btnText: 'Finalize & Move Backward',
            isSuccess: true
        }, function () {
            // 1. Remove that month's tracking data
            if (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.removeMonthTrackingData === 'function') {
                window.TasbeehCurrentApp.removeMonthTrackingData(curM);
            }

            // 2. Update end date in app_tasbeeh_period to previous month
            savePeriod(period.startDate, prevMonthKey, period.initialEnd);
            currentOldMonthKey = null;

            // 3. Move to that month
            renderOldTab();
            if (isAllCleared) {
                showToast('🎉 ' + curLabel + ' completed! All old tracking months cleared!', 3500);
            } else {
                showToast('🎉 ' + curLabel + ' completed! Moved to ' + prevLabel, 3500);
            }
        });
    }

    function advanceOldMonth() {
        if (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.advanceOldMonth === 'function') {
            window.TasbeehCurrentApp.advanceOldMonth();
        } else {
            checkAndAdvanceMonth(getCurrentOldMonth());
        }
    }

    function markMonthCompleted(mKey) {
        checkAndAdvanceMonth(mKey);
    }

    function reopenLastMonth() {
        var period = loadPeriod();
        var maxEnd = period.initialEnd || period.endDate;
        if (period.endDate >= maxEnd) {
            showToast('Cannot reopen: already at latest month (' + formatMonthLabel(maxEnd) + ')');
            return;
        }
        var nextM = typeof getNextMonthKey === 'function' ? getNextMonthKey(period.endDate) : (function (m) {
            var p = m.split('-'); var y = parseInt(p[0], 10); var mo = parseInt(p[1], 10) + 1;
            if (mo > 12) { mo = 1; y++; } return y + '-' + pad2(mo);
        })(period.endDate);

        savePeriod(period.startDate, nextM, maxEnd);
        showToast('Reopened ' + formatMonthLabel(nextM));
        renderOldTab();
    }

    function resetAllCompleted() {
        if (!confirm('Reset Old Tasbeeh tracking back to initial period end?')) return;
        var period = loadPeriod();
        var maxEnd = period.initialEnd || period.endDate;
        savePeriod(period.startDate, maxEnd, maxEnd);
        showToast('Reset old tracking period to ' + formatMonthLabel(maxEnd));
        renderOldTab();
    }

    function openCounterOld(id, monthKey) {
        if (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.openCounter === 'function') {
            window.TasbeehCurrentApp.openCounter(id, monthKey);
        }
    }

    /* ---------- Old Card HTML Generator ---------- */
    function renderOldCardHtml(item, isDhikrDone, curOldMonth, monthName) {
        var isInfinite = item.targetCount === 'infinite';
        var parts = curOldMonth.split('-');
        var yr = parseInt(parts[0], 10);
        var mo = parseInt(parts[1], 10) - 1;
        var totalDays = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getDaysInMonth === 'function')
            ? window.TasbeehCurrentApp.getDaysInMonth(yr, mo)
            : new Date(yr, mo + 1, 0).getDate();
        var completedDays = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getCompletedDaysInMonth === 'function')
            ? window.TasbeehCurrentApp.getCompletedDaysInMonth(item.id, yr, mo)
            : 0;

        var icons = (window.CONSTANTS && window.CONSTANTS.TASBEEH && window.CONSTANTS.TASBEEH.ICONS) || {};
        var targetDisplay = isInfinite ? '∞' : item.targetCount;

        var misbahaIcon = renderIcon('misbaha');
        var pencilIcon = renderIcon('tb-pencil');
        var chevronIcon = renderIcon('tb-chevron');
        var targetIcon = renderIcon('tb-target');
        var checkCircleIcon = renderIcon('tb-check-circle');
        var calendarDaysIcon = renderIcon({ name: 'calendar-days', color: 'text-muted', size: 13 });

        return '<div class="tb-card bg-white border border-borderGrey rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:border-brand min-h-[146px] select-none transition-all ' + (isDhikrDone ? 'tb-card-done opacity-80' : '') + '" data-id="' + item.id + '" data-month="' + curOldMonth + '" role="button" tabindex="0" aria-label="' + escHtml(item.title) + '">' +
            '<div class="tb-card-top flex items-start justify-between w-full">' +
            '<div class="w-[46px] h-[46px] min-w-[46px] min-h-[46px] rounded-2xl bg-dash-mintBg text-brand inline-flex items-center justify-center shrink-0 leading-none select-none overflow-hidden">' + (typeof renderIcon === 'function' ? renderIcon({ name: 'misbaha' }) : '') + '</div>' +
            '<div class="tb-card-actions flex items-center gap-1.5 shrink-0 ml-auto">' +
            '<button type="button" class="tb-btn-edit w-8 h-8 rounded-lg bg-brand-light text-brand flex items-center justify-center cursor-pointer hover:bg-brand/20 active:scale-95 transition-all p-0" data-act="tb-edit" title="Edit Dhikr" aria-label="Edit Dhikr">' + pencilIcon + '</button>' +
            chevronIcon +
            '</div>' +
            '</div>' +
            '<div class="tb-card-body flex flex-col justify-end w-full mt-2.5 min-w-0">' +
            '<h6 class="tb-card-title text-base font-bold text-brand leading-snug mb-1 truncate">' + escHtml(item.title) + '</h6>' +
            '<div class="tb-card-meta flex flex-col gap-1 w-full">' +
            '<div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' +
            targetIcon +
            '<span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs">Target: <span class="tb-val-num font-semibold text-brand">' + targetDisplay + '</span> / day</span>' +
            '</div>' +
            '<div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' +
            checkCircleIcon +
            '<span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs"><span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand text-white leading-none" style="font-size:0.72rem;padding:0.25rem 0.6rem;">Done</span><strong class="tb-val-done ml-1 font-bold text-brand">' + completedDays + '</strong></span>' +
            '</div>' +
            '<div class="tb-meta-row flex items-center gap-1.5 text-xs text-gr-text font-medium truncate leading-tight">' +
            calendarDaysIcon +
            '<span class="tb-meta-text inline-flex items-center overflow-hidden truncate text-xs">Total: <span class="tb-val-total text-gr-textMuted font-medium">' + totalDays + ' days</span></span>' +
            '</div>' +
            (isDhikrDone
                ? '<div class="tb-meta-row tb-meta-sub-row"><span class="text-brand fw-bold" style="font-size: 11px;">' + renderIcon({ name: 'circle-check', className: 'me-1' }) + 'Month Completed</span></div>'
                : '') +
            '</div>' +
            '</div>' +
            '</div>';
    }

    /* ---------- Rendering: Old Tab (Single Active Previous Month) ---------- */
    function renderOldTab() {
        var oldBody = getEl(ELEMENT_IDS.OLD_BODY || 'tbOldBody');
        if (!oldBody) return;

        var emptyRangeEl = getEl(ELEMENT_IDS.OLD_EMPTY_RANGE || 'tbOldEmptyRange');
        var allCompletedEl = getEl(ELEMENT_IDS.OLD_ALL_COMPLETED || 'tbOldAllCompleted');
        var contentEl = getEl(ELEMENT_IDS.OLD_CONTENT || 'tbOldContent');

        var period = loadPeriod();
        var curOldMonth = getCurrentOldMonth();
        var curMonthName = formatMonthLabel(getCurrentMonthKey());
        var initialMaxEnd = period.initialEnd || period.endDate;

        // Check if no previous months exist in configured period
        if (initialMaxEnd < period.startDate) {
            var subNone = getEl(ELEMENT_IDS.HEADER_SUB || 'tbHeaderSub');
            if (subNone) subNone.textContent = 'None';
            if (emptyRangeEl) {
                emptyRangeEl.classList.remove('d-none');
                var startLabel = getEl(ELEMENT_IDS.OLD_EMPTY_RANGE_START || 'tbOldEmptyRangeStart');
                if (startLabel) startLabel.textContent = formatMonthLabel(period.startDate);
                var curLabel = getEl(ELEMENT_IDS.OLD_EMPTY_RANGE_CUR || 'tbOldEmptyRangeCur');
                if (curLabel) curLabel.textContent = curMonthName;
            }
            if (allCompletedEl) allCompletedEl.classList.add('d-none');
            if (contentEl) contentEl.classList.add('d-none');
            return;
        }

        // If all previous months in period are completed!
        if (!curOldMonth) {
            var subAll = getEl(ELEMENT_IDS.HEADER_SUB || 'tbHeaderSub');
            if (subAll) subAll.textContent = 'All Completed';
            if (allCompletedEl) {
                allCompletedEl.classList.remove('d-none');
                var startDoneLabel = getEl(ELEMENT_IDS.OLD_ALL_COMPLETED_START || 'tbOldAllCompletedStart');
                if (startDoneLabel) startDoneLabel.textContent = formatMonthLabel(period.startDate);
            }
            if (emptyRangeEl) emptyRangeEl.classList.add('d-none');
            if (contentEl) contentEl.classList.add('d-none');
            return;
        }

        if (emptyRangeEl) emptyRangeEl.classList.add('d-none');
        if (allCompletedEl) allCompletedEl.classList.add('d-none');
        if (contentEl) contentEl.classList.remove('d-none');

        var monthName = formatMonthLabel(curOldMonth);

        // Header subtitle update: shows present active month under Old
        var sub = getEl(ELEMENT_IDS.HEADER_SUB || 'tbHeaderSub');
        if (sub) {
            sub.textContent = monthName;
        }

        var items = getItems();
        var parts = curOldMonth.split('-');
        var yr = parseInt(parts[0], 10);
        var mo = parseInt(parts[1], 10) - 1;
        var totalDays = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getDaysInMonth === 'function')
            ? window.TasbeehCurrentApp.getDaysInMonth(yr, mo)
            : new Date(yr, mo + 1, 0).getDate();

        // Partition items into To Do and Completed for this active old month
        var todoOldItems = [];
        var doneOldItems = [];

        items.forEach(function (item) {
            var isInfinite = item.targetCount === 'infinite';
            var completedDays = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getCompletedDaysInMonth === 'function')
                ? window.TasbeehCurrentApp.getCompletedDaysInMonth(item.id, yr, mo)
                : 0;
            var isDhikrDone = !isInfinite && completedDays >= totalDays;
            if (isDhikrDone) {
                doneOldItems.push(item);
            } else {
                todoOldItems.push(item);
            }
        });

        var isAllDone = todoOldItems.length === 0 && items.length > 0;
        var advanceBanner = getEl(ELEMENT_IDS.OLD_ADVANCE_BANNER || 'tbOldAdvanceBanner');
        var advanceMsg = getEl(ELEMENT_IDS.OLD_ADVANCE_BANNER_MSG || 'tbOldAdvanceBannerMsg');
        if (advanceBanner) {
            if (isAllDone) {
                advanceBanner.classList.remove('d-none');
                if (advanceMsg) advanceMsg.textContent = 'All targets for ' + monthName + ' are completed!';
            } else {
                advanceBanner.classList.add('d-none');
            }
        }

        var todoOldCardsHtml = todoOldItems.length > 0
            ? todoOldItems.map(function (it) { return renderOldCardHtml(it, false, curOldMonth, monthName); }).join('')
            : '<div class="col-span-2 border border-borderGrey p-4 text-center rounded-2xl bg-white">' +
              renderIcon({ name: 'circle-check', color: 'text-brand', size: 'fs-3', className: 'mb-2' }) +
              '<div class="fw-bold text-gr1">All Dhikrs for ' + monthName + ' Completed!</div>' +
              '</div>';

        var doneOldCardsHtml = doneOldItems.length > 0
            ? doneOldItems.map(function (it) { return renderOldCardHtml(it, true, curOldMonth, monthName); }).join('')
            : '<div class="col-span-2 border border-borderGrey p-4 text-center rounded-2xl bg-white">' +
              '<div class="text-muted small">No completed Dhikrs for ' + monthName + ' yet. Completed chants will appear here.</div>' +
              '</div>';

        var isOldDoneExpanded = doneOldItems.length > 0;

        // Update counts on badges
        var todoBadge = getEl(ELEMENT_IDS.OLD_TODO_BADGE || 'tbOldTodoBadge');
        if (todoBadge) todoBadge.textContent = todoOldItems.length;

        var doneBadge = getEl(ELEMENT_IDS.OLD_DONE_BADGE || 'tbOldDoneBadge');
        if (doneBadge) doneBadge.textContent = doneOldItems.length;

        var vm = (typeof getTasbeehViewModel === 'function') ? getTasbeehViewModel() : null;
        var hasKo = typeof ko !== 'undefined' && vm && typeof vm.oldTodoItems === 'function';

        function mapOldCard(item, isComplete) {
            var isInfinite = item.targetCount === 'infinite';
            var parts = curOldMonth.split('-');
            var yr = parseInt(parts[0], 10);
            var mo = parseInt(parts[1], 10) - 1;
            var totalDays = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getDaysInMonth === 'function')
                ? window.TasbeehCurrentApp.getDaysInMonth(yr, mo)
                : new Date(yr, mo + 1, 0).getDate();
            var completedDays = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getCompletedDaysInMonth === 'function')
                ? window.TasbeehCurrentApp.getCompletedDaysInMonth(item.id, yr, mo)
                : 0;

            return {
                id: item.id,
                title: item.title,
                month: curOldMonth,
                targetCount: isInfinite ? '∞' : item.targetCount,
                completedDays: completedDays,
                totalDays: totalDays,
                isComplete: !!isComplete,
                isTodayDone: false,
                onCardClick: function (d, e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                    if (window.TasbeehApp && typeof window.TasbeehApp.openCounterFromHome === 'function') {
                        window.TasbeehApp.openCounterFromHome(item.id, curOldMonth, 'old');
                    } else if (window.TasbeehApp && typeof window.TasbeehApp.openCounterView === 'function') {
                        window.TasbeehApp.openCounterView(item.id, curOldMonth);
                    }
                },
                onEditClick: function (d, e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                    if (window.TasbeehApp && typeof window.TasbeehApp.openEditModal === 'function') {
                        window.TasbeehApp.openEditModal(item.id);
                    }
                }
            };
        }

        // Populate grids
        var todoGrid = getEl(ELEMENT_IDS.OLD_TODO_GRID || 'tbOldTodoGrid');
        var doneGrid = getEl(ELEMENT_IDS.OLD_DONE_GRID || 'tbOldDoneGrid');

        if (hasKo) {
            vm.oldTodoItems(todoOldItems.map(function (it) { return mapOldCard(it, false); }));
            vm.oldDoneItems(doneOldItems.map(function (it) { return mapOldCard(it, true); }));
        } else {
            if (todoGrid) todoGrid.innerHTML = todoOldCardsHtml;
            if (doneGrid) doneGrid.innerHTML = doneOldCardsHtml;
        }

        // Update Done collapse expansion state
        var doneToggle = getEl(ELEMENT_IDS.OLD_DONE_TOGGLE || 'tbOldDoneToggle');
        var doneList = getEl(ELEMENT_IDS.OLD_DONE_LIST || 'tbOldDoneList');
        if (doneToggle) {
            if (isOldDoneExpanded) {
                doneToggle.classList.remove('collapsed');
                doneToggle.setAttribute('aria-expanded', 'true');
            } else {
                doneToggle.classList.add('collapsed');
                doneToggle.setAttribute('aria-expanded', 'false');
            }
        }
        if (doneList) {
            if (isOldDoneExpanded) {
                doneList.classList.add('show');
            } else {
                doneList.classList.remove('show');
            }
        }
    }

    /* ---------- Period Settings Modal Management ---------- */
    function updatePeriodPreview() {
        var startInp = getEl('tbPeriodStart');
        var endInp = getEl('tbPeriodEnd');
        var previewText = getEl('tbPeriodPreviewText');
        if (!startInp || !endInp || !previewText) return;

        var startVal = startInp.value;
        var endVal = endInp.value || td();

        if (!startVal) {
            previewText.innerHTML = '<span class="text-danger">Please pick a Start Date.</span>';
            return;
        }

        var startMonth = typeof normalizeMonthKey === 'function' ? normalizeMonthKey(startVal) : startVal.slice(0, 7);
        var endMonth = typeof normalizeMonthKey === 'function' ? normalizeMonthKey(endVal) : endVal.slice(0, 7);
        var curMonthName = formatMonthLabel(getCurrentMonthKey());
        var oldMonths = getPreviousMonthsList(startMonth, endMonth);

        if (oldMonths.length === 0) {
            previewText.innerHTML =
                '<div><strong>Current Month:</strong> ' + curMonthName + '</div>' +
                '<div class="text-warning mt-1">' + renderIcon({ name: 'triangle-exclamation', className: 'me-1' }) + 'Start Date is in or after current month. No previous months will show in Old tab.</div>';
        } else {
            var newestOldMonth = formatMonthLabel(oldMonths[0]);
            var oldestMonth = formatMonthLabel(oldMonths[oldMonths.length - 1]);
            previewText.innerHTML =
                '<div class="mb-1"><strong>Old Tab Timeline:</strong> ' + formatMonthLabel(startMonth) + ' → ' + formatMonthLabel(endMonth) + '</div>' +
                '<div class="mb-1"><strong>Step-by-Step:</strong> Starts at <strong>' + newestOldMonth + '</strong>, then navigates backward month by month till <strong>' + oldestMonth + '</strong> (' + oldMonths.length + ' total months).</div>' +
                '<div><strong>Current Tab:</strong> ' + curMonthName + '</div>';
        }
    }

    function openPeriodModal() {
        var p = loadPeriod();
        var startInp = getEl('tbPeriodStart');
        var endInp = getEl('tbPeriodEnd');
        if (startInp) {
            var sVal = p.startDate || (new Date().getFullYear() + '-01');
            startInp.value = sVal.length === 7 ? (sVal + '-01') : sVal;
        }
        if (endInp) {
            var eVal = p.initialEnd || p.endDate || td();
            endInp.value = eVal.length === 7 ? (eVal + '-01') : eVal;
        }

        updatePeriodPreview();

        var modalEl = getEl('tasbeehPeriodModal');
        if (modalEl) {
            if (!periodModalInstance) {
                var ModalClass = window.UIModal || (window.bootstrap && window.bootstrap.Modal);
                periodModalInstance = ModalClass ? ModalClass.getOrCreateInstance(modalEl) : null;
            }
            if (periodModalInstance) periodModalInstance.show();
        }
    }

    function savePeriodModal() {
        var startInp = getEl('tbPeriodStart');
        var endInp = getEl('tbPeriodEnd');
        if (!startInp) return;

        var startRaw = startInp.value;
        var endRaw = (endInp && endInp.value) ? endInp.value : td();

        if (!startRaw) {
            alert('Please select a Start Date.');
            startInp.focus();
            return;
        }

        var startMonth = typeof normalizeMonthKey === 'function' ? normalizeMonthKey(startRaw) : startRaw.slice(0, 7);
        var endMonth = typeof normalizeMonthKey === 'function' ? normalizeMonthKey(endRaw) : endRaw.slice(0, 7);

        if (endMonth < startMonth) {
            alert('End Date must be on or after Start Date.');
            if (endInp) endInp.focus();
            return;
        }

        savePeriod(startMonth, endMonth, endMonth);

        if (periodModalInstance) {
            periodModalInstance.hide();
        }

        currentOldMonthKey = null;
        showToast('Tasbeeh period updated');
        if (window.TasbeehApp && typeof window.TasbeehApp.switchTab === 'function') {
            window.TasbeehApp.switchTab('old');
        } else {
            renderOldTab();
        }
    }

    function resetPeriodModal() {
        var now = new Date();
        var curMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
        var defaultStart = now.getFullYear() + '-01';
        var defaultEnd = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');

        var startInp = getEl('tbPeriodStart');
        var endInp = getEl('tbPeriodEnd');
        if (startInp) startInp.value = defaultStart + '-01';
        if (endInp) endInp.value = defaultEnd + '-01';

        savePeriod(defaultStart, defaultEnd, defaultEnd);
        updatePeriodPreview();

        if (periodModalInstance) {
            periodModalInstance.hide();
        }

        currentOldMonthKey = null;
        showToast('Period reset to current year');
        if (window.TasbeehApp && typeof window.TasbeehApp.switchTab === 'function') {
            window.TasbeehApp.switchTab('old');
        } else {
            renderOldTab();
        }
    }

    function setPeriodPreset(type) {
        var now = new Date();
        var curMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
        var prevMonth = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');
        var startInp = getEl('tbPeriodStart');
        var endInp = getEl('tbPeriodEnd');
        if (!startInp || !endInp) return;

        var startStr = '';
        var endStr = prevMonth + '-01';

        if (type === PERIOD_PRESETS.THIS_YEAR) {
            startStr = now.getFullYear() + '-01-01';
        } else if (type === PERIOD_PRESETS.LAST_6_MONTHS) {
            var d6 = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            startStr = d6.getFullYear() + '-' + pad2(d6.getMonth() + 1) + '-01';
        } else if (type === PERIOD_PRESETS.LAST_1_YEAR) {
            var d12 = new Date(now.getFullYear() - 1, now.getMonth(), 1);
            startStr = d12.getFullYear() + '-' + pad2(d12.getMonth() + 1) + '-01';
        }

        startInp.value = startStr;
        endInp.value = endStr;
        updatePeriodPreview();
    }

    /* ---------- Event Bindings ---------- */
    function bindEvents() {
        /* Period Settings Modal button in header */
        var settingsBtn = getEl('tbSettingsBtn');
        if (settingsBtn) {
            settingsBtn.onclick = openPeriodModal;
        }

        /* Period Modal controls */
        var btnSavePeriod = getEl('tbBtnSavePeriod');
        if (btnSavePeriod) {
            btnSavePeriod.onclick = savePeriodModal;
        }

        var btnResetPeriod = getEl('tbBtnResetPeriod');
        if (btnResetPeriod) {
            btnResetPeriod.onclick = resetPeriodModal;
        }

        var presetThisYear = getEl('tbPresetThisYear');
        if (presetThisYear) {
            presetThisYear.onclick = function () { setPeriodPreset(PERIOD_PRESETS.THIS_YEAR); };
        }

        var preset6M = getEl('tbPreset6Months');
        if (preset6M) {
            preset6M.onclick = function () { setPeriodPreset(PERIOD_PRESETS.LAST_6_MONTHS); };
        }

        var preset1Y = getEl('tbPreset1Year');
        if (preset1Y) {
            preset1Y.onclick = function () { setPeriodPreset(PERIOD_PRESETS.LAST_1_YEAR); };
        }

        var pStart = getEl('tbPeriodStart');
        var pEnd = getEl('tbPeriodEnd');
        if (pStart) pStart.oninput = updatePeriodPreview;
        if (pEnd) pEnd.oninput = updatePeriodPreview;

        /* Old tab delegations */
        var oldBody = getEl('tbOldBody');
        if (oldBody) {
            oldBody.onclick = function (e) {
                var btn = e.target.closest('button[data-act]');
                if (btn) {
                    var act = btn.dataset.act;
                    if (act === 'tb-old-advance') {
                        advanceOldMonth();
                    } else if (act === 'tb-old-reopen') {
                        reopenLastMonth();
                    } else if (act === 'tb-reset-all-completed') {
                        resetAllCompleted();
                    } else if (act === 'tb-open-settings' || act === 'tb-change-period') {
                        openPeriodModal();
                    }
                    return;
                }

                var editBtn = e.target.closest('button[data-act="tb-edit"]');
                if (editBtn) {
                    var cardForEdit = editBtn.closest('.tb-card[data-id]');
                    if (cardForEdit) {
                        e.stopPropagation();
                        if (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.openModal === 'function') {
                            window.TasbeehCurrentApp.openModal(cardForEdit.dataset.id);
                        }
                    }
                    return;
                }

                var card = e.target.closest('.tb-card[data-id]');
                if (card) {
                    var id = card.dataset.id;
                    var mKey = card.dataset.month;
                    openCounterOld(id, mKey);
                }
            };

            oldBody.onkeydown = function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    var btn = e.target.closest('button[data-act]');
                    if (btn) return;
                    var card = e.target.closest('.tb-card[data-id]');
                    if (card) {
                        e.preventDefault();
                        var id = card.dataset.id;
                        var mKey = card.dataset.month;
                        openCounterOld(id, mKey);
                    }
                }
            };
        }
    }

    /* ---------- Public API ---------- */
    function init() {
        loadPeriod();
        bindEvents();
    }

    var api = {
        init: init,
        renderOldTab: renderOldTab,
        getCurrentOldMonth: getCurrentOldMonth,
        checkAndAdvanceMonth: checkAndAdvanceMonth,
        advanceOldMonth: advanceOldMonth,
        markMonthCompleted: markMonthCompleted,
        markCurrentMonthCompleted: markMonthCompleted,
        reopenLastMonth: reopenLastMonth,
        resetAllCompleted: resetAllCompleted,
        openPeriodModal: openPeriodModal,
        savePeriodModal: savePeriodModal,
        resetPeriodModal: resetPeriodModal,
        loadPeriod: loadPeriod,
        savePeriod: savePeriod,
        openCounterOld: openCounterOld
    };

    // Bridge Old methods onto window.TasbeehApp for full backwards compatibility
    if (window.TasbeehApp) {
        window.TasbeehApp.openPeriodModal = openPeriodModal;
        window.TasbeehApp.checkAndAdvanceMonth = checkAndAdvanceMonth;
        window.TasbeehApp.advanceOldMonth = advanceOldMonth;
        window.TasbeehApp.markCurrentMonthCompleted = markMonthCompleted;
        window.TasbeehApp.reopenLastMonth = reopenLastMonth;
        window.TasbeehApp.resetAllCompleted = resetAllCompleted;
        window.TasbeehApp.getCurrentOldMonth = getCurrentOldMonth;
        window.TasbeehApp.loadPeriod = loadPeriod;
        window.TasbeehApp.savePeriod = savePeriod;
        window.TasbeehApp.renderOldTab = renderOldTab;
    }

    return api;
})();


/* ============================================================
   Nur Prayer — Digital Tasbeeh: History & Settings Module
   Submodule: Tasbeeh History & Settings
   Handles:
     - History bottom tab rendering inside Digital Tasbeeh
     - Period settings (start date, end date, presets)
     - Sequential monthly clearance history & progress overview
     - Reopening completed months and resetting history
     - Modal compatibility bridges
   ============================================================ */
'use strict';

window.TasbeehHistoryApp = (function () {
    var TASBEEH_CONSTANTS = window.TASBEEH_CONSTANTS || (window.CONSTANTS && window.CONSTANTS.TASBEEH) || {};
    var ELEMENT_IDS = TASBEEH_CONSTANTS.ELEMENT_IDS || {};
    var PERIOD_KEY = (TASBEEH_CONSTANTS.STORAGE_KEYS && TASBEEH_CONSTANTS.STORAGE_KEYS.PERIOD) || 'app_tasbeeh_period';
    var PERIOD_PRESETS = TASBEEH_CONSTANTS.PERIOD_PRESETS || {
        THIS_YEAR: 'this-year',
        LAST_6_MONTHS: '6-months',
        LAST_1_YEAR: '1-year'
    };

    function getEl(id) {
        return document.getElementById(id);
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function showToast(msg, duration) {
        if (window.TasbeehApp && typeof window.TasbeehApp.showToast === 'function') {
            window.TasbeehApp.showToast(msg, duration);
        } else if (typeof window.showToast === 'function') {
            window.showToast(msg, duration);
        }
    }

    /* ---------- Period Storage Layer (Delegated to TasbeehOldApp) ---------- */
    function loadPeriod() {
        if (window.TasbeehOldApp && typeof window.TasbeehOldApp.loadPeriod === 'function') {
            return window.TasbeehOldApp.loadPeriod();
        }
        var raw = localStorage.getItem(PERIOD_KEY);
        var now = new Date();
        var curMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
        var defaultStart = now.getFullYear() + '-01';
        var defaultEnd = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');

        if (!raw) {
            return { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
        }
        try {
            var p = JSON.parse(raw);
            if (!p || !p.startDate) {
                return { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
            }
            var s = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(p.startDate) : String(p.startDate).slice(0, 7)) || defaultStart;
            var e = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(p.endDate) : String(p.endDate).slice(0, 7)) || defaultEnd;
            var initE = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(p.initialEnd) : String(p.initialEnd || '').slice(0, 7)) || e;
            return { startDate: s, endDate: e, initialEnd: initE, updatedAt: p.updatedAt || Date.now() };
        } catch (_) {
            return { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
        }
    }

    function savePeriod(start, end, initialEnd) {
        if (window.TasbeehOldApp && typeof window.TasbeehOldApp.savePeriod === 'function') {
            return window.TasbeehOldApp.savePeriod(start, end, initialEnd);
        }
        var s = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(start) : String(start).slice(0, 7));
        var e = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(end) : String(end).slice(0, 7));
        var initE = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(initialEnd) : String(initialEnd || '').slice(0, 7)) || e;
        var p = { startDate: s, endDate: e, initialEnd: initE, updatedAt: Date.now() };
        try { localStorage.setItem(PERIOD_KEY, JSON.stringify(p)); } catch (_) {}
        return p;
    }

    /* ---------- Render History Tab ---------- */
    function renderHistoryTab() {
        var body = getEl(ELEMENT_IDS.HISTORY_BODY || 'tbHistoryBody');
        if (!body) return;

        var period = loadPeriod();
        var maxEnd = period.initialEnd || period.endDate;
        var allOldMonths = typeof getPreviousMonthsList === 'function'
            ? getPreviousMonthsList(period.startDate, maxEnd)
            : [];

        var curOldMonth = (window.TasbeehOldApp && typeof window.TasbeehOldApp.getCurrentOldMonth === 'function')
            ? window.TasbeehOldApp.getCurrentOldMonth()
            : (period.endDate >= period.startDate ? period.endDate : null);

        var totalMonthsCount = allOldMonths.length;
        var completedCount = 0;
        allOldMonths.forEach(function (m) {
            if (m > period.endDate || period.endDate < period.startDate) {
                completedCount++;
            }
        });
        var pendingCount = Math.max(0, totalMonthsCount - completedCount - (curOldMonth ? 1 : 0));
        var percent = totalMonthsCount > 0 ? Math.round((completedCount / totalMonthsCount) * 100) : 0;

        // The month eligible to be reopened is the one directly after period.endDate
        var reopenTargetMonth = null;
        if (period.endDate < maxEnd) {
            reopenTargetMonth = typeof getNextMonthKey === 'function' ? getNextMonthKey(period.endDate) : null;
        }

        // Render Months List items
        var monthsListHtml = '';
        if (allOldMonths.length === 0) {
            monthsListHtml =
                '<div class="text-center py-4 text-muted small">' +
                '  ' + renderIcon({ name: 'calendar-xmark', size: 'fs-2', className: 'opacity-50 mb-2 d-block' }) +
                '  No past months found in this period range. Check your Start and End dates.' +
                '</div>';
        } else {
            monthsListHtml = allOldMonths.map(function (mKey, idx) {
                var isCompleted = (mKey > period.endDate) || (period.endDate < period.startDate);
                var isActive = (mKey === curOldMonth);
                var monthLabel = typeof formatMonthLabel === 'function' ? formatMonthLabel(mKey) : mKey;

                var badgeClass = isCompleted ? 'bg-brand-light text-brand border border-brand-subtle'
                    : (isActive ? 'bg-brand text-white border-0'
                        : 'bg-surface text-secondary border');

                var badgeIcon = isCompleted ? renderIcon({ name: 'circle-check', className: 'me-1' })
                    : (isActive ? renderIcon({ name: 'play', className: 'me-1' })
                        : renderIcon({ name: 'clock', className: 'me-1' }));

                var badgeText = isCompleted ? 'Completed'
                    : (isActive ? 'In Progress' : 'Pending');

                var canReopenThis = (mKey === reopenTargetMonth);
                var reopenBtn = canReopenThis
                    ? '<button type="button" class="inline-flex items-center justify-center bg-transparent border border-yellow-500 text-yellow-600 font-semibold rounded-full px-2 py-0 ml-auto text-[11px] hover:bg-yellow-50 transition-colors cursor-pointer select-none" data-act="tb-old-reopen" title="Reopen this month to recount">' + renderIcon({ name: 'arrow-rotate-left', className: 'mr-1' }) + ' Reopen</button>'
                    : '';

                return (
                    '<div class="flex items-center justify-between p-2 rounded-3 bg-white border border-borderGrey mb-2" data-month="' + mKey + '">' +
                    '  <div class="flex items-center gap-2 min-w-0">' +
                    '    <span class="text-muted fw-bold small" style="width: 24px; font-size: 11px;">#' + (totalMonthsCount - idx) + '</span>' +
                    '    <span class="fw-bold text-gr1 small text-truncate" style="font-size: 13.5px;">' + escHtml(monthLabel) + '</span>' +
                    '  </div>' +
                    '  <div class="flex items-center gap-2 shrink-0">' +
                    '    <span class="badge rounded-pill ' + badgeClass + ' inline-flex items-center" style="font-size: 10.5px; font-weight: 600; padding: 4px 8px;">' +
                    badgeIcon + badgeText +
                    '    </span>' +
                    reopenBtn +
                    '  </div>' +
                    '</div>'
                );
            }).join('');
        }

        var startInputVal = period.startDate ? (period.startDate.length === 7 ? period.startDate + '-01' : period.startDate) : '';
        var endInputVal = maxEnd ? (maxEnd.length === 7 ? maxEnd + '-01' : maxEnd) : '';

        // Update Header Summary Banner
        var percentBadge = getEl(ELEMENT_IDS.HIST_PERCENT_BADGE || 'tbHistPercentBadge');
        if (percentBadge) percentBadge.textContent = percent + '% Cleared';

        var progressBar = getEl(ELEMENT_IDS.HIST_PROGRESS_BAR || 'tbHistProgressBar');
        if (progressBar) {
            progressBar.style.width = percent + '%';
            progressBar.setAttribute('aria-valuenow', percent);
        }

        var totalMonthsEl = getEl(ELEMENT_IDS.HIST_TOTAL_MONTHS || 'tbHistTotalMonths');
        if (totalMonthsEl) totalMonthsEl.textContent = totalMonthsCount;

        var clearedMonthsEl = getEl(ELEMENT_IDS.HIST_CLEARED_MONTHS || 'tbHistClearedMonths');
        if (clearedMonthsEl) clearedMonthsEl.textContent = completedCount;

        var pendingMonthsEl = getEl(ELEMENT_IDS.HIST_PENDING_MONTHS || 'tbHistPendingMonths');
        if (pendingMonthsEl) pendingMonthsEl.textContent = pendingCount;

        // Update Period Settings Inputs
        var startInput = getEl(ELEMENT_IDS.HIST_PERIOD_START || 'tbHistPeriodStart');
        if (startInput) startInput.value = startInputVal;

        var endInput = getEl(ELEMENT_IDS.HIST_PERIOD_END || 'tbHistPeriodEnd');
        if (endInput) endInput.value = endInputVal;

        // Toggle Reset Cleared button
        var resetBtn = getEl(ELEMENT_IDS.HIST_RESET_COMPLETED_BTN || 'tbHistResetCompletedBtn');
        if (resetBtn) {
            if (completedCount > 0) {
                resetBtn.classList.remove('d-none');
            } else {
                resetBtn.classList.add('d-none');
            }
        }

        // Render Months List
        var listEl = getEl(ELEMENT_IDS.HISTORY_LIST || 'tbHistoryList');
        if (listEl) {
            listEl.innerHTML = monthsListHtml;
        }
    }

    /* ---------- Setting Handlers ---------- */
    function applyPreset(presetType) {
        var now = new Date();
        var curMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
        var prevMonth = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');
        var startInp = getEl('tbHistPeriodStart');
        var endInp = getEl('tbHistPeriodEnd');
        if (!startInp || !endInp) return;

        var startStr = '';
        var endStr = prevMonth + '-01';

        if (presetType === PERIOD_PRESETS.THIS_YEAR) {
            startStr = now.getFullYear() + '-01-01';
        } else if (presetType === PERIOD_PRESETS.LAST_6_MONTHS) {
            var d6 = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            startStr = d6.getFullYear() + '-' + pad2(d6.getMonth() + 1) + '-01';
        } else if (presetType === PERIOD_PRESETS.LAST_1_YEAR) {
            var d12 = new Date(now.getFullYear() - 1, now.getMonth(), 1);
            startStr = d12.getFullYear() + '-' + pad2(d12.getMonth() + 1) + '-01';
        }

        startInp.value = startStr;
        endInp.value = endStr;
    }

    function saveHistoryPeriod() {
        var startInp = getEl('tbHistPeriodStart');
        var endInp = getEl('tbHistPeriodEnd');
        if (!startInp) return;

        var startRaw = startInp.value;
        var endRaw = (endInp && endInp.value) ? endInp.value : td();

        if (!startRaw) {
            alert('Please select a Start Date.');
            startInp.focus();
            return;
        }

        var startMonth = typeof normalizeMonthKey === 'function' ? normalizeMonthKey(startRaw) : startRaw.slice(0, 7);
        var endMonth = typeof normalizeMonthKey === 'function' ? normalizeMonthKey(endRaw) : endRaw.slice(0, 7);

        if (endMonth < startMonth) {
            alert('End Date must be on or after Start Date.');
            if (endInp) endInp.focus();
            return;
        }

        savePeriod(startMonth, endMonth, endMonth);
        showToast('Tasbeeh period settings updated');
        renderHistoryTab();

        // Also notify old tab if needed
        if (window.TasbeehOldApp && typeof window.TasbeehOldApp.renderOldTab === 'function') {
            window.TasbeehOldApp.renderOldTab();
        }
    }

    function resetHistoryPeriod() {
        var now = new Date();
        var curMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
        var defaultStart = now.getFullYear() + '-01';
        var defaultEnd = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');

        savePeriod(defaultStart, defaultEnd, defaultEnd);
        showToast('Period reset to current year');
        renderHistoryTab();

        if (window.TasbeehOldApp && typeof window.TasbeehOldApp.renderOldTab === 'function') {
            window.TasbeehOldApp.renderOldTab();
        }
    }

    function init() {
        loadPeriod();
    }

    var api = {
        init: init,
        loadPeriod: loadPeriod,
        savePeriod: savePeriod,
        renderHistoryTab: renderHistoryTab,
        applyPreset: applyPreset,
        saveHistoryPeriod: saveHistoryPeriod,
        resetHistoryPeriod: resetHistoryPeriod
    };

    if (window.TasbeehApp) {
        window.TasbeehApp.renderHistoryTab = renderHistoryTab;
        window.TasbeehApp.loadPeriod = loadPeriod;
        window.TasbeehApp.savePeriod = savePeriod;
    }

    return api;
})();


// Cross-module bridge verification
if (typeof window !== 'undefined' && window.TasbeehApp && window.TasbeehHomeApp) {
    window.TasbeehApp.renderHomeTab = window.TasbeehHomeApp.renderHomeTab;
}

export {
    tasbeehViewModel,
    escHtml
};

if (typeof window !== 'undefined') {
    window.TasbeehPageViewModel = TasbeehPageViewModel;
    window.getTasbeehViewModel = getTasbeehViewModel;
    window.initTasbeeh = initTasbeeh;
    window.registerTasbeehComponents = registerTasbeehComponents;
    window.escHtml = escHtml;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TasbeehPageTemplate: TasbeehPageTemplate,
        TasbeehHeaderTemplate: TasbeehHeaderTemplate,
        TasbeehCounterCardTemplate: TasbeehCounterCardTemplate,
        TasbeehProgressCircleTemplate: TasbeehProgressCircleTemplate,
        TasbeehGoalSetterTemplate: TasbeehGoalSetterTemplate,
        TasbeehNavTabTemplate: TasbeehNavTabTemplate,
        TasbeehPageViewModel: TasbeehPageViewModel,
        getTasbeehViewModel: getTasbeehViewModel,
        initTasbeeh: initTasbeeh,
        registerTasbeehComponents: registerTasbeehComponents,
        escHtml: escHtml
    };
    module.exports.default = (typeof window !== 'undefined' ? window.TasbeehApp : null);
}

export default (typeof window !== 'undefined' ? window.TasbeehApp : null);
