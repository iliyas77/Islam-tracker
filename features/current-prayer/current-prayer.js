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

    updateCurrentMissedBadge();
}

function updateCurrentMissedBadge() {
    var totalMissed = typeof getConsolidatedMissedCount === 'function'
        ? getConsolidatedMissedCount()
        : 0;
    var missedBtn = $('currentMissedBtn');
    var missedBadge = $('currentMissedBadge');
    if (missedBadge) {
        if (totalMissed > 0) {
            missedBadge.textContent = totalMissed;
            missedBadge.classList.remove('d-none');
        } else {
            missedBadge.textContent = '';
            missedBadge.classList.add('d-none');
        }
    }
    if (missedBtn) {
        missedBtn.title = totalMissed > 0 ? ('Missed Prayers (' + totalMissed + ')') : 'Missed Prayers';
    }
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
    var iconHtml = typeof renderIcon === 'function' ? renderIcon(p.toLowerCase()) : I[p];
    return '<div class="rounded-4 p-2 flex flex-col items-center justify-center gap-2 flex-1 bg-danger-subtle min-w-0" ' +
        'data-ref="page.current.missed-sheet.tile.' + p.toLowerCase() + '">' +
        '<span class="fs-3">' + iconHtml + '</span>' +
        '<span class="fw-bold text-truncate w-100 text-center small text-dark">' + p + '</span>' +
        '<span class="badge-pill-custom badge-missed inline-flex items-center fs-xs py-1 px-2">' +
        (typeof renderIcon === 'function' ? renderIcon('circle-exclamation') : '<i class="fa-solid fa-circle-exclamation"></i>') + 'Missed</span>' +
        '</div>';
}

function missCard(x) {
    var tiles = x.prayers.map(function (p) { return missTile(x.date, p); }).join('');
    return '<div class="card shadow-sm rounded-4 p-3 bg-gr border-0 cursor-pointer" role="button" data-act="jump" data-d="' + x.date + '" data-ref="page.current.missed-sheet.card.' + x.date + '">' +
        '<div class="flex items-center gap-3 p-2 rounded-4 mb-3 bg-brand-light" data-ref="page.current.missed-sheet.card.header">' +
        '<span class="icon-box icon-box-lg flex items-center justify-center shrink-0" data-ref="page.current.missed-sheet.card.icon">' +
        (typeof renderIcon === 'function' ? renderIcon({ name: 'calendar-days', variant: 'regular', size: 'fs-3', color: 'text-gr-accent' }) : '<i class="fa-regular fa-calendar-days fs-3 text-gr-accent"></i>') + '</span>' +
        '<div class="grow min-w-0" data-ref="page.current.missed-sheet.card.info">' +
        '<div class="fw-bold text-gr1 fs-5 lh-1" data-ref="page.current.missed-sheet.card.title">' + friendly(x.date) + '</div>' +
        '<div class="text-gr-accent fw-semibold mt-1" data-ref="page.current.missed-sheet.card.date">' + fr(x.date) + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="flex gap-2 w-100" data-ref="page.current.missed-sheet.card.tiles">' + tiles + '</div>' +
        '</div>';
}

function rMS() {
    var sheetCfg = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.SHEETS && window.CONSTANTS.PRAYER.SHEETS.MISSED_PRAYERS) || {
        iconClass: 'fa-solid fa-clipboard-list text-gr-accent',
        title: 'Missed Prayers',
        sub: 'From previous days (today excluded)'
    };
    if (window.Icon && typeof Icon.update === 'function') {
        Icon.update($('sheet2Icon'), sheetCfg.iconClass);
    } else {
        $('sheet2Icon').className = sheetCfg.iconClass;
    }
    $('sheet2Title').textContent = sheetCfg.title;
    $('sheet2Sub').textContent = sheetCfg.sub;

    var list = mBD().reverse();
    var b = $('sheet2Body');
    if (!list.length) {
        b.innerHTML = '<div class="text-center text-muted py-5" data-ref="page.current.missed-sheet.empty">' +
            (typeof renderIcon === 'function' ? renderIcon({ name: 'star', size: 'display-4', color: 'text-brand', className: 'opacity-50' }) : '<i class="fa-solid fa-star display-4 text-brand opacity-50"></i>') +
            '<p class="mt-3">No missed prayers from previous days.<br>All caught up!</p></div>';
    } else {
        b.innerHTML = '<div class="flex flex-col gap-2" data-ref="page.current.missed-sheet.list">' +
            list.map(missCard).join('') + '</div>';
    }
    sheet2BS.show();
}

if (typeof window !== 'undefined') {
    window.rn = rn;
    window.go = go;
    window.rMS = rMS;
    window.updateCurrentMissedBadge = updateCurrentMissedBadge;
}
