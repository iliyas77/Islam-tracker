/* ============================================================
   Nur Prayer — Old Prayer Tracking Feature Module
   Path: prayer-tracking/old-tracking.js
   Responsibilities:
     - Old Tracking period settings, calendar & sequential clearance
     - Period info bottom sheet (start/end dates, total missed, per prayer)
     - Set Old Period bottom sheet & date pickers
     - Reactive update of TrackerPageViewModel.oldCard
   ============================================================ */
'use strict';

import { PrayerRowViewModel } from './tracker-view-model.js';
import { updatePerformanceTab } from './performance-view-model.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var PRAYER_CONSTANTS = _win.PRAYER_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.PRAYER) || {};
var COMMON_CONSTANTS = _win.COMMON_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.COMMON) || {};
var P = PRAYER_CONSTANTS.NAMES || _win.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
var T = _win.T || Object.assign({}, PRAYER_CONSTANTS.DEFAULT_TIMINGS || {});
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

export var oldSd = null;

function formatChipDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    var day = d.getDate();
    var currentYear = new Date().getFullYear();
    var yearStr = d.getFullYear() !== currentYear ? (' ' + d.getFullYear()) : '';
    return day + ' ' + MONTH_NAMES[d.getMonth()] + yearStr;
}

export function rOldInfo() {
    var o = typeof _win.rdOK === 'function' ? _win.rdOK() : null;
    if (!o) { rPeriod(); return; }

    var isAllCompleted = o.end < o.start;
    var dates = isAllCompleted ? [] : (typeof _win.datesInRange === 'function' ? _win.datesInRange(o.start, o.end) : []);
    var a = typeof _win.rdOC === 'function' ? _win.rdOC() : {};
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

    var frFn = typeof _win.fr === 'function' ? _win.fr : function (d) { return d; };
    var perPrayerHtml = P.map(function (p) {
        var c = perPrayer[p];
        var pIcon = typeof _win.renderIcon === 'function' ? _win.renderIcon(p.toLowerCase()) : (PRAYER_CARD_ICONS[p] || '');
        return '<div class="flex justify-between items-center py-2 px-3 rounded-3 mb-2 bg-surface">' +
            '<div class="flex items-center gap-2"><span class="fs-4">' + pIcon + '</span>' +
            '<span class="fw-bold fs-6">' + p + '</span></div>' +
            '<span class="badge rounded-pill ' + (c > 0 ? 'bg-danger text-white' : 'bg-brand text-white') +
            ' px-3 py-2 small">' + c + ' missed</span></div>';
    }).join('');

    var sheetCfg = (_win.CONSTANTS && _win.CONSTANTS.PRAYER && _win.CONSTANTS.PRAYER.SHEETS && _win.CONSTANTS.PRAYER.SHEETS.PERIOD_INFO) || {
        iconClass: 'circle-info text-brand',
        title: 'Period Info'
    };
    sheetCfg.sub = isAllCompleted ? (frFn(o.start) + ' → Complete') : (frFn(o.start) + ' → ' + frFn(o.end));
    if (_win.sheet2BS && typeof _win.sheet2BS.show === 'function') {
        _win.sheet2BS.show(sheetCfg);
    }
    if (_win.Icon && typeof _win.Icon.update === 'function' && _win.$ && _win.$('sheet2Icon')) {
        _win.Icon.update(_win.$('sheet2Icon'), sheetCfg.iconClass);
    } else if (_win.$ && _win.$('sheet2Icon')) {
        _win.$('sheet2Icon').className = sheetCfg.iconClass;
    }
    if (_win.$ && _win.$('sheet2Title')) _win.$('sheet2Title').textContent = sheetCfg.title;
    if (_win.$ && _win.$('sheet2Sub')) _win.$('sheet2Sub').textContent = sheetCfg.sub;

    if (_win.$) {
        var missedContent = _win.$('sheetMissedContent');
        var periodInfoContent = _win.$('sheetPeriodInfoContent');
        var setOldContent = _win.$('sheetSetOldPeriodContent');
        if (missedContent) missedContent.classList.add('d-none');
        if (setOldContent) setOldContent.classList.add('d-none');
        if (periodInfoContent) periodInfoContent.classList.remove('d-none');

        var startValEl = _win.$('sheetPeriodStartVal');
        if (startValEl) startValEl.textContent = frFn(o.start);
        var endValEl = _win.$('sheetPeriodEndVal');
        if (endValEl) endValEl.textContent = isAllCompleted ? 'Complete' : frFn(o.end);
        var totalDaysEl = _win.$('sheetPeriodTotalDaysVal');
        if (totalDaysEl) totalDaysEl.textContent = totalDays;
        var totalMissedEl = _win.$('sheetPeriodTotalMissedVal');
        if (totalMissedEl) totalMissedEl.textContent = totalMissed;
        var daysMissedEl = _win.$('sheetPeriodDaysMissedVal');
        if (daysMissedEl) daysMissedEl.textContent = daysMissed;
        var perPrayerEl = _win.$('sheetPeriodPerPrayer');
        if (perPrayerEl) perPrayerEl.innerHTML = perPrayerHtml;
    }
}

