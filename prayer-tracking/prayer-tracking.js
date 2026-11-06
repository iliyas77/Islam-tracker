/* ============================================================
   Nur Prayer — Prayer Tracking Feature Module
   Path: prayer-tracking.js
   Consolidated Module (Prayer Card, Current Prayer, Old Tracking, Performance, History)
   ============================================================ */

/* ============================================================
   Nur Prayer — Reusable Prayer Tracker Card Component
   Submodule: Prayer Tracker Card Component
   Reusable UI component for Current Prayer & Old Tracking.
   ============================================================ */


var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var PRAYER_CONSTANTS = _win.PRAYER_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.PRAYER) || {};
var COMMON_CONSTANTS = _win.COMMON_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.COMMON) || {};
var P = PRAYER_CONSTANTS.NAMES || _win.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
if (typeof window !== 'undefined') window.P = P;
var T = _win.T || Object.assign({}, PRAYER_CONSTANTS.DEFAULT_TIMINGS || {});
if (typeof window !== 'undefined') window.T = T;
var sd = _win.sd || (typeof td === 'function' ? td() : new Date().toISOString().slice(0, 10));
if (typeof window !== 'undefined') window.sd = sd;

var PRAYER_CARD_ICONS = PRAYER_CONSTANTS.CARD_ICONS || (_win.CONSTANTS && _win.CONSTANTS.PRAYER && _win.CONSTANTS.PRAYER.CARD_ICONS) || _win.PRAYER_CARD_ICONS || {};
var MONTH_NAMES = COMMON_CONSTANTS.MONTH_NAMES || (_win.CONSTANTS && ((_win.CONSTANTS.COMMON && _win.CONSTANTS.COMMON.MONTH_NAMES) || (_win.CONSTANTS.DATE && _win.CONSTANTS.DATE.MONTH_NAMES))) || _win.MONTH_NAMES || [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/* ---------- Prayer Tracking Component Templates ---------- */
export const TrackerPageTemplate = { element: 'tracker-page-template', file: 'prayer-tracking/prayer-tracking.html' };
export const PrayerHeaderTemplate = { element: 'prayer-header-template', file: 'prayer-tracking/templates/prayer-header.html' };
export const PrayerTrackerCardTemplate = { element: 'prayer-tracker-card-template', file: 'prayer-tracking/templates/prayer-tracker-card.html' };
export const PrayerRowTemplate = { element: 'prayer-row-template', file: 'prayer-tracking/templates/prayer-row.html' };
export const PrayerStatCardTemplate = { element: 'prayer-stat-card-template', file: 'prayer-tracking/templates/prayer-stat-card.html' };
export const PrayerPerfRingTemplate = { element: 'prayer-perf-ring-template', file: 'prayer-tracking/templates/prayer-perf-ring.html' };
export const PrayerNavTabTemplate = { element: 'prayer-nav-tab-template', file: 'prayer-tracking/templates/prayer-nav-tab.html' };
export const PrayerHistoryCardTemplate = { element: 'prayer-history-card-template', file: 'prayer-tracking/templates/prayer-history-card.html' };

/* ---------- Knockout ViewModel & Component Registration ---------- */
var trackerViewModel = null;

export function PrayerTrackerCardViewModel(params) {
    if (params instanceof PrayerTrackerCardViewModel) {
        return params;
    }
    if (!(this instanceof PrayerTrackerCardViewModel)) {
        return new PrayerTrackerCardViewModel(params);
    }
    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = typeof ko !== 'undefined' ? ko : (typeof window !== 'undefined' ? window.ko : null);
    var self = this;

    function unwrap(v, def) {
        if (typeof v === 'function') return v();
        return (v !== undefined && v !== null) ? v : def;
    }

    self.collapsePrefix = unwrap(p.collapsePrefix, 'cur');
    self.pagePrefix = unwrap(p.pagePrefix, 'page.current');
    self.dateChipAct = unwrap(p.dateChipAct, '');
    self.dateChipText = (k && k.isObservable(p.dateChipText)) ? p.dateChipText : ((k && k.observable) ? k.observable(unwrap(p.dateChipText, '')) : unwrap(p.dateChipText, ''));
    self.badgeText = (k && k.isObservable(p.badgeText)) ? p.badgeText : ((k && k.observable) ? k.observable(unwrap(p.badgeText, '')) : unwrap(p.badgeText, ''));
    self.badgeAct = unwrap(p.badgeAct, '');
    self.actionBtnText = (k && k.isObservable(p.actionBtnText)) ? p.actionBtnText : ((k && k.observable) ? k.observable(unwrap(p.actionBtnText, '')) : unwrap(p.actionBtnText, ''));
    self.actionBtnAct = unwrap(p.actionBtnAct, '');
    self.missedGroupTitle = (k && k.isObservable(p.missedGroupTitle)) ? p.missedGroupTitle : ((k && k.observable) ? k.observable(unwrap(p.missedGroupTitle, 'MISSED')) : unwrap(p.missedGroupTitle, 'MISSED'));
    self.missedRows = (k && k.isObservable(p.missedRows)) ? p.missedRows : ((k && k.observableArray) ? k.observableArray(unwrap(p.missedRows, [])) : function () { return unwrap(p.missedRows, []); });
    self.doneGroupTitle = (k && k.isObservable(p.doneGroupTitle)) ? p.doneGroupTitle : ((k && k.observable) ? k.observable(unwrap(p.doneGroupTitle, 'DONE')) : unwrap(p.doneGroupTitle, 'DONE'));
    self.doneRows = (k && k.isObservable(p.doneRows)) ? p.doneRows : ((k && k.observableArray) ? k.observableArray(unwrap(p.doneRows, [])) : function () { return unwrap(p.doneRows, []); });
}

export function PrayerRowViewModel(params) {
    if (params instanceof PrayerRowViewModel) return params;
    if (!(this instanceof PrayerRowViewModel)) return new PrayerRowViewModel(params);
    var p = (params && typeof params === 'function') ? params() : (params || {});
    var self = this;
    self.prayer = p.prayer || '';
    self.time = p.time || '--:--';
    self.isDone = !!p.isDone;
    self.isUpcoming = !!p.isUpcoming;
    self.isMissed = !!p.isMissed;
    self.isStandard = (p.isStandard !== undefined) ? !!p.isStandard : (!self.isDone && !self.isUpcoming && !self.isMissed);
    self.isCurrent = !!p.isCurrent;
    self.prefix = p.prefix || p.pagePrefix || 'page.tracker';
    self.actionAct = p.actionAct || '';
    self.date = p.date || '';
    self.iconClass = p.iconClass || 'fa-solid fa-mosque';
}

export function getTrackerViewModel() {
    if (!trackerViewModel && typeof TrackerPageViewModel === 'function') {
        trackerViewModel = new TrackerPageViewModel();
    }
    return trackerViewModel;
}

export function TrackerPageViewModel(params) {
    params = params || {};
    var self = this;
    var k = typeof ko !== 'undefined' ? ko : (typeof window !== 'undefined' ? window.ko : null);

    self.currentSubTab = (k && k.observable) ? k.observable(_win.trackerSubTab || 'current') : function () { return 'current'; };

    var initialMissed = typeof tMT === 'function' ? tMT() : 0;
    self.missedCount = (k && k.observable) ? k.observable(initialMissed) : function () { return 0; };
    self.hasMissed = (k && k.pureComputed) ? k.pureComputed(function () {
        return (typeof self.missedCount === 'function' ? self.missedCount() : self.missedCount) > 0;
    }) : function () { return false; };

    self.header = {
        iconClass: (k && k.observable) ? k.observable('fa-regular fa-calendar-days text-gr-accent') : 'fa-regular fa-calendar-days text-gr-accent',
        label: (k && k.observable) ? k.observable('Current Prayer') : 'Current Prayer',
        subtitle: (k && k.observable) ? k.observable('Select a period to begin') : '',
        showSubtitle: (k && k.observable) ? k.observable(false) : false,
        missedCount: self.missedCount,
        hasMissed: self.hasMissed,
        currentSubTab: self.currentSubTab
    };

    self.currentCard = (k && k.observable) ? k.observable(new PrayerTrackerCardViewModel({
        collapsePrefix: 'cur',
        pagePrefix: 'page.current',
        dateChipAct: 'open-cal'
    })) : new PrayerTrackerCardViewModel({
        collapsePrefix: 'cur',
        pagePrefix: 'page.current',
        dateChipAct: 'open-cal'
    });

    self.oldCard = (k && k.observable) ? k.observable(new PrayerTrackerCardViewModel({
        collapsePrefix: 'old',
        pagePrefix: 'page.old',
        dateChipAct: 'old-open-cal'
    })) : new PrayerTrackerCardViewModel({
        collapsePrefix: 'old',
        pagePrefix: 'page.old',
        dateChipAct: 'old-open-cal'
    });

    self.performance = {
        hero: {
            dashArray: (k && k.observable) ? k.observable('0, 100') : '0, 100',
            percentageText: (k && k.observable) ? k.observable('0%') : '0%',
            totalCompleted: (k && k.observable) ? k.observable(0) : 0,
            totalPossible: (k && k.observable) ? k.observable(0) : 0,
            datePillText: (k && k.observable) ? k.observable('0 days') : '0 days'
        },
        stats: {
            completed: (k && k.observable) ? k.observable(0) : 0,
            missed: (k && k.observable) ? k.observable(0) : 0,
            rate: (k && k.observable) ? k.observable('0%') : '0%'
        },
        trackedDays: (k && k.observable) ? k.observable('0 days') : '0 days',
        footerLabel: (k && k.observable) ? k.observable('Tracking Start Date: --') : ''
    };

    self.historySubtitle = (k && k.observable) ? k.observable('0 completed prayers') : '0 completed prayers';
    self.historyEntries = (k && k.observableArray) ? k.observableArray([]) : [];
}

export function registerPrayerTrackingComponents(customKo) {
    var k = customKo || (typeof ko !== 'undefined' ? ko : (typeof window !== 'undefined' ? window.ko : null));
    if (!k || !k.components) return;

    if (!k.components.isRegistered('prayer-header')) {
        k.components.register('prayer-header', {
            viewModel: function (params) { return params || {}; },
            template: PrayerHeaderTemplate
        });
    }

    if (!k.components.isRegistered('prayer-history-card')) {
        k.components.register('prayer-history-card', {
            viewModel: function (params) { return params || {}; },
            template: PrayerHistoryCardTemplate
        });
    }

    if (!k.components.isRegistered('prayer-tracker-card')) {
        k.components.register('prayer-tracker-card', {
            viewModel: PrayerTrackerCardViewModel,
            template: PrayerTrackerCardTemplate
        });
    }

    if (!k.components.isRegistered('prayer-row')) {
        k.components.register('prayer-row', {
            viewModel: PrayerRowViewModel,
            template: PrayerRowTemplate
        });
    }

    if (!k.components.isRegistered('prayer-stat-card')) {
        k.components.register('prayer-stat-card', {
            viewModel: function (params) { return params || {}; },
            template: PrayerStatCardTemplate
        });
    }

    if (!k.components.isRegistered('prayer-perf-ring')) {
        k.components.register('prayer-perf-ring', {
            viewModel: function (params) { return params || {}; },
            template: PrayerPerfRingTemplate
        });
    }

    if (!k.components.isRegistered('prayer-nav-tab')) {
        k.components.register('prayer-nav-tab', {
            viewModel: function (params) { return params || {}; },
            template: PrayerNavTabTemplate
        });
    }

    if (!k.components.isRegistered('tracker-page')) {
        k.components.register('tracker-page', {
            viewModel: function (params) {
                return (params && params.viewModel) ? params.viewModel : getTrackerViewModel();
            },
            template: TrackerPageTemplate
        });
    }
}

export function initTracker() {
    registerPrayerTrackingComponents();
    var el = document.getElementById('trackerPage');
    if (el && typeof ko !== 'undefined') {
        var vm = getTrackerViewModel();
        if (!ko.dataFor(el)) {
            ko.applyBindings(vm, el);
        }
    }
    if (typeof rn === 'function') {
        rn();
    }
}


function parseTimeToMin(timeStr) {
    if (!timeStr) return -1;
    var clean = timeStr.trim().split(' ');
    if (!clean[0]) return -1;
    var parts = clean[0].split(':');
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return -1;
    var ap = clean[1] || 'AM';
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return h * 60 + m;
}

function isPrayerUpcoming(prayerName, dateStr) {
    var today = td();
    if (dateStr && dateStr !== today) return false;
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var pTime = T[prayerName];
    if (!pTime) return false;
    var pMin = parseTimeToMin(pTime);
    if (pMin === -1) return false;
    return nowMin < pMin;
}

function isDonePrayer(p, dateStr, r) {
    if (!r) {
        var d = dateStr || (typeof sd !== 'undefined' ? sd : td());
        r = typeof gr === 'function' ? gr(d) : {};
    }
    if (!r) return false;
    // Unified boolean format: false = completed, true = missed (with legacy 'done' fallback)
    if (r[p] === false || r[p] === 'done') return true;
    if (r[p] === true || r[p] === 'missed') return false;
    if (dateStr && typeof rd === 'function' && !rd()[dateStr]) {
        return true;
    }
    return false;
}

function formatChipDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    var day = d.getDate();
    var currentYear = new Date().getFullYear();
    var yearStr = d.getFullYear() !== currentYear ? (' ' + d.getFullYear()) : '';
    return day + ' ' + MONTH_NAMES[d.getMonth()] + yearStr;
}

