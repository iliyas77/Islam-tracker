/* ---------- Old Tracking ---------- */
function oldSectionHeader(type, title, count) {
    var isMissed = type === 'missed';
    var bg = isMissed ? '#fde8e8' : '#d1e7dd';
    var fg = isMissed ? '#dc3545' : '#1b7a4b';
    var icon = isMissed ? 'fa-exclamation' : 'fa-check';
    return '<div class="section-header" style="background:' + bg + '" data-ref="page.old.section-header.' + type + '">' +
        '<span class="icon-circle" style="background:' + fg + '" data-ref="page.old.section-header.' + type + '.icon">' +
        '<i class="fa-solid ' + icon + '"></i></span>' +
        '<span class="title" data-ref="page.old.section-header.' + type + '.title">' + title + '</span>' +
        '<span class="count" style="color:' + fg + '" data-ref="page.old.section-header.' + type + '.count">' + count + '</span>' +
        '</div>';
}

function oldRow(date, p) {
    var r = grO(date);
    var d = r[p] === true;
    var badge = d
        ? '<span class="badge-pill-custom badge-missed" data-ref="page.old.prayer-row.badge.' + p.toLowerCase() + '"><i class="fa-solid fa-circle-exclamation"></i>Missed</span>'
        : '<span class="badge-pill-custom badge-done" data-ref="page.old.prayer-row.badge.' + p.toLowerCase() + '"><i class="fa-solid fa-circle-check"></i>Done</span>';
    return '<div class="prayer-row" role="button" data-act="toggle-old" data-p="' + p + '" data-d="' + date + '" data-ref="page.old.prayer-row.' + p.toLowerCase() + '">' +
        '<span class="icon-circle-lg" data-ref="page.old.prayer-row.icon.' + p.toLowerCase() + '">' + I[p] + '</span>' +
        '<div class="flex-grow-1 ms-3 min-w-0" data-ref="page.old.prayer-row.details.' + p.toLowerCase() + '">' +
        '<div class="name" data-ref="page.old.prayer-row.name.' + p.toLowerCase() + '">' + p + '</div>' +
        '<div class="time" data-ref="page.old.prayer-row.time.' + p.toLowerCase() + '">' + (T[p] || '--:--') + '</div>' +
        '</div>' + badge +
        '<i class="fa-solid fa-chevron-right chevron" data-ref="page.old.prayer-row.chevron.' + p.toLowerCase() + '"></i>' +
        '</div>';
}

