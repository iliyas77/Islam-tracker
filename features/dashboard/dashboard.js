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

/* ---------- Dashboard Clock ---------- */
function dashTick() {
    var liveTimeEl = $('dashLiveTime');
    if (liveTimeEl) {
        liveTimeEl.textContent = dashLiveHeaderTime();
    }

    var countdownEl = $('dashCountdown');
    if (countdownEl && typeof getNextPrayerInfo === 'function') {
        var nextP = getNextPrayerInfo();
        if (nextP && nextP.remainingPad) {
            countdownEl.textContent = nextP.remainingPad;
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

var TIMELINE_ICONS = {
    Fajr: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1zm6.36 2.05a1 1 0 0 1 0 1.41l-1.41 1.42a1 1 0 1 1-1.42-1.42l1.42-1.41a1 1 0 0 1 1.41 0zM21 11a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2h2zM7.05 6.05a1 1 0 0 1 1.41 1.41L7.05 8.88A1 1 0 0 1 5.64 7.46l1.41-1.41zM5 11a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2h2zm7 3a4 4 0 0 0-3.87 3H3a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2h-5.13A4 4 0 0 0 12 14z"/></svg>',
    Dhuhr: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4.5"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3m-3.8-8.2l-2.1 2.1m-8.2 8.2l-2.1 2.1m0-12.4l2.1 2.1m8.2 8.2l2.1 2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    Asr: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4.5"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3m-3.8-8.2l-2.1 2.1m-8.2 8.2l-2.1 2.1m0-12.4l2.1 2.1m8.2 8.2l2.1 2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    Maghrib: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1zm6.36 2.05a1 1 0 0 1 0 1.41l-1.41 1.42a1 1 0 1 1-1.42-1.42l1.42-1.41a1 1 0 0 1 1.41 0zM21 11a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2h2zM7.05 6.05a1 1 0 0 1 1.41 1.41L7.05 8.88A1 1 0 0 1 5.64 7.46l1.41-1.41zM5 11a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2h2zm7 3a4 4 0 0 0-3.87 3H3a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2h-5.13A4 4 0 0 0 12 14z"/></svg>',
    Isha: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.3 2a10 10 0 0 0-1.9 19.8 10 10 0 0 0 11.4-11.4 1 1 0 0 0-1.1-.9 1 1 0 0 0-.9.6 8 8 0 0 1-9.9-9.9 1 1 0 0 0-.6-.9 1 1 0 0 0-.9-.3z"/><circle cx="16" cy="7" r="1.5"/></svg>'
};

/* ---------- Dashboard Render ---------- */
function rDashboard() {
    var body = $('dashBody');
    if (!body) return;

    var today = td();
    var todayData = en(today);
    var missToday = P.filter(function (p) { return todayData[p] === true; }).length;
    var doneToday = P.length - missToday;
    var missPrev = tMT();
    var curPct = Math.round((doneToday / P.length) * 100);

    var o = rdOK();
    var ocA = rdOC();
    var checkDates, periodLabel;
    if (o) {
        checkDates = datesInRange(o.start, o.end);
        periodLabel = checkDates.length + '-day';
    } else {
        var endD = new Date(); endD.setDate(endD.getDate() - 1);
        var startD = new Date(); startD.setDate(startD.getDate() - 30);
        checkDates = datesInRange(
            startD.getFullYear() + '-' + pad2(startD.getMonth() + 1) + '-' + pad2(startD.getDate()),
            endD.getFullYear() + '-' + pad2(endD.getMonth() + 1) + '-' + pad2(endD.getDate())
        );
        periodLabel = checkDates.length + '-day';
    }

    var trackedDays = 0, trackedMiss = 0;
    checkDates.forEach(function (d) {
        var rr = ocA[d];
        if (!rr) return;
        trackedDays++;
        P.forEach(function (p) { if (rr[p] === true) trackedMiss++; });
    });
    var oldPct = trackedDays > 0
        ? Math.round((1 - trackedMiss / (trackedDays * 5)) * 100)
        : 0;

    var nextP = typeof getNextPrayerInfo === 'function' ? getNextPrayerInfo() : {
        name: 'Fajr',
        time: T.Fajr,
        remainingPad: '09h 46m',
        isTomorrow: true
    };

    var cfg = typeof getPrayerConfig === 'function' ? getPrayerConfig() : { city: 'Guntur', school: 1 };

    var now = new Date();
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var gregorianStr = days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
    var hijriStr = currentHijri && currentHijri.day && currentHijri.month && currentHijri.year
        ? (currentHijri.day + ' ' + currentHijri.month + ' ' + currentHijri.year)
        : (currentHijri && currentHijri.text ? currentHijri.text.replace(' AH', '') : '4 Jumādá al-ūlá 1448');

    var countdownStr = nextP && nextP.remainingPad ? nextP.remainingPad : '09h 46m';
    var nextCardIcon = TIMELINE_ICONS[nextP.name] || TIMELINE_ICONS.Fajr;

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
            '<div class="timeline-label mt-1 text-gr1" style="line-height:1.2" data-ref="page.dashboard.timeline.name.' + p.toLowerCase() + '">' + p + '</div>' +
            '<div class="timeline-time text-gr-muted" style="margin-top:2px" data-ref="page.dashboard.timeline.time.' + p.toLowerCase() + '">' + (T[p] || '--:--') + '</div>' +
            '<span class="badge rounded-pill mt-2 ' + badgeClass + '" data-ref="page.dashboard.timeline.badge.' + p.toLowerCase() + '">' + badgeText + '</span>' +
            '</div>';
    }).join('');

    function summaryTile(label, value, color) {
        return '<div class="col-4" data-ref="page.dashboard.summary-tile.' + label.toLowerCase() + '">' +
            '<div class="summary-tile" data-ref="page.dashboard.summary-tile.' + label.toLowerCase() + '.box">' +
            '<div class="label label-supporting text-gr-muted" data-ref="page.dashboard.summary-tile.' + label.toLowerCase() + '.label">' + label + '</div>' +
            '<div class="value" style="color:' + color + '" data-ref="page.dashboard.summary-tile.' + label.toLowerCase() + '.value">' + value + '</div>' +
            '</div></div>';
    }

    body.innerHTML =
        '<!-- Main Clock / Prayer Timeline Card matching reference UI -->' +
        '<div class="card shadow-sm rounded-4 p-3 mb-3 bg-gr border-0 position-relative overflow-hidden" data-ref="page.dashboard.clock-card">' +
        '  <!-- 1. Header Bar: Location on left, Live + Time on right -->' +
        '  <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style="border-color:#edf2ee !important" data-ref="page.dashboard.clock-card.header">' +
        '    <div class="d-flex align-items-center gap-1 text-gr1 location" data-ref="page.dashboard.clock-card.header.location">' +
        '      <i class="fa-solid fa-location-dot text-gr-accent me-1" data-ref="page.dashboard.clock-card.header.location-icon"></i>' +
        '      <span data-ref="page.dashboard.clock-card.header.location-text">' + cfg.city + ' &bull; ' + (cfg.school === 1 ? 'Hanafi' : 'Shafi') + '</span>' +
        '    </div>' +
        '    <div class="d-flex align-items-center gap-2 text-gr1 live-time" data-ref="page.dashboard.clock-card.header.status">' +
        '      <span class="text-gr-accent d-inline-flex align-items-center gap-1" data-ref="page.dashboard.clock-card.header.live-badge">' +
        '        <i class="fa-solid fa-bolt"></i> Live' +
        '      </span>' +
        '      <span class="text-gr-muted opacity-50">|</span>' +
        '      <span id="dashLiveTime" data-ref="page.dashboard.clock-card.header.time">' + dashLiveHeaderTime() + '</span>' +
        '    </div>' +
        '  </div>' +

        '  <!-- 2. Hero Section: Mosque dome silhouette icon + NEXT PRAYER IN + Countdown + Mosque skyline watermark -->' +
        '  <div class="position-relative overflow-hidden py-2 mb-3" data-ref="page.dashboard.clock-card.hero">' +
        '    <div class="position-absolute end-0 bottom-0 d-flex align-items-end pe-1" style="pointer-events:none;z-index:0;opacity:0.25" data-ref="page.dashboard.clock-card.hero.watermark">' +
        '      <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMax meet" width="160" height="80" fill="#25845B">' +
        '        <path d="M160,100 L160,60 Q160,50 165,45 Q170,50 170,60 L170,100 Z"></path>' +
        '        <path d="M150,100 L150,70 Q150,65 155,62 Q160,65 160,70 L160,100 Z"></path>' +
        '        <path d="M175,100 L175,75 Q175,70 180,68 Q185,70 185,75 L185,100 Z"></path>' +
        '        <circle cx="165" cy="42" r="3"></circle>' +
        '        <circle cx="155" cy="60" r="2"></circle>' +
        '        <circle cx="180" cy="65" r="2"></circle>' +
        '        <path d="M100,100 L100,80 Q100,70 110,65 Q120,70 120,80 L120,100 Z"></path>' +
        '        <circle cx="110" cy="60" r="4"></circle>' +
        '        <rect x="108" y="55" width="4" height="10"></rect>' +
        '        <path d="M50,100 L50,85 Q50,78 58,75 Q66,78 66,85 L66,100 Z"></path>' +
        '        <circle cx="58" cy="72" r="3"></circle>' +
        '        <rect x="56" y="68" width="4" height="8"></rect>' +
        '      </svg>' +
        '    </div>' +
        '    <div class="d-flex align-items-center gap-3 position-relative" style="z-index:1" data-ref="page.dashboard.clock-card.hero.content">' +
        '      <div data-ref="page.dashboard.clock-card.hero.icon">' +
        '        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '          <path d="M24 6C23 6 22.3 5.3 22.3 4.3C22.3 3.3 23 2.5 24 2.5C24.4 2.5 24.8 2.6 25.1 2.8C24.2 3.1 23.6 3.9 23.6 4.8C23.6 5.9 24.5 6.7 25.6 6.7C25.8 6.7 26 6.7 26.2 6.6C25.8 7.4 25 8 24 8V10.5C24 10.5 24 10.5 24 10.5C14.5 11.5 7 19.5 7 29.5V36H41V29.5C41 19.5 33.5 11.5 24 10.5V6Z" fill="#25845B"/>' +
        '          <path d="M20 36V28C20 25.8 21.8 24 24 24C26.2 24 28 25.8 28 28V36H20Z" fill="#ffffff"/>' +
        '          <rect x="5" y="36" width="38" height="3" rx="1.5" fill="#25845B"/>' +
        '        </svg>' +
        '      </div>' +
        '      <div data-ref="page.dashboard.clock-card.hero.info">' +
        '        <div class="section-heading text-uppercase text-gr" data-ref="page.dashboard.clock-card.hero.label">NEXT PRAYER IN</div>' +
        '        <div class="countdown lh-1 mt-1 text-gr1" id="dashCountdown" data-ref="page.dashboard.clock-card.hero.countdown">' +
        countdownStr +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +

        '  <!-- 3. Next Prayer Card: Left = Icon + Name + Time + Tomorrow, Divider, Right = Dates -->' +
        '  <div class="dash-next-card d-flex align-items-center justify-content-between mb-4" data-ref="page.dashboard.clock-card.next-card">' +
        '    <div class="d-flex align-items-center gap-3" data-ref="page.dashboard.clock-card.next-card.left">' +
        '      <div class="dash-next-icon-circle" data-ref="page.dashboard.clock-card.next-card.icon-circle">' +
        nextCardIcon +
        '      </div>' +
        '      <div data-ref="page.dashboard.clock-card.next-card.details">' +
        '        <div class="prayer-name text-gr-accent text-uppercase" style="line-height:1.2" data-ref="page.dashboard.clock-card.next-card.name">' + nextP.name + '</div>' +
        '        <div class="prayer-time text-gr1" style="line-height:1.2" data-ref="page.dashboard.clock-card.next-card.time">' + nextP.time + '</div>' +
        '        <div class="tomorrow-label text-gr-muted mt-1 d-flex align-items-center gap-1" data-ref="page.dashboard.clock-card.next-card.day">' +
        '          <i class="fa-regular fa-calendar"></i>' +
        '          <span>' + (nextP.isTomorrow ? 'Tomorrow' : 'Today') + '</span>' +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '    <div class="border-start mx-2 align-self-stretch" style="border-color:#d4e4db !important" data-ref="page.dashboard.clock-card.next-card.divider"></div>' +
        '    <div class="d-flex flex-column justify-content-center gap-2 date-text" data-ref="page.dashboard.clock-card.next-card.right">' +
        '      <div class="d-flex align-items-center gap-2 text-gr" data-ref="page.dashboard.clock-card.next-card.gregorian">' +
        '        <i class="fa-regular fa-calendar-days text-gr"></i>' +
        '        <span>' + gregorianStr + '</span>' +
        '      </div>' +
        '      <div class="d-flex align-items-center gap-2 text-gr" data-ref="page.dashboard.clock-card.next-card.hijri">' +
        '        <i class="fa-regular fa-moon text-gr"></i>' +
        '        <span>' + hijriStr + '</span>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +

        '  <!-- 4. Daily Prayer Timeline Section -->' +
        '  <div class="d-flex align-items-center gap-3 my-3" data-ref="page.dashboard.timeline.header">' +
        '    <span class="section-title text-uppercase text-gr1" style="white-space:nowrap" data-ref="page.dashboard.timeline.title">DAILY PRAYER TIMELINE</span>' +
        '    <div class="flex-grow-1 border-bottom" style="border-color:#dbe5df !important" data-ref="page.dashboard.timeline.line"></div>' +
        '  </div>' +

        '  <div class="position-relative w-100 my-2" data-ref="page.dashboard.timeline.track">' +
        '    <div class="position-absolute start-0 end-0" style="height:2px;background:#d8e6de;top:51px;margin-left:10%;margin-right:10%;z-index:1;" data-ref="page.dashboard.timeline.track-line"></div>' +
        '    <div class="d-flex align-items-start justify-content-between position-relative" style="z-index:2;" data-ref="page.dashboard.timeline.nodes">' +
        timelineNodesHtml +
        '    </div>' +
        '  </div>' +

        '  <!-- 5. Bottom Decorative Divider -->' +
        '  <div class="d-flex align-items-center justify-content-center my-3" data-ref="page.dashboard.clock-card.bottom-divider">' +
        '    <div class="flex-grow-1 border-bottom opacity-50" style="max-width:140px;border-color:#dbe5df !important"></div>' +
        '    <span class="px-2 text-gr-muted" style="font-size:0.85rem">✦</span>' +
        '    <div class="flex-grow-1 border-bottom opacity-50" style="max-width:140px;border-color:#dbe5df !important"></div>' +
        '  </div>' +
        '</div>' +

        '<!-- Current Prayer Summary Card -->' +
        '<div class="fw-bold mb-2 px-1 text-gr label-supporting" style="letter-spacing:1.5px" data-ref="page.dashboard.current-prayer.section-title">CURRENT PRAYER</div>' +
        '<div class="card shadow-sm rounded-4 p-3 mb-3 bg-gr border-0" role="button" data-act="goto-cur" style="cursor:pointer" data-ref="page.dashboard.current-prayer-card">' +
        '<div class="row g-2 mb-2" data-ref="page.dashboard.current-prayer-card.stats">' +
        summaryTile('Done', doneToday, '#25845B') +
        summaryTile('Missed', missToday, '#dc3545') +
        summaryTile('Today', curPct + '%', '#ca8a04') +
        '</div>' +
        (missPrev > 0
            ? '<div class="d-flex align-items-center gap-2 mb-2 p-2 rounded-3 bg-gr-danger-soft" data-ref="page.dashboard.current-prayer-card.missed-alert">' +
            '<i class="fa-solid fa-circle-exclamation text-gr-danger"></i>' +
            '<span class="fw-bold text-gr-danger" style="font-size:.82rem">' + missPrev + ' missed from previous days</span>' +
            '<i class="fa-solid fa-chevron-right ms-auto text-gr-muted" style="font-size:.8rem"></i>' +
            '</div>'
            : '<div class="d-flex align-items-center gap-2 mb-2 p-2 rounded-3 bg-gr-accent-soft" data-ref="page.dashboard.current-prayer-card.all-clear">' +
            '<i class="fa-solid fa-circle-check text-gr-accent"></i>' +
            '<span class="fw-bold text-gr-accent" style="font-size:.82rem">No missed prayers from previous days</span>' +
            '</div>') +
        '<div class="text-gr-muted label-supporting" data-ref="page.dashboard.current-prayer-card.footer">' +
        '<i class="fa-regular fa-calendar me-1"></i>' + fr(today) +
        '</div>' +
        '</div>' +

        '<!-- Previous Prayer Summary Card -->' +
        '<div class="fw-bold mb-2 px-1 text-gr label-supporting" style="letter-spacing:1.5px" data-ref="page.dashboard.previous-prayer.section-title">PREVIOUS PRAYER</div>' +
        '<div class="card shadow-sm rounded-4 p-3 mb-3 bg-gr border-0" role="button" data-act="goto-old" style="cursor:pointer" data-ref="page.dashboard.previous-prayer-card">' +
        '<div class="row g-2 mb-2" data-ref="page.dashboard.previous-prayer-card.stats">' +
        summaryTile('Tracked', trackedDays, '#25845B') +
        summaryTile('Missed', trackedMiss, '#dc3545') +
        summaryTile('Rate', oldPct + '%', '#ca8a04') +
        '</div>' +
        '<div class="text-gr-muted label-supporting" data-ref="page.dashboard.previous-prayer-card.footer">' +
        '<i class="fa-solid fa-clock-rotate-left me-1"></i>' +
        (o ? (fr(o.start) + ' → ' + fr(o.end)) : (periodLabel + ' · last 30 days')) +
        '</div>' +
        '</div>';

    var tbRaw = localStorage.getItem('app_tasbeeh_data');
    var tbList = [];
    try { tbList = JSON.parse(tbRaw) || []; } catch (_) { }
    var tbToday = tbList.reduce(function (sum, it) { return sum + (it.totalCountToday || 0); }, 0);
    var tbCount = tbList.length;

    body.innerHTML +=
        '<!-- Digital Tasbeeh Summary Card -->' +
        '<div class="fw-bold mb-2 px-1 text-gr label-supporting" style="letter-spacing:1.5px" data-ref="page.dashboard.tasbeeh.section-title">DIGITAL TASBEEH</div>' +
        '<div class="card shadow-sm rounded-4 p-3 mb-3 bg-gr border-0" role="button" data-act="goto-tasbeeh" style="cursor:pointer" data-ref="page.dashboard.tasbeeh-card">' +
        '<div class="row g-2 mb-2" data-ref="page.dashboard.tasbeeh-card.stats">' +
        summaryTile('Chants', tbCount, '#25845B') +
        summaryTile('Today', tbToday, '#ca8a04') +
        summaryTile('Counter', '<i class="fa-solid fa-arrow-right"></i>', '#25845B') +
        '</div>' +
        '<div class="text-gr-muted label-supporting" data-ref="page.dashboard.tasbeeh-card.footer">' +
        '<i class="fa-solid fa-hand-holding-heart me-1"></i>Tap to open Digital Tasbeeh' +
        '</div>' +
        '</div>';

    startDashClock();
}