/**
 * Render a single prayer row.
 * @param {Object} opts
 * @param {string} opts.prayer - Prayer name ('Fajr', 'Dhuhr', etc.)
 * @param {string} opts.time - Formatted time ('11:54 AM')
 * @param {boolean} opts.isCurrent - Whether prayer is currently in progress
 * @param {boolean} opts.isDone - Whether prayer is completed
 * @param {boolean} opts.isUpcoming - Whether prayer time is in future today
 * @param {string} opts.actionAct - data-act action ('toggle-cur' or 'toggle-old')
 * @param {string} [opts.date] - Optional date string
 * @param {string} opts.pagePrefix - e.g. 'page.current' or 'page.old'
 */
function renderPrayerTrackerRow(opts) {
    var p = opts.prayer;
    var pLower = p.toLowerCase();
    var time = opts.time || '--:--';
    var isCurrent = opts.isCurrent;
    var isDone = opts.isDone;
    var isUpcoming = opts.isUpcoming;
    var isMissed = opts.isMissed;
    var act = opts.actionAct || 'toggle-cur';
    var dateAttr = opts.date ? ' data-d="' + opts.date + '"' : '';
    var prefix = opts.pagePrefix || 'page.current';

    if (isDone) {
        return '<li class="prayer-row prayer-row-done p-2.5 px-3 bg-surfaceBg border border-transparent rounded-xl flex items-center justify-between opacity-75 transition-all gap-2.5 mb-1.5" data-ref="' + prefix + '.row.' + pLower + '">' +
            '  <div class="prayer-meta flex items-center gap-2.5 min-w-0" data-ref="' + prefix + '.row.' + pLower + '.meta">' +
            '    <div class="icon-box icon-box-md icon-done w-[46px] h-[46px] min-w-[46px] min-h-[46px] rounded-2xl bg-[#D1E5DC] text-brand inline-flex items-center justify-center shrink-0 leading-none select-none overflow-hidden" data-ref="' + prefix + '.row.' + pLower + '.avatar">' + (typeof renderIcon === 'function' ? renderIcon({ name: 'done-check', size: 'text-xl' }) : '') + '</div>' +
            '    <div class="prayer-details flex flex-col gap-0.5 min-w-0" data-ref="' + prefix + '.row.' + pLower + '.details">' +
            '      <div class="title-wrap flex items-baseline" data-ref="' + prefix + '.row.' + pLower + '.title-wrap">' +
            '        <span class="prayer-name text-sm font-bold text-brand truncate" data-ref="' + prefix + '.row.' + pLower + '.name">' + p + '</span>' +
            '      </div>' +
            '      <time class="prayer-time text-xs text-gr-textMuted" data-ref="' + prefix + '.row.' + pLower + '.time">' + time + '</time>' +
            '    </div>' +
            '  </div>' +
            '  <button type="button" class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D1E5DC] text-brand border-0 hover:bg-[#c2ded3] transition-colors cursor-pointer shrink-0 text-xs font-semibold" data-act="' + act + '" data-p="' + p + '"' + dateAttr + ' data-ref="' + prefix + '.row.' + pLower + '.action-btn" title="Tap to mark missed">' + (typeof renderIcon === 'function' ? renderIcon('done-check-sm') : PRAYER_CARD_ICONS.DoneCheckSm) + ' Done</button>' +
            '</li>';
    } else if (isUpcoming) {
        return '<li class="prayer-row prayer-row-upcoming p-2.5 px-3 bg-surfaceBg border border-borderGrey rounded-xl flex items-center justify-between cursor-default transition-all gap-2.5 mb-1.5" data-ref="' + prefix + '.row.' + pLower + '">' +
            '  <div class="prayer-meta flex items-center gap-2.5 min-w-0" data-ref="' + prefix + '.row.' + pLower + '.meta">' +
            '    <div class="icon-box icon-box-md w-[46px] h-[46px] min-w-[46px] min-h-[46px] rounded-2xl bg-dash-mintBg text-brand inline-flex items-center justify-center shrink-0 leading-none select-none overflow-hidden" data-ref="' + prefix + '.row.' + pLower + '.avatar">' + (typeof renderIcon === 'function' ? renderIcon({ name: pLower, size: 'text-xl' }) : '') + '</div>' +
            '    <div class="prayer-details flex flex-col gap-0.5 min-w-0" data-ref="' + prefix + '.row.' + pLower + '.details">' +
            '      <div class="title-wrap flex items-baseline" data-ref="' + prefix + '.row.' + pLower + '.title-wrap">' +
            '        <span class="prayer-name text-sm font-bold text-brand truncate" data-ref="' + prefix + '.row.' + pLower + '.name">' + p + '</span>' +
            '      </div>' +
            '      <time class="prayer-time text-xs text-gr-textMuted" data-ref="' + prefix + '.row.' + pLower + '.time">' + time + '</time>' +
            '    </div>' +
            '  </div>' +
            '  <button type="button" class="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-gray-100 text-gray-400 border border-dashed border-borderGrey cursor-default shrink-0 text-xs font-semibold" disabled aria-disabled="true" data-ref="' + prefix + '.row.' + pLower + '.action-btn">Upcoming</button>' +
            '</li>';
    } else if (isMissed) {
        return '<li class="prayer-row prayer-row-missed p-2.5 px-3 bg-gradient-to-r from-gr-dangerSoft to-white border border-gr-danger rounded-xl flex items-center justify-between transition-all gap-2.5 mb-1.5" data-ref="' + prefix + '.row.' + pLower + '">' +
            '  <div class="prayer-meta flex items-center gap-2.5 min-w-0" data-ref="' + prefix + '.row.' + pLower + '.meta">' +
            '    <div class="icon-box icon-box-md icon-missed w-[46px] h-[46px] min-w-[46px] min-h-[46px] rounded-2xl bg-red-500 text-white inline-flex items-center justify-center shrink-0 leading-none select-none overflow-hidden" data-ref="' + prefix + '.row.' + pLower + '.avatar">' + (typeof renderIcon === 'function' ? renderIcon({ name: pLower, size: 'text-xl' }) : '') + '</div>' +
            '    <div class="prayer-details flex flex-col gap-0.5 min-w-0" data-ref="' + prefix + '.row.' + pLower + '.details">' +
            '      <div class="title-wrap flex items-baseline" data-ref="' + prefix + '.row.' + pLower + '.title-wrap">' +
            '        <span class="prayer-name text-sm font-bold text-brand truncate" data-ref="' + prefix + '.row.' + pLower + '.name">' + p + '</span>' +
            '      </div>' +
            '      <time class="prayer-time text-xs text-gr-textMuted" data-ref="' + prefix + '.row.' + pLower + '.time">' + time + '</time>' +
            '    </div>' +
            '  </div>' +
            '  <button type="button" class="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white transition-colors cursor-pointer shrink-0 text-xs font-semibold" data-act="' + act + '" data-p="' + p + '"' + dateAttr + ' data-ref="' + prefix + '.row.' + pLower + '.action-btn">Mark Done</button>' +
            '</li>';
    } else {
        var rowClass = isCurrent ? 'prayer-row prayer-row-current p-2.5 px-3 bg-gradient-to-r from-activeLight to-white border border-brand rounded-xl flex items-center justify-between transition-all gap-2.5 mb-1.5' : 'prayer-row p-2.5 px-3 bg-white border border-borderGrey rounded-xl flex items-center justify-between hover:border-brand transition-all gap-2.5 mb-1.5';
        var avatarHtml = '<div class="icon-box icon-box-md ' + (isCurrent ? 'icon-current bg-brand text-white' : 'bg-dash-mintBg text-brand') + ' w-[46px] h-[46px] min-w-[46px] min-h-[46px] rounded-2xl inline-flex items-center justify-center shrink-0 leading-none select-none overflow-hidden" data-ref="' + prefix + '.row.' + pLower + '.avatar">' + (typeof renderIcon === 'function' ? renderIcon({ name: pLower, size: 'text-xl' }) : '') + '</div>';
        var btnClass = isCurrent ? 'inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-brand text-white hover:bg-brand-hover transition-colors cursor-pointer shrink-0 text-xs font-semibold' : 'inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-transparent border border-borderGrey text-brand hover:bg-brand-light transition-colors cursor-pointer shrink-0 text-xs font-semibold';

        return '<li class="' + rowClass + '" data-ref="' + prefix + '.row.' + pLower + '">' +
            '  <div class="prayer-meta flex items-center gap-2.5 min-w-0" data-ref="' + prefix + '.row.' + pLower + '.meta">' +
            '    ' + avatarHtml +
            '    <div class="prayer-details flex flex-col gap-0.5 min-w-0" data-ref="' + prefix + '.row.' + pLower + '.details">' +
            '      <div class="title-wrap flex items-baseline" data-ref="' + prefix + '.row.' + pLower + '.title-wrap">' +
            '        <span class="prayer-name text-sm font-bold text-brand truncate" data-ref="' + prefix + '.row.' + pLower + '.name">' + p + '</span>' +
            '      </div>' +
            '      <time class="prayer-time text-xs text-gr-textMuted" data-ref="' + prefix + '.row.' + pLower + '.time">' + time + '</time>' +
            '    </div>' +
            '  </div>' +
            '  <button type="button" class="' + btnClass + '" data-act="' + act + '" data-p="' + p + '"' + dateAttr + ' data-ref="' + prefix + '.row.' + pLower + '.action-btn">Mark Done</button>' +
            '</li>';
    }
}

