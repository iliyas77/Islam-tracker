/* ============================================================
   Nur Prayer — Reusable Prayer Tracker Card Component
   Path: components/prayer-card.js
   Reusable UI component for Current Prayer & Old Tracking.
   ============================================================ */


var PRAYER_CARD_ICONS = {
    Fajr: '<svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
        '<path d="M12 2v6M4.93 10.93l1.41 1.41M19.07 10.93l-1.41 1.41M2 18h20M4 22h16M8 18a4 4 0 018 0"/>' +
        '<circle cx="12" cy="11" r="3"/>' +
        '</svg>',
    Dhuhr: '<svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
        '<circle cx="12" cy="12" r="4" />' +
        '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />' +
        '</svg>',
    Asr: '<svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
        '<path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z" />' +
        '</svg>',
    Maghrib: '<svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
        '<path d="M12 10V2M4.93 10.93l1.41-1.41M19.07 10.93l-1.41-1.41M2 18h20M4 22h16M8 18a4 4 0 018 0" />' +
        '</svg>',
    Isha: '<svg class="icon-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
        '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />' +
        '</svg>',
    DoneCheck: '<svg class="icon-md" viewBox="0 0 20 20" fill="currentColor">' +
        '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />' +
        '</svg>',
    DoneCheckSm: '<svg class="icon-sm" viewBox="0 0 20 20" fill="currentColor">' +
        '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />' +
        '</svg>',
    Warning: '<svg class="icon-sm" viewBox="0 0 20 20" fill="currentColor">' +
        '<path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />' +
        '</svg>',
    Calendar: '<svg class="icon-sm" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75">' +
        '<rect x="3" y="4" width="14" height="13" rx="2" />' +
        '<path d="M16 2v4M4 2v4M3 8h14" />' +
        '</svg>'
};

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

function isPrayerUpcoming(prayerName, dateStr) {
    var today = td();
    if (dateStr && dateStr !== today) return false;
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var pTime = T[prayerName];
    if (!pTime) return false;
    var pMin = parseTimeToMin(pTime);
    if (pMin === -1) return false;
    return nowMin < pMin;
}

function isDonePrayer(p, dateStr, r) {
    if (!r) return false;
    if (r[p] === 'done') return true;
    var today = td();
    if (dateStr && dateStr < today) {
        return r[p] !== true && r[p] !== 'missed' && r[p] !== undefined;
    }
    return false;
}

function formatChipDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    var day = d.getDate();
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return day + ' ' + months[d.getMonth()];
}

/**
 * Render a single prayer row.
 * @param {Object} opts
 * @param {string} opts.prayer - Prayer name ('Fajr', 'Dhuhr', etc.)
 * @param {string} opts.time - Formatted time ('11:54 AM')
 * @param {boolean} opts.isCurrent - Whether prayer is currently in progress
 * @param {boolean} opts.isDone - Whether prayer is completed
 * @param {boolean} opts.isUpcoming - Whether prayer time is in future today
 * @param {string} opts.actionAct - data-act action ('toggle-cur' or 'toggle-old')
 * @param {string} [opts.date] - Optional date string
 * @param {string} opts.pagePrefix - e.g. 'page.current' or 'page.old'
 */
