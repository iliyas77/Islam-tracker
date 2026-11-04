/* ---------- Old Tracking ---------- */

var oldSd = null;

function rOldInfo() {
    var o = rdOK();
    if (!o) { rPeriod(); return; }

    var isAllCompleted = o.end < o.start;
    var dates = isAllCompleted ? [] : datesInRange(o.start, o.end);
    var a = rdOC();
    var totalDays = dates.length;
    var totalMissed = 0, daysMissed = 0;
    var perPrayer = {};
    P.forEach(function (p) { perPrayer[p] = 0; });

    dates.forEach(function (d) {
        var r = a[d] || {};
        var m = P.filter(function (p) { return r[p] === true || r[p] === 'missed'; });
        if (m.length > 0) {
            totalMissed += m.length;
            daysMissed++;
            m.forEach(function (p) { perPrayer[p]++; });
        }
    });

    var perPrayerHtml = P.map(function (p) {
        var c = perPrayer[p];
        var pIcon = typeof renderIcon === 'function' ? renderIcon(p.toLowerCase()) : I[p];
        return '<div class="flex justify-between items-center py-2 px-3 rounded-3 mb-2 bg-surface">' +
            '<div class="flex items-center gap-2"><span class="fs-4">' + pIcon + '</span>' +
            '<span class="fw-bold fs-6">' + p + '</span></div>' +
            '<span class="badge rounded-pill ' + (c > 0 ? 'bg-danger text-white' : 'bg-brand text-white') +
            ' px-3 py-2 small">' + c + ' missed</span></div>';
    }).join('');

    var sheetCfg = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.SHEETS && window.CONSTANTS.PRAYER.SHEETS.PERIOD_INFO) || {
        iconClass: 'circle-info text-brand',
        title: 'Period Info'
    };
    if (window.Icon && typeof Icon.update === 'function') {
        Icon.update($('sheet2Icon'), sheetCfg.iconClass);
    } else {
        $('sheet2Icon').className = sheetCfg.iconClass;
    }
    $('sheet2Title').textContent = sheetCfg.title;
    $('sheet2Sub').textContent = isAllCompleted ? (fr(o.start) + ' → Complete') : (fr(o.start) + ' → ' + fr(o.end));

    $('sheet2Body').innerHTML =
        '<div class="flex flex-col gap-2">' +
        '<div class="card border border-borderGrey rounded-4 p-3 bg-brand-light">' +
        '<div class="flex items-center gap-2 mb-3">' +
        renderIcon({ name: 'calendar-check', size: 'fs-4', color: 'text-brand' }) +
        '<strong class="fs-5 text-brand">Current Period</strong>' +
        '</div>' +
        '<div class="row g-2">' +
        '<div class="col-6"><div class="p-3 rounded-3 text-center bg-white border border-borderGrey">' +
        '<div class="text-muted small fw-bold text-uppercase">Start</div>' +
        '<div class="fw-bold small text-dark">' + fr(o.start) + '</div></div></div>' +
        '<div class="col-6"><div class="p-3 rounded-3 text-center bg-white border border-borderGrey">' +
        '<div class="text-muted small fw-bold text-uppercase">End</div>' +
        '<div class="fw-bold small text-dark">' + (isAllCompleted ? 'Complete' : fr(o.end)) + '</div></div></div>' +
        '</div>' +
        '</div>' +
        '<div class="card border border-borderGrey rounded-4 p-3 bg-white">' +
        '<div class="flex items-center gap-2 mb-3">' +
        renderIcon({ name: 'chart-simple', size: 'fs-5', color: 'text-brand' }) +
        '<strong class="text-dark">Summary</strong>' +
        '</div>' +
        '<div class="row g-2 mb-3">' +
        '<div class="col-6"><div class="p-3 rounded-3 text-center bg-surface border border-borderGrey">' +
        '<div class="text-muted small fw-bold text-uppercase">Total Days</div>' +
        '<div class="fw-bold fs-4 text-warning">' + totalDays + '</div></div></div>' +
        '<div class="col-6"><div class="p-3 rounded-3 text-center bg-surface border border-borderGrey">' +
        '<div class="text-muted small fw-bold text-uppercase">Total Missed</div>' +
        '<div class="fw-bold fs-4 text-danger">' + totalMissed + '</div></div></div>' +
        '</div>' +
        '<div class="row g-2">' +
        '<div class="col-12"><div class="p-3 rounded-3 text-center bg-surface border border-borderGrey">' +
        '<div class="text-muted small fw-bold text-uppercase">Days Missed</div>' +
        '<div class="fw-bold fs-4 text-danger">' + daysMissed + '</div></div></div>' +
        '</div>' +
        '</div>' +
        '<div class="card border border-borderGrey rounded-4 p-3 bg-white">' +
        '<div class="flex items-center gap-2 mb-2">' +
        renderIcon({ name: 'list-check', size: 'fs-5', color: 'text-warning' }) +
        '<strong class="text-dark">Per Prayer Breakdown</strong>' +
        '</div>' +
        '<div class="mt-2">' + perPrayerHtml + '</div>' +
        '</div>' +
        Button({
            label: 'Change Period',
            variant: 'brand',
            className: 'fw-bold py-3 rounded-3 fs-6',
            icon: renderIcon({ name: 'calendar-plus', className: 'me-1' }),
            dataAct: 'old-change-period'
        }) +
        '</div>';
    sheet2BS.show();
}