/**
 * Render the complete Prayer Tracker Card.
 * @param {Object} cfg
 * @param {string} cfg.pagePrefix - 'page.current' or 'page.old'
 * @param {string} cfg.collapsePrefix - 'cur' or 'old'
 * @param {string} cfg.badgeText - e.g. 'Missed' or 'Missed (4)'
 * @param {string} [cfg.badgeAct] - e.g. 'missed-open'
 * @param {string} cfg.actionBtnText - e.g. 'Select All' or 'Today'
 * @param {string} cfg.actionBtnAct - e.g. 'select-all' or 'jump-today'
 * @param {string} cfg.dateChipText - e.g. '17 October'
 * @param {string} cfg.dateChipAct - e.g. 'open-cal' or 'old-info'
 * @param {Array<string>} cfg.missedPrayers - Array of prayer names in missed section
 * @param {Array<string>} [cfg.upcomingPrayers] - Array of prayer names that are upcoming
 * @param {Array<string>} cfg.donePrayers - Array of prayer names in done section
 * @param {Object} cfg.timings - e.g. T object
 * @param {string} [cfg.currentPrayerName] - e.g. 'Asr' if today
 * @param {string} cfg.toggleAct - 'toggle-cur' or 'toggle-old'
 * @param {string} [cfg.date] - date string
 */
function renderPrayerTrackerCard(cfg) {
    var prefix = cfg.pagePrefix || 'page.current';
    var cPrefix = cfg.collapsePrefix || 'cur';
    var missed = cfg.missedPrayers || [];
    var upcoming = cfg.upcomingPrayers || [];
    var done = cfg.donePrayers || [];
    var curP = cfg.currentPrayerName || null;
    var timings = cfg.timings || {};
    var act = cfg.toggleAct || 'toggle-cur';
    var date = cfg.date || '';
    var highlightMissed = cfg.highlightMissed !== undefined
        ? cfg.highlightMissed
        : true;

    var badgeActAttr = cfg.badgeAct ? ' data-act="' + cfg.badgeAct + '" role="button" class="cursor-pointer"' : '';

    var missedRowsHtml = missed.length
        ? missed.map(function (p) {
            var isUp = upcoming.indexOf(p) !== -1;
            var isCur = (p === curP && !isUp);
            var isMsd = highlightMissed && (!isUp && !isCur);
            return renderPrayerTrackerRow({
                prayer: p,
                time: timings[p],
                isCurrent: isCur,
                isDone: false,
                isUpcoming: isUp,
                isMissed: isMsd,
                actionAct: act,
                date: date,
                pagePrefix: prefix + '.missed'
            });
        }).join('')
        : '<li class="p-3 text-center text-gr-muted small bg-white rounded-3 border" data-ref="' + prefix + '.missed.empty">No missed or pending prayers. All caught up!</li>';

    var doneRowsHtml = done.length
        ? done.map(function (p) {
            return renderPrayerTrackerRow({
                prayer: p,
                time: timings[p],
                isCurrent: false,
                isDone: true,
                isUpcoming: false,
                actionAct: act,
                date: date,
                pagePrefix: prefix + '.done'
            });
        }).join('')
        : '<li class="p-3 text-center text-gr-muted small bg-white rounded-3 border" data-ref="' + prefix + '.done.empty">No completed prayers yet.</li>';

    var badgeHtml = cfg.badgeText
        ? ('<span class="badge badge-warning inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer" ' + badgeActAttr + ' data-ref="' + prefix + '.card.header.badge">' +
            (typeof renderIcon === 'function' ? renderIcon('warning') : (PRAYER_CARD_ICONS.Warning || '')) +
            '  ' + cfg.badgeText +
            '</span>')
        : '';
    var missedTitle = cfg.missedTitle || 'MISSED';

    var rightSideHtml = '';
    if (cfg.rightActionHtml) {
        rightSideHtml = cfg.rightActionHtml;
    } else if (cfg.actionBtnText) {
        rightSideHtml = '<button type="button" class="bg-transparent border-0 text-brand font-semibold cursor-pointer p-0 text-sm hover:underline" id="' + cPrefix + 'ActionBtn" data-act="' + (cfg.actionBtnAct || '') + '" data-ref="' + prefix + '.card.header.action-btn">' + cfg.actionBtnText + '</button>';
    }

    return '<div class="prayer-tracker-card w-full max-w-[480px] bg-white border border-borderGrey rounded-2xl p-3.5 flex flex-col gap-3 shadow-none mx-auto" id="' + cPrefix + 'TrackerCard" data-ref="' + prefix + '.card">' +
        '  <!-- Header: Date & Global Actions -->' +
        '  <header class="tracker-header pb-2.5 border-b border-borderGrey flex items-center justify-between gap-2" data-ref="' + prefix + '.card.header">' +
        '    <button type="button" class="date-chip flex items-center gap-1.5 bg-surfaceBg border border-borderGrey text-brand px-3 py-1.5 rounded-full text-sm font-semibold cursor-pointer hover:border-brand transition-colors" id="' + cPrefix + 'DateChip" data-act="' + (cfg.dateChipAct || '') + '" aria-label="Select date" data-ref="' + prefix + '.card.header.date-chip">' + (typeof renderIcon === 'function' ? renderIcon('calendar-card') : (PRAYER_CARD_ICONS.Calendar || '')) + '<span id="' + cPrefix + 'DateChipText" data-ref="' + prefix + '.card.header.date-text">' + (cfg.dateChipText || '') + '</span></button>' +
        '    <div class="header-status flex items-center gap-2" id="' + cPrefix + 'HeaderStatus" data-ref="' + prefix + '.card.header.status">' +
        badgeHtml +
        rightSideHtml +
        '    </div>' +
        '  </header>' +

        '  <!-- Section 1: Missed / Pending Prayers -->' +
        '  <section class="prayer-group flex flex-col gap-2" data-ref="' + prefix + '.card.missed-group">' +
        '    <button type="button" class="group-toggle flex items-center justify-between w-full bg-transparent border-0 p-0 cursor-pointer text-gr-text select-none" data-toggle="collapse" data-target="#' + cPrefix + 'MissedList" aria-expanded="true" data-ref="' + prefix + '.card.missed-group.toggle"><span class="section-title text-xs font-bold uppercase tracking-wider text-gr-text" id="' + cPrefix + 'MissedTitle" data-ref="' + prefix + '.card.missed-group.title">' + missedTitle + ' (' + missed.length + ')</span><span class="toggle-icon text-[10px] transition-transform duration-200 inline-block" data-ref="' + prefix + '.card.missed-group.icon">▼</span></button>' +
        '    <div class="collapse show visible" id="' + cPrefix + 'MissedList" style="visibility: visible;" data-ref="' + prefix + '.card.missed-group.collapse">' +
        '      <ul class="prayer-list flex flex-col gap-1.5 list-none p-0 m-0" id="' + cPrefix + 'MissedUl" data-ref="' + prefix + '.card.missed-group.list">' +
        missedRowsHtml +
        '      </ul>' +
        '    </div>' +
        '  </section>' +

        '  <!-- Section 2: Completed Prayers -->' +
        '  <section class="prayer-group flex flex-col gap-2" data-ref="' + prefix + '.card.done-group">' +
        '    <button type="button" class="group-toggle flex items-center justify-between w-full bg-transparent border-0 p-0 cursor-pointer text-gr-text select-none" data-toggle="collapse" data-target="#' + cPrefix + 'DoneList" aria-expanded="true" data-ref="' + prefix + '.card.done-group.toggle"><span class="section-title text-xs font-bold uppercase tracking-wider text-gr-text" id="' + cPrefix + 'DoneTitle" data-ref="' + prefix + '.card.done-group.title">DONE (' + done.length + ')</span><span class="toggle-icon text-[10px] transition-transform duration-200 inline-block" data-ref="' + prefix + '.card.done-group.icon">▼</span></button>' +
        '    <div class="collapse show visible" id="' + cPrefix + 'DoneList" style="visibility: visible;" data-ref="' + prefix + '.card.done-group.collapse">' +
        '      <ul class="prayer-list flex flex-col gap-1.5 list-none p-0 m-0" id="' + cPrefix + 'DoneUl" data-ref="' + prefix + '.card.done-group.list">' +
        doneRowsHtml +
        '      </ul>' +
        '    </div>' +
        '  </section>' +
        '</div>';
}