function renderPrayerTrackerRow(opts) {
    var p = opts.prayer;
    var pLower = p.toLowerCase();
    var time = opts.time || '--:--';
    var isCurrent = opts.isCurrent;
    var isDone = opts.isDone;
    var isUpcoming = opts.isUpcoming;
    var act = opts.actionAct || 'toggle-cur';
    var dateAttr = opts.date ? ' data-d="' + opts.date + '"' : '';
    var prefix = opts.pagePrefix || 'page.current';

    if (isDone) {
        return '<li class="prayer-row prayer-row-done" data-ref="' + prefix + '.row.' + pLower + '">' +
            '  <div class="prayer-meta" data-ref="' + prefix + '.row.' + pLower + '.meta">' +
            '    <div class="icon-avatar icon-done" data-ref="' + prefix + '.row.' + pLower + '.avatar">' +
            PRAYER_CARD_ICONS.DoneCheck +
            '    </div>' +
            '    <div class="prayer-details" data-ref="' + prefix + '.row.' + pLower + '.details">' +
            '      <div class="title-wrap" data-ref="' + prefix + '.row.' + pLower + '.title-wrap">' +
            '        <span class="prayer-name" data-ref="' + prefix + '.row.' + pLower + '.name">' + p + '</span>' +
            '      </div>' +
            '      <time class="prayer-time" data-ref="' + prefix + '.row.' + pLower + '.time">' + time + '</time>' +
            '    </div>' +
            '  </div>' +
            '  <button type="button" class="btn-action btn-completed" data-act="' + act + '" data-p="' + p + '"' + dateAttr + ' data-ref="' + prefix + '.row.' + pLower + '.action-btn" title="Tap to mark missed">' +
            PRAYER_CARD_ICONS.DoneCheckSm +
            'Done' +
            '  </button>' +
            '</li>';
    } else if (isUpcoming) {
        return '<li class="prayer-row prayer-row-upcoming" data-ref="' + prefix + '.row.' + pLower + '">' +
            '  <div class="prayer-meta" data-ref="' + prefix + '.row.' + pLower + '.meta">' +
            '    <div class="icon-avatar" data-ref="' + prefix + '.row.' + pLower + '.avatar">' +
            (PRAYER_CARD_ICONS[p] || PRAYER_CARD_ICONS.Dhuhr) +
            '    </div>' +
            '    <div class="prayer-details" data-ref="' + prefix + '.row.' + pLower + '.details">' +
            '      <div class="title-wrap" data-ref="' + prefix + '.row.' + pLower + '.title-wrap">' +
            '        <span class="prayer-name" data-ref="' + prefix + '.row.' + pLower + '.name">' + p + '</span>' +
            '        <span class="status-pill status-pill-upcoming" data-ref="' + prefix + '.row.' + pLower + '.status-pill">Upcoming</span>' +
            '      </div>' +
            '      <time class="prayer-time" data-ref="' + prefix + '.row.' + pLower + '.time">' + time + '</time>' +
            '    </div>' +
            '  </div>' +
            '  <button type="button" class="btn-action btn-upcoming" disabled aria-disabled="true" data-ref="' + prefix + '.row.' + pLower + '.action-btn">Upcoming</button>' +
            '</li>';
    } else {
        var rowClass = isCurrent ? 'prayer-row prayer-row-current' : 'prayer-row';
        var avatarClass = isCurrent ? 'icon-avatar icon-current' : 'icon-avatar';
        var btnClass = isCurrent ? 'btn-action btn-action-primary' : 'btn-action';
        var currentPill = isCurrent
            ? '<span class="status-pill" data-ref="' + prefix + '.row.' + pLower + '.status-pill">Current</span>'
            : '';

        return '<li class="' + rowClass + '" data-ref="' + prefix + '.row.' + pLower + '">' +
            '  <div class="prayer-meta" data-ref="' + prefix + '.row.' + pLower + '.meta">' +
            '    <div class="' + avatarClass + '" data-ref="' + prefix + '.row.' + pLower + '.avatar">' +
            (PRAYER_CARD_ICONS[p] || PRAYER_CARD_ICONS.Dhuhr) +
            '    </div>' +
            '    <div class="prayer-details" data-ref="' + prefix + '.row.' + pLower + '.details">' +
            '      <div class="title-wrap" data-ref="' + prefix + '.row.' + pLower + '.title-wrap">' +
            '        <span class="prayer-name" data-ref="' + prefix + '.row.' + pLower + '.name">' + p + '</span>' +
            currentPill +
            '      </div>' +
            '      <time class="prayer-time" data-ref="' + prefix + '.row.' + pLower + '.time">' + time + '</time>' +
            '    </div>' +
            '  </div>' +
            '  <button type="button" class="' + btnClass + '" data-act="' + act + '" data-p="' + p + '"' + dateAttr + ' data-ref="' + prefix + '.row.' + pLower + '.action-btn">Mark Done</button>' +
            '</li>';
    }
}

/**
 * Render the complete Prayer Tracker Card.
 * @param {Object} cfg
 * @param {string} cfg.pagePrefix - 'page.current' or 'page.old'
 * @param {string} cfg.collapsePrefix - 'cur' or 'old'
 * @param {string} cfg.badgeText - e.g. 'Missed' or 'Missed (4)'
 * @param {string} [cfg.badgeAct] - e.g. 'missed-open'
 * @param {string} cfg.actionBtnText - e.g. 'Select All' or 'Today'
 * @param {string} cfg.actionBtnAct - e.g. 'select-all' or 'jump-today'
 * @param {string} cfg.dateChipText - e.g. '17 October'
 * @param {string} cfg.dateChipAct - e.g. 'open-cal' or 'old-info'
 * @param {Array<string>} cfg.missedPrayers - Array of prayer names in missed section
 * @param {Array<string>} [cfg.upcomingPrayers] - Array of prayer names that are upcoming
 * @param {Array<string>} cfg.donePrayers - Array of prayer names in done section
 * @param {Object} cfg.timings - e.g. T object
 * @param {string} [cfg.currentPrayerName] - e.g. 'Asr' if today
 * @param {string} cfg.toggleAct - 'toggle-cur' or 'toggle-old'
 * @param {string} [cfg.date] - date string
 */
