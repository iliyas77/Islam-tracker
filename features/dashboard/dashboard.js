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

    var prayerRow = P.map(function (p) {
        var done = todayData[p] === true;
        var ring = done ? '#dc3545' : '#1b7a4b';
        return '<div class="d-flex flex-column align-items-center gap-2" style="flex:1 1 0;min-width:0">' +
            '<div class="prayer-icon-circle" style="border:2px solid ' + ring + '">' + I[p] + '</div>' +
            '<div class="prayer-label">' + p.toUpperCase() + '</div>' +
            '</div>';
    }).join('');

    function summaryTile(label, value, color) {
        return '<div class="col-4"><div class="summary-tile">' +
            '<div class="label">' + label + '</div>' +
            '<div class="value" style="color:' + color + '">' + value + '</div>' +
            '</div></div>';
    }

    body.innerHTML =
        '<div class="card shadow-sm rounded-4 p-3 mb-3" style="background:#fff">' +
        '<div class="d-flex align-items-center gap-1 mb-3">' + prayerRow + '</div>' +
        '<div class="clock-big mb-2" id="dashTime">--:--<span class="small">:--</span><span class="ampm">AM</span></div>' +
        '<div class="text-center" style="font-size:.95rem;color:#7a8b83;font-weight:600">' + dashDate() + '</div>' +
        '</div>' +

        '<div class="fw-bold mb-2 px-1" style="font-size:.75rem;color:#7a8b83;letter-spacing:1.5px">CURRENT PRAYER</div>' +
        '<div class="card shadow-sm rounded-4 p-3 mb-3" role="button" data-act="goto-cur" style="background:#fff;cursor:pointer">' +
        '<div class="row g-2 mb-2">' +
        summaryTile('Done', doneToday, '#1b7a4b') +
        summaryTile('Missed', missToday, '#dc3545') +
        summaryTile('Today', curPct + '%', '#cc7a00') +
        '</div>' +
        (missPrev > 0
            ? '<div class="d-flex align-items-center gap-2 mb-2 p-2 rounded-3" style="background:#fde8e8">' +
            '<i class="fa-solid fa-circle-exclamation" style="color:#dc3545"></i>' +
            '<span class="fw-bold" style="font-size:.82rem;color:#dc3545">' + missPrev + ' missed from previous days</span>' +
            '<i class="fa-solid fa-chevron-right ms-auto" style="color:#c0c8c4;font-size:.8rem"></i>' +
            '</div>'
            : '<div class="d-flex align-items-center gap-2 mb-2 p-2 rounded-3" style="background:#d1e7dd">' +
            '<i class="fa-solid fa-circle-check" style="color:#1b7a4b"></i>' +
            '<span class="fw-bold" style="font-size:.82rem;color:#1b7a4b">No missed prayers from previous days</span>' +
            '</div>') +
        '<div class="text-muted" style="font-size:.75rem">' +
        '<i class="fa-regular fa-calendar me-1"></i>' + fr(today) +
        '</div>' +
        '</div>' +

        '<div class="fw-bold mb-2 px-1" style="font-size:.75rem;color:#7a8b83;letter-spacing:1.5px">PREVIOUS PRAYER</div>' +
        '<div class="card shadow-sm rounded-4 p-3 mb-3" role="button" data-act="goto-old" style="background:#fff;cursor:pointer">' +
        '<div class="row g-2 mb-2">' +
        summaryTile('Tracked', trackedDays, '#1b7a4b') +
        summaryTile('Missed', trackedMiss, '#dc3545') +
        summaryTile('Rate', oldPct + '%', '#cc7a00') +
        '</div>' +
        '<div class="text-muted" style="font-size:.75rem">' +
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
        '<div class="fw-bold mb-2 px-1" style="font-size:.75rem;color:#7a8b83;letter-spacing:1.5px" data-ref="page.dashboard.tasbeeh.section-title">DIGITAL TASBEEH</div>' +
        '<div class="card shadow-sm rounded-4 p-3 mb-3" role="button" data-act="goto-tasbeeh" style="background:#fff;cursor:pointer" data-ref="page.dashboard.tasbeeh-card">' +
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