function rn() {
    var dp = $('dp');
    if (dp) {
        dp.value = sd;
        dp.max = td();
    }

    var r = en(sd);
    var isToday = sd === td();
    var missTotal = tMT();

    var done = [];
    var missed = [];
    var upcoming = [];

    P.forEach(function (p) {
        if (isDonePrayer(p, sd, r)) {
            done.push(p);
        } else {
            if (isToday && isPrayerUpcoming(p, sd)) {
                upcoming.push(p);
            }
            missed.push(p);
        }
    });

    var curActive = isToday && typeof getActivePrayerInfo === 'function' ? getActivePrayerInfo() : null;
    var curPrayerName = curActive ? curActive.name : null;

    var actualMissedCount = missed.filter(function (p) {
        return upcoming.indexOf(p) === -1 && p !== curPrayerName;
    }).length;
    var badgeText = actualMissedCount > 0 ? ('Missed (' + actualMissedCount + ')') : 'Missed';
    var actionBtnText = isToday ? 'Select All' : 'Today';
    var actionBtnAct = isToday ? 'select-all' : 'jump-today';
    var dateChipText = formatChipDate(sd);

    var html = renderPrayerTrackerCard({
        pagePrefix: 'page.current',
        collapsePrefix: 'cur',
        badgeText: actualMissedCount > 0 ? ('Missed (' + actualMissedCount + ')') : '',
        badgeAct: missTotal > 0 ? 'missed-open' : '',
        actionBtnText: actionBtnText,
        actionBtnAct: actionBtnAct,
        dateChipText: dateChipText,
        dateChipAct: 'open-cal',
        missedPrayers: missed,
        upcomingPrayers: upcoming,
        donePrayers: done,
        timings: T,
        currentPrayerName: curPrayerName,
        toggleAct: 'toggle-cur',
        date: sd
    });

    var currentBody = $('currentBody');
    if (currentBody) {
        currentBody.innerHTML = html;
    }

    updateCurrentMissedBadge();
    if (typeof updatePerformanceTab === 'function') {
        updatePerformanceTab();
    }
}

function updateCurrentMissedBadge() {
    var totalMissed = typeof getConsolidatedMissedCount === 'function'
        ? getConsolidatedMissedCount()
        : 0;
    var missedBtn = $('currentMissedBtn');
    var missedBadge = $('currentMissedBadge');
    if (missedBadge) {
        if (totalMissed > 0) {
            missedBadge.textContent = totalMissed;
            missedBadge.classList.remove('d-none');
        } else {
            missedBadge.textContent = '';
            missedBadge.classList.add('d-none');
        }
    }
    if (missedBtn) {
        missedBtn.title = totalMissed > 0 ? ('Missed Prayers (' + totalMissed + ')') : 'Missed Prayers';
    }
}

function go(d) {
    if (d > td()) d = td();
    sd = d;
    if (typeof fetchPrayerTimings === 'function') {
        fetchPrayerTimings(sd, function () { rn(); });
    }
    rn();
}

/* ---------- Missed Prayers Sheet ---------- */
function missTile(date, p) {
    var iconHtml = typeof renderIcon === 'function' ? renderIcon(p.toLowerCase()) : I[p];
    return '<div class="rounded-3 p-2 flex flex-col items-center justify-center gap-1.5 bg-danger-subtle min-w-0" ' +
        'data-ref="page.current.missed-sheet.tile.' + p.toLowerCase() + '">' +
        '<span class="fs-4 flex items-center justify-center">' + iconHtml + '</span>' +
        '<span class="fw-bold text-truncate w-100 text-center fs-xs text-dark">' + p + '</span>' +
        '<span class="badge-pill-custom badge-missed inline-flex items-center fs-xs py-1 px-1.5">' +
        renderIcon('circle-exclamation') + 'Missed</span>' +
        '</div>';
}

function missCard(x) {
    var tiles = x.prayers.map(function (p) { return missTile(x.date, p); }).join('');
    var missedCount = x.prayers.length;
    var countBadge = '<span class="badge-pill-custom badge-missed fs-xs py-1 px-2 inline-flex items-center gap-1 shrink-0">' +
        missedCount + ' Missed' +
        renderIcon({ name: 'chevron-right', size: 'fs-xs', className: 'opacity-75' }) + '</span>';

    return '<div class="card border border-borderGrey rounded-4 p-2 bg-gr cursor-pointer" role="button" data-act="jump" data-d="' + x.date + '" data-ref="page.current.missed-sheet.card.' + x.date + '">' +
        '<div class="flex items-center justify-between gap-2 mb-2 px-1" data-ref="page.current.missed-sheet.card.header">' +
        '<div class="flex items-center gap-2 min-w-0" data-ref="page.current.missed-sheet.card.info">' +
        '<div class="w-9 h-9 min-w-[36px] min-h-[36px] rounded-[10px] bg-dash-mintBg text-gr-accent inline-flex items-center justify-center shrink-0 leading-none select-none overflow-hidden" data-ref="page.current.missed-sheet.card.icon">' + (typeof renderIcon === 'function' ? renderIcon({ name: 'calendar-days', color: 'text-gr-accent' }) : '') + '</div>' +
        '<div class="min-w-0">' +
        '<div class="fw-bold text-gr1 fs-5 lh-1 text-truncate" data-ref="page.current.missed-sheet.card.title">' + friendly(x.date) + '</div>' +
        '<div class="text-gr-accent fw-semibold small mt-0.5 text-truncate" data-ref="page.current.missed-sheet.card.date">' + fr(x.date) + '</div>' +
        '</div>' +
        '</div>' +
        countBadge +
        '</div>' +
        '<div class="grid grid-cols-3 gap-2 w-100 missed-tiles-grid" data-ref="page.current.missed-sheet.card.tiles">' + tiles + '</div>' +
        '</div>';
}

function rMS() {
    var sheetCfg = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.SHEETS && window.CONSTANTS.PRAYER.SHEETS.MISSED_PRAYERS) || {
        iconClass: 'clipboard-list text-gr-accent',
        title: 'Missed Prayers',
        sub: 'From previous days (today excluded)'
    };
    if (window.sheet2BS && typeof window.sheet2BS.show === 'function') {
        window.sheet2BS.show(sheetCfg);
    }
    if (window.Icon && typeof Icon.update === 'function' && $('sheet2Icon')) {
        Icon.update($('sheet2Icon'), sheetCfg.iconClass);
    } else if ($('sheet2Icon')) {
        $('sheet2Icon').className = sheetCfg.iconClass;
    }
    if ($('sheet2Title')) $('sheet2Title').textContent = sheetCfg.title;
    if ($('sheet2Sub')) $('sheet2Sub').textContent = sheetCfg.sub;

    var list = mBD().reverse();
    var missedContent = $('sheetMissedContent');
    var periodInfoContent = $('sheetPeriodInfoContent');
    var setOldContent = $('sheetSetOldPeriodContent');
    if (periodInfoContent) periodInfoContent.classList.add('d-none');
    if (setOldContent) setOldContent.classList.add('d-none');
    if (missedContent) missedContent.classList.remove('d-none');

    var emptyEl = $('sheetMissedEmpty');
    var listEl = $('sheetMissedList');
    if (!list.length) {
        if (emptyEl) emptyEl.classList.remove('d-none');
        if (listEl) listEl.innerHTML = '';
    } else {
        if (emptyEl) emptyEl.classList.add('d-none');
        if (listEl) listEl.innerHTML = list.map(missCard).join('');
    }
}

if (typeof window !== 'undefined') {
    window.rn = rn;
    window.go = go;
    window.rMS = rMS;
    window.updateCurrentMissedBadge = updateCurrentMissedBadge;
}


/* ---------- Old Tracking ---------- */

var oldSd = null;

