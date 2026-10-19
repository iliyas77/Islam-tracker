function rn() {
    $('dp').value = sd;
    $('dp').max = td();

    var r = en(sd);
    var isToday = sd === td();
    var missTotal = tMT();

    var done = [];
    var missed = [];
    var upcoming = [];

    P.forEach(function (p) {
        if (isDonePrayer(p, sd, r)) {
            done.push(p);
        } else {
            if (isToday && isPrayerUpcoming(p, sd)) {
                upcoming.push(p);
            }
            missed.push(p);
        }
    });

    var curActive = isToday && typeof getActivePrayerInfo === 'function' ? getActivePrayerInfo() : null;
    var curPrayerName = curActive ? curActive.name : null;

    var actualMissedCount = missed.filter(function (p) {
        return upcoming.indexOf(p) === -1 && p !== curPrayerName;
    }).length;
    var badgeText = actualMissedCount > 0 ? ('Missed (' + actualMissedCount + ')') : 'Missed';
    var actionBtnText = isToday ? 'Select All' : 'Today';
    var actionBtnAct = isToday ? 'select-all' : 'jump-today';
    var dateChipText = formatChipDate(sd);

    var html = renderPrayerTrackerCard({
        pagePrefix: 'page.current',
        collapsePrefix: 'cur',
        badgeText: badgeText,
        badgeAct: missTotal > 0 ? 'missed-open' : '',
        actionBtnText: actionBtnText,
        actionBtnAct: actionBtnAct,
        dateChipText: dateChipText,
        dateChipAct: 'open-cal',
        missedPrayers: missed,
        upcomingPrayers: upcoming,
        donePrayers: done,
        timings: T,
        currentPrayerName: curPrayerName,
        toggleAct: 'toggle-cur',
        date: sd
    });

    $('currentBody').innerHTML = html;
}

function go(d) {
    if (d > td()) d = td();
    sd = d;
    if (typeof fetchPrayerTimings === 'function') {
        fetchPrayerTimings(sd, function () { rn(); });
    }
    rn();
}

/* ---------- Missed Prayers Sheet ---------- */
function missTile(date, p) {
    return '<div class="rounded-4 p-2 d-flex flex-column align-items-center justify-content-center gap-2 flex-fill bg-danger-subtle min-w-0" ' +
        'data-ref="page.current.missed-sheet.tile.' + p.toLowerCase() + '">' +
        '<span class="fs-3">' + I[p] + '</span>' +
        '<span class="fw-bold text-truncate w-100 text-center small text-dark">' + p + '</span>' +
        '<span class="badge-pill-custom badge-missed fs-xs py-1 px-2">' +
        '<i class="fa-solid fa-circle-exclamation"></i>Missed</span>' +
        '</div>';
}

function missCard(x) {
    var tiles = x.prayers.map(function (p) { return missTile(x.date, p); }).join('');
    return '<div class="card shadow-sm rounded-4 p-3 bg-gr border-0 cursor-pointer" role="button" data-act="jump" data-d="' + x.date + '" data-ref="page.current.missed-sheet.card.' + x.date + '">' +
        '<div class="d-flex align-items-center gap-3 p-2 rounded-4 mb-3 bg-success-subtle" data-ref="page.current.missed-sheet.card.header">' +
        '<span class="icon-circle-lg" data-ref="page.current.missed-sheet.card.icon">' +
        '<i class="fa-regular fa-calendar-days fs-3 text-gr-accent"></i></span>' +
        '<div class="flex-grow-1 min-w-0" data-ref="page.current.missed-sheet.card.info">' +
        '<div class="fw-bold text-gr1 fs-5 lh-1" data-ref="page.current.missed-sheet.card.title">' + friendly(x.date) + '</div>' +
        '<div class="text-gr-accent fw-semibold mt-1" data-ref="page.current.missed-sheet.card.date">' + fr(x.date) + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="d-flex gap-2 w-100" data-ref="page.current.missed-sheet.card.tiles">' + tiles + '</div>' +
        '</div>';
}

function rMS() {
    $('sheet2Icon').className = 'fa-solid fa-clipboard-list text-gr-accent';
    $('sheet2Title').textContent = 'Missed Prayers';
    $('sheet2Sub').textContent = 'From previous days (today excluded)';

    var list = mBD().reverse();
    var b = $('sheet2Body');
    if (!list.length) {
        b.innerHTML = '<div class="text-center text-muted py-5" data-ref="page.current.missed-sheet.empty">' +
            '<i class="fa-solid fa-star display-4 text-success opacity-50"></i>' +
            '<p class="mt-3">No missed prayers from previous days.<br>All caught up!</p></div>';
    } else {
        b.innerHTML = '<div class="d-flex flex-column gap-2" data-ref="page.current.missed-sheet.list">' +
            list.map(missCard).join('') + '</div>';
    }
    sheet2BS.show();
}
