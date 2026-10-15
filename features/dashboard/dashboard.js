/* ---------- Dashboard Clock ---------- */
function dashTick() {
    var el = $('dashTime');
    if (!el) return;
    var now = new Date();
    var h = now.getHours();
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12;
    if (hh === 0) hh = 12;
    el.innerHTML = pad2(hh) + ':' + pad2(now.getMinutes()) +
        '<span class="small">:' + pad2(now.getSeconds()) + '</span>' +
        '<span class="ampm">' + ap + '</span>';

    // Update Next Prayer badge if on second 0 or first tick
    if (now.getSeconds() === 0) {
        updateNextPrayerBadge();
    }
}

function updateNextPrayerBadge() {
    var badgeWrap = $('dashNextPrayer');
    if (!badgeWrap || typeof getNextPrayerInfo !== 'function') return;
    var nextP = getNextPrayerInfo();
    if (!nextP) {
        badgeWrap.innerHTML = '';
        return;
    }
    badgeWrap.innerHTML =
        '<span class="badge bg-gr-accent-soft text-gr-accent border border-success-subtle rounded-pill px-3 py-1 fw-bold d-inline-flex align-items-center gap-1" style="font-size:.78rem" data-ref="page.dashboard.clock-card.next-prayer-badge">' +
        '<i class="fa-solid fa-bell"></i>' +
        'Next: ' + nextP.name + ' (' + nextP.time + ')' +
        '<span class="opacity-75 ms-1">&bull; in ' + nextP.remaining + '</span>' +
        '</span>';
}

