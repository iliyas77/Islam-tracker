/* ============================================================
   Nur Prayer — Dashboard Feature Module
   Path: dashboard.js
   Matches the Reference UI Layout & Styling Pixel-Perfect
   ============================================================ */

function dashLiveHeaderTime() {
    var now = new Date();
    var h = now.getHours();
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12;
    if (hh === 0) hh = 12;
    return pad2(hh) + ':' + pad2(now.getMinutes()) + ' ' + ap;
}

function dashBigTimeHtml() {
    var now = new Date();
    var h = now.getHours();
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12;
    if (hh === 0) hh = 12;
    return '<span class="dash-clock-digits">' + pad2(hh) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds()) + '</span>' +
        '<span class="dash-clock-ampm">' + ap + '</span>';
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

var dashCurrentActivePrayer = null;
var dashLastCheckedDate = typeof td === 'function' ? td() : null;

/* ---------- Dashboard Clock ---------- */
var DASH_CONSTANTS = (window.CONSTANTS && window.CONSTANTS.DASHBOARD) || {};
var DASH_STATUSES = DASH_CONSTANTS.STATUSES || { ACTIVE: 'active', PASSED: 'passed', NEXT: 'next', UPCOMING: 'upcoming' };
var DASH_STATUS_BADGES = DASH_CONSTANTS.STATUS_BADGES || {
    active: { className: 'badge-active', text: 'Active' },
    passed: { className: 'badge-passed', text: 'Passed' },
    next: { className: 'badge-next', text: 'Next' },
    upcoming: { className: 'badge-upcoming', text: 'Upcoming' }
};
var DASH_CLOCK_INTERVAL = DASH_CONSTANTS.CLOCK_INTERVAL_MS || 1000;
var SCHOOL_NAMES = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.SCHOOL_NAMES) || { 1: 'Hanafi', 0: 'Shafi' };

function dashTick() {
    var curDate = typeof td === 'function' ? td() : null;
    if (curDate && dashLastCheckedDate && curDate !== dashLastCheckedDate) {
        dashLastCheckedDate = curDate;
        if (typeof ensureCurrentDateInitialized === 'function') {
            ensureCurrentDateInitialized();
        }
        if (typeof refreshPrayerTimesUI === 'function') {
            refreshPrayerTimesUI(curDate);
        }
    } else if (curDate && !dashLastCheckedDate) {
        dashLastCheckedDate = curDate;
    }

    var digitsEl = $('dashClockDigits');
    var ampmEl = $('dashClockAmPm');
    if (digitsEl && ampmEl) {
        var now = new Date();
        var h = now.getHours();
        var ap = h >= 12 ? 'PM' : 'AM';
        var hh = h % 12;
        if (hh === 0) hh = 12;
        digitsEl.textContent = pad2(hh) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
        ampmEl.textContent = ap;
    } else {
        var timeEl = $('dashTime');
        if (timeEl) {
            timeEl.innerHTML = dashBigTimeHtml();
        }
    }

    var liveTimeEl = $('dashLiveTime');
    if (liveTimeEl) {
        liveTimeEl.textContent = dashLiveHeaderTime();
    }

    var trackerBadgeEl = document.getElementById('trackerMissedBadge');
    if (trackerBadgeEl && typeof getConsolidatedMissedCount === 'function') {
        var tm = getConsolidatedMissedCount();
        if (tm > 0) {
            trackerBadgeEl.className = 'dash-tracker-badge dash-tracker-badge-missed';
            trackerBadgeEl.textContent = tm + ' missed';
        } else {
            trackerBadgeEl.className = 'dash-tracker-badge dash-tracker-badge-missed d-none';
            trackerBadgeEl.textContent = '';
        }
    }

    if (typeof getActivePrayerInfo === 'function') {
        var curActive = getActivePrayerInfo();
        if (dashCurrentActivePrayer && curActive && curActive.name !== dashCurrentActivePrayer) {
            rDashboard();
            return;
        }
    }
}

function startDashClock() {
    if (dashTimer) clearInterval(dashTimer);
    dashTick();
    dashTimer = setInterval(dashTick, DASH_CLOCK_INTERVAL);
}

/* ---------- Timeline Prayer Statuses ---------- */
function getTimelinePrayerStatuses() {
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();

    var fajrMin = parseTimeToMin(T.Fajr);
    var dhuhrMin = parseTimeToMin(T.Dhuhr);
    var asrMin = parseTimeToMin(T.Asr);
    var maghribMin = parseTimeToMin(T.Maghrib);
    var ishaMin = parseTimeToMin(T.Isha);

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

function getActivePrayerInfo() {
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var fajrMin = parseTimeToMin(T.Fajr);
    var statuses = getTimelinePrayerStatuses();
    var activeName = 'Fajr';
    for (var i = 0; i < P.length; i++) {
        if (statuses[P[i]] === 'active') {
            activeName = P[i];
            break;
        }
    }
    return {
        name: activeName,
        time: T[activeName] || '--:--',
        isYesterday: (activeName === 'Isha' && nowMin < fajrMin)
    };
}


var TIMELINE_ICONS = (window.CONSTANTS && window.CONSTANTS.DASHBOARD && window.CONSTANTS.DASHBOARD.TIMELINE_ICONS) || window.TIMELINE_ICONS || {};

/* ---------- Dashboard Render ---------- */
function rDashboard() {
    var body = $('dashBody');
    if (!body) return;

    var activeP = typeof getActivePrayerInfo === 'function' ? getActivePrayerInfo() : {
        name: 'Fajr',
        time: T.Fajr,
        isYesterday: false
    };
    dashCurrentActivePrayer = activeP.name;

    var cfg = typeof getPrayerConfig === 'function' ? getPrayerConfig() : { city: 'Guntur', school: 1 };

    var locEl = $('dashLocationText');
    if (locEl) {
        locEl.innerHTML = cfg.city + ' &bull; ' + (SCHOOL_NAMES[cfg.school] || 'Hanafi');
    }

    var statuses = getTimelinePrayerStatuses();
    P.forEach(function (p) {
        var st = statuses[p] || DASH_STATUSES.UPCOMING;
        var isActive = st === DASH_STATUSES.ACTIVE;

        var timeEl = $('dashTime' + p);
        if (timeEl) {
            timeEl.textContent = T[p] || '--:--';
        }

        var badgeEl = $('dashBadge' + p);
        if (badgeEl) {
            var badgeInfo = DASH_STATUS_BADGES[st] || DASH_STATUS_BADGES[DASH_STATUSES.UPCOMING];
            badgeEl.className = 'dash-timeline-badge ' + badgeInfo.className;
            badgeEl.textContent = badgeInfo.text;
        }

        var iconBox = $('dashIconBox' + p);
        if (iconBox) {
            if (isActive) {
                iconBox.classList.add('icon-box-active');
            } else {
                iconBox.classList.remove('icon-box-active');
            }
        }
    });

    var totalMissed = typeof getConsolidatedMissedCount === 'function'
        ? getConsolidatedMissedCount()
        : (typeof tMT === 'function' ? tMT() : 0);
    var hasMissed = totalMissed > 0;
    var trackerBadgeEl = $('trackerMissedBadge');
    if (trackerBadgeEl) {
        if (hasMissed) {
            trackerBadgeEl.className = 'dash-tracker-badge dash-tracker-badge-missed';
            trackerBadgeEl.textContent = totalMissed + ' missed';
        } else {
            trackerBadgeEl.className = 'dash-tracker-badge dash-tracker-badge-missed d-none';
            trackerBadgeEl.textContent = '';
        }
    }

    startDashClock();
}
