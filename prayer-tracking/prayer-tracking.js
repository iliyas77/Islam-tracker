/* ============================================================
   Nur Prayer — Prayer Tracking Feature Module (Coordinator)
   Path: prayer-tracking/prayer-tracking.js
   Consolidates & exports:
     - TrackerPageViewModel, PrayerTrackerCardViewModel, PrayerRowViewModel (tracker-view-model.js)
     - Old Tracking logic & sheets (old-tracking.js)
     - Prayer Performance statistics & calculations (performance-view-model.js)
     - Activity Log history & persistence (history-view-model.js)
     - Current tracking operational logic & render functions (rn, go, rMS)
   ============================================================ */
'use strict';

// 1. Import from submodules
export {
    TrackerPageTemplate,
    PrayerHeaderTemplate,
    PrayerTrackerCardTemplate,
    PrayerRowTemplate,
    PrayerStatCardTemplate,
    PrayerPerfRingTemplate,
    PrayerNavTabTemplate,
    PrayerHistoryCardTemplate,
    PrayerTrackerCardViewModel,
    PrayerRowViewModel,
    TrackerPageViewModel,
    getTrackerViewModel,
    registerPrayerTrackingComponents,
    initTracker
} from './tracker-view-model.js';

export {
    calculatePrayerPerformance,
    renderPerformanceTab,
    updatePerformanceTab
} from './performance-view-model.js';

export {
    getPrayerHistory,
    savePrayerHistory,
    addPrayerHistoryEntry,
    removePrayerHistoryEntry,
    clearPrayerHistory,
    clearPrayerHistoryByType,
    emptyPrayerHistory,
    renderPrayerHistoryTab,
    formatHistoryTimestamp,
    formatTimeAgo,
    formatPrayerDate,
    renderHistoryEntryCard,
    initPrayerHistory,
    PrayerHistoryApp
} from './history-view-model.js';

export {
    oldSd,
    rOldInfo,
    rPeriod,
    openOldCal,
    goOld,
    setOldSd,
    getDefaultOldPeriod,
    rOT
} from './old-tracking.js';

import {
    PrayerRowViewModel,
    getTrackerViewModel,
    registerPrayerTrackingComponents,
    initTracker
} from './tracker-view-model.js';

