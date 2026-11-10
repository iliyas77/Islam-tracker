/* ============================================================
   Nur Prayer — Dashboard Service & Business Logic Layer
   Path: features/dashboard/dashboard-service.js
   Responsibilities:
     - Centralizes Dashboard-specific service/data/business logic
     - Clock time formatting and calculations
     - Prayer time status calculations (active, next, upcoming, passed)
     - Active prayer detection
     - Location configuration retrieval
     - Missed prayer count integration
     - Preserves all existing business logic, rules, and APIs
   ============================================================ */
'use strict';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

/* ---------- Dashboard Constants ---------- */
export var DASH_CONSTANTS = _win.DASHBOARD_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.DASHBOARD) || {};
export var PRAYER_CONSTANTS = _win.PRAYER_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.PRAYER) || {};
export var DASH_STATUSES = DASH_CONSTANTS.STATUSES || { ACTIVE: 'active', PASSED: 'passed', NEXT: 'next', UPCOMING: 'upcoming' };
export var DASH_STATUS_BADGES = DASH_CONSTANTS.STATUS_BADGES || {
    active: { className: 'badge-active', text: 'Active' },
    passed: { className: 'badge-passed', text: 'Passed' },
    next: { className: 'badge-next', text: 'Next' },
    upcoming: { className: 'badge-upcoming', text: 'Upcoming' }
};
export var DASH_CLOCK_INTERVAL = DASH_CONSTANTS.CLOCK_INTERVAL_MS || 1000;
export var SCHOOL_NAMES = PRAYER_CONSTANTS.SCHOOL_NAMES || { 1: 'Hanafi', 0: 'Shafi' };

export var TIMELINE_ICONS = {
    Fajr: 'fa-solid fa-cloud-sun',
    Dhuhr: 'fa-solid fa-sun',
    Asr: 'fa-solid fa-sun',
    Maghrib: 'fa-solid fa-cloud-sun',
    Isha: 'fa-solid fa-moon'
};

var dashTimer = null;
var dashCurrentActivePrayer = null;
var dashLastCheckedDate = typeof _win.td === 'function' ? _win.td() : null;
var dashTickListeners = [];

export function onDashTick(fn) {
    if (typeof fn === 'function') {
        dashTickListeners.push(fn);
        return function unsubscribe() {
            var idx = dashTickListeners.indexOf(fn);
            if (idx !== -1) dashTickListeners.splice(idx, 1);
        };
    }
    return function () {};
}

/* ---------- Helper Functions ---------- */
export function pad2(n) {
    if (typeof _win.pad2 === 'function') return _win.pad2(n);
    var s = String(n);
    return s.length < 2 ? '0' + s : s;
}

export function parseTimeToMin(timeStr) {
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

export function dashLiveHeaderTime() {
    var now = new Date();
    var h = now.getHours();
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12;
    if (hh === 0) hh = 12;
    return pad2(hh) + ':' + pad2(now.getMinutes()) + ' ' + ap;
}

export function getCurrentClockTime() {
    var now = new Date();
    var h = now.getHours();
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12;
    if (hh === 0) hh = 12;
    return {
        digits: pad2(hh) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds()),
        ampm: ap,
        hours: hh,
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
        rawHours: h
    };
}

export function getLocationInfo() {
    var cfg = typeof _win.getPrayerConfig === 'function' ? _win.getPrayerConfig() : { city: 'Guntur', school: 1 };
    var city = (cfg && cfg.city) || 'Guntur';
    var school = (cfg && cfg.school !== undefined) ? cfg.school : 1;
    var schoolName = SCHOOL_NAMES[school] || 'Hanafi';
    return {
        city: city,
        school: school,
        schoolName: schoolName,
        locationText: city + ' &bull; ' + schoolName
    };
}

export function getMissedPrayerCount() {
    if (_win.PrayerStore && typeof _win.PrayerStore.missedCount === 'function') {
        return _win.PrayerStore.missedCount();
    }
    if (typeof _win.getConsolidatedMissedCount === 'function') {
        return _win.getConsolidatedMissedCount();
    }
    if (typeof _win.tMT === 'function') {
        return _win.tMT();
    }
    return 0;
}

