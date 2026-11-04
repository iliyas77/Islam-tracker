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
    if (typeof updatePerformanceTab === 'function') {
        updatePerformanceTab();
    }
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
    return '<div class="rounded-3 p-2 flex flex-col items-center justify-center gap-1.5 bg-danger-subtle min-w-0" ' +
        'data-ref="page.current.missed-sheet.tile.' + p.toLowerCase() + '">' +
        '<span class="fs-4 flex items-center justify-center">' + iconHtml + '</span>' +
        '<span class="fw-bold text-truncate w-100 text-center fs-xs text-dark">' + p + '</span>' +
        '<span class="badge-pill-custom badge-missed inline-flex items-center fs-xs py-1 px-1.5">' +
        renderIcon('circle-exclamation') + 'Missed</span>' +
        '</div>';
}

function missCard(x) {
    var tiles = x.prayers.map(function (p) { return missTile(x.date, p); }).join('');
    var missedCount = x.prayers.length;
    var countBadge = '<span class="badge-pill-custom badge-missed fs-xs py-1 px-2 inline-flex items-center gap-1 shrink-0">' +
        missedCount + ' Missed' +
        renderIcon({ name: 'chevron-right', size: 'fs-xs', className: 'opacity-75' }) + '</span>';

    return '<div class="card border border-borderGrey rounded-4 p-2 bg-gr cursor-pointer" role="button" data-act="jump" data-d="' + x.date + '" data-ref="page.current.missed-sheet.card.' + x.date + '">' +
        '<div class="flex items-center justify-between gap-2 mb-2 px-1" data-ref="page.current.missed-sheet.card.header">' +
        '<div class="flex items-center gap-2 min-w-0" data-ref="page.current.missed-sheet.card.info">' +
        IconBox({
            icon: 'calendar-days',
            size: 'sm',
            color: 'text-gr-accent',
            dataRef: 'page.current.missed-sheet.card.icon'
        }) +
        '<div class="min-w-0">' +
        '<div class="fw-bold text-gr1 fs-5 lh-1 text-truncate" data-ref="page.current.missed-sheet.card.title">' + friendly(x.date) + '</div>' +
        '<div class="text-gr-accent fw-semibold small mt-0.5 text-truncate" data-ref="page.current.missed-sheet.card.date">' + fr(x.date) + '</div>' +
        '</div>' +
        '</div>' +
        countBadge +
        '</div>' +
        '<div class="grid grid-cols-3 gap-2 w-100 missed-tiles-grid" data-ref="page.current.missed-sheet.card.tiles">' + tiles + '</div>' +
        '</div>';
}

function rMS() {
    var sheetCfg = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.SHEETS && window.CONSTANTS.PRAYER.SHEETS.MISSED_PRAYERS) || {
        iconClass: 'clipboard-list text-gr-accent',
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
            renderIcon({ name: 'star', size: 'display-4', color: 'text-brand', className: 'opacity-50' }) +
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