function rOldInfo() {
    var o = rdOK();
    if (!o) { rPeriod(); return; }

    var isAllCompleted = o.end < o.start;
    var dates = isAllCompleted ? [] : datesInRange(o.start, o.end);
    var a = rdOC();
    var totalDays = dates.length;
    var totalMissed = 0, daysMissed = 0;
    var perPrayer = {};
    P.forEach(function (p) { perPrayer[p] = 0; });

    dates.forEach(function (d) {
        var r = a[d] || {};
        var m = P.filter(function (p) { return r[p] === true || r[p] === 'missed'; });
        if (m.length > 0) {
            totalMissed += m.length;
            daysMissed++;
            m.forEach(function (p) { perPrayer[p]++; });
        }
    });

    var perPrayerHtml = P.map(function (p) {
        var c = perPrayer[p];
        var pIcon = typeof renderIcon === 'function' ? renderIcon(p.toLowerCase()) : I[p];
        return '<div class="flex justify-between items-center py-2 px-3 rounded-3 mb-2 bg-surface">' +
            '<div class="flex items-center gap-2"><span class="fs-4">' + pIcon + '</span>' +
            '<span class="fw-bold fs-6">' + p + '</span></div>' +
            '<span class="badge rounded-pill ' + (c > 0 ? 'bg-danger text-white' : 'bg-brand text-white') +
            ' px-3 py-2 small">' + c + ' missed</span></div>';
    }).join('');

    var sheetCfg = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.SHEETS && window.CONSTANTS.PRAYER.SHEETS.PERIOD_INFO) || {
        iconClass: 'circle-info text-brand',
        title: 'Period Info'
    };
    sheetCfg.sub = isAllCompleted ? (fr(o.start) + ' → Complete') : (fr(o.start) + ' → ' + fr(o.end));
    if (window.sheet2BS && typeof window.sheet2BS.show === 'function') {
        window.sheet2BS.show(sheetCfg);
    }
    if (window.Icon && typeof Icon.update === 'function' && $('sheet2Icon')) {
        Icon.update($('sheet2Icon'), sheetCfg.iconClass);
    } else if ($('sheet2Icon')) {
        $('sheet2Icon').className = sheetCfg.iconClass;
    }
    if ($('sheet2Title')) $('sheet2Title').textContent = sheetCfg.title;
    if ($('sheet2Sub')) $('sheet2Sub').textContent = sheetCfg.sub;

    var missedContent = $('sheetMissedContent');
    var periodInfoContent = $('sheetPeriodInfoContent');
    var setOldContent = $('sheetSetOldPeriodContent');
    if (missedContent) missedContent.classList.add('d-none');
    if (setOldContent) setOldContent.classList.add('d-none');
    if (periodInfoContent) periodInfoContent.classList.remove('d-none');

    var startValEl = $('sheetPeriodStartVal');
    if (startValEl) startValEl.textContent = fr(o.start);

    var endValEl = $('sheetPeriodEndVal');
    if (endValEl) endValEl.textContent = isAllCompleted ? 'Complete' : fr(o.end);

    var totalDaysEl = $('sheetPeriodTotalDaysVal');
    if (totalDaysEl) totalDaysEl.textContent = totalDays;

    var totalMissedEl = $('sheetPeriodTotalMissedVal');
    if (totalMissedEl) totalMissedEl.textContent = totalMissed;

    var daysMissedEl = $('sheetPeriodDaysMissedVal');
    if (daysMissedEl) daysMissedEl.textContent = daysMissed;

    var perPrayerEl = $('sheetPeriodPerPrayer');
    if (perPrayerEl) perPrayerEl.innerHTML = perPrayerHtml;
}

function rPeriod() {
    var sheetCfg = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.SHEETS && window.CONSTANTS.PRAYER.SHEETS.SET_OLD_PERIOD) || {
        iconClass: 'clock-rotate-left text-warning',
        title: 'Set Old Period',
        sub: ''
    };
    if (window.sheet2BS && typeof window.sheet2BS.show === 'function') {
        window.sheet2BS.show(sheetCfg);
    }
    if (window.Icon && typeof Icon.update === 'function' && $('sheet2Icon')) {
        Icon.update($('sheet2Icon'), sheetCfg.iconClass);
    } else if ($('sheet2Icon')) {
        $('sheet2Icon').className = sheetCfg.iconClass;
    }
    if ($('sheet2Title')) $('sheet2Title').textContent = sheetCfg.title;
    if ($('sheet2Sub')) $('sheet2Sub').textContent = sheetCfg.sub;
    var o = rdOK();
    var hasValidPeriod = o && o.end >= o.start;

    var missedContent = $('sheetMissedContent');
    var periodInfoContent = $('sheetPeriodInfoContent');
    var setOldContent = $('sheetSetOldPeriodContent');
    if (missedContent) missedContent.classList.add('d-none');
    if (periodInfoContent) periodInfoContent.classList.add('d-none');
    if (setOldContent) setOldContent.classList.remove('d-none');

    var startInp = $('oldStart');
    if (startInp) {
        startInp.value = o ? o.start : '';
        startInp.max = td();
    }

    var endInp = $('oldEnd');
    if (endInp) {
        endInp.value = hasValidPeriod ? (o.initialEnd || o.end) : (o ? o.end : '');
        endInp.max = td();
    }

    var resetBtn = $('sheetResetPeriodBtn');
    if (resetBtn) {
        if (o) {
            resetBtn.classList.remove('d-none');
        } else {
            resetBtn.classList.add('d-none');
        }
    }
}

function openOldCal() {
    var oldDp = $('oldDp');
    if (!oldDp) return;
    var o = rdOK();
    if (o && o.end >= o.start) {
        oldDp.min = o.start;
        oldDp.max = o.end;
        if (oldSd) oldDp.value = oldSd;
    }
    if (oldDp.showPicker) {
        try { oldDp.showPicker(); return; } catch (e) { }
    }
    oldDp.focus();
    oldDp.click();
}

function goOld(d) {
    var o = rdOK();
    if (!o || !d) return;
    if (o.end < o.start) return;
    if (d < o.start) d = o.start;
    if (d > o.end) d = o.end;
    oldSd = d;
    rOT();
}

function setOldSd(d) {
    oldSd = d;
}

function getDefaultOldPeriod() {
    var today = typeof td === 'function' ? td() : new Date().toISOString().slice(0, 10);
    var yesterday = typeof prevDate === 'function' ? prevDate(today) : today;
    var start = (typeof rdSD === 'function' ? rdSD() : null) || null;
    if (!start || start >= today) {
        var d = new Date();
        d.setDate(d.getDate() - 30);
        start = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }
    if (start > yesterday) start = yesterday;
    return {
        start: start,
        end: yesterday,
        initialEnd: yesterday,
        created: Date.now()
    };
}

function rOT() {
    ensureAllOldMissed();

    var o = rdOK();
    var lst = $('oldBody');
    var sub = $('oldSub');
    if (!lst) return;

    if (!o) {
        var defaultPeriod = getDefaultOldPeriod();
        wrOK(defaultPeriod);
        ensureAllOldMissed();
        o = defaultPeriod;
    }

    if (o.end < o.start) {
        if (sub) sub.textContent = 'All days completed';
        lst.innerHTML = '<div class="text-center text-gr-textMuted py-8 px-4 bg-white border border-borderGrey rounded-2xl flex flex-col items-center justify-center max-w-[480px] mx-auto" data-ref="page.old.all-completed">' +
            '<app-icon params="name: \'circle-check\', color: \'text-brand\', size: \'4xl\', customClass: \'mb-3\'"></app-icon>' +
            '<p class="font-bold mb-2 text-gr-accent text-base">All days complete!</p>' +
            '<p class="text-gr-textMuted text-xs mb-0">The Old Tracking period has been fully cleared.</p>' +
            '<button type="button" class="mt-4 px-4 py-2 bg-brand text-white font-bold text-xs rounded-xl hover:bg-brand-hover inline-flex items-center gap-1.5 transition-colors cursor-pointer" data-act="old-change-period">' +
            '<app-icon params="name: \'calendar-plus\'"></app-icon> Set Period' +
            '</button>' +
            '</div>';
        return;
    }

    if (sub) sub.textContent = fr(o.start) + ' → ' + fr(o.end);

    if (!oldSd || oldSd < o.start || oldSd > o.end) {
        oldSd = currentOldDate() || o.end;
    }
    var curDate = oldSd;

    var oldDp = $('oldDp');
    if (oldDp) {
        oldDp.min = o.start;
        oldDp.max = o.end;
        oldDp.value = curDate;
    }

    var r = grO(curDate);
    var missed = P.filter(function (p) { return r[p] === true || r[p] === 'missed'; });
    var done = P.filter(function (p) { return r[p] !== true && r[p] !== 'missed'; });

    var dateChipText = formatChipDate(curDate);

    var html = renderPrayerTrackerCard({
        pagePrefix: 'page.old',
        collapsePrefix: 'old',
        badgeText: '',
        badgeAct: '',
        dateChipText: dateChipText,
        dateChipAct: 'old-open-cal',
        missedPrayers: missed,
        donePrayers: done,
        timings: T,
        currentPrayerName: null,
        toggleAct: 'toggle-old',
        date: curDate,
        missedTitle: 'MISSED',
        highlightMissed: true
    });

    lst.innerHTML = html;

    if (typeof updatePerformanceTab === 'function') {
        updatePerformanceTab();
    }
}

if (typeof window !== 'undefined') {
    window.rOT = rOT;
    window.rOldInfo = rOldInfo;
    window.rPeriod = rPeriod;
    window.openOldCal = openOldCal;
    window.goOld = goOld;
    window.setOldSd = setOldSd;
    window.oldSd = oldSd;
    window.getDefaultOldPeriod = getDefaultOldPeriod;
}


/* ============================================================
   Nur Prayer — Prayer Performance Feature Module
   Submodule: Prayer Performance Module
   Calculates and renders prayer statistics from configured start date
   to current date across all prayers (Fajr, Dhuhr, Asr, Maghrib, Isha).
   ============================================================ */

