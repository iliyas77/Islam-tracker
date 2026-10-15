/* ---------- Current Prayer Render ---------- */
function curSectionHeader(type, title, count) {
    var isMissed = type === 'missed';
    var bg = isMissed ? '#fde8e8' : '#f1f3f2';
    var fg = isMissed ? '#dc3545' : '#6b7a72';
    var icon = isMissed ? 'fa-exclamation' : 'fa-hourglass-half';
    return '<div class="section-header" style="background:' + bg + '">' +
        '<span class="icon-circle" style="background:' + fg + '">' +
        '<i class="fa-solid ' + icon + '"></i></span>' +
        '<span class="title">' + title + '</span>' +
        '<span class="count" style="color:' + fg + '">' + count + '</span>' +
        '</div>';
}

function curRow(p, isMissed) {
    var badge = isMissed
        ? '<span class="badge-pill-custom badge-missed"><i class="fa-solid fa-circle-exclamation"></i>Missed</span>'
        : '<span class="badge-pill-custom badge-notyet"><i class="fa-regular fa-circle"></i>Not yet</span>';
    return '<div class="prayer-row" role="button" data-act="toggle-cur" data-p="' + p + '">' +
        '<span class="icon-circle-lg">' + I[p] + '</span>' +
        '<div class="flex-grow-1 ms-3 min-w-0">' +
        '<div class="name">' + p + '</div>' +
        '<div class="time">' + T[p] + '</div>' +
        '</div>' + badge +
        '<i class="fa-solid fa-chevron-right chevron"></i>' +
        '</div>';
}

function rn() {
    $('dp').value = sd;
    $('dp').max = td();
    $('currentSub').textContent = fr(sd);

    var r = en(sd);
    var isToday = sd === td();
    var missTotal = tMT();
    var missedBtn = missTotal > 0
        ? '<button class="btn-pill-missed" data-act="missed-open">' +
        '<i class="fa-solid fa-circle-exclamation"></i>Missed ' + missTotal + '</button>'
        : '';
    var rightBtn = isToday
        ? '<button class="btn-pill-action" data-act="select-all">' +
        '<i class="fa-solid fa-check"></i>Select All</button>'
        : '<button class="btn-pill-today" data-act="jump-today">' +
        '<i class="fa-solid fa-arrow-rotate-right"></i>Today</button>';

    var actionRow = '<div class="d-flex align-items-center gap-2 mb-2" style="min-height:38px">' +
        missedBtn + '<div class="flex-grow-1"></div>' + rightBtn + '</div>';

    var missed = P.filter(function (p) { return r[p] === true; });
    var notYet = P.filter(function (p) { return r[p] !== true; });

    var html = actionRow;
    if (missed.length) {
        html += '<div class="card shadow-sm rounded-4 overflow-hidden mb-2">' +
            curSectionHeader('missed', 'Missed Prayers', missed.length) +
            missed.map(function (p) { return curRow(p, true); }).join('') +
            '</div>';
    }
    if (notYet.length) {
        html += '<div class="card shadow-sm rounded-4 overflow-hidden mb-2">' +
            curSectionHeader('notyet', 'Not Yet Prayed', notYet.length) +
            notYet.map(function (p) { return curRow(p, false); }).join('') +
            '</div>';
    }
    $('currentBody').innerHTML = html;
}

function go(d) {
    if (d > td()) d = td();
    sd = d;
    rn();
}

/* ---------- Missed Prayers Sheet ---------- */
function missTile(date, p) {
    return '<div class="rounded-4 p-2 d-flex flex-column align-items-center justify-content-center gap-2 flex-fill" ' +
        'style="background:#fde8e8;min-width:0">' +
        '<span class="fs-3">' + I[p] + '</span>' +
        '<span class="fw-bold text-truncate w-100 text-center" style="font-size:.85rem;color:#1a2b23">' + p + '</span>' +
        '<span class="badge-pill-custom badge-missed" style="font-size:.68rem;padding:.25rem .5rem">' +
        '<i class="fa-solid fa-circle-exclamation"></i>Missed</span>' +
        '</div>';
}

function missCard(x) {
    var tiles = x.prayers.map(function (p) { return missTile(x.date, p); }).join('');
    return '<div class="card shadow-sm rounded-4 p-3" role="button" data-act="jump" data-d="' + x.date + '" style="background:#fff;cursor:pointer">' +
        '<div class="d-flex align-items-center gap-3 p-2 rounded-4 mb-3" style="background:#e8f4ed">' +
        '<span class="icon-circle-lg" style="background:#d3ecdc;width:52px;height:52px">' +
        '<i class="fa-regular fa-calendar-days fs-3" style="color:#1b7a4b"></i></span>' +
        '<div class="flex-grow-1 min-w-0">' +
        '<div class="fw-bold" style="font-size:1.3rem;color:#1a2b23;line-height:1.15">' + friendly(x.date) + '</div>' +
        '<div style="font-size:1rem;color:#1b7a4b;font-weight:600;margin-top:2px">' + fr(x.date) + '</div>' +
        '</div>' +
        '</div>' +
        '<div class="d-flex gap-2" style="width:100%">' + tiles + '</div>' +
        '</div>';
}

function rMS() {
    $('sheet2Icon').className = 'fa-solid fa-clipboard-list';
    $('sheet2Icon').style.color = '#1b7a4b';
    $('sheet2Title').textContent = 'Missed Prayers';
    $('sheet2Sub').textContent = 'From previous days (today excluded)';

    var list = mBD().reverse();
    var b = $('sheet2Body');
    if (!list.length) {
        b.innerHTML = '<div class="text-center text-muted py-5">' +
            '<i class="fa-solid fa-star display-4 text-success opacity-50"></i>' +
            '<p class="mt-3">No missed prayers from previous days.<br>All caught up!</p></div>';
    } else {
        b.innerHTML = '<div class="d-flex flex-column gap-2">' +
            list.map(missCard).join('') + '</div>';
    }
    sheet2BS.show();
}