function rPeriod() {
    var sheetCfg = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.SHEETS && window.CONSTANTS.PRAYER.SHEETS.SET_OLD_PERIOD) || {
        iconClass: 'clock-rotate-left text-warning',
        title: 'Set Old Period',
        sub: ''
    };
    if (window.Icon && typeof Icon.update === 'function') {
        Icon.update($('sheet2Icon'), sheetCfg.iconClass);
    } else {
        $('sheet2Icon').className = sheetCfg.iconClass;
    }
    $('sheet2Title').textContent = sheetCfg.title;
    $('sheet2Sub').textContent = sheetCfg.sub;
    var o = rdOK();
    var hasValidPeriod = o && o.end >= o.start;
    $('sheet2Body').innerHTML =
        '<div class="flex flex-col gap-2">' +
        '<div class="card border border-borderGrey rounded-4 p-3 bg-warning-subtle">' +
        '<div class="mb-3">' +
        '<label class="form-label fw-bold">' +
        renderIcon({ name: 'calendar', color: 'text-brand', className: 'me-1' }) + 'Start date</label>' +
        '<input type="date" class="form-control form-control-lg" id="oldStart" value="' +
        (o ? o.start : '') + '" max="' + td() + '">' +
        '</div>' +
        '<div class="mb-3">' +
        '<label class="form-label fw-bold">' +
        renderIcon({ name: 'calendar-check', color: 'text-brand', className: 'me-1' }) + 'End date</label>' +
        '<input type="date" class="form-control form-control-lg" id="oldEnd" value="' +
        (hasValidPeriod ? (o.initialEnd || o.end) : (o ? o.end : '')) + '" max="' + td() + '">' +
        '</div>' +
        '<div class="flex gap-2">' +
        Button({
            label: 'Save Period',
            variant: 'brand',
            className: 'flex-1 fw-bold py-2 fs-5',
            icon: renderIcon({ name: 'check', className: 'me-1' }),
            dataAct: 'old-save'
        }) +
        (o ? Button({
            label: '',
            variant: 'outline-danger',
            className: 'fw-bold px-3',
            icon: renderIcon('trash'),
            dataAct: 'old-clear'
        }) : '') +
        '</div>' +
        '</div>' +
        (hasValidPeriod
            ? '<div class="card border border-borderGrey rounded-4 p-3 bg-brand-light">' +
            '<div class="flex items-center gap-2">' +
            renderIcon({ name: 'circle-info', color: 'text-brand' }) +
            '<div class="small">Current period: <strong>' + fr(o.start) +
            '</strong> to <strong>' + fr(o.end) + '</strong></div>' +
            '</div></div>'
            : '') +
        '</div>';
    sheet2BS.show();
}