function rOldInfo() {
    var o = rdOK();
    if (!o) { rPeriod(); return; }

    var dates = datesInRange(o.start, o.end);
    var a = rdOC();
    var totalDays = dates.length;
    var totalMissed = 0, daysMissed = 0;
    var perPrayer = {};
    P.forEach(function (p) { perPrayer[p] = 0; });

    dates.forEach(function (d) {
        var r = a[d] || {};
        var m = P.filter(function (p) { return r[p] === true; });
        if (m.length > 0) {
            totalMissed += m.length;
            daysMissed++;
            m.forEach(function (p) { perPrayer[p]++; });
        }
    });

    var perPrayerHtml = P.map(function (p) {
        var c = perPrayer[p];
        return '<div class="d-flex justify-content-between align-items-center py-2 px-3 rounded-3 mb-2" style="background:#f8faf9">' +
            '<div class="d-flex align-items-center gap-2"><span class="fs-4">' + I[p] + '</span>' +
            '<span class="fw-bold" style="font-size:1rem">' + p + '</span></div>' +
            '<span class="badge rounded-pill ' + (c > 0 ? 'text-bg-danger' : 'text-bg-success') +
            ' px-3 py-2" style="font-size:.9rem">' + c + ' missed</span></div>';
    }).join('');

    $('sheet2Icon').className = 'fa-solid fa-circle-info';
    $('sheet2Icon').style.color = '#0d6efd';
    $('sheet2Title').textContent = 'Period Info';
    $('sheet2Sub').textContent = fr(o.start) + ' → ' + fr(o.end);

    $('sheet2Body').innerHTML =
        '<div class="d-flex flex-column gap-2">' +
        '<div class="card rounded-4 p-3" style="background:#e7f1ff">' +
        '<div class="d-flex align-items-center gap-2 mb-3">' +
        '<i class="fa-regular fa-calendar-check fs-4" style="color:#0d6efd"></i>' +
        '<strong class="fs-5" style="color:#0d6efd">Current Period</strong>' +
        '</div>' +
        '<div class="row g-2">' +
        '<div class="col-6"><div class="p-3 rounded-3 text-center bg-white">' +
        '<div class="text-muted" style="font-size:.72rem;font-weight:700;text-transform:uppercase">Start</div>' +
        '<div class="fw-bold" style="font-size:.9rem;color:#1a2b23">' + fr(o.start) + '</div></div></div>' +
        '<div class="col-6"><div class="p-3 rounded-3 text-center bg-white">' +
        '<div class="text-muted" style="font-size:.72rem;font-weight:700;text-transform:uppercase">End</div>' +
        '<div class="fw-bold" style="font-size:.9rem;color:#1a2b23">' + fr(o.end) + '</div></div></div>' +
        '</div>' +
        '</div>' +
        '<div class="card rounded-4 p-3" style="background:#fff">' +
        '<div class="d-flex align-items-center gap-2 mb-3">' +
        '<i class="fa-solid fa-chart-simple fs-5" style="color:#0d6efd"></i>' +
        '<strong style="font-size:.95rem;color:#1a2b23">Summary</strong>' +
        '</div>' +
        '<div class="row g-2 mb-3">' +
        '<div class="col-6"><div class="p-3 rounded-3 text-center" style="background:#f4f8f5">' +
        '<div class="text-muted" style="font-size:.68rem;font-weight:700;text-transform:uppercase">Total Days</div>' +
        '<div class="fw-bold" style="font-size:1.4rem;color:#cc7a00">' + totalDays + '</div></div></div>' +
        '<div class="col-6"><div class="p-3 rounded-3 text-center" style="background:#f4f8f5">' +
        '<div class="text-muted" style="font-size:.68rem;font-weight:700;text-transform:uppercase">Total Missed</div>' +
        '<div class="fw-bold" style="font-size:1.4rem;color:#dc3545">' + totalMissed + '</div></div></div>' +
        '</div>' +
        '<div class="row g-2">' +
        '<div class="col-12"><div class="p-3 rounded-3 text-center" style="background:#f4f8f5">' +
        '<div class="text-muted" style="font-size:.68rem;font-weight:700;text-transform:uppercase">Days Missed</div>' +
        '<div class="fw-bold" style="font-size:1.4rem;color:#dc3545">' + daysMissed + '</div></div></div>' +
        '</div>' +
        '</div>' +
        '<div class="card rounded-4 p-3" style="background:#fff">' +
        '<div class="d-flex align-items-center gap-2 mb-2">' +
        '<i class="fa-solid fa-list-check fs-5" style="color:#cc7a00"></i>' +
        '<strong style="font-size:.95rem;color:#1a2b23">Per Prayer Breakdown</strong>' +
        '</div>' +
        '<div class="mt-2">' + perPrayerHtml + '</div>' +
        '</div>' +
        '<button type="button" class="btn btn-brand fw-bold py-3 rounded-3 fs-6" data-act="old-change-period">' +
        '<i class="fa-regular fa-calendar-plus me-1"></i>Change Period</button>' +
        '</div>';
    sheet2BS.show();
}

