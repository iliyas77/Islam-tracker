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

    var activeP = typeof getActivePrayerInfo === 'function' ? getActivePrayerInfo() : {
        name: 'Fajr',
        time: T.Fajr,
        isYesterday: false
    };
    dashCurrentActivePrayer = activeP.name;

    var today = td();
    var todayData = en(today);
    var doneToday = P.filter(function (p) {
        return typeof isDonePrayer === 'function' ? isDonePrayer(p, today, todayData) : (todayData[p] === 'done');
    }).length;
    var missToday = P.filter(function (p) {
        if (typeof isDonePrayer === 'function' && isDonePrayer(p, today, todayData)) return false;
        if (typeof isPrayerUpcoming === 'function' && isPrayerUpcoming(p, today)) return false;
        if (activeP && activeP.name === p) return false;
        return true;
    }).length;
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

    var cfg = typeof getPrayerConfig === 'function' ? getPrayerConfig() : { city: 'Guntur', school: 1 };

    var now = new Date();
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var gregorianStr = days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
    var hijriStr = currentHijri && currentHijri.day && currentHijri.month && currentHijri.year
        ? (currentHijri.day + ' ' + currentHijri.month + ' ' + currentHijri.year)
        : (currentHijri && currentHijri.text ? currentHijri.text.replace(' AH', '') : '4 Jumādá al-ūlá 1448');

    var activeCardIcon = TIMELINE_ICONS[activeP.name] || TIMELINE_ICONS.Fajr;

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
        '<div class="card shadow-sm rounded-4 p-3 mb-3 bg-gr border-0 position-relative overflow-hidden d-flex flex-column gap-3" data-ref="page.dashboard.clock-card">' +
        '  <!-- 1. Header Bar: Location -->' +
        '  <div class="d-flex align-items-center justify-content-between pb-2 border-bottom" style="border-color:#edf2ee !important" data-ref="page.dashboard.clock-card.header">' +
        '    <div class="d-flex align-items-center gap-1 text-gr1 location" data-ref="page.dashboard.clock-card.header.location">' +
        '      <i class="fa-solid fa-location-dot text-gr-accent" data-ref="page.dashboard.clock-card.header.location-icon"></i>' +
        '      <span data-ref="page.dashboard.clock-card.header.location-text">' + cfg.city + ' &bull; ' + (cfg.school === 1 ? 'Hanafi' : 'Shafi') + '</span>' +
        '    </div>' +
        '  </div>' +

        '  <!-- 2. Big Live Current Time with Masjid Icon -->' +
        '  <div class="d-flex align-items-center justify-content-start gap-2 gap-sm-3" data-ref="page.dashboard.clock-card.time-wrap">' +
        '    <i class="fa-solid fa-mosque text-gr1" style="font-size:2.2rem;line-height:1" data-ref="page.dashboard.clock-card.time-icon"></i>' +
        '    <div class="clock-big text-gr1 d-inline-flex align-items-baseline fw-normal" id="dashTime" data-ref="page.dashboard.clock-card.time">' +
        dashBigTimeHtml() +
        '    </div>' +
        '  </div>' +

        '  <!-- 3. Active Prayer Card: Left = Icon + Name + Time + Day, Divider, Right = Dates -->' +
        '  <div class="dash-next-card d-flex align-items-center justify-content-between" data-ref="page.dashboard.clock-card.next-card">' +
        '    <div class="d-flex align-items-center gap-3" data-ref="page.dashboard.clock-card.next-card.left">' +
        '      <div class="dash-next-icon-circle" data-ref="page.dashboard.clock-card.next-card.icon-circle">' +
        activeCardIcon +
        '      </div>' +
        '      <div class="d-flex flex-column justify-content-center gap-2" data-ref="page.dashboard.clock-card.next-card.details">' +
        '        <div class="prayer-name text-gr1 text-uppercase lh-1" data-ref="page.dashboard.clock-card.next-card.name">' + activeP.name + '</div>' +
        '        <div class="prayer-time text-gr1 lh-1" data-ref="page.dashboard.clock-card.next-card.time">' + activeP.time + '</div>' +
        '        <div class="tomorrow-label text-gr-muted d-flex align-items-center gap-1 lh-1" data-ref="page.dashboard.clock-card.next-card.day">' +
        '          <i class="fa-regular fa-calendar"></i>' +
        '          <span>' + (activeP.isYesterday ? 'Yesterday' : 'Today') + '</span>' +
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
        '  <div class="d-flex align-items-center gap-3" data-ref="page.dashboard.timeline.header">' +
        '    <span class="section-title text-uppercase text-gr1" style="white-space:nowrap" data-ref="page.dashboard.timeline.title">DAILY PRAYER TIMELINE</span>' +
        '    <div class="flex-grow-1 border-bottom" style="border-color:#dbe5df !important" data-ref="page.dashboard.timeline.line"></div>' +
        '  </div>' +

        '  <div class="position-relative w-100" data-ref="page.dashboard.timeline.track">' +
        '    <div class="position-absolute" style="height:2px;background:#d8e6de;top:54px;left:10%;right:10%;z-index:1;" data-ref="page.dashboard.timeline.track-line"></div>' +
        '    <div class="d-flex align-items-start justify-content-between position-relative" style="z-index:2;" data-ref="page.dashboard.timeline.nodes">' +
        timelineNodesHtml +
        '    </div>' +
        '  </div>' +

        '  <!-- 5. Bottom Decorative Divider -->' +
        '  <div class="d-flex align-items-center justify-content-center" data-ref="page.dashboard.clock-card.bottom-divider">' +
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

    var duasRaw = localStorage.getItem('quranDuas_data');
    var duasList = [];
    try { duasList = JSON.parse(duasRaw) || []; } catch (_) { }
    var duasCount = duasList.length || 100;
    var favsRaw = localStorage.getItem('quranDuas_favourites');
    var favsList = [];
    try { favsList = JSON.parse(favsRaw) || []; } catch (_) { }
    var favsCount = favsList.length;
    var pinsRaw = localStorage.getItem('quranDuas_pins');
    var pinsList = [];
    try { pinsList = JSON.parse(pinsRaw) || []; } catch (_) { }
    var pinsCount = pinsList.length;

    body.innerHTML +=
        '<!-- Quran Duas Summary Card -->' +
        '<div class="fw-bold mb-2 px-1 text-gr label-supporting" style="letter-spacing:1.5px" data-ref="page.dashboard.duas.section-title">QURAN DUAS</div>' +
        '<div class="card shadow-sm rounded-4 p-3 mb-3 bg-gr border-0" role="button" data-act="goto-duas" style="cursor:pointer" data-ref="page.dashboard.duas-card">' +
        '<div class="row g-2 mb-2" data-ref="page.dashboard.duas-card.stats">' +
        summaryTile('Total', duasCount, '#25845B') +
        summaryTile('Pinned', pinsCount + ' / 2', '#ca8a04') +
        summaryTile('Favorites', favsCount, '#E5484D') +
        '</div>' +
        '<div class="text-gr-muted label-supporting" data-ref="page.dashboard.duas-card.footer">' +
        '<i class="fa-solid fa-book-quran me-1"></i>Tap to explore Quran Duas &amp; meanings' +
        '</div>' +
        '</div>';

    startDashClock();
}