function openOldCal() {
    var oldDp = $('oldDp');
    if (!oldDp) return;
    var o = rdOK();
    if (o && o.end >= o.start) {
        oldDp.min = o.start;
        oldDp.max = o.end;
        if (oldSd) oldDp.value = oldSd;
    }
    if (oldDp.showPicker) {
        try { oldDp.showPicker(); return; } catch (e) { }
    }
    oldDp.focus();
    oldDp.click();
}

function goOld(d) {
    var o = rdOK();
    if (!o || !d) return;
    if (o.end < o.start) return;
    if (d < o.start) d = o.start;
    if (d > o.end) d = o.end;
    oldSd = d;
    rOT();
}

function setOldSd(d) {
    oldSd = d;
}

function rOT() {
    ensureAllOldMissed();

    var o = rdOK();
    var lst = $('oldBody');
    var sub = $('oldSub');
    if (!lst) return;

    if (!o) {
        sub.textContent = 'Select a period to begin';
        lst.innerHTML = '<div class="text-center text-muted py-5 px-3 bg-white border border-borderGrey rounded-4" data-ref="page.old.empty-period">' +
            renderIcon({ name: 'calendar-plus', size: 'display-4', color: 'text-warning', className: 'mb-3' }) +
            '<p class="fw-bold mb-1 text-warning">No period selected</p>' +
            '<p class="text-muted small mb-0">Tap the bookmark button above to set your Old Tracking period.</p>' +
            Button({
                label: 'Set Period',
                variant: 'brand',
                size: 'sm',
                className: 'mt-3 fw-bold',
                icon: renderIcon({ name: 'plus', className: 'me-1' }),
                dataAct: 'old-change-period'
            }) +
            '</div>';
        return;
    }

    if (o.end < o.start) {
        sub.textContent = 'All days completed';
        lst.innerHTML = '<div class="text-center text-muted py-5 px-3 bg-white border border-borderGrey rounded-4" data-ref="page.old.all-completed">' +
            renderIcon({ name: 'circle-check', size: 'display-4', color: 'text-brand', className: 'mb-3' }) +
            '<p class="fw-bold mb-2 text-gr-accent">All days complete!</p>' +
            '<p class="text-muted small mb-0">The Old Tracking period has been fully cleared.</p>' +
            Button({
                label: 'Set Period',
                variant: 'brand',
                size: 'sm',
                className: 'mt-3 fw-bold',
                icon: renderIcon({ name: 'calendar-plus', className: 'me-1' }),
                dataAct: 'old-change-period'
            }) +
            '</div>';
        return;
    }

    sub.textContent = fr(o.start) + ' → ' + fr(o.end);

    if (!oldSd || oldSd < o.start || oldSd > o.end) {
        oldSd = currentOldDate() || o.end;
    }
    var curDate = oldSd;

    var oldDp = $('oldDp');
    if (oldDp) {
        oldDp.min = o.start;
        oldDp.max = o.end;
        oldDp.value = curDate;
    }

    var r = grO(curDate);
    var missed = P.filter(function (p) { return r[p] === true || r[p] === 'missed'; });
    var done = P.filter(function (p) { return r[p] !== true && r[p] !== 'missed'; });

    var dateChipText = formatChipDate(curDate);

    var html = renderPrayerTrackerCard({
        pagePrefix: 'page.old',
        collapsePrefix: 'old',
        badgeText: '',
        badgeAct: '',
        dateChipText: dateChipText,
        dateChipAct: 'old-open-cal',
        missedPrayers: missed,
        donePrayers: done,
        timings: T,
        currentPrayerName: null,
        toggleAct: 'toggle-old',
        date: curDate,
        missedTitle: 'MISSED',
        highlightMissed: true
    });

    lst.innerHTML = html;
    if (typeof updatePerformanceTab === 'function') {
        updatePerformanceTab();
    }
}

if (typeof window !== 'undefined') {
    window.rOT = rOT;
    window.rOldInfo = rOldInfo;
    window.rPeriod = rPeriod;
    window.openOldCal = openOldCal;
    window.goOld = goOld;
    window.setOldSd = setOldSd;
    window.oldSd = oldSd;
}