function startDashClock() {
    if (dashTimer) clearInterval(dashTimer);
    dashTick();
    dashTimer = setInterval(dashTick, 1000);
}

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

    var nextP = typeof getNextPrayerInfo === 'function' ? getNextPrayerInfo() : null;

    var prayerRow = P.map(function (p) {
        var done = todayData[p] === true;
        var isNext = nextP && nextP.name === p && !nextP.isTomorrow;
        var ring = done ? '#dc3545' : (isNext ? '#ca8a04' : '#1b7a4b');
        return '<div class="d-flex flex-column align-items-center gap-1" style="flex:1 1 0;min-width:0" data-ref="page.dashboard.prayer-item.' + p.toLowerCase() + '">' +
            '<div class="prayer-icon-circle" style="border:2px solid ' + ring + '" data-ref="page.dashboard.prayer-icon.' + p.toLowerCase() + '">' + I[p] + '</div>' +
            '<div class="prayer-label text-truncate" data-ref="page.dashboard.prayer-label.' + p.toLowerCase() + '">' + p.toUpperCase() + '</div>' +
            '<div class="text-muted text-center text-truncate" style="font-size:.65rem;line-height:1" data-ref="page.dashboard.prayer-time.' + p.toLowerCase() + '">' + (T[p] || '--:--') + '</div>' +
            '</div>';
    }).join('');

    function summaryTile(label, value, color) {
        return '<div class="col-4" data-ref="page.dashboard.summary-tile.' + label.toLowerCase() + '">' +
            '<div class="summary-tile" data-ref="page.dashboard.summary-tile.' + label.toLowerCase() + '.box">' +
            '<div class="label" data-ref="page.dashboard.summary-tile.' + label.toLowerCase() + '.label">' + label + '</div>' +
            '<div class="value" style="color:' + color + '" data-ref="page.dashboard.summary-tile.' + label.toLowerCase() + '.value">' + value + '</div>' +
            '</div></div>';
    }

    var hijriHtml = currentHijri && currentHijri.text
        ? '<div class="text-center mt-1 text-gr-accent fw-bold" style="font-size:.85rem" data-ref="page.dashboard.clock-card.hijri-date"><i class="fa-solid fa-moon me-1"></i>' + currentHijri.text + '</div>'
        : '';

    var cfg = typeof getPrayerConfig === 'function' ? getPrayerConfig() : { city: 'Delhi', school: 1 };
    var statusIcon = prayerTimingsStatus === 'live' ? 'fa-bolt text-success' : (prayerTimingsStatus === 'cached' ? 'fa-check text-muted' : 'fa-circle-notch text-muted');
    var statusPill =
        '<div class="d-flex align-items-center justify-content-center gap-2 mt-2" data-ref="page.dashboard.clock-card.meta-row">' +
        '<span class="badge bg-light text-secondary border rounded-pill px-2 py-1" style="font-size:.7rem" data-ref="page.dashboard.clock-card.location-pill">' +
        '<i class="fa-solid fa-location-dot text-success me-1"></i>' + cfg.city + ' &bull; ' + (cfg.school === 1 ? 'Hanafi' : 'Shafi') +
        '</span>' +
        '<span class="badge bg-light text-secondary border rounded-pill px-2 py-1" style="font-size:.7rem" data-ref="page.dashboard.clock-card.status-pill">' +
        '<i class="fa-solid ' + statusIcon + ' me-1"></i>' + (prayerTimingsStatus === 'live' ? 'Live' : 'Cached') +
        '</span>' +
        '</div>';

    var nextPrayerHtml =
        '<div class="d-flex align-items-center justify-content-center mt-2" id="dashNextPrayer" data-ref="page.dashboard.clock-card.next-prayer">' +
        (nextP
            ? '<span class="badge bg-gr-accent-soft text-gr-accent border border-success-subtle rounded-pill px-3 py-1 fw-bold d-inline-flex align-items-center gap-1" style="font-size:.78rem" data-ref="page.dashboard.clock-card.next-prayer-badge">' +
            '<i class="fa-solid fa-bell"></i>' +
            'Next: ' + nextP.name + ' (' + nextP.time + ')' +
            '<span class="opacity-75 ms-1">&bull; in ' + nextP.remaining + '</span>' +
            '</span>'
            : '') +
        '</div>';

    body.innerHTML =
        '<div class="card shadow-sm rounded-4 p-3 mb-3 bg-gr" style="border:0" data-ref="page.dashboard.clock-card">' +
        '<div class="d-flex align-items-center gap-1 mb-3" data-ref="page.dashboard.clock-card.prayers-row">' + prayerRow + '</div>' +
        '<div class="clock-big mb-2" id="dashTime" data-ref="page.dashboard.clock-card.time">--:--<span class="small">:--</span><span class="ampm">AM</span></div>' +
        '<div class="text-center" style="font-size:.95rem;color:#7a8b83;font-weight:600" data-ref="page.dashboard.clock-card.gregorian-date">' + dashDate() + '</div>' +
        hijriHtml +
        nextPrayerHtml +
        statusPill +
        '</div>' +

        '<div class="fw-bold mb-2 px-1 text-gr-muted" style="font-size:.75rem;letter-spacing:1.5px" data-ref="page.dashboard.current-prayer.section-title">CURRENT PRAYER</div>' +
        '<div class="card shadow-sm rounded-4 p-3 mb-3 bg-gr border-0" role="button" data-act="goto-cur" style="cursor:pointer" data-ref="page.dashboard.current-prayer-card">' +
        '<div class="row g-2 mb-2" data-ref="page.dashboard.current-prayer-card.stats">' +
        summaryTile('Done', doneToday, '#1b7a4b') +
        summaryTile('Missed', missToday, '#dc3545') +
        summaryTile('Today', curPct + '%', '#cc7a00') +
        '</div>' +
        (missPrev > 0
            ? '<div class="d-flex align-items-center gap-2 mb-2 p-2 rounded-3 bg-gr-danger-soft" data-ref="page.dashboard.current-prayer-card.missed-alert">' +
            '<i class="fa-solid fa-circle-exclamation text-gr-danger"></i>' +
            '<span class="fw-bold text-gr-danger" style="font-size:.82rem">' + missPrev + ' missed from previous days</span>' +
            '<i class="fa-solid fa-chevron-right ms-auto text-muted" style="font-size:.8rem"></i>' +
            '</div>'
            : '<div class="d-flex align-items-center gap-2 mb-2 p-2 rounded-3 bg-gr-accent-soft" data-ref="page.dashboard.current-prayer-card.all-clear">' +
            '<i class="fa-solid fa-circle-check text-gr-accent"></i>' +
            '<span class="fw-bold text-gr-accent" style="font-size:.82rem">No missed prayers from previous days</span>' +
            '</div>') +
        '<div class="text-muted" style="font-size:.75rem" data-ref="page.dashboard.current-prayer-card.footer">' +
        '<i class="fa-regular fa-calendar me-1"></i>' + fr(today) +
        '</div>' +
        '</div>' +

        '<div class="fw-bold mb-2 px-1 text-gr-muted" style="font-size:.75rem;letter-spacing:1.5px" data-ref="page.dashboard.previous-prayer.section-title">PREVIOUS PRAYER</div>' +
        '<div class="card shadow-sm rounded-4 p-3 mb-3 bg-gr border-0" role="button" data-act="goto-old" style="cursor:pointer" data-ref="page.dashboard.previous-prayer-card">' +
        '<div class="row g-2 mb-2" data-ref="page.dashboard.previous-prayer-card.stats">' +
        summaryTile('Tracked', trackedDays, '#1b7a4b') +
        summaryTile('Missed', trackedMiss, '#dc3545') +
        summaryTile('Rate', oldPct + '%', '#cc7a00') +
        '</div>' +
        '<div class="text-muted" style="font-size:.75rem" data-ref="page.dashboard.previous-prayer-card.footer">' +
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
        '<div class="fw-bold mb-2 px-1 text-gr-muted" style="font-size:.75rem;letter-spacing:1.5px" data-ref="page.dashboard.tasbeeh.section-title">DIGITAL TASBEEH</div>' +
        '<div class="card shadow-sm rounded-4 p-3 mb-3 bg-gr border-0" role="button" data-act="goto-tasbeeh" style="cursor:pointer" data-ref="page.dashboard.tasbeeh-card">' +
        '<div class="row g-2 mb-2" data-ref="page.dashboard.tasbeeh-card.stats">' +
        summaryTile('Chants', tbCount, '#1b7a4b') +
        summaryTile('Today', tbToday, '#ca8a04') +
        summaryTile('Counter', '<i class="fa-solid fa-arrow-right"></i>', '#1b7a4b') +
        '</div>' +
        '<div class="text-muted" style="font-size:.75rem" data-ref="page.dashboard.tasbeeh-card.footer">' +
        '<i class="fa-solid fa-hand-holding-heart me-1"></i>Tap to open Digital Tasbeeh' +
        '</div>' +
        '</div>';

    startDashClock();
}