(function (window) {
    'use strict';

    var PRAYER_NAMES = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.NAMES) ||
        window.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    /**
     * Calculate comprehensive prayer performance statistics from Settings start date to today.
     * @returns {Object} statistics object
     */
    function calculatePrayerPerformance() {
        var sdate = (typeof window.rdSD === 'function' ? window.rdSD() : null);
        var today = (typeof window.td === 'function' ? window.td() : new Date().toISOString().slice(0, 10));

        if (!sdate) sdate = today;
        if (sdate > today) sdate = today;

        var dates = typeof window.datesInRange === 'function' ? window.datesInRange(sdate, today) : [today];
        var totalDays = dates.length;
        var totalPossible = totalDays * PRAYER_NAMES.length;

        var curDb = typeof window.rd === 'function' ? window.rd() : {};
        var oldDb = typeof window.rdOC === 'function' ? window.rdOC() : {};

        var perPrayer = {};
        PRAYER_NAMES.forEach(function (p) {
            perPrayer[p] = {
                name: p,
                completed: 0,
                missed: 0,
                total: totalDays,
                percentage: 0
            };
        });

        var totalCompleted = 0;
        var totalMissed = 0;

        dates.forEach(function (d) {
            var isCurToday = (d === today);
            var curEntry = curDb[d];
            var oldEntry = oldDb[d];

            PRAYER_NAMES.forEach(function (p) {
                var isCompleted = false;

                if (curEntry) {
                    // Unified boolean format: false/'done' = completed, true/'missed' = missed
                    isCompleted = (curEntry[p] === false || curEntry[p] === 'done');
                } else if (oldEntry) {
                    // Old tracking records: false = completed, true/'missed' = missed
                    isCompleted = (oldEntry[p] === false);
                } else if (isCurToday) {
                    // Today entry if accessed before explicit storage write
                    var rt = typeof window.gr === 'function' ? window.gr(d) : {};
                    isCompleted = (rt[p] === false || rt[p] === 'done');
                } else {
                    // In Nur Prayer's storage architecture, dates with all prayers completed
                    // are pruned from the database (sr: delete a[d])
                    isCompleted = true;
                }

                if (isCompleted) {
                    perPrayer[p].completed++;
                    totalCompleted++;
                } else {
                    perPrayer[p].missed++;
                    totalMissed++;
                }
            });
        });

        PRAYER_NAMES.forEach(function (p) {
            perPrayer[p].percentage = totalDays > 0
                ? Math.round((perPrayer[p].completed / totalDays) * 100)
                : 0;
        });

        var totalPercentage = totalPossible > 0
            ? Math.round((totalCompleted / totalPossible) * 100)
            : 0;

        return {
            startDate: sdate,
            endDate: today,
            totalDays: totalDays,
            totalPossible: totalPossible,
            totalCompleted: totalCompleted,
            totalMissed: totalMissed,
            totalPercentage: totalPercentage,
            perPrayer: perPrayer
        };
    }

    /**
     * Render the Performance tab content into #performanceBody.
     */
    function renderPerformanceTab() {
        var body = typeof window.$ === 'function' ? window.$('performanceBody') : document.getElementById('performanceBody');
        if (!body) return;

        var stats = calculatePrayerPerformance();
        var frFn = typeof window.fr === 'function' ? window.fr : function (d) { return d; };
        var renderIconFn = typeof window.renderIcon === 'function' ? window.renderIcon : function (opts) {
            var n = typeof opts === 'object' ? opts.name : opts;
            return '<app-icon params="name: \'' + n + '\'"></app-icon>';
        };
        var timings = window.T || (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.DEFAULT_TIMINGS) || {};

        // Update header subtitle if currently on performance tab
        var oldSub = typeof window.$ === 'function' ? window.$('oldSub') : document.getElementById('oldSub');
        if (oldSub && typeof window.trackerSubTab !== 'undefined' && window.trackerSubTab === 'performance') {
            oldSub.classList.remove('d-none');
            oldSub.textContent = frFn(stats.startDate) + ' → ' + frFn(stats.endDate) + ' (' + stats.totalDays + (stats.totalDays === 1 ? ' day' : ' days') + ')';
        }

        // Update Hero Card: Circular Progress Ring & Summary
        var ringVal = document.getElementById('perfRingVal');
        if (ringVal) {
            ringVal.setAttribute('stroke-dasharray', stats.totalPercentage + ', 100');
        }
        var heroPercentage = document.getElementById('perfHeroPercentage');
        if (heroPercentage) {
            heroPercentage.textContent = stats.totalPercentage + '%';
        }
        var totalCompleted = document.getElementById('perfTotalCompleted');
        if (totalCompleted) {
            totalCompleted.textContent = stats.totalCompleted;
        }
        var totalPossible = document.getElementById('perfTotalPossible');
        if (totalPossible) {
            totalPossible.textContent = ' / ' + stats.totalPossible;
        }
        var datePill = document.getElementById('perfDatePill');
        if (datePill) {
            datePill.innerHTML = '<span class="font-bold mr-1">' + stats.totalDays + (stats.totalDays === 1 ? ' day' : ' days') + '</span> · ' + frFn(stats.startDate) + ' → ' + frFn(stats.endDate);
        }

        // Update Three Summary Cards: Completed, Missed, Success
        var completedStat = document.getElementById('perfCompletedStat');
        if (completedStat) {
            completedStat.textContent = stats.totalCompleted;
        }
        var missedStat = document.getElementById('perfMissedStat');
        if (missedStat) {
            missedStat.textContent = stats.totalMissed;
            missedStat.className = 'font-bold text-xl mt-1.5 leading-none ' + (stats.totalMissed > 0 ? 'text-gr-danger' : 'text-brand');
        }
        var rateStat = document.getElementById('perfRateStat');
        if (rateStat) {
            rateStat.textContent = stats.totalPercentage + '%';
        }

        // Update Tracked Days in Section Header
        var trackedDays = document.getElementById('perfTrackedDays');
        if (trackedDays) {
            trackedDays.textContent = stats.totalDays + (stats.totalDays === 1 ? ' day' : ' days');
        }

        // Generate individual prayer cards
        var filledCircleCheckSvg = '<app-icon params="name: \'circle-check\', customClass: \'shrink-0\', size: \'14px\'"></app-icon>';

        var prayerRowsHtml = PRAYER_NAMES.map(function (p) {
            var pLower = p.toLowerCase();
            var pStats = stats.perPrayer[p] || { completed: 0, missed: 0, total: stats.totalDays, percentage: 0 };
            var pIcon = renderIconFn({ name: pLower, size: 22, color: 'text-brand' });
            var pTime = timings[p] || (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.DEFAULT_TIMINGS && window.CONSTANTS.PRAYER.DEFAULT_TIMINGS[p]) || '--:--';
            var isPerfect = (pStats.missed === 0);

            // Badge variant matching reference
            var pctBadge = isPerfect
                ? '<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand" data-ref="page.performance.prayer.' + pLower + '.pct">' + pStats.percentage + '%</span>'
                : '<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-gr-dangerSoft text-gr-danger" data-ref="page.performance.prayer.' + pLower + '.pct">' + pStats.percentage + '%</span>';

            // Progress bar with dual/single fill matching reference
            var progressBarHtml;
            if (isPerfect) {
                progressBarHtml =
                    '<div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">' +
                    '<div class="h-full bg-brand rounded-full" style="width: ' + pStats.percentage + '%;"></div>' +
                    '</div>';
            } else {
                var compW = pStats.percentage;
                var missW = Math.max(0, 100 - compW);
                progressBarHtml =
                    '<div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">' +
                    (compW > 0 ? '<div class="perf-bar-fill" style="width: ' + compW + '%; border-top-left-radius: 9999px; border-bottom-left-radius: 9999px;"></div>' : '') +
                    (missW > 0 ? '<div class="perf-bar-missed" style="width: ' + missW + '%; border-top-right-radius: 9999px; border-bottom-right-radius: 9999px;"></div>' : '') +
                    '</div>';
            }

            // Bottom indicators matching reference
            var completedStatusHtml =
                '<span class="flex items-center gap-1.5 text-brand fw-semibold text-nowrap lh-1">' +
                filledCircleCheckSvg +
                '<span>' + pStats.completed + ' Completed</span>' +
                '</span>';

            var missedStatusHtml = isPerfect
                ? '<span class="flex items-center gap-1.5 text-muted fw-medium text-nowrap lh-1">' +
                  renderIconFn({ name: 'circle-xmark', size: 14, className: 'shrink-0' }) +
                  '<span>0 Missed</span>' +
                  '</span>'
                : '<span class="flex items-center gap-1.5 text-danger fw-semibold text-nowrap lh-1">' +
                  renderIconFn({ name: 'circle-exclamation', size: 14, className: 'shrink-0' }) +
                  '<span>' + pStats.missed + ' Missed</span>' +
                  '</span>';

            return '<div class="rounded-2xl p-4 bg-white border border-borderGrey flex flex-col gap-3" data-ref="page.performance.prayer.' + pLower + '">' +
                '<!-- Top Row: Icon + Name/Time on left, Count + Pill on right -->' +
                '<div class="flex items-center justify-between">' +
                '<div class="flex items-center gap-2.5 min-w-0">' +
                '<div class="w-11 h-11 rounded-xl bg-brand-light text-brand flex items-center justify-center shrink-0" style="width: 44px; height: 44px;" data-ref="page.performance.prayer.' + pLower + '.icon">' +
                pIcon +
                '</div>' +
                '<div class="min-w-0">' +
                '<h6 class="fw-bold text-gr1 fs-base mb-0 lh-sm" data-ref="page.performance.prayer.' + pLower + '.name">' + p + '</h6>' +
                '<div class="flex items-center gap-1 text-muted fs-xs mt-0.5" data-ref="page.performance.prayer.' + pLower + '.time">' +
                renderIconFn({ name: 'clock', size: 11, className: 'shrink-0' }) +
                '<span style="font-size: 11px;">' + pTime + '</span>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="flex items-center gap-2 shrink-0">' +
                '<span class="fs-sm fw-bold text-gr1 lh-1" data-ref="page.performance.prayer.' + pLower + '.count">' +
                pStats.completed + ' <span class="text-muted fw-normal">/ ' + stats.totalDays + '</span>' +
                '</span>' +
                pctBadge +
                '</div>' +
                '</div>' +
                '<!-- Middle Row: Full-width Progress Bar -->' +
                progressBarHtml +
                '<!-- Bottom Row: Completed & Missed Statuses -->' +
                '<div class="flex items-center justify-between fs-xs">' +
                completedStatusHtml +
                missedStatusHtml +
                '</div>' +
                '</div>';
        }).join('');

        var breakdownList = document.getElementById('perfBreakdownList');
        if (breakdownList) {
            breakdownList.innerHTML = prayerRowsHtml;
        }

        // Update Settings Start Date Footer Card
        var footerLabel = document.getElementById('perfFooterLabel');
        if (footerLabel) {
            footerLabel.textContent = 'Tracking Start Date: ' + frFn(stats.startDate);
        }
        var footerDesc = document.getElementById('perfFooterDesc');
        if (footerDesc) {
            footerDesc.textContent = 'Calculated from your start date configured in Settings up to today (' + frFn(stats.endDate) + ').';
        }
    }

    /**
     * Updates the performance view if the tab or body is currently active/visible.
     */
    function updatePerformanceTab() {
        var body = typeof window.$ === 'function' ? window.$('performanceBody') : document.getElementById('performanceBody');
        if (body && (!body.classList.contains('d-none') || (typeof window.trackerSubTab !== 'undefined' && window.trackerSubTab === 'performance'))) {
            renderPerformanceTab();
        }
    }

    // Expose functions globally
    window.calculatePrayerPerformance = calculatePrayerPerformance;
    window.renderPerformanceTab = renderPerformanceTab;
    window.updatePerformanceTab = updatePerformanceTab;

})(typeof window !== 'undefined' ? window : global);



