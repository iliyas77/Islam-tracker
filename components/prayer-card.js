/* ============================================================
   Nur Prayer — Reusable Prayer Tracker Card Component
   Path: components/prayer-card.js
   Reusable UI component for Current Prayer & Old Tracking.
   ============================================================ */


var PRAYER_CARD_ICONS = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.CARD_ICONS) || window.PRAYER_CARD_ICONS || {};


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
    var currentYear = new Date().getFullYear();
    var yearStr = d.getFullYear() !== currentYear ? (' ' + d.getFullYear()) : '';
    return day + ' ' + months[d.getMonth()] + yearStr;
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
    var isMissed = opts.isMissed;
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
            '      </div>' +
            '      <time class="prayer-time" data-ref="' + prefix + '.row.' + pLower + '.time">' + time + '</time>' +
            '    </div>' +
            '  </div>' +
            '  <button type="button" class="btn-action btn-upcoming" disabled aria-disabled="true" data-ref="' + prefix + '.row.' + pLower + '.action-btn">Upcoming</button>' +
            '</li>';
    } else if (isMissed) {
        return '<li class="prayer-row prayer-row-missed" data-ref="' + prefix + '.row.' + pLower + '">' +
            '  <div class="prayer-meta" data-ref="' + prefix + '.row.' + pLower + '.meta">' +
            '    <div class="icon-avatar icon-missed" data-ref="' + prefix + '.row.' + pLower + '.avatar">' +
            (PRAYER_CARD_ICONS[p] || PRAYER_CARD_ICONS.Dhuhr) +
            '    </div>' +
            '    <div class="prayer-details" data-ref="' + prefix + '.row.' + pLower + '.details">' +
            '      <div class="title-wrap" data-ref="' + prefix + '.row.' + pLower + '.title-wrap">' +
            '        <span class="prayer-name" data-ref="' + prefix + '.row.' + pLower + '.name">' + p + '</span>' +
            '      </div>' +
            '      <time class="prayer-time" data-ref="' + prefix + '.row.' + pLower + '.time">' + time + '</time>' +
            '    </div>' +
            '  </div>' +
            '  <button type="button" class="btn-action btn-action-missed" data-act="' + act + '" data-p="' + p + '"' + dateAttr + ' data-ref="' + prefix + '.row.' + pLower + '.action-btn">Mark Done</button>' +
            '</li>';
    } else {
        var rowClass = isCurrent ? 'prayer-row prayer-row-current' : 'prayer-row';
        var avatarClass = isCurrent ? 'icon-avatar icon-current' : 'icon-avatar';
        var btnClass = isCurrent ? 'btn-action btn-action-primary' : 'btn-action';

        return '<li class="' + rowClass + '" data-ref="' + prefix + '.row.' + pLower + '">' +
            '  <div class="prayer-meta" data-ref="' + prefix + '.row.' + pLower + '.meta">' +
            '    <div class="' + avatarClass + '" data-ref="' + prefix + '.row.' + pLower + '.avatar">' +
            (PRAYER_CARD_ICONS[p] || PRAYER_CARD_ICONS.Dhuhr) +
            '    </div>' +
            '    <div class="prayer-details" data-ref="' + prefix + '.row.' + pLower + '.details">' +
            '      <div class="title-wrap" data-ref="' + prefix + '.row.' + pLower + '.title-wrap">' +
            '        <span class="prayer-name" data-ref="' + prefix + '.row.' + pLower + '.name">' + p + '</span>' +
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
    var highlightMissed = cfg.highlightMissed !== undefined
        ? cfg.highlightMissed
        : true;

    var badgeActAttr = cfg.badgeAct ? ' data-act="' + cfg.badgeAct + '" role="button" class="cursor-pointer"' : '';
    var dateChipActAttr = cfg.dateChipAct ? ' data-act="' + cfg.dateChipAct + '"' : '';
    var actionBtnActAttr = cfg.actionBtnAct ? ' data-act="' + cfg.actionBtnAct + '"' : '';

    var missedRowsHtml = missed.length
        ? missed.map(function (p) {
            var isUp = upcoming.indexOf(p) !== -1;
            var isCur = (p === curP && !isUp);
            var isMsd = highlightMissed && (!isUp && !isCur);
            return renderPrayerTrackerRow({
                prayer: p,
                time: timings[p],
                isCurrent: isCur,
                isDone: false,
                isUpcoming: isUp,
                isMissed: isMsd,
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

    var badgeHtml = cfg.badgeText
        ? ('<span class="badge badge-warning"' + badgeActAttr + ' data-ref="' + prefix + '.card.header.badge">' +
            PRAYER_CARD_ICONS.Warning +
            '  ' + cfg.badgeText +
            '</span>')
        : '';
    var missedTitle = cfg.missedTitle || 'MISSED';

    var rightSideHtml = '';
    if (cfg.rightActionHtml) {
        rightSideHtml = cfg.rightActionHtml;
    } else if (cfg.actionBtnText) {
        rightSideHtml = '<button type="button" class="btn-text"' + actionBtnActAttr + ' data-ref="' + prefix + '.card.header.action-btn">' + cfg.actionBtnText + '</button>';
    }

    return '<div class="prayer-tracker-card mx-auto" data-ref="' + prefix + '.card">' +
        '  <!-- Header: Date & Global Actions -->' +
        '  <header class="tracker-header" data-ref="' + prefix + '.card.header">' +
        '    <button type="button" class="date-chip"' + dateChipActAttr + ' aria-label="Select date" data-ref="' + prefix + '.card.header.date-chip">' +
        PRAYER_CARD_ICONS.Calendar +
        '      <span data-ref="' + prefix + '.card.header.date-text">' + (cfg.dateChipText || '') + '</span>' +
        '    </button>' +
        '    <div class="header-status" data-ref="' + prefix + '.card.header.status">' +
        rightSideHtml +
        '    </div>' +
        '  </header>' +

        '  <!-- Section 1: Missed / Pending Prayers -->' +
        '  <section class="prayer-group" data-ref="' + prefix + '.card.missed-group">' +
        '    <button type="button" class="group-toggle" data-bs-toggle="collapse" data-bs-target="#' + cPrefix + 'MissedList" aria-expanded="true" data-ref="' + prefix + '.card.missed-group.toggle">' +
        '      <span class="toggle-icon" data-ref="' + prefix + '.card.missed-group.icon">▼</span>' +
        '      <span class="section-title" data-ref="' + prefix + '.card.missed-group.title">' + missedTitle + ' (' + missed.length + ')</span>' +
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
