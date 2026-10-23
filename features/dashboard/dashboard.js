/* ============================================================
   Nur Prayer — Dashboard Feature Module
   Path: features/dashboard/dashboard.js
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
    return pad2(hh) + ':' + pad2(now.getMinutes()) +
        '<span class="small">:' + pad2(now.getSeconds()) + '</span>' +
        '<span class="ampm">' + ap + '</span>';
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
        var circleClass = isActive ? 'timeline-circle-active' : 'timeline-circle-inactive';
        var dotHtml = isActive
            ? '<div class="timeline-dot-active" data-ref="page.dashboard.timeline.dot.' + p.toLowerCase() + '"><div class="timeline-dot-active-inner"></div></div>'
            : '<div class="timeline-dot" data-ref="page.dashboard.timeline.dot.' + p.toLowerCase() + '"></div>';

        var badgeClass = st === 'active' ? 'badge-status-active'
            : (st === 'passed' ? 'badge-status-passed'
                : (st === 'next' ? 'badge-status-next' : 'badge-status-upcoming'));
        var badgeText = st === 'active' ? 'Active'
            : (st === 'passed' ? 'Passed'
                : (st === 'next' ? 'Next' : 'Upcoming'));

        return '<div class="timeline-item" data-ref="page.dashboard.timeline.item.' + p.toLowerCase() + '">' +
            '<div class="timeline-circle ' + circleClass + ' mb-1" data-ref="page.dashboard.timeline.icon.' + p.toLowerCase() + '">' +
            TIMELINE_ICONS[p] +
            '</div>' +
            '<div class="timeline-dot-wrap" data-ref="page.dashboard.timeline.dot-wrap.' + p.toLowerCase() + '">' +
            dotHtml +
            '</div>' +
            '<div class="timeline-label mt-1 text-gr1 lh-sm" data-ref="page.dashboard.timeline.name.' + p.toLowerCase() + '">' + p + '</div>' +
            '<div class="timeline-time text-gr-muted mt-1" data-ref="page.dashboard.timeline.time.' + p.toLowerCase() + '">' + (T[p] || '--:--') + '</div>' +
            '<span class="badge rounded-pill mt-2 ' + badgeClass + '" data-ref="page.dashboard.timeline.badge.' + p.toLowerCase() + '">' + badgeText + '</span>' +
            '</div>';
    }).join('');

    body.innerHTML =
        '<!-- Main Clock / Prayer Timeline Card matching reference UI -->' +
        '<div class="card shadow-sm rounded-4 p-3 mb-3 bg-gr border-0 position-relative overflow-hidden d-flex flex-column gap-3" data-ref="page.dashboard.clock-card">' +
        '  <!-- 1. Header Bar: Location -->' +
        '  <div class="d-flex align-items-center justify-content-between pb-2 border-bottom border-secondary-subtle" data-ref="page.dashboard.clock-card.header">' +
        '    <div class="d-flex align-items-center gap-1 text-gr1 location" data-ref="page.dashboard.clock-card.header.location">' +
        '      <i class="fa-solid fa-location-dot text-gr-accent" data-ref="page.dashboard.clock-card.header.location-icon"></i>' +
        '      <span data-ref="page.dashboard.clock-card.header.location-text">' + cfg.city + ' &bull; ' + (cfg.school === 1 ? 'Hanafi' : 'Shafi') + '</span>' +
        '    </div>' +
        '  </div>' +

        '  <!-- 2. Big Live Current Time with Masjid Icon -->' +
        '  <div class="d-flex align-items-center justify-content-start gap-2 gap-sm-3" data-ref="page.dashboard.clock-card.time-wrap">' +
        '    <i class="fa-solid fa-mosque text-gr1 display-6 lh-1" data-ref="page.dashboard.clock-card.time-icon"></i>' +
        '    <div class="clock-big text-gr1 d-inline-flex align-items-baseline fw-normal" id="dashTime" data-ref="page.dashboard.clock-card.time">' +
        dashBigTimeHtml() +
        '    </div>' +
        '  </div>' +

        '  <!-- 3. Daily Prayer Timeline Section -->' +
        '  <div class="d-flex align-items-center gap-3" data-ref="page.dashboard.timeline.header">' +
        '    <span class="section-title text-uppercase text-gr1 text-nowrap" data-ref="page.dashboard.timeline.title">DAILY PRAYER TIMELINE</span>' +
        '    <div class="flex-grow-1 border-bottom border-secondary-subtle" data-ref="page.dashboard.timeline.line"></div>' +
        '  </div>' +

        '  <div class="position-relative w-100" data-ref="page.dashboard.timeline.track">' +
        '    <div class="timeline-track-line" data-ref="page.dashboard.timeline.track-line"></div>' +
        '    <div class="d-flex align-items-start justify-content-between position-relative timeline-track-nodes" data-ref="page.dashboard.timeline.nodes">' +
        timelineNodesHtml +
        '    </div>' +
        '  </div>' +

        '  <!-- 4. Bottom Decorative Divider -->' +
        '  <div class="d-flex align-items-center justify-content-center" data-ref="page.dashboard.clock-card.bottom-divider">' +
        '    <div class="flex-grow-1 border-bottom opacity-50 border-secondary-subtle divider-line-sm"></div>' +
        '    <span class="px-2 text-gr-muted small">✦</span>' +
        '    <div class="flex-grow-1 border-bottom opacity-50 border-secondary-subtle divider-line-sm"></div>' +
        '  </div>' +
        '</div>' +

        '<!-- 2x2 Square Cards Navigation Grid -->' +
        '<div class="row g-2 g-sm-3" data-ref="page.dashboard.nav-grid">' +
        '  <div class="col-6" data-ref="page.dashboard.nav-card.tracker-col">' +
        '    <div class="card dash-card bg-gr shadow-sm rounded-4 border-0 p-3 d-flex flex-column align-items-center justify-content-center text-center w-100 cursor-pointer" role="button" tabindex="0" data-act="goto-tracker" data-ref="page.dashboard.card.tracker">' +
        '      <div class="dash-icon-box rounded-circle bg-gr-accent-soft d-flex align-items-center justify-content-center mb-2" data-ref="page.dashboard.card.tracker-icon">' +
        '        <i class="fa-solid fa-calendar-check fs-2 text-gr-accent"></i>' +
        '      </div>' +
        '      <span class="fw-semibold text-gr1 fs-6" data-ref="page.dashboard.card.tracker-label">Tracker</span>' +
        '    </div>' +
        '  </div>' +
        '  <div class="col-6" data-ref="page.dashboard.nav-card.tasbeeh-col">' +
        '    <div class="card dash-card bg-gr shadow-sm rounded-4 border-0 p-3 d-flex flex-column align-items-center justify-content-center text-center w-100 cursor-pointer" role="button" tabindex="0" data-act="goto-tasbeeh" data-ref="page.dashboard.card.tasbeeh">' +
        '      <div class="dash-icon-box rounded-circle bg-gr-accent-soft d-flex align-items-center justify-content-center mb-2" data-ref="page.dashboard.card.tasbeeh-icon">' +
        '        <i class="fa-solid fa-hand-holding-heart fs-2 text-gr-accent"></i>' +
        '      </div>' +
        '      <span class="fw-semibold text-gr1 fs-6" data-ref="page.dashboard.card.tasbeeh-label">Tasbeeh</span>' +
        '    </div>' +
        '  </div>' +
        '  <div class="col-6" data-ref="page.dashboard.nav-card.duas-col">' +
        '    <div class="card dash-card bg-gr shadow-sm rounded-4 border-0 p-3 d-flex flex-column align-items-center justify-content-center text-center w-100 cursor-pointer" role="button" tabindex="0" data-act="goto-duas" data-ref="page.dashboard.card.duas">' +
        '      <div class="dash-icon-box rounded-circle bg-gr-accent-soft d-flex align-items-center justify-content-center mb-2" data-ref="page.dashboard.card.duas-icon">' +
        '        <i class="fa-solid fa-book-quran fs-2 text-gr-accent"></i>' +
        '      </div>' +
        '      <span class="fw-semibold text-gr1 fs-6" data-ref="page.dashboard.card.duas-label">Duas</span>' +
        '    </div>' +
        '  </div>' +
        '  <div class="col-6" data-ref="page.dashboard.nav-card.settings-col">' +
        '    <div class="card dash-card bg-gr shadow-sm rounded-4 border-0 p-3 d-flex flex-column align-items-center justify-content-center text-center w-100 cursor-pointer" role="button" tabindex="0" data-act="goto-settings" data-ref="page.dashboard.card.settings">' +
        '      <div class="dash-icon-box rounded-circle bg-gr-accent-soft d-flex align-items-center justify-content-center mb-2" data-ref="page.dashboard.card.settings-icon">' +
        '        <i class="fa-solid fa-gear fs-2 text-gr-accent"></i>' +
        '      </div>' +
        '      <span class="fw-semibold text-gr1 fs-6" data-ref="page.dashboard.card.settings-label">Settings</span>' +
        '    </div>' +
        '  </div>' +
        '</div>';

    startDashClock();
}
