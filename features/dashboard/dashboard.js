/* ============================================================
   Nur Prayer — Dashboard Feature Module
   Path: features/dashboard/dashboard.js
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

    var timeEl = $('dashTime');
    if (timeEl) {
        timeEl.innerHTML = dashBigTimeHtml();
    }

    var liveTimeEl = $('dashLiveTime');
    if (liveTimeEl) {
        liveTimeEl.textContent = dashLiveHeaderTime();
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

/* ---------- Dedicated SVG Graphics matching Reference UI ---------- */
var _svgC = (window.SVG_CONSTANTS) || {};
var DASH_SVG_MOSQUE_CLOCK  = (_svgC.SHARED  && _svgC.SHARED.MOSQUE)        || '';
var DASH_SVG_MOSQUE_HEADER = DASH_SVG_MOSQUE_CLOCK;
var DASH_SVG_RUB_EL_HIZB   = (_svgC.DASHBOARD && _svgC.DASHBOARD.RUB_EL_HIZB) || '';
var DASH_SVG_TRACKER        = (_svgC.DASHBOARD && _svgC.DASHBOARD.TRACKER)     || '';
var DASH_SVG_TASBEEH        = (_svgC.SHARED  && _svgC.SHARED.MISBAHA)       || '';
var DASH_SVG_DUAS           = (_svgC.DASHBOARD && _svgC.DASHBOARD.DUAS)        || '';
var DASH_SVG_SETTINGS       = (_svgC.DASHBOARD && _svgC.DASHBOARD.SETTINGS)    || '';
var DASH_SVG_CHEVRON        = (_svgC.DASHBOARD && _svgC.DASHBOARD.CHEVRON)     || '';
var DASH_SVG_CORNER_TL      = (_svgC.DASHBOARD && _svgC.DASHBOARD.CORNER_TL)    || '';
var DASH_SVG_CORNER_TR      = (_svgC.DASHBOARD && _svgC.DASHBOARD.CORNER_TR)    || '';

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

    var statuses = getTimelinePrayerStatuses();
    var timelineNodesHtml = P.map(function (p) {
        var st = statuses[p] || DASH_STATUSES.UPCOMING;
        var isActive = st === DASH_STATUSES.ACTIVE;
        var circleClass = isActive ? 'dash-timeline-circle active flex items-center justify-center' : 'dash-timeline-circle flex items-center justify-center';

        var badgeInfo = DASH_STATUS_BADGES[st] || DASH_STATUS_BADGES[DASH_STATUSES.UPCOMING];
        var badgeClass = badgeInfo.className;
        var badgeText = badgeInfo.text;

        var prayerIcon = TIMELINE_ICONS[p] || '';

        return '<div class="dash-timeline-col flex-1 flex flex-col items-center" data-ref="page.dashboard.timeline.item.' + p.toLowerCase() + '">' +
            '  <div class="' + circleClass + '" data-ref="page.dashboard.timeline.icon.' + p.toLowerCase() + '">' +
            prayerIcon +
            '  </div>' +
            '  <div class="dash-timeline-name" data-ref="page.dashboard.timeline.name.' + p.toLowerCase() + '">' + p + '</div>' +
            '  <div class="dash-timeline-time" data-ref="page.dashboard.timeline.time.' + p.toLowerCase() + '">' + (T[p] || '--:--') + '</div>' +
            '  <span class="dash-timeline-badge ' + badgeClass + '" data-ref="page.dashboard.timeline.badge.' + p.toLowerCase() + '">' + badgeText + '</span>' +
            '</div>';
    }).join('');

    body.innerHTML =
        '<div class="dash-container flex flex-col" data-ref="page.dashboard.container">' +
        '  <!-- Background Islamic Geometric Watermark -->' +
        '  <div class="dash-bg-pattern-top" aria-hidden="true">' +
        '    ' + DASH_SVG_CORNER_TL +
        '    ' + DASH_SVG_CORNER_TR +
        '  </div>' +
        '' +
        '  <!-- Top Header Bar: Location & Mosque Silhouette -->' +
        '  <header class="dash-top-header flex items-center justify-between" data-ref="page.dashboard.header">' +
        '    <div class="dash-location-text flex items-center" data-ref="page.dashboard.header.location">' +
        '      <i class="fa-solid fa-location-dot dash-location-icon" data-ref="page.dashboard.header.location-icon"></i>' +
        '      <span data-ref="page.dashboard.header.location-text">' + cfg.city + ' &bull; ' + (SCHOOL_NAMES[cfg.school] || 'Hanafi') + '</span>' +
        '    </div>' +
        '    <div class="dash-header-mosque flex items-center justify-center" data-ref="page.dashboard.header.mosque-icon">' +
        '      ' + DASH_SVG_MOSQUE_HEADER +
        '    </div>' +
        '  </header>' +
        '' +
        '  <!-- 1. Digital Clock Card -->' +
        '  <div class="dash-clock-card flex items-center justify-between" data-ref="page.dashboard.clock-card">' +
        '    <div class="dash-clock-left" data-ref="page.dashboard.clock-card.left-icon">' +
        '      ' + DASH_SVG_MOSQUE_CLOCK +
        '    </div>' +
        '    <div class="dash-clock-wrap flex items-baseline justify-center" id="dashTime" data-ref="page.dashboard.clock-card.time">' +
        '      ' + dashBigTimeHtml() +
        '    </div>' +
        '    <div class="dash-clock-right" data-ref="page.dashboard.clock-card.right-icon">' +
        '      ' + DASH_SVG_RUB_EL_HIZB +
        '    </div>' +
        '  </div>' +
        '' +
        '  <!-- 2. Daily Prayer Timeline Card -->' +
        '  <div class="dash-timeline-card" data-ref="page.dashboard.timeline-card">' +
        '    <div class="dash-timeline-header flex items-center" data-ref="page.dashboard.timeline.header">' +
        '      <span class="dash-timeline-title" data-ref="page.dashboard.timeline.title">Daily Prayer Timeline</span>' +
        '      <div class="dash-timeline-header-line flex-1" data-ref="page.dashboard.timeline.line"></div>' +
        '      <div class="dash-timeline-header-icon flex items-center justify-center shrink-0" title="Daily Prayers" aria-hidden="true" data-ref="page.dashboard.timeline.alarm-icon">' +
        '        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '          <circle cx="12" cy="13" r="8"/>' +
        '          <path d="M12 9v4l2 1.5M5 3L2 6M22 6l-3-3M6.38 18.7L4 21M17.64 18.67L20 21"/>' +
        '        </svg>' +
        '      </div>' +
        '    </div>' +
        '    <div class="dash-timeline-nodes flex justify-between items-stretch" data-ref="page.dashboard.timeline.nodes">' +
        '      ' + timelineNodesHtml +
        '    </div>' +
        '  </div>' +
        '' +
        '  <!-- 3. 2x2 Quick Navigation Cards Grid -->' +
        '  <div class="dash-grid-2x2" data-ref="page.dashboard.nav-grid">' +
        '    <!-- Tracker -->' +
        '    <div class="dash-nav-card flex flex-col items-center justify-between" role="button" tabindex="0" data-act="goto-tracker" data-ref="page.dashboard.card.tracker">' +
        '      <div class="dash-nav-icon-circle flex items-center justify-center" data-ref="page.dashboard.card.tracker-icon">' +
        '        ' + DASH_SVG_TRACKER +
        '      </div>' +
        '      <div class="dash-nav-footer flex items-center justify-center">' +
        '        <span class="dash-nav-title" data-ref="page.dashboard.card.tracker-label">Tracker</span>' +
        '        ' + DASH_SVG_CHEVRON +
        '      </div>' +
        '    </div>' +
        '    <!-- Tasbeeh -->' +
        '    <div class="dash-nav-card flex flex-col items-center justify-between" role="button" tabindex="0" data-act="goto-tasbeeh" data-ref="page.dashboard.card.tasbeeh">' +
        '      <div class="dash-nav-icon-circle flex items-center justify-center" data-ref="page.dashboard.card.tasbeeh-icon">' +
        '        ' + DASH_SVG_TASBEEH +
        '      </div>' +
        '      <div class="dash-nav-footer flex items-center justify-center">' +
        '        <span class="dash-nav-title" data-ref="page.dashboard.card.tasbeeh-label">Tasbeeh</span>' +
        '        ' + DASH_SVG_CHEVRON +
        '      </div>' +
        '    </div>' +
        '    <!-- Duas -->' +
        '    <div class="dash-nav-card flex flex-col items-center justify-between" role="button" tabindex="0" data-act="goto-duas" data-ref="page.dashboard.card.duas">' +
        '      <div class="dash-nav-icon-circle flex items-center justify-center" data-ref="page.dashboard.card.duas-icon">' +
        '        ' + DASH_SVG_DUAS +
        '      </div>' +
        '      <div class="dash-nav-footer flex items-center justify-center">' +
        '        <span class="dash-nav-title" data-ref="page.dashboard.card.duas-label">Duas</span>' +
        '        ' + DASH_SVG_CHEVRON +
        '      </div>' +
        '    </div>' +
        '    <!-- Settings -->' +
        '    <div class="dash-nav-card flex flex-col items-center justify-between" role="button" tabindex="0" data-act="goto-settings" data-ref="page.dashboard.card.settings">' +
        '      <div class="dash-nav-icon-circle flex items-center justify-center" data-ref="page.dashboard.card.settings-icon">' +
        '        ' + DASH_SVG_SETTINGS +
        '      </div>' +
        '      <div class="dash-nav-footer flex items-center justify-center">' +
        '        <span class="dash-nav-title" data-ref="page.dashboard.card.settings-label">Settings</span>' +
        '        ' + DASH_SVG_CHEVRON +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '' +
        '  <!-- 4. Bottom Decorative Divider -->' +
        '  <div class="dash-bottom-divider flex items-center justify-center" data-ref="page.dashboard.bottom-divider">' +
        '    <div class="dash-bottom-line flex-1"></div>' +
        '    <div class="dash-bottom-star">' + DASH_SVG_RUB_EL_HIZB + '</div>' +
        '    <div class="dash-bottom-line flex-1"></div>' +
        '  </div>' +
        '</div>';

    startDashClock();
}