/* ---------- Timeline Prayer Statuses ---------- */
export function getTimelinePrayerStatuses(customTimings) {
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();

    var timings = customTimings || _win.T || {};
    var fajrMin = parseTimeToMin(timings.Fajr);
    var dhuhrMin = parseTimeToMin(timings.Dhuhr);
    var asrMin = parseTimeToMin(timings.Asr);
    var maghribMin = parseTimeToMin(timings.Maghrib);
    var ishaMin = parseTimeToMin(timings.Isha);

    var statuses = {};

    if (nowMin >= ishaMin || nowMin < fajrMin) {
        statuses.Fajr = nowMin >= ishaMin ? DASH_STATUSES.PASSED : DASH_STATUSES.UPCOMING;
        statuses.Dhuhr = nowMin >= ishaMin ? DASH_STATUSES.PASSED : DASH_STATUSES.UPCOMING;
        statuses.Asr = nowMin >= ishaMin ? DASH_STATUSES.PASSED : DASH_STATUSES.UPCOMING;
        statuses.Maghrib = nowMin >= ishaMin ? DASH_STATUSES.PASSED : DASH_STATUSES.UPCOMING;
        statuses.Isha = DASH_STATUSES.ACTIVE;
    } else if (nowMin >= maghribMin && nowMin < ishaMin) {
        statuses.Fajr = DASH_STATUSES.PASSED;
        statuses.Dhuhr = DASH_STATUSES.PASSED;
        statuses.Asr = DASH_STATUSES.PASSED;
        statuses.Maghrib = DASH_STATUSES.ACTIVE;
        statuses.Isha = DASH_STATUSES.NEXT;
    } else if (nowMin >= asrMin && nowMin < maghribMin) {
        statuses.Fajr = DASH_STATUSES.PASSED;
        statuses.Dhuhr = DASH_STATUSES.PASSED;
        statuses.Asr = DASH_STATUSES.ACTIVE;
        statuses.Maghrib = DASH_STATUSES.NEXT;
        statuses.Isha = DASH_STATUSES.UPCOMING;
    } else if (nowMin >= dhuhrMin && nowMin < asrMin) {
        statuses.Fajr = DASH_STATUSES.PASSED;
        statuses.Dhuhr = DASH_STATUSES.ACTIVE;
        statuses.Asr = DASH_STATUSES.NEXT;
        statuses.Maghrib = DASH_STATUSES.UPCOMING;
        statuses.Isha = DASH_STATUSES.UPCOMING;
    } else {
        statuses.Fajr = DASH_STATUSES.ACTIVE;
        statuses.Dhuhr = DASH_STATUSES.NEXT;
        statuses.Asr = DASH_STATUSES.UPCOMING;
        statuses.Maghrib = DASH_STATUSES.UPCOMING;
        statuses.Isha = DASH_STATUSES.UPCOMING;
    }

    return statuses;
}

export function getActivePrayerInfo(customTimings) {
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var timings = customTimings || _win.T || {};
    var fajrMin = parseTimeToMin(timings.Fajr);
    var statuses = getTimelinePrayerStatuses(timings);
    var prayers = _win.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    var activeName = 'Fajr';
    for (var i = 0; i < prayers.length; i++) {
        if (statuses[prayers[i]] === 'active') {
            activeName = prayers[i];
            break;
        }
    }
    return {
        name: activeName,
        time: timings[activeName] || '--:--',
        isYesterday: (activeName === 'Isha' && nowMin < fajrMin)
    };
}