/* ============================================================
   Nur Prayer — Prayer Tracking Activity History Module
   Submodule: Prayer Activity History Module
   Maintains a single unified activity log for completed prayers
   across both Current Prayer Tracking and Old Prayer Tracking.
   ============================================================ */

(function (window) {
    'use strict';

    var PRAYER_CONSTANTS = window.PRAYER_CONSTANTS || (window.CONSTANTS && window.CONSTANTS.PRAYER) || {};
    var PRAYER_STORAGE_KEYS = PRAYER_CONSTANTS.STORAGE_KEYS || {};
    var HISTORY_STORAGE_KEY = PRAYER_STORAGE_KEYS.HISTORY || window.PHK || 'namazPrayerHistory';

    function getStorageKey() {
        return (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.STORAGE_KEYS && window.CONSTANTS.PRAYER.STORAGE_KEYS.HISTORY) ||
            window.PHK ||
            HISTORY_STORAGE_KEY;
    }

    function isHistoryTabActive() {
        if (typeof window.trackerSubTab !== 'undefined' && window.trackerSubTab === 'history') return true;
        if (typeof trackerSubTab !== 'undefined' && trackerSubTab === 'history') return true;
        var historyBody = typeof window.$ === 'function' ? window.$('historyBody') : document.getElementById('historyBody');
        if (historyBody && !historyBody.classList.contains('d-none')) return true;
        return false;
    }

    function isDoneInOldTracking(prayer, dateStr) {
        if (typeof window.rdOK !== 'function') return true;
        var o = window.rdOK();
        if (!o || o.end < o.start) return false;
        var maxEnd = o.initialEnd || o.end;
        if (dateStr < o.start || dateStr > maxEnd) return false;
        var a = typeof window.rdOC === 'function' ? window.rdOC() : {};
        var r = a[dateStr];
        if (r) {
            return (r[prayer] === false);
        }
        return true;
    }

    /**
     * Retrieve all activity history entries from database.
     * Chronologically sorted: latest activity first.
     * @param {Object} [options]
     * @param {boolean} [options.prune=true] - Prune entries no longer currently completed
     * @returns {Array} List of history entry objects
     */
    function getPrayerHistory(options) {
        options = options || {};
        var shouldPrune = options.prune !== false;
        var raw = null;
        try {
            raw = localStorage.getItem(getStorageKey());
        } catch (_) {
            raw = null;
        }

        var entries = [];
        if (raw) {
            try {
                var parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    entries = parsed;
                }
            } catch (_) {
                entries = [];
            }
        }

        if (shouldPrune && entries.length > 0) {
            var originalLen = entries.length;
            entries = entries.filter(function (entry) {
                if (!entry || !entry.prayer || !entry.type || !entry.date) {
                    return false;
                }
                if (entry.type === 'Current') {
                    if (typeof window.isDonePrayer === 'function') {
                        return window.isDonePrayer(entry.prayer, entry.date);
                    }
                    return true;
                }
                if (entry.type === 'Old') {
                    return isDoneInOldTracking(entry.prayer, entry.date);
                }
                return false;
            });

            if (entries.length !== originalLen) {
                savePrayerHistory(entries);
            }
        }

        entries.sort(function (a, b) {
            return (b.timestamp || 0) - (a.timestamp || 0);
        });

        return entries;
    }

    /**
     * Persist history entries to storage.
     * @param {Array} entries
     */
    function savePrayerHistory(entries) {
        try {
            localStorage.setItem(getStorageKey(), JSON.stringify(entries || []));
        } catch (e) {
            console.error('Failed to save prayer history:', e);
        }
    }

    /**
     * Add a completed prayer entry to the activity log.
     * Replaces any existing entry for this specific prayer/type/date to update timestamp.
     * @param {string} prayerName - e.g. 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'
     * @param {string} trackingType - 'Current' or 'Old'
     * @param {string} prayerDate - 'YYYY-MM-DD'
     * @param {number} [customTimestamp] - Optional override timestamp
     * @returns {Object} The created history entry
     */
    function addPrayerHistoryEntry(prayerName, trackingType, prayerDate, customTimestamp) {
        if (!prayerName || !prayerDate) return null;

        var type = (trackingType === 'Old') ? 'Old' : 'Current';
        var pName = prayerName.charAt(0).toUpperCase() + prayerName.slice(1);
        var ts = typeof customTimestamp === 'number' ? customTimestamp : Date.now();

        var entries = getPrayerHistory({ prune: false });

        // Remove previous entry for exact same prayer, type, and date so re-marking updates timestamp
        entries = entries.filter(function (e) {
            return !(e.prayer === pName && e.type === type && e.date === prayerDate);
        });

        var idGen = typeof window.uid === 'function'
            ? window.uid('hist_')
            : ('hist_' + ts.toString(36) + Math.random().toString(36).slice(2, 6));

        var newEntry = {
            id: idGen,
            prayer: pName,
            type: type,
            date: prayerDate,
            timestamp: ts,
            createdAt: new Date(ts).toISOString()
        };

        entries.unshift(newEntry);
        savePrayerHistory(entries);

        if (isHistoryTabActive()) {
            renderPrayerHistoryTab();
        }

        return newEntry;
    }

    /**
     * Remove an entry from the activity log when a completed prayer is undone.
     * @param {string} prayerName
     * @param {string} trackingType - 'Current' or 'Old'
     * @param {string} prayerDate - 'YYYY-MM-DD'
     */
    function removePrayerHistoryEntry(prayerName, trackingType, prayerDate) {
        if (!prayerName || !prayerDate) return;

        var type = (trackingType === 'Old') ? 'Old' : 'Current';
        var pName = prayerName.charAt(0).toUpperCase() + prayerName.slice(1);

        var entries = getPrayerHistory({ prune: false });
        var beforeLen = entries.length;

        entries = entries.filter(function (e) {
            return !(e.prayer === pName && e.type === type && e.date === prayerDate);
        });

        if (entries.length !== beforeLen) {
            savePrayerHistory(entries);
            if (isHistoryTabActive()) {
                renderPrayerHistoryTab();
            }
        }
    }

    /**
     * Clear all activity history entries.
     */
    function clearPrayerHistory() {
        savePrayerHistory([]);
        if (isHistoryTabActive()) {
            renderPrayerHistoryTab();
        }
    }

    /**
     * Clear activity history entries by tracking type ('Current' or 'Old').
     * @param {string} trackingType
     */
    function clearPrayerHistoryByType(trackingType) {
        var type = (trackingType === 'Old') ? 'Old' : 'Current';
        var entries = getPrayerHistory({ prune: false });
        entries = entries.filter(function (e) {
            return e.type !== type;
        });
        savePrayerHistory(entries);
        if (isHistoryTabActive()) {
            renderPrayerHistoryTab();
        }
    }

    /**
     * Action triggered by the Empty button in the History header.
     * Shows confirmation dialog before deleting all activity log entries.
     */
    function emptyPrayerHistory() {
        var entries = getPrayerHistory({ prune: false });
        if (!entries || entries.length === 0) {
            if (typeof window.showToast === 'function') {
                window.showToast('Activity history is already empty.');
            } else {
                alert('Activity history is already empty.');
            }
            return;
        }

        var confirmed = confirm('Are you sure you want to delete all activity-log entries? This action cannot be undone.');
        if (!confirmed) return;

        clearPrayerHistory();
        if (typeof window.showToast === 'function') {
            window.showToast('Activity history emptied.');
        }
    }

    /**
     * Format timestamp into date and exact time: e.g. "04 Nov 2026, 03:46:12 PM".
     * @param {number|string} ts
     * @returns {string} Formatted timestamp
     */
    function formatHistoryTimestamp(ts) {
        if (!ts) return '';
        var d = new Date(ts);
        if (isNaN(d.getTime())) return '';

        var day = String(d.getDate()).padStart(2, '0');
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var month = months[d.getMonth()];
        var year = d.getFullYear();

        var hours = d.getHours();
        var minutes = String(d.getMinutes()).padStart(2, '0');
        var seconds = String(d.getSeconds()).padStart(2, '0');
        var ampm = hours >= 12 ? 'PM' : 'AM';
        var h12 = hours % 12;
        if (h12 === 0) h12 = 12;

        return day + ' ' + month + ' ' + year + ', ' + String(h12).padStart(2, '0') + ':' + minutes + ':' + seconds + ' ' + ampm;
    }

    /**
     * Relative time string: e.g. "Just now", "5m ago", "2h ago".
     * @param {number|string} ts
     * @returns {string}
     */
    function formatTimeAgo(ts) {
        if (!ts) return '';
        var diffMs = Date.now() - new Date(ts).getTime();
        if (diffMs < 0) diffMs = 0;
        var diffSec = Math.floor(diffMs / 1000);
        if (diffSec < 60) return 'Just now';
        var diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return diffMin + 'm ago';
        var diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return diffHr + 'h ago';
        var diffDays = Math.floor(diffHr / 24);
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return diffDays + 'd ago';
        return Math.floor(diffDays / 7) + 'w ago';
    }

    /**
     * Format prayer date: e.g. "Wed, 04 Nov 2026"
     * @param {string} dateStr YYYY-MM-DD
     * @returns {string}
     */
    function formatPrayerDate(dateStr) {
        if (!dateStr) return '';
        try {
            var d = new Date(dateStr + 'T00:00:00');
            if (isNaN(d.getTime())) return dateStr;
            var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var dayName = days[d.getDay()];
            var dayNum = String(d.getDate()).padStart(2, '0');
            var monthName = months[d.getMonth()];
            var year = d.getFullYear();
            return dayName + ', ' + dayNum + ' ' + monthName + ' ' + year;
        } catch (e) {
            return dateStr;
        }
    }

    /**
     * Render a single history entry card.
     * @param {Object} entry
     * @returns {string} HTML string
     */
    function renderHistoryEntryCard(entry) {
        var renderIconFn = typeof window.renderIcon === 'function' ? window.renderIcon : function (opts) {
            var n = typeof opts === 'object' ? opts.name : opts;
            return '<span class="icon-' + n + '"></span>';
        };

        var isCurrent = entry.type === 'Current';
        var typeBadgeClass = isCurrent
            ? 'badge-history-type-current'
            : 'badge-history-type-old';

        var pLower = (entry.prayer || '').toLowerCase();
        var pIcon = renderIconFn({ name: pLower, size: 22, color: 'text-brand' });
        var formattedDate = formatPrayerDate(entry.date);
        var exactTime = formatHistoryTimestamp(entry.timestamp);
        var ago = formatTimeAgo(entry.timestamp);

        return '<div class="rounded-2xl p-4 bg-white border border-borderGrey mb-3 flex flex-col gap-3 shadow-none" data-ref="page.history.card.' + (entry.id || '') + '">' +
            '  <!-- Row 1: Prayer Icon + Name + Badge (Left) and Completed (Right) -->' +
            '  <div class="flex items-center justify-between">' +
            '    <div class="flex items-center gap-2.5 min-w-0">' +
            '      <div class="w-11 h-11 rounded-xl bg-brand-light text-brand flex items-center justify-center shrink-0" style="width: 44px; height: 44px;" data-ref="page.history.item.avatar.' + (entry.id || '') + '">' +
            '        ' + pIcon +
            '      </div>' +
            '      <div class="flex items-center gap-2 min-w-0">' +
            '        <h6 class="fw-bold text-gr1 fs-5 mb-0 lh-1" data-ref="page.history.item.prayer.' + (entry.id || '') + '">' + entry.prayer + '</h6>' +
            '        <span class="badge-history-type ' + typeBadgeClass + '" data-ref="page.history.item.type.' + (entry.id || '') + '">' + entry.type + '</span>' +
            '      </div>' +
            '    </div>' +
            '    <span class="flex items-center gap-1.5 text-brand fs-sm fw-bold shrink-0">' +
            '      ' + renderIconFn({ name: 'check', size: 14, className: 'shrink-0' }) +
            '      <span>Completed</span>' +
            '    </span>' +
            '  </div>' +
            '  <!-- Row 2: Prayer Date -->' +
            '  <div class="text-muted fs-xs" data-ref="page.history.item.date.' + (entry.id || '') + '">' +
            '    Prayer Date: <strong class="text-gr1 fw-bold">' + formattedDate + '</strong>' +
            '  </div>' +
            '  <!-- Row 3: Completed exact time (Left) & Relative time (Right) -->' +
            '  <div class="flex items-center justify-between text-muted fs-xs">' +
            '    <div class="flex items-center gap-1.5" data-ref="page.history.item.time.' + (entry.id || '') + '">' +
            '      ' + renderIconFn({ name: 'clock', size: 12, className: 'shrink-0' }) +
            '      <span>Completed: <span class="text-gr1">' + exactTime + '</span></span>' +
            '    </div>' +
            '    <span class="text-muted">' + ago + '</span>' +
            '  </div>' +
            '</div>';
    }

    /**
     * Render the History tab content into #historyBody.
     */
    function renderPrayerHistoryTab() {
        var body = typeof window.$ === 'function' ? window.$('historyBody') : document.getElementById('historyBody');
        if (!body) return;

        var entries = getPrayerHistory({ prune: true });
        var totalCount = entries.length;

        // Update header subtitle if currently on History tab
        var oldSub = typeof window.$ === 'function' ? window.$('oldSub') : document.getElementById('oldSub');
        if (oldSub && typeof window.trackerSubTab !== 'undefined' && window.trackerSubTab === 'history') {
            oldSub.classList.remove('d-none');
            oldSub.textContent = 'Activity Log · ' + totalCount + (totalCount === 1 ? ' entry' : ' entries');
        }

        // Update Empty header button state
        var emptyBtn = typeof window.$ === 'function' ? window.$('historyEmptyBtn') : document.getElementById('historyEmptyBtn');
        if (emptyBtn) {
            if (totalCount === 0) {
                emptyBtn.classList.add('opacity-50');
            } else {
                emptyBtn.classList.remove('opacity-50');
            }
        }

        var emptyState = typeof window.$ === 'function' ? window.$('histEmptyState') : document.getElementById('histEmptyState');
        var content = typeof window.$ === 'function' ? window.$('histContent') : document.getElementById('histContent');
        var subtitleCount = typeof window.$ === 'function' ? window.$('histSubtitleCount') : document.getElementById('histSubtitleCount');
        var list = typeof window.$ === 'function' ? window.$('histList') : document.getElementById('histList');

        var vm = (typeof getTrackerViewModel === 'function') ? getTrackerViewModel() : null;
        var hasKo = typeof ko !== 'undefined' && vm && typeof vm.historyEntries === 'function';

        // Empty state
        if (totalCount === 0) {
            if (emptyState) emptyState.classList.remove('d-none');
            if (content) content.classList.add('d-none');
            if (hasKo) {
                vm.historyEntries([]);
            } else if (list) {
                list.innerHTML = '';
            }
            return;
        }

        // Summary Card + Entries List
        if (emptyState) emptyState.classList.add('d-none');
        if (content) content.classList.remove('d-none');

        var currentCount = entries.filter(function (e) { return e.type === 'Current'; }).length;
        var oldCount = entries.filter(function (e) { return e.type === 'Old'; }).length;

        var subText = totalCount + ' completed ' + (totalCount === 1 ? 'prayer' : 'prayers') + ' (' + currentCount + ' Current, ' + oldCount + ' Old)';
        if (subtitleCount) {
            subtitleCount.textContent = subText;
        }
        if (vm && typeof vm.historySubtitle === 'function') {
            vm.historySubtitle(subText);
        }

        var mapped = entries.map(function (entry) {
            return {
                id: entry.id,
                prayer: entry.prayer,
                iconName: (entry.prayer || '').toLowerCase(),
                type: entry.type,
                isCurrent: entry.type === 'Current',
                formattedDate: formatPrayerDate(entry.date),
                exactTime: formatHistoryTimestamp(entry.timestamp),
                ago: formatTimeAgo(entry.timestamp)
            };
        });

        if (hasKo) {
            vm.historyEntries(mapped);
        } else {
            if (list) {
                list.innerHTML = entries.map(renderHistoryEntryCard).join('');
            }
        }
    }

    function init() {
        // If tracker is already open on history tab on boot, render it
        if (typeof window.trackerSubTab !== 'undefined' && window.trackerSubTab === 'history') {
            renderPrayerHistoryTab();
        }
    }

    var PrayerHistoryApp = {
        init: init,
        getPrayerHistory: getPrayerHistory,
        savePrayerHistory: savePrayerHistory,
        addPrayerHistoryEntry: addPrayerHistoryEntry,
        removePrayerHistoryEntry: removePrayerHistoryEntry,
        clearPrayerHistory: clearPrayerHistory,
        clearPrayerHistoryByType: clearPrayerHistoryByType,
        emptyPrayerHistory: emptyPrayerHistory,
        renderPrayerHistoryTab: renderPrayerHistoryTab,
        formatHistoryTimestamp: formatHistoryTimestamp,
        formatTimeAgo: formatTimeAgo
    };

    window.PrayerHistoryApp = PrayerHistoryApp;
    window.getPrayerHistory = getPrayerHistory;
    window.addPrayerHistoryEntry = addPrayerHistoryEntry;
    window.removePrayerHistoryEntry = removePrayerHistoryEntry;
    window.clearPrayerHistory = clearPrayerHistory;
    window.clearPrayerHistoryByType = clearPrayerHistoryByType;
    window.emptyPrayerHistory = emptyPrayerHistory;
    window.renderPrayerHistoryTab = renderPrayerHistoryTab;

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {}));

export {
    rn,
    rOT,
    trackerViewModel
};

var PrayerTrackingApp = {
    init: initTracker,
    render: rn,
    getViewModel: getTrackerViewModel,
    registerComponents: registerPrayerTrackingComponents
};

if (typeof window !== 'undefined') {
    window.PrayerTrackingApp = PrayerTrackingApp;
    window.initTracker = initTracker;
    window.TrackerPageViewModel = TrackerPageViewModel;
    window.PrayerTrackerCardViewModel = PrayerTrackerCardViewModel;
    window.PrayerRowViewModel = PrayerRowViewModel;
    window.getTrackerViewModel = getTrackerViewModel;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initTracker: initTracker,
        rn: rn,
        rOT: rOT,
        registerPrayerTrackingComponents: registerPrayerTrackingComponents,
        TrackerPageViewModel: TrackerPageViewModel,
        PrayerTrackerCardViewModel: PrayerTrackerCardViewModel,
        PrayerRowViewModel: PrayerRowViewModel,
        getTrackerViewModel: getTrackerViewModel
    };
    module.exports.default = PrayerTrackingApp;
}

export default PrayerTrackingApp;