import { updatePerformanceTab } from './performance-view-model.js';
import { addPrayerHistoryEntry, removePrayerHistoryEntry, renderPrayerHistoryTab } from './history-view-model.js';
import { rOT } from './old-tracking.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var PRAYER_CONSTANTS = _win.PRAYER_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.PRAYER) || {};
var COMMON_CONSTANTS = _win.COMMON_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.COMMON) || {};
var P = PRAYER_CONSTANTS.NAMES || _win.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
var T = _win.T || Object.assign({}, PRAYER_CONSTANTS.DEFAULT_TIMINGS || {});
var sd = _win.sd || (typeof _win.td === 'function' ? _win.td() : new Date().toISOString().slice(0, 10));
var I = PRAYER_CONSTANTS.ICONS || _win.I || {};
var PRAYER_CARD_ICONS = {
    Fajr: 'fa-solid fa-cloud-sun',
    Dhuhr: 'fa-solid fa-sun',
    Asr: 'fa-solid fa-sun',
    Maghrib: 'fa-solid fa-cloud-sun',
    Isha: 'fa-solid fa-moon'
};
var MONTH_NAMES = COMMON_CONSTANTS.MONTH_NAMES || (_win.CONSTANTS && ((_win.CONSTANTS.COMMON && _win.CONSTANTS.COMMON.MONTH_NAMES) || (_win.CONSTANTS.DATE && _win.CONSTANTS.DATE.MONTH_NAMES))) || _win.MONTH_NAMES || [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function $(id) {
    if (typeof _win.$ === 'function' && _win.$ !== $) return _win.$(id);
    return (_win.document && typeof _win.document.getElementById === 'function')
        ? _win.document.getElementById(id)
        : null;
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
    var today = typeof _win.td === 'function' ? _win.td() : '';
    if (dateStr && dateStr !== today) return false;
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var pTime = (_win.T && _win.T[prayerName]) || T[prayerName];
    if (!pTime) return false;
    var pMin = parseTimeToMin(pTime);
    if (pMin === -1) return false;
    return nowMin < pMin;
}

function isDonePrayer(p, dateStr, r) {
    if (!r) {
        var d = dateStr || (typeof _win.sd !== 'undefined' ? _win.sd : (typeof _win.td === 'function' ? _win.td() : ''));
        r = typeof _win.gr === 'function' ? _win.gr(d) : {};
    }
    if (!r) return false;
    if (r[p] === false || r[p] === 'done') return true;
    if (r[p] === true || r[p] === 'missed') return false;
    if (dateStr && typeof _win.rd === 'function' && !_win.rd()[dateStr]) {
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

export function rn() {
    var dp = $('dp');
    var todayStr = typeof _win.td === 'function' ? _win.td() : '';
    var currSd = _win.sd || (typeof _win.PrayerStore !== 'undefined' && _win.PrayerStore ? _win.PrayerStore.selectedDate() : sd);
    if (dp) {
        dp.value = currSd;
        dp.max = todayStr;
    }

    var r = typeof _win.en === 'function' ? _win.en(currSd) : (typeof _win.gr === 'function' ? _win.gr(currSd) : {});
    var isToday = currSd === todayStr;
    var missTotal = (_win.PrayerStore && typeof _win.PrayerStore.missedCount === 'function')
        ? _win.PrayerStore.missedCount()
        : (typeof _win.tMT === 'function' ? _win.tMT() : 0);

    var done = [];
    var missed = [];
    var upcoming = [];

    P.forEach(function (p) {
        if (isDonePrayer(p, currSd, r)) {
            done.push(p);
        } else {
            if (isToday && isPrayerUpcoming(p, currSd)) {
                upcoming.push(p);
            }
            missed.push(p);
        }
    });

    var curActive = isToday && typeof _win.getActivePrayerInfo === 'function' ? _win.getActivePrayerInfo() : null;
    var curPrayerName = curActive ? curActive.name : null;

    var actualMissedCount = missed.filter(function (p) {
        return upcoming.indexOf(p) === -1 && p !== curPrayerName;
    }).length;
    var badgeText = actualMissedCount > 0 ? ('Missed (' + actualMissedCount + ')') : 'Missed';
    var actionBtnText = isToday ? 'Select All' : 'Today';
    var actionBtnAct = isToday ? 'select-all' : 'jump-today';
    var dateChipText = formatChipDate(currSd);

    // Update Knockout ViewModel reactively
    var vm = _win.trackerViewModel || (typeof getTrackerViewModel === 'function' ? getTrackerViewModel() : null);
    if (vm && vm.currentCard) {
        var card = typeof vm.currentCard === 'function' ? vm.currentCard() : vm.currentCard;
        if (card) {
            var timings = _win.T || T;
            var missedRowVms = missed.map(function (p) {
                var isUp = upcoming.indexOf(p) !== -1;
                var isCur = (p === curPrayerName && !isUp);
                var isMsd = !isUp && !isCur;
                return new PrayerRowViewModel({
                    prayer: p,
                    time: timings[p] || '--:--',
                    isDone: false,
                    isUpcoming: isUp,
                    isMissed: isMsd,
                    isCurrent: isCur,
                    isStandard: isCur,
                    prefix: 'page.current',
                    actionAct: 'toggle-cur',
                    date: currSd,
                    iconClass: PRAYER_CARD_ICONS[p] || 'fa-solid fa-mosque'
                });
            });
            var doneRowVms = done.map(function (p) {
                return new PrayerRowViewModel({
                    prayer: p,
                    time: timings[p] || '--:--',
                    isDone: true,
                    isUpcoming: false,
                    isMissed: false,
                    isCurrent: false,
                    isStandard: false,
                    prefix: 'page.current',
                    actionAct: 'toggle-cur',
                    date: currSd,
                    iconClass: PRAYER_CARD_ICONS[p] || 'fa-solid fa-mosque'
                });
            });

            if (typeof card.dateChipText === 'function') card.dateChipText(dateChipText);
            if (typeof card.badgeText === 'function') card.badgeText(actualMissedCount > 0 ? ('Missed (' + actualMissedCount + ')') : '');
            if (typeof card.badgeAct === 'function') card.badgeAct(missTotal > 0 ? 'missed-open' : '');
            if (typeof card.actionBtnText === 'function') card.actionBtnText(actionBtnText);
            if (typeof card.actionBtnAct === 'function') card.actionBtnAct(actionBtnAct);
            if (typeof card.missedGroupTitle === 'function') card.missedGroupTitle('MISSED (' + missed.length + ')');
            if (typeof card.missedRows === 'function') card.missedRows(missedRowVms);
            if (typeof card.doneGroupTitle === 'function') card.doneGroupTitle('DONE (' + done.length + ')');
            if (typeof card.doneRows === 'function') card.doneRows(doneRowVms);
        }
    }

    updateCurrentMissedBadge();
    if (typeof updatePerformanceTab === 'function') {
        updatePerformanceTab();
    }
}

export function updateCurrentMissedBadge() {
    var totalMissed = typeof _win.getConsolidatedMissedCount === 'function'
        ? _win.getConsolidatedMissedCount()
        : 0;
    var vm = _win.trackerViewModel || (typeof getTrackerViewModel === 'function' ? getTrackerViewModel() : null);
    if (vm && typeof vm.missedCount === 'function' && vm.missedCount !== (_win.PrayerStore && _win.PrayerStore.missedCount)) {
        vm.missedCount(totalMissed);
    }
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

export function go(d) {
    var todayStr = typeof _win.td === 'function' ? _win.td() : '';
    if (d > todayStr) d = todayStr;
    if (_win.PrayerStore && typeof _win.PrayerStore.selectDate === 'function') {
        _win.PrayerStore.selectDate(d);
    } else {
        _win.sd = d;
    }
    if (typeof _win.fetchPrayerTimings === 'function') {
        _win.fetchPrayerTimings(d, function () { rn(); });
    }
    rn();
}

/* ---------- Missed Prayers Sheet ---------- */
function missTile(date, p) {
    var iconHtml = typeof _win.renderIcon === 'function' ? _win.renderIcon(p.toLowerCase()) : (I[p] || '');
    return '<div class="rounded-3 p-2 flex flex-col items-center justify-center gap-1.5 bg-danger-subtle min-w-0" ' +
        'data-ref="page.current.missed-sheet.tile.' + p.toLowerCase() + '">' +
        '<span class="fs-4 flex items-center justify-center">' + iconHtml + '</span>' +
        '<span class="fw-bold text-truncate w-100 text-center fs-xs text-dark">' + p + '</span>' +
        '<span class="badge-pill-custom badge-missed inline-flex items-center fs-xs py-1 px-1.5">' +
        (typeof _win.renderIcon === 'function' ? _win.renderIcon('circle-exclamation') : '') + 'Missed</span>' +
        '</div>';
}

function missCard(x) {
    var tiles = x.prayers.map(function (p) { return missTile(x.date, p); }).join('');
    var missedCount = x.prayers.length;
    var friendlyFn = typeof _win.friendly === 'function' ? _win.friendly : function (d) { return d; };
    var frFn = typeof _win.fr === 'function' ? _win.fr : function (d) { return d; };
    var countBadge = '<span class="badge-pill-custom badge-missed fs-xs py-1 px-2 inline-flex items-center gap-1 shrink-0">' +
        missedCount + ' Missed' +
        (typeof _win.renderIcon === 'function' ? _win.renderIcon({ name: 'chevron-right', size: 'fs-xs', className: 'opacity-75' }) : '') + '</span>';

    return '<div class="card border border-borderGrey rounded-4 p-2 bg-gr cursor-pointer" role="button" data-act="jump" data-d="' + x.date + '" data-ref="page.current.missed-sheet.card.' + x.date + '">' +
        '<div class="flex items-center justify-between gap-2 mb-2 px-1" data-ref="page.current.missed-sheet.card.header">' +
        '<div class="flex items-center gap-2 min-w-0" data-ref="page.current.missed-sheet.card.info">' +
        '<div class="w-9 h-9 min-w-[36px] min-h-[36px] rounded-[10px] bg-dash-mintBg text-gr-accent inline-flex items-center justify-center shrink-0 leading-none select-none overflow-hidden" data-ref="page.current.missed-sheet.card.icon">' + (typeof _win.renderIcon === 'function' ? _win.renderIcon({ name: 'calendar-days', color: 'text-gr-accent' }) : '') + '</div>' +
        '<div class="min-w-0">' +
        '<div class="fw-bold text-gr1 fs-5 lh-1 text-truncate" data-ref="page.current.missed-sheet.card.title">' + friendlyFn(x.date) + '</div>' +
        '<div class="text-gr-accent fw-semibold small mt-0.5 text-truncate" data-ref="page.current.missed-sheet.card.date">' + frFn(x.date) + '</div>' +
        '</div>' +
        '</div>' +
        countBadge +
        '</div>' +
        '<div class="grid grid-cols-3 gap-2 w-100 missed-tiles-grid" data-ref="page.current.missed-sheet.card.tiles">' + tiles + '</div>' +
        '</div>';
}

export function rMS() {
    var sheetCfg = (_win.CONSTANTS && _win.CONSTANTS.PRAYER && _win.CONSTANTS.PRAYER.SHEETS && _win.CONSTANTS.PRAYER.SHEETS.MISSED_PRAYERS) || {
        iconClass: 'clipboard-list text-gr-accent',
        title: 'Missed Prayers',
        sub: 'From previous days (today excluded)'
    };
    if (_win.sheet2BS && typeof _win.sheet2BS.show === 'function') {
        _win.sheet2BS.show(sheetCfg);
    }
    if (_win.Icon && typeof _win.Icon.update === 'function' && $('sheet2Icon')) {
        _win.Icon.update($('sheet2Icon'), sheetCfg.iconClass);
    } else if ($('sheet2Icon')) {
        $('sheet2Icon').className = sheetCfg.iconClass;
    }
    if ($('sheet2Title')) $('sheet2Title').textContent = sheetCfg.title;
    if ($('sheet2Sub')) $('sheet2Sub').textContent = sheetCfg.sub;

    var list = (typeof _win.mBD === 'function' ? _win.mBD() : []).reverse();
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

export var PrayerTrackingApp = {
    init: initTracker,
    render: rn,
    getViewModel: getTrackerViewModel,
    registerComponents: registerPrayerTrackingComponents
};

if (typeof window !== 'undefined') {
    window.rn = rn;
    window.go = go;
    window.rMS = rMS;
    window.updateCurrentMissedBadge = updateCurrentMissedBadge;
    window.PrayerTrackingApp = PrayerTrackingApp;
}

export default PrayerTrackingApp;
