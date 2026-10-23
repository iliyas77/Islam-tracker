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

/* ---------- Dashboard Clock ---------- */
function dashTick() {
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
    dashTimer = setInterval(dashTick, 1000);
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
        statuses.Fajr = nowMin >= ishaMin ? 'passed' : 'upcoming';
        statuses.Dhuhr = nowMin >= ishaMin ? 'passed' : 'upcoming';
        statuses.Asr = nowMin >= ishaMin ? 'passed' : 'upcoming';
        statuses.Maghrib = nowMin >= ishaMin ? 'passed' : 'upcoming';
        statuses.Isha = 'active';
    } else if (nowMin >= maghribMin && nowMin < ishaMin) {
        statuses.Fajr = 'passed';
        statuses.Dhuhr = 'passed';
        statuses.Asr = 'passed';
        statuses.Maghrib = 'active';
        statuses.Isha = 'next';
    } else if (nowMin >= asrMin && nowMin < maghribMin) {
        statuses.Fajr = 'passed';
        statuses.Dhuhr = 'passed';
        statuses.Asr = 'active';
        statuses.Maghrib = 'next';
        statuses.Isha = 'upcoming';
    } else if (nowMin >= dhuhrMin && nowMin < asrMin) {
        statuses.Fajr = 'passed';
        statuses.Dhuhr = 'active';
        statuses.Asr = 'next';
        statuses.Maghrib = 'upcoming';
        statuses.Isha = 'upcoming';
    } else {
        statuses.Fajr = 'active';
        statuses.Dhuhr = 'next';
        statuses.Asr = 'upcoming';
        statuses.Maghrib = 'upcoming';
        statuses.Isha = 'upcoming';
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
var DASH_SVG_MOSQUE_CLOCK =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">' +
    '  <title>the-prophets-mosque</title>' +
    '  <g fill="none" stroke="#123D2E" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">' +
    '    <path d="M3 22v-2.5c0-2.068.345-2.5 2-2.5h12c1.655 0 2 .432 2 2.5V22zm-1 0h20M17.513 6C15.97 4 18.339 3 19 2c.661 1 3.03 2 1.488 4z"/>' +
    '    <path d="M17.5 6L17 17m0 5h4l-.5-16M11 8c1.984 2.25 6 3 6 9H5c0-6 4.015-6.75 5.999-9"/>' +
    '  </g>' +
    '</svg>';

var DASH_SVG_MOSQUE_HEADER = DASH_SVG_MOSQUE_CLOCK;

var DASH_SVG_RUB_EL_HIZB =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9bb8a9" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="4.2" y="4.2" width="15.6" height="15.6" rx="1.5"/>' +
    '<rect x="4.2" y="4.2" width="15.6" height="15.6" rx="1.5" transform="rotate(45 12 12)"/>' +
    '<circle cx="12" cy="12" r="3.2"/>' +
    '</svg>';

var DASH_SVG_TRACKER =
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">' +
    '  <title>prayer-times</title>' +
    '  <path fill="none" stroke="#123D2E" stroke-linecap="round" stroke-linejoin="round" d="M38.5 5.5h-29c-2.2 0-4 1.8-4 4v29c0 2.2 1.8 4 4 4h29c2.2 0 4-1.8 4-4v-29c0-2.2-1.8-4-4-4"/>' +
    '  <path fill="none" stroke="#123D2E" stroke-linecap="round" stroke-linejoin="round" d="M15.333 37C12.95 37 11 36.056 11 33.673V14c0-1.65 1.35-3 3-3h20c1.65 0 3 1.35 3 3v18.667A4.346 4.346 0 0 1 32.667 37v-1.526c-1.214-1.005-1.693-1.21-1.693-1.21s1.524-1.23 1.898-1.756c.816-1.15 2.863-6.045-1.469-9.095c-1.552-1.093-6.31-3.317-6.31-3.317c-1.036-2.482-1.128-3.545-1.093-6.172c.035 2.627-.057 3.69-1.094 6.172c0 0-4.756 2.224-6.309 3.317c-4.332 3.05-2.285 7.945-1.469 9.095c.374.527 1.898 1.756 1.898 1.756s-.479.205-1.692 1.21z"/>' +
    '</svg>';

var DASH_SVG_TASBEEH =
    '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">' +
    '  <title>prayer-beads</title>' +
    '  <path fill="#123D2E" d="M26.797 28.781c.484 1.109-.268 2.391.739 4.323c1.088 2.087 3.653 2.801 5.292 2.817c1.078.011 1.189-.447.759-.667c-.681-.349-.598-.871-.598-.871s.464.429 1.308.663c.621.173 1.307.216 1.518-.379c.182-.51-1.647-.142-2.491-1.954c1.092.494 1.692.224 2.146-.151c.257-.213.453-.625.109-.5s-2.703.391-3.047-2.062c1.088 1.231 2.402 1.122 3.019.708c.403-.271.503-.803.11-.621c-1.422.656-2.051-.606-2.975-1.856c-1.113-1.507-2.936-.996-3.686-1.324c-.276-.122-2.203 1.874-2.203 1.874"/>' +
    '  <path fill="#123D2E" d="M10.087 6.851a2.29 2.29 0 1 1-3.24 3.242a2.29 2.29 0 0 1 3.24-3.242"/>' +
    '  <path fill="#123D2E" d="M7.227 10.218a2.29 2.29 0 1 1-3.238 3.24a2.29 2.29 0 0 1 3.238-3.24"/>' +
    '  <path fill="#123D2E" d="M5.051 14.064a2.29 2.29 0 0 1 0 3.24a2.29 2.29 0 0 1-3.24 0a2.29 2.29 0 0 1 0-3.24a2.29 2.29 0 0 1 3.24 0"/>' +
    '  <path fill="#123D2E" d="M4.039 18.317a2.292 2.292 0 1 1-3.244 3.24a2.292 2.292 0 0 1 3.244-3.24"/>' +
    '  <path fill="#123D2E" d="M4.494 22.67a2.29 2.29 0 1 1-3.239 3.239a2.29 2.29 0 0 1 0-3.239a2.29 2.29 0 0 1 3.239 0"/>' +
    '  <path fill="#123D2E" d="M6.848 26.289a2.29 2.29 0 1 1-3.238 3.24a2.29 2.29 0 0 1 3.238-3.24"/>' +
    '  <path fill="#123D2E" d="M10.923 27.681a2.29 2.29 0 0 1 0 3.24a2.29 2.29 0 0 1-3.24 0a2.29 2.29 0 0 1 0-3.24a2.29 2.29 0 0 1 3.24 0"/>' +
    '  <path fill="#123D2E" d="M15.327 28.288a2.292 2.292 0 1 1-3.24 3.241a2.292 2.292 0 0 1 3.24-3.241"/>' +
    '  <path fill="#123D2E" d="M19.604 27.807a2.29 2.29 0 1 1-3.239 3.241a2.292 2.292 0 0 1 3.239-3.241"/>' +
    '  <path fill="#123D2E" d="M23.806 26.34a2.291 2.291 0 1 1-3.241 3.239a2.291 2.291 0 0 1 3.241-3.239M10.214 7.231a2.29 2.29 0 1 0 3.24-3.238a2.29 2.29 0 0 0-3.24 3.238"/>' +
    '  <path fill="#123D2E" d="M14.061 5.055a2.29 2.29 0 0 0 3.24 0a2.29 2.29 0 0 0 0-3.24a2.29 2.29 0 1 0-3.24 3.24"/>' +
    '  <path fill="#123D2E" d="M18.313 4.042a2.29 2.29 0 1 0 3.242-3.24a2.29 2.29 0 0 0-3.242 3.24"/>' +
    '  <path fill="#123D2E" d="M22.666 4.498a2.29 2.29 0 1 0 3.24-3.238a2.29 2.29 0 0 0-3.24 3.238"/>' +
    '  <path fill="#123D2E" d="M26.286 6.851a2.29 2.29 0 0 0 3.238 0a2.29 2.29 0 1 0-3.238 0"/>' +
    '  <path fill="#123D2E" d="M27.677 10.926a2.294 2.294 0 0 0 3.241 0a2.296 2.296 0 0 0 0-3.24a2.292 2.292 0 0 0-3.241 3.24"/>' +
    '  <path fill="#123D2E" d="M28.285 15.33a2.29 2.29 0 0 0 3.24 0a2.29 2.29 0 1 0-3.24 0"/>' +
    '  <path fill="#123D2E" d="M27.804 19.607a2.29 2.29 0 1 0 3.24-3.238a2.29 2.29 0 0 0-3.24 3.238"/>' +
    '  <path fill="#123D2E" d="M26.336 23.81a2.291 2.291 0 1 0 3.239-3.241a2.291 2.291 0 0 0-3.239 3.241"/>' +
    '  <path fill="#123D2E" d="M28.153 24.583a2.546 2.546 0 0 0-3.599 0a2.543 2.543 0 0 0 0 3.599l2.398 1.2l2.4-2.4z"/>' +
    '</svg>';

var DASH_SVG_DUAS =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">' +
    '  <title>places-praying-room</title>' +
    '  <path fill="none" stroke="#123D2E" d="m17 9l-4.25 4.5h-.25l-1.5-6h-.5a3 3 0 0 0-3 3V17c5.5 0 9 2.5 9 3.5H7m6-10.882L15 7.5m-15 16h24m-12.445-18s1.81-.557 2.135-1.776a1.77 1.77 0 0 0-1.242-2.163a1.75 1.75 0 0 0-2.145 1.25c-.325 1.219.961 2.61.961 2.61z"/>' +
    '</svg>';

var DASH_SVG_SETTINGS =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="#123D2E" aria-hidden="true">' +
    '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.48.48 0 0 0 14 2.3h-4a.48.48 0 0 0-.48.41l-.38 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.62 8.77c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h4c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>' +
    '</svg>';

var DASH_SVG_CHEVRON =
    '<svg class="dash-nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9bb8a9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="m9 18 6-6-6-6"/>' +
    '</svg>';

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
        var st = statuses[p] || 'upcoming';
        var isActive = st === 'active';
        var circleClass = isActive ? 'dash-timeline-circle active' : 'dash-timeline-circle';
        var dotHtml = isActive
            ? '<div class="dash-timeline-dot-active" data-ref="page.dashboard.timeline.dot.' + p.toLowerCase() + '"><div class="dash-timeline-dot-active-inner"></div></div>'
            : '<div class="dash-timeline-dot" data-ref="page.dashboard.timeline.dot.' + p.toLowerCase() + '"></div>';

        var badgeClass = st === 'active' ? 'badge-active'
            : (st === 'passed' ? 'badge-passed'
                : (st === 'next' ? 'badge-next' : 'badge-upcoming'));
        var badgeText = st === 'active' ? 'Active'
            : (st === 'passed' ? 'Passed'
                : (st === 'next' ? 'Next' : 'Upcoming'));

        var prayerIcon = TIMELINE_ICONS[p] || '';

        return '<div class="dash-timeline-col" data-ref="page.dashboard.timeline.item.' + p.toLowerCase() + '">' +
            '  <div class="' + circleClass + '" data-ref="page.dashboard.timeline.icon.' + p.toLowerCase() + '">' +
            prayerIcon +
            '  </div>' +
            '  <div class="dash-timeline-dot-wrap" data-ref="page.dashboard.timeline.dot-wrap.' + p.toLowerCase() + '">' +
            dotHtml +
            '  </div>' +
            '  <div class="dash-timeline-name" data-ref="page.dashboard.timeline.name.' + p.toLowerCase() + '">' + p + '</div>' +
            '  <div class="dash-timeline-time" data-ref="page.dashboard.timeline.time.' + p.toLowerCase() + '">' + (T[p] || '--:--') + '</div>' +
            '  <span class="dash-timeline-badge ' + badgeClass + '" data-ref="page.dashboard.timeline.badge.' + p.toLowerCase() + '">' + badgeText + '</span>' +
            '</div>';
    }).join('');

    body.innerHTML =
        '<div class="dash-container" data-ref="page.dashboard.container">' +
        '  <!-- Background Islamic Geometric Watermark -->' +
        '  <div class="dash-bg-pattern-top" aria-hidden="true">' +
        '    <svg class="dash-corner-pattern dash-corner-tl" viewBox="0 0 160 120" fill="none" stroke="#123D2E" stroke-width="1.2">' +
        '      <path d="M 0,0 L 40,0 L 60,20 L 60,60 L 40,80 L 0,80 Z"/>' +
        '      <path d="M 20,0 L 40,20 L 20,40 L 0,20 Z"/>' +
        '      <path d="M 60,20 L 80,0 L 100,20 L 80,40 Z"/>' +
        '      <path d="M 40,40 L 60,60 L 40,80 L 20,60 Z"/>' +
        '      <polygon points="60,35 66,49 80,46 72,58 80,70 66,67 60,81 54,67 40,70 48,58 40,46 54,49"/>' +
        '      <polygon points="120,35 126,49 140,46 132,58 140,70 126,67 120,81 114,67 100,70 108,58 100,46 114,49"/>' +
        '      <circle cx="60" cy="58" r="8"/>' +
        '      <circle cx="120" cy="58" r="8"/>' +
        '      <line x1="0" y1="20" x2="160" y2="20"/>' +
        '      <line x1="0" y1="58" x2="160" y2="58"/>' +
        '      <line x1="0" y1="96" x2="160" y2="96"/>' +
        '      <line x1="60" y1="0" x2="60" y2="120"/>' +
        '      <line x1="120" y1="0" x2="120" y2="120"/>' +
        '    </svg>' +
        '    <svg class="dash-corner-pattern dash-corner-tr" viewBox="0 0 160 120" fill="none" stroke="#123D2E" stroke-width="1.2">' +
        '      <path d="M 0,0 L 40,0 L 60,20 L 60,60 L 40,80 L 0,80 Z"/>' +
        '      <path d="M 20,0 L 40,20 L 20,40 L 0,20 Z"/>' +
        '      <path d="M 60,20 L 80,0 L 100,20 L 80,40 Z"/>' +
        '      <path d="M 40,40 L 60,60 L 40,80 L 20,60 Z"/>' +
        '      <polygon points="60,35 66,49 80,46 72,58 80,70 66,67 60,81 54,67 40,70 48,58 40,46 54,49"/>' +
        '      <polygon points="120,35 126,49 140,46 132,58 140,70 126,67 120,81 114,67 100,70 108,58 100,46 114,49"/>' +
        '      <circle cx="60" cy="58" r="8"/>' +
        '      <circle cx="120" cy="58" r="8"/>' +
        '      <line x1="0" y1="20" x2="160" y2="20"/>' +
        '      <line x1="0" y1="58" x2="160" y2="58"/>' +
        '      <line x1="0" y1="96" x2="160" y2="96"/>' +
        '      <line x1="60" y1="0" x2="60" y2="120"/>' +
        '      <line x1="120" y1="0" x2="120" y2="120"/>' +
        '    </svg>' +
        '  </div>' +
        '' +
        '  <!-- Top Header Bar: Location & Mosque Silhouette -->' +
        '  <header class="dash-top-header" data-ref="page.dashboard.header">' +
        '    <div class="dash-location-text" data-ref="page.dashboard.header.location">' +
        '      <i class="fa-solid fa-location-dot dash-location-icon" data-ref="page.dashboard.header.location-icon"></i>' +
        '      <span data-ref="page.dashboard.header.location-text">' + cfg.city + ' &bull; ' + (cfg.school === 1 ? 'Hanafi' : 'Shafi') + '</span>' +
        '    </div>' +
        '    <div class="dash-header-mosque" data-ref="page.dashboard.header.mosque-icon">' +
        '      ' + DASH_SVG_MOSQUE_HEADER +
        '    </div>' +
        '  </header>' +
        '' +
        '  <!-- 1. Digital Clock Card -->' +
        '  <div class="dash-clock-card" data-ref="page.dashboard.clock-card">' +
        '    <div class="dash-clock-left" data-ref="page.dashboard.clock-card.left-icon">' +
        '      ' + DASH_SVG_MOSQUE_CLOCK +
        '    </div>' +
        '    <div class="dash-clock-wrap" id="dashTime" data-ref="page.dashboard.clock-card.time">' +
        '      ' + dashBigTimeHtml() +
        '    </div>' +
        '    <div class="dash-clock-right" data-ref="page.dashboard.clock-card.right-icon">' +
        '      ' + DASH_SVG_RUB_EL_HIZB +
        '    </div>' +
        '  </div>' +
        '' +
        '  <!-- 2. Daily Prayer Timeline Card -->' +
        '  <div class="dash-timeline-card" data-ref="page.dashboard.timeline-card">' +
        '    <div class="dash-timeline-header" data-ref="page.dashboard.timeline.header">' +
        '      <span class="dash-timeline-title" data-ref="page.dashboard.timeline.title">DAILY PRAYER TIMELINE</span>' +
        '      <div class="dash-timeline-header-line" data-ref="page.dashboard.timeline.line"></div>' +
        '    </div>' +
        '    <div class="dash-timeline-track" data-ref="page.dashboard.timeline.track">' +
        '      <div class="dash-timeline-track-line" data-ref="page.dashboard.timeline.track-line"></div>' +
        '      <div class="dash-timeline-nodes" data-ref="page.dashboard.timeline.nodes">' +
        '        ' + timelineNodesHtml +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '' +
        '  <!-- 3. 2x2 Quick Navigation Cards Grid -->' +
        '  <div class="dash-grid-2x2" data-ref="page.dashboard.nav-grid">' +
        '    <!-- Tracker -->' +
        '    <div class="dash-nav-card" role="button" tabindex="0" data-act="goto-tracker" data-ref="page.dashboard.card.tracker">' +
        '      <div class="dash-nav-icon-circle" data-ref="page.dashboard.card.tracker-icon">' +
        '        ' + DASH_SVG_TRACKER +
        '      </div>' +
        '      <div class="dash-nav-footer">' +
        '        <span class="dash-nav-title" data-ref="page.dashboard.card.tracker-label">Tracker</span>' +
        '        ' + DASH_SVG_CHEVRON +
        '      </div>' +
        '    </div>' +
        '    <!-- Tasbeeh -->' +
        '    <div class="dash-nav-card" role="button" tabindex="0" data-act="goto-tasbeeh" data-ref="page.dashboard.card.tasbeeh">' +
        '      <div class="dash-nav-icon-circle" data-ref="page.dashboard.card.tasbeeh-icon">' +
        '        ' + DASH_SVG_TASBEEH +
        '      </div>' +
        '      <div class="dash-nav-footer">' +
        '        <span class="dash-nav-title" data-ref="page.dashboard.card.tasbeeh-label">Tasbeeh</span>' +
        '        ' + DASH_SVG_CHEVRON +
        '      </div>' +
        '    </div>' +
        '    <!-- Duas -->' +
        '    <div class="dash-nav-card" role="button" tabindex="0" data-act="goto-duas" data-ref="page.dashboard.card.duas">' +
        '      <div class="dash-nav-icon-circle" data-ref="page.dashboard.card.duas-icon">' +
        '        ' + DASH_SVG_DUAS +
        '      </div>' +
        '      <div class="dash-nav-footer">' +
        '        <span class="dash-nav-title" data-ref="page.dashboard.card.duas-label">Duas</span>' +
        '        ' + DASH_SVG_CHEVRON +
        '      </div>' +
        '    </div>' +
        '    <!-- Settings -->' +
        '    <div class="dash-nav-card" role="button" tabindex="0" data-act="goto-settings" data-ref="page.dashboard.card.settings">' +
        '      <div class="dash-nav-icon-circle" data-ref="page.dashboard.card.settings-icon">' +
        '        ' + DASH_SVG_SETTINGS +
        '      </div>' +
        '      <div class="dash-nav-footer">' +
        '        <span class="dash-nav-title" data-ref="page.dashboard.card.settings-label">Settings</span>' +
        '        ' + DASH_SVG_CHEVRON +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '' +
        '  <!-- 4. Bottom Decorative Divider -->' +
        '  <div class="dash-bottom-divider" data-ref="page.dashboard.bottom-divider">' +
        '    <div class="dash-bottom-line"></div>' +
        '    <div class="dash-bottom-star">' + DASH_SVG_RUB_EL_HIZB + '</div>' +
        '    <div class="dash-bottom-line"></div>' +
        '  </div>' +
        '</div>';

    startDashClock();
}