function rPeriod() {
    $('sheet2Icon').className = 'fa-solid fa-clock-rotate-left';
    $('sheet2Icon').style.color = '#cc7a00';
    $('sheet2Title').textContent = 'Set Old Period';
    $('sheet2Sub').textContent = '';
    var o = rdOK();
    $('sheet2Body').innerHTML =
        '<div class="d-flex flex-column gap-2">' +
        '<div class="card rounded-4 p-3" style="background:#fff5e6">' +
        '<div class="mb-3">' +
        '<label class="form-label fw-bold">' +
        '<i class="fa-regular fa-calendar me-1 text-success"></i>Start date</label>' +
        '<input type="date" class="form-control form-control-lg" id="oldStart" value="' +
        (o ? o.start : '') + '" max="' + td() + '">' +
        '</div>' +
        '<div class="mb-3">' +
        '<label class="form-label fw-bold">' +
        '<i class="fa-regular fa-calendar-check me-1 text-success"></i>End date</label>' +
        '<input type="date" class="form-control form-control-lg" id="oldEnd" value="' +
        (o ? o.end : '') + '" max="' + td() + '">' +
        '</div>' +
        '<div class="d-flex gap-2">' +
        '<button class="btn btn-brand flex-fill fw-bold py-2 fs-5" data-act="old-save" type="button">' +
        '<i class="fa-solid fa-check me-1"></i>Save Period</button>' +
        (o ? '<button class="btn btn-outline-danger fw-bold px-3" data-act="old-clear" type="button">' +
            '<i class="fa-solid fa-trash"></i></button>' : '') +
        '</div>' +
        '</div>' +
        (o
            ? '<div class="card rounded-4 p-3 bg-success-subtle">' +
            '<div class="d-flex align-items-center gap-2">' +
            '<i class="fa-solid fa-circle-info text-success"></i>' +
            '<div class="small">Current period: <strong>' + fr(o.start) +
            '</strong> to <strong>' + fr(o.end) + '</strong></div>' +
            '</div></div>'
            : '') +
        '</div>';
    sheet2BS.show();
}

function rOT() {
    ensureAllOldMissed();
    shrinkOldPeriod();

    var o = rdOK();
    var lst = $('oldBody');
    var sub = $('oldSub');
    if (!lst) return;

    if (!o) {
        sub.textContent = 'Select a period to begin';
        lst.innerHTML = '<div class="text-center text-muted py-5 px-3" style="background:#fff;border-radius:16px">' +
            '<i class="fa-regular fa-calendar-plus display-4 mb-3" style="color:#cc7a00"></i>' +
            '<p class="fw-bold mb-1" style="color:#cc7a00">No period selected</p>' +
            '<p class="text-muted small mb-0">Tap the bookmark button above to set your Old Tracking period.</p>' +
            '</div>';
        return;
    }
    sub.textContent = fr(o.start) + ' → ' + fr(o.end);

    var curDate = currentOldDate();
    if (!curDate) {
        lst.innerHTML = '<div class="text-center text-muted py-5 px-3" style="background:#fff;border-radius:16px">' +
            '<i class="fa-solid fa-circle-check display-4 mb-3 text-success"></i>' +
            '<p class="fw-bold mb-2" style="color:#1b7a4b">All days complete!</p>' +
            '<p class="text-muted small mb-0">The Old Tracking period has been fully cleared.</p>' +
            '</div>';
        return;
    }

    var r = grO(curDate);
    var missed = P.filter(function (p) { return r[p] === true; });
    var done = P.filter(function (p) { return r[p] !== true; });

    var html = '<div class="fw-bold mb-2 px-1" style="font-size:.78rem;color:#7a8b83">' +
        friendly(curDate) + ' · ' + fr(curDate) + '</div>';

    html += '<div class="card shadow-sm rounded-4 overflow-hidden mb-2">';
    html += oldSectionHeader('missed', 'Missed Prayers', missed.length);
    html += missed.length
        ? missed.map(function (p) { return oldRow(curDate, p); }).join('')
        : '<div class="text-center text-muted py-4" style="background:#fff;font-size:.9rem">No missed prayers</div>';
    html += '</div>';

    html += '<div class="card shadow-sm rounded-4 overflow-hidden">';
    html += oldSectionHeader('done', 'Completed Prayers', done.length);
    html += done.length
        ? done.map(function (p) { return oldRow(curDate, p); }).join('')
        : '<div class="text-center text-muted py-4" style="background:#fff;font-size:.9rem">No completed prayers yet</div>';
    html += '</div>';

    lst.innerHTML = html;
}