/* ---------- Dashboard Clock & Lifecycle Service ---------- */
export function dashTick() {
    var curDate = typeof _win.td === 'function' ? _win.td() : null;
    if (curDate && dashLastCheckedDate && curDate !== dashLastCheckedDate) {
        dashLastCheckedDate = curDate;
        if (typeof _win.ensureCurrentDateInitialized === 'function') {
            _win.ensureCurrentDateInitialized();
        }
        if (typeof _win.refreshPrayerTimesUI === 'function') {
            _win.refreshPrayerTimesUI(curDate);
        }
    } else if (curDate && !dashLastCheckedDate) {
        dashLastCheckedDate = curDate;
    }

    var vm = (typeof _win.getDashboardViewModel === 'function')
        ? _win.getDashboardViewModel()
        : _win.dashboardViewModel;

    if (vm) {
        if (typeof vm.updateClock === 'function') vm.updateClock();
        if (typeof vm.updateTrackerBadge === 'function') vm.updateTrackerBadge();
    } else {
        var digitsEl = typeof _win.$ === 'function' ? _win.$('dashClockDigits') : null;
        var ampmEl = typeof _win.$ === 'function' ? _win.$('dashClockAmPm') : null;
        if (digitsEl && ampmEl) {
            var timeInfo = getCurrentClockTime();
            digitsEl.textContent = timeInfo.digits;
            ampmEl.textContent = timeInfo.ampm;
        }
        var trackerBadgeEl = document.getElementById('trackerMissedBadge');
        if (trackerBadgeEl) {
            var tm = getMissedPrayerCount();
            if (tm > 0) {
                trackerBadgeEl.className = 'dash-tracker-badge dash-tracker-badge-missed';
                trackerBadgeEl.textContent = tm + ' missed';
            } else {
                trackerBadgeEl.className = 'dash-tracker-badge dash-tracker-badge-missed d-none';
                trackerBadgeEl.textContent = '';
            }
        }
    }

    var liveTimeEl = typeof _win.$ === 'function' ? _win.$('dashLiveTime') : null;
    if (liveTimeEl) {
        liveTimeEl.textContent = dashLiveHeaderTime();
    }

    var curActive = getActivePrayerInfo();
    if (dashCurrentActivePrayer && curActive && curActive.name !== dashCurrentActivePrayer) {
        if (typeof _win.rDashboard === 'function') {
            _win.rDashboard();
        }
    }

    // Notify registered listeners
    for (var i = 0; i < dashTickListeners.length; i++) {
        try {
            dashTickListeners[i]();
        } catch (_) {}
    }
}

export function startDashClock() {
    if (dashTimer) clearInterval(dashTimer);
    dashTick();
    dashTimer = setInterval(dashTick, DASH_CLOCK_INTERVAL);
    return dashTimer;
}

export function stopDashClock() {
    if (dashTimer) {
        clearInterval(dashTimer);
        dashTimer = null;
    }
}

export function setDashCurrentActivePrayer(name) {
    dashCurrentActivePrayer = name;
}

export function getDashCurrentActivePrayer() {
    return dashCurrentActivePrayer;
}

/* ---------- Centralized Dashboard Service Object ---------- */
export const DashboardService = {
    pad2: pad2,
    parseTimeToMin: parseTimeToMin,
    dashLiveHeaderTime: dashLiveHeaderTime,
    getCurrentClockTime: getCurrentClockTime,
    getLocationInfo: getLocationInfo,
    getMissedPrayerCount: getMissedPrayerCount,
    getTimelinePrayerStatuses: getTimelinePrayerStatuses,
    getActivePrayerInfo: getActivePrayerInfo,
    dashTick: dashTick,
    startDashClock: startDashClock,
    stopDashClock: stopDashClock,
    onDashTick: onDashTick,
    setDashCurrentActivePrayer: setDashCurrentActivePrayer,
    getDashCurrentActivePrayer: getDashCurrentActivePrayer,
    CONSTANTS: DASH_CONSTANTS,
    STATUSES: DASH_STATUSES,
    STATUS_BADGES: DASH_STATUS_BADGES,
    CLOCK_INTERVAL: DASH_CLOCK_INTERVAL,
    SCHOOL_NAMES: SCHOOL_NAMES,
    TIMELINE_ICONS: TIMELINE_ICONS
};

// Global backward compatibility
if (typeof window !== 'undefined') {
    window.DashboardService = DashboardService;
    window.dashLiveHeaderTime = dashLiveHeaderTime;
    window.parseTimeToMin = parseTimeToMin;
    window.getTimelinePrayerStatuses = getTimelinePrayerStatuses;
    window.getActivePrayerInfo = getActivePrayerInfo;
    window.dashTick = dashTick;
    window.startDashClock = startDashClock;
    window.onDashTick = onDashTick;
}

export default DashboardService;