export function rPeriod() {
    var sheetCfg = (_win.CONSTANTS && _win.CONSTANTS.PRAYER && _win.CONSTANTS.PRAYER.SHEETS && _win.CONSTANTS.PRAYER.SHEETS.SET_OLD_PERIOD) || {
        iconClass: 'clock-rotate-left text-warning',
        title: 'Set Old Period',
        sub: ''
    };
    if (_win.sheet2BS && typeof _win.sheet2BS.show === 'function') {
        _win.sheet2BS.show(sheetCfg);
    }
    if (_win.Icon && typeof _win.Icon.update === 'function' && _win.$ && _win.$('sheet2Icon')) {
        _win.Icon.update(_win.$('sheet2Icon'), sheetCfg.iconClass);
    } else if (_win.$ && _win.$('sheet2Icon')) {
        _win.$('sheet2Icon').className = sheetCfg.iconClass;
    }
    if (_win.$ && _win.$('sheet2Title')) _win.$('sheet2Title').textContent = sheetCfg.title;
    if (_win.$ && _win.$('sheet2Sub')) _win.$('sheet2Sub').textContent = sheetCfg.sub;

    var o = typeof _win.rdOK === 'function' ? _win.rdOK() : null;
    var hasValidPeriod = o && o.end >= o.start;

    if (_win.$) {
        var missedContent = _win.$('sheetMissedContent');
        var periodInfoContent = _win.$('sheetPeriodInfoContent');
        var setOldContent = _win.$('sheetSetOldPeriodContent');
        if (missedContent) missedContent.classList.add('d-none');
        if (periodInfoContent) periodInfoContent.classList.add('d-none');
        if (setOldContent) setOldContent.classList.remove('d-none');

        var startInp = _win.$('oldStart');
        if (startInp) {
            startInp.value = o ? o.start : '';
            startInp.max = typeof _win.td === 'function' ? _win.td() : '';
        }
        var endInp = _win.$('oldEnd');
        if (endInp) {
            endInp.value = hasValidPeriod ? (o.initialEnd || o.end) : (o ? o.end : '');
            endInp.max = typeof _win.td === 'function' ? _win.td() : '';
        }
        var resetBtn = _win.$('sheetResetPeriodBtn');
        if (resetBtn) {
            if (o) resetBtn.classList.remove('d-none');
            else resetBtn.classList.add('d-none');
        }
    }
}