function renderPrayerTrackerCard(cfg) {
    var prefix = cfg.pagePrefix || 'page.current';
    var cPrefix = cfg.collapsePrefix || 'cur';
    var missed = cfg.missedPrayers || [];
    var upcoming = cfg.upcomingPrayers || [];
    var done = cfg.donePrayers || [];
    var curP = cfg.currentPrayerName || null;
    var timings = cfg.timings || {};
    var act = cfg.toggleAct || 'toggle-cur';
    var date = cfg.date || '';

    var badgeActAttr = cfg.badgeAct ? ' data-act="' + cfg.badgeAct + '" role="button" style="cursor:pointer"' : '';
    var dateChipActAttr = cfg.dateChipAct ? ' data-act="' + cfg.dateChipAct + '"' : '';
    var actionBtnActAttr = cfg.actionBtnAct ? ' data-act="' + cfg.actionBtnAct + '"' : '';

    var missedRowsHtml = missed.length
        ? missed.map(function (p) {
            var isUp = upcoming.indexOf(p) !== -1;
            return renderPrayerTrackerRow({
                prayer: p,
                time: timings[p],
                isCurrent: (p === curP && !isUp),
                isDone: false,
                isUpcoming: isUp,
                actionAct: act,
                date: date,
                pagePrefix: prefix + '.missed'
            });
        }).join('')
        : '<li class="p-3 text-center text-gr-muted small bg-white rounded-3 border" data-ref="' + prefix + '.missed.empty">No missed or pending prayers. All caught up!</li>';

    var doneRowsHtml = done.length
        ? done.map(function (p) {
            return renderPrayerTrackerRow({
                prayer: p,
                time: timings[p],
                isCurrent: false,
                isDone: true,
                isUpcoming: false,
                actionAct: act,
                date: date,
                pagePrefix: prefix + '.done'
            });
        }).join('')
        : '<li class="p-3 text-center text-gr-muted small bg-white rounded-3 border" data-ref="' + prefix + '.done.empty">No completed prayers yet.</li>';

    return '<div class="prayer-tracker-card mx-auto" data-ref="' + prefix + '.card">' +
        '  <!-- Header: Date & Global Actions -->' +
        '  <header class="tracker-header" data-ref="' + prefix + '.card.header">' +
        '    <div class="header-status" data-ref="' + prefix + '.card.header.status">' +
        '      <span class="badge badge-warning"' + badgeActAttr + ' data-ref="' + prefix + '.card.header.badge">' +
        PRAYER_CARD_ICONS.Warning +
        '        ' + (cfg.badgeText || 'Missed') +
        '      </span>' +
        '      <button type="button" class="btn-text"' + actionBtnActAttr + ' data-ref="' + prefix + '.card.header.action-btn">' + (cfg.actionBtnText || 'Select All') + '</button>' +
        '    </div>' +
        '    <button type="button" class="date-chip"' + dateChipActAttr + ' aria-label="Select date" data-ref="' + prefix + '.card.header.date-chip">' +
        PRAYER_CARD_ICONS.Calendar +
        '      <span data-ref="' + prefix + '.card.header.date-text">' + (cfg.dateChipText || '') + '</span>' +
        '    </button>' +
        '  </header>' +

        '  <!-- Section 1: Missed / Pending Prayers -->' +
        '  <section class="prayer-group" data-ref="' + prefix + '.card.missed-group">' +
        '    <button type="button" class="group-toggle" data-bs-toggle="collapse" data-bs-target="#' + cPrefix + 'MissedList" aria-expanded="true" data-ref="' + prefix + '.card.missed-group.toggle">' +
        '      <span class="toggle-icon" data-ref="' + prefix + '.card.missed-group.icon">▼</span>' +
        '      <span class="section-title" data-ref="' + prefix + '.card.missed-group.title">MISSED (' + missed.length + ')</span>' +
        '    </button>' +
        '    <div class="collapse show" id="' + cPrefix + 'MissedList" data-ref="' + prefix + '.card.missed-group.collapse">' +
        '      <ul class="prayer-list" data-ref="' + prefix + '.card.missed-group.list">' +
        missedRowsHtml +
        '      </ul>' +
        '    </div>' +
        '  </section>' +

        '  <!-- Section 2: Completed Prayers -->' +
        '  <section class="prayer-group" data-ref="' + prefix + '.card.done-group">' +
        '    <button type="button" class="group-toggle" data-bs-toggle="collapse" data-bs-target="#' + cPrefix + 'DoneList" aria-expanded="true" data-ref="' + prefix + '.card.done-group.toggle">' +
        '      <span class="toggle-icon" data-ref="' + prefix + '.card.done-group.icon">▼</span>' +
        '      <span class="section-title" data-ref="' + prefix + '.card.done-group.title">DONE (' + done.length + ')</span>' +
        '    </button>' +
        '    <div class="collapse show" id="' + cPrefix + 'DoneList" data-ref="' + prefix + '.card.done-group.collapse">' +
        '      <ul class="prayer-list" data-ref="' + prefix + '.card.done-group.list">' +
        doneRowsHtml +
        '      </ul>' +
        '    </div>' +
        '  </section>' +
        '</div>';
}