export function openOldCal() {
    var oldDp = _win.$ ? _win.$('oldDp') : null;
    if (!oldDp) return;
    var o = typeof _win.rdOK === 'function' ? _win.rdOK() : null;
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

export function goOld(d) {
    var o = typeof _win.rdOK === 'function' ? _win.rdOK() : null;
    if (!o || !d) return;
    if (o.end < o.start) return;
    if (d < o.start) d = o.start;
    if (d > o.end) d = o.end;
    oldSd = d;
    rOT();
}

export function setOldSd(d) {
    oldSd = d;
}

export function getDefaultOldPeriod() {
    var today = typeof _win.td === 'function' ? _win.td() : new Date().toISOString().slice(0, 10);
    var yesterday = typeof _win.prevDate === 'function' ? _win.prevDate(today) : today;
    var start = (typeof _win.rdSD === 'function' ? _win.rdSD() : null) || null;
    if (!start || start >= today) {
        var d = new Date();
        d.setDate(d.getDate() - 30);
        var pad2 = typeof _win.pad2 === 'function' ? _win.pad2 : function (n) { return n < 10 ? '0' + n : n; };
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

export function rOT() {
    if (typeof _win.ensureAllOldMissed === 'function') {
        _win.ensureAllOldMissed();
    }

    var o = typeof _win.rdOK === 'function' ? _win.rdOK() : null;
    var lst = _win.$ ? _win.$('oldBody') : (_win.document ? _win.document.getElementById('oldBody') : null);
    var sub = _win.$ ? _win.$('oldSub') : (_win.document ? _win.document.getElementById('oldSub') : null);
    if (!lst) return;

    if (!o) {
        var defaultPeriod = getDefaultOldPeriod();
        if (typeof _win.wrOK === 'function') _win.wrOK(defaultPeriod);
        if (typeof _win.ensureAllOldMissed === 'function') _win.ensureAllOldMissed();
        o = defaultPeriod;
    }

    if (o.end < o.start) {
        if (sub) sub.textContent = 'All days completed';
        return;
    }

    var frFn = typeof _win.fr === 'function' ? _win.fr : function (d) { return d; };
    if (sub) sub.textContent = frFn(o.start) + ' → ' + frFn(o.end);

    if (!oldSd || oldSd < o.start || oldSd > o.end) {
        oldSd = (typeof _win.currentOldDate === 'function' ? _win.currentOldDate() : null) || o.end;
    }
    var curDate = oldSd;

    var oldDp = _win.$ ? _win.$('oldDp') : null;
    if (oldDp) {
        oldDp.min = o.start;
        oldDp.max = o.end;
        oldDp.value = curDate;
    }

    var r = typeof _win.grO === 'function' ? _win.grO(curDate) : {};
    var missed = P.filter(function (p) { return r[p] === true || r[p] === 'missed'; });
    var done = P.filter(function (p) { return r[p] !== true && r[p] !== 'missed'; });
    var dateChipText = formatChipDate(curDate);

    // Update Knockout ViewModel reactively
    var vm = _win.trackerViewModel || (typeof _win.getTrackerViewModel === 'function' ? _win.getTrackerViewModel() : null);
    if (vm && vm.oldCard) {
        var card = typeof vm.oldCard === 'function' ? vm.oldCard() : vm.oldCard;
        if (card) {
            var oldMissedRowVms = missed.map(function (p) {
                return new PrayerRowViewModel({
                    prayer: p,
                    time: T[p] || '--:--',
                    isDone: false,
                    isUpcoming: false,
                    isMissed: true,
                    isCurrent: false,
                    isStandard: false,
                    prefix: 'page.old',
                    actionAct: 'toggle-old',
                    date: curDate,
                    iconClass: PRAYER_CARD_ICONS[p] || 'fa-solid fa-mosque'
                });
            });
            var oldDoneRowVms = done.map(function (p) {
                return new PrayerRowViewModel({
                    prayer: p,
                    time: T[p] || '--:--',
                    isDone: true,
                    isUpcoming: false,
                    isMissed: false,
                    isCurrent: false,
                    isStandard: false,
                    prefix: 'page.old',
                    actionAct: 'toggle-old',
                    date: curDate,
                    iconClass: PRAYER_CARD_ICONS[p] || 'fa-solid fa-mosque'
                });
            });

            if (typeof card.dateChipText === 'function') card.dateChipText(dateChipText);
            if (typeof card.badgeText === 'function') card.badgeText('');
            if (typeof card.actionBtnText === 'function') card.actionBtnText('');
            if (typeof card.missedGroupTitle === 'function') card.missedGroupTitle('MISSED (' + missed.length + ')');
            if (typeof card.missedRows === 'function') card.missedRows(oldMissedRowVms);
            if (typeof card.doneGroupTitle === 'function') card.doneGroupTitle('DONE (' + done.length + ')');
            if (typeof card.doneRows === 'function') card.doneRows(oldDoneRowVms);
        }
    }

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

