/* ============================================================
   Nur Prayer — Prayer Tracking Activity History Module
   Path: features/prayer-tracking/prayer-history.js
   Maintains a single unified activity log for completed prayers
   across both Current Prayer Tracking and Old Prayer Tracking.
   ============================================================ */

(function (window) {
    'use strict';

    var PRAYER_CONSTANTS = (window.CONSTANTS && window.CONSTANTS.PRAYER) || {};
    var PRAYER_STORAGE_KEYS = PRAYER_CONSTANTS.STORAGE_KEYS || {};
    var HISTORY_STORAGE_KEY = PRAYER_STORAGE_KEYS.HISTORY || window.PHK || 'namazPrayerHistory';

    function getStorageKey() {
        return (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.STORAGE_KEYS && window.CONSTANTS.PRAYER.STORAGE_KEYS.HISTORY) ||
            window.PHK ||
            HISTORY_STORAGE_KEY;
    }

    function isHistoryTabActive() {
        if (typeof window.trackerSubTab !== 'undefined' && window.trackerSubTab === 'history') return true;
        if (typeof trackerSubTab !== 'undefined' && trackerSubTab === 'history') return true;
        var historyBody = typeof window.$ === 'function' ? window.$('historyBody') : document.getElementById('historyBody');
        if (historyBody && !historyBody.classList.contains('d-none')) return true;
        return false;
    }

    function isDoneInOldTracking(prayer, dateStr) {
        if (typeof window.rdOK !== 'function') return true;
        var o = window.rdOK();
        if (!o || o.end < o.start) return false;
        var maxEnd = o.initialEnd || o.end;
        if (dateStr < o.start || dateStr > maxEnd) return false;
        var a = typeof window.rdOC === 'function' ? window.rdOC() : {};
        var r = a[dateStr];
        if (r) {
            return (r[prayer] === false);
        }
        return true;
    }

    /**
     * Retrieve all activity history entries from database.
     * Chronologically sorted: latest activity first.
     * @param {Object} [options]
     * @param {boolean} [options.prune=true] - Prune entries no longer currently completed
     * @returns {Array} List of history entry objects
     */
    function getPrayerHistory(options) {
        options = options || {};
        var shouldPrune = options.prune !== false;
        var raw = null;
        try {
            raw = localStorage.getItem(getStorageKey());
        } catch (_) {
            raw = null;
        }

        var entries = [];
        if (raw) {
            try {
                var parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    entries = parsed;
                }
            } catch (_) {
                entries = [];
            }
        }

        if (shouldPrune && entries.length > 0) {
            var originalLen = entries.length;
            entries = entries.filter(function (entry) {
                if (!entry || !entry.prayer || !entry.type || !entry.date) {
                    return false;
                }
                if (entry.type === 'Current') {
                    if (typeof window.isDonePrayer === 'function') {
                        return window.isDonePrayer(entry.prayer, entry.date);
                    }
                    return true;
                }
                if (entry.type === 'Old') {
                    return isDoneInOldTracking(entry.prayer, entry.date);
                }
                return false;
            });

            if (entries.length !== originalLen) {
                savePrayerHistory(entries);
            }
        }

        entries.sort(function (a, b) {
            return (b.timestamp || 0) - (a.timestamp || 0);
        });

        return entries;
    }

    /**
     * Persist history entries to storage.
     * @param {Array} entries
     */
    function savePrayerHistory(entries) {
        try {
            localStorage.setItem(getStorageKey(), JSON.stringify(entries || []));
        } catch (e) {
            console.error('Failed to save prayer history:', e);
        }
    }

    /**
     * Add a completed prayer entry to the activity log.
     * Replaces any existing entry for this specific prayer/type/date to update timestamp.
     * @param {string} prayerName - e.g. 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'
     * @param {string} trackingType - 'Current' or 'Old'
     * @param {string} prayerDate - 'YYYY-MM-DD'
     * @param {number} [customTimestamp] - Optional override timestamp
     * @returns {Object} The created history entry
     */
    function addPrayerHistoryEntry(prayerName, trackingType, prayerDate, customTimestamp) {
        if (!prayerName || !prayerDate) return null;

        var type = (trackingType === 'Old') ? 'Old' : 'Current';
        var pName = prayerName.charAt(0).toUpperCase() + prayerName.slice(1);
        var ts = typeof customTimestamp === 'number' ? customTimestamp : Date.now();

        var entries = getPrayerHistory({ prune: false });

        // Remove previous entry for exact same prayer, type, and date so re-marking updates timestamp
        entries = entries.filter(function (e) {
            return !(e.prayer === pName && e.type === type && e.date === prayerDate);
        });

        var idGen = typeof window.uid === 'function'
            ? window.uid('hist_')
            : ('hist_' + ts.toString(36) + Math.random().toString(36).slice(2, 6));

        var newEntry = {
            id: idGen,
            prayer: pName,
            type: type,
            date: prayerDate,
            timestamp: ts,
            createdAt: new Date(ts).toISOString()
        };

        entries.unshift(newEntry);
        savePrayerHistory(entries);

        if (isHistoryTabActive()) {
            renderPrayerHistoryTab();
        }

        return newEntry;
    }

    /**
     * Remove an entry from the activity log when a completed prayer is undone.
     * @param {string} prayerName
     * @param {string} trackingType - 'Current' or 'Old'
     * @param {string} prayerDate - 'YYYY-MM-DD'
     */
    function removePrayerHistoryEntry(prayerName, trackingType, prayerDate) {
        if (!prayerName || !prayerDate) return;

        var type = (trackingType === 'Old') ? 'Old' : 'Current';
        var pName = prayerName.charAt(0).toUpperCase() + prayerName.slice(1);

        var entries = getPrayerHistory({ prune: false });
        var beforeLen = entries.length;

        entries = entries.filter(function (e) {
            return !(e.prayer === pName && e.type === type && e.date === prayerDate);
        });

        if (entries.length !== beforeLen) {
            savePrayerHistory(entries);
            if (isHistoryTabActive()) {
                renderPrayerHistoryTab();
            }
        }
    }

    /**
     * Clear all activity history entries.
     */
    function clearPrayerHistory() {
        savePrayerHistory([]);
        if (isHistoryTabActive()) {
            renderPrayerHistoryTab();
        }
    }

    /**
     * Clear activity history entries by tracking type ('Current' or 'Old').
     * @param {string} trackingType
     */
    function clearPrayerHistoryByType(trackingType) {
        var type = (trackingType === 'Old') ? 'Old' : 'Current';
        var entries = getPrayerHistory({ prune: false });
        entries = entries.filter(function (e) {
            return e.type !== type;
        });
        savePrayerHistory(entries);
        if (isHistoryTabActive()) {
            renderPrayerHistoryTab();
        }
    }

    /**
     * Action triggered by the Empty button in the History header.
     * Shows confirmation dialog before deleting all activity log entries.
     */
    function emptyPrayerHistory() {
        var entries = getPrayerHistory({ prune: false });
        if (!entries || entries.length === 0) {
            if (typeof window.showToast === 'function') {
                window.showToast('Activity history is already empty.');
            } else {
                alert('Activity history is already empty.');
            }
            return;
        }

        var confirmed = confirm('Are you sure you want to delete all activity-log entries? This action cannot be undone.');
        if (!confirmed) return;

        clearPrayerHistory();
        if (typeof window.showToast === 'function') {
            window.showToast('Activity history emptied.');
        }
    }

    /**
     * Format timestamp into date and exact time: e.g. "04 Nov 2026, 03:46:12 PM".
     * @param {number|string} ts
     * @returns {string} Formatted timestamp
     */
    function formatHistoryTimestamp(ts) {
        if (!ts) return '';
        var d = new Date(ts);
        if (isNaN(d.getTime())) return '';

        var day = String(d.getDate()).padStart(2, '0');
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var month = months[d.getMonth()];
        var year = d.getFullYear();

        var hours = d.getHours();
        var minutes = String(d.getMinutes()).padStart(2, '0');
        var seconds = String(d.getSeconds()).padStart(2, '0');
        var ampm = hours >= 12 ? 'PM' : 'AM';
        var h12 = hours % 12;
        if (h12 === 0) h12 = 12;

        return day + ' ' + month + ' ' + year + ', ' + String(h12).padStart(2, '0') + ':' + minutes + ':' + seconds + ' ' + ampm;
    }

    /**
     * Relative time string: e.g. "Just now", "5m ago", "2h ago".
     * @param {number|string} ts
     * @returns {string}
     */
    function formatTimeAgo(ts) {
        if (!ts) return '';
        var diffMs = Date.now() - new Date(ts).getTime();
        if (diffMs < 0) diffMs = 0;
        var diffSec = Math.floor(diffMs / 1000);
        if (diffSec < 60) return 'Just now';
        var diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return diffMin + 'm ago';
        var diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return diffHr + 'h ago';
        var diffDays = Math.floor(diffHr / 24);
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return diffDays + 'd ago';
        return Math.floor(diffDays / 7) + 'w ago';
    }

    /**
     * Format prayer date: e.g. "Wed, 04 Nov 2026"
     * @param {string} dateStr YYYY-MM-DD
     * @returns {string}
     */
    function formatPrayerDate(dateStr) {
        if (!dateStr) return '';
        try {
            var d = new Date(dateStr + 'T00:00:00');
            if (isNaN(d.getTime())) return dateStr;
            var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var dayName = days[d.getDay()];
            var dayNum = String(d.getDate()).padStart(2, '0');
            var monthName = months[d.getMonth()];
            var year = d.getFullYear();
            return dayName + ', ' + dayNum + ' ' + monthName + ' ' + year;
        } catch (e) {
            return dateStr;
        }
    }

    /**
     * Render a single history entry card.
     * @param {Object} entry
     * @returns {string} HTML string
     */
    function renderHistoryEntryCard(entry) {
        var renderIconFn = typeof window.renderIcon === 'function' ? window.renderIcon : function (opts) {
            var n = typeof opts === 'object' ? opts.name : opts;
            return '<span class="icon-' + n + '"></span>';
        };

        var isCurrent = entry.type === 'Current';
        var typeBadgeClass = isCurrent
            ? 'badge-history-type-current'
            : 'badge-history-type-old';

        var pLower = (entry.prayer || '').toLowerCase();
        var pIcon = renderIconFn({ name: pLower, size: 22, color: 'text-brand' });
        var formattedDate = formatPrayerDate(entry.date);
        var exactTime = formatHistoryTimestamp(entry.timestamp);
        var ago = formatTimeAgo(entry.timestamp);

        return '<div class="card rounded-4 p-3 bg-white border border-borderGrey mb-3 flex flex-col gap-2.5" data-ref="page.history.card.' + (entry.id || '') + '">' +
            '  <!-- Row 1: Prayer Icon + Name + Badge (Left) and Completed (Right) -->' +
            '  <div class="flex items-center justify-between">' +
            '    <div class="flex items-center gap-2.5 min-w-0">' +
            '      <div class="rounded-circle bg-brand-light text-brand flex items-center justify-center shrink-0" style="width: 44px; height: 44px;" data-ref="page.history.item.avatar.' + (entry.id || '') + '">' +
            '        ' + pIcon +
            '      </div>' +
            '      <div class="flex items-center gap-2 min-w-0">' +
            '        <h6 class="fw-bold text-gr1 fs-5 mb-0 lh-1" data-ref="page.history.item.prayer.' + (entry.id || '') + '">' + entry.prayer + '</h6>' +
            '        <span class="badge-history-type ' + typeBadgeClass + '" data-ref="page.history.item.type.' + (entry.id || '') + '">' + entry.type + '</span>' +
            '      </div>' +
            '    </div>' +
            '    <span class="flex items-center gap-1.5 text-brand fs-sm fw-bold shrink-0">' +
            '      ' + renderIconFn({ name: 'check', size: 14, className: 'shrink-0' }) +
            '      <span>Completed</span>' +
            '    </span>' +
            '  </div>' +
            '  <!-- Row 2: Prayer Date -->' +
            '  <div class="text-muted fs-xs" data-ref="page.history.item.date.' + (entry.id || '') + '">' +
            '    Prayer Date: <strong class="text-gr1 fw-bold">' + formattedDate + '</strong>' +
            '  </div>' +
            '  <!-- Row 3: Completed exact time (Left) & Relative time (Right) -->' +
            '  <div class="flex items-center justify-between text-muted fs-xs">' +
            '    <div class="flex items-center gap-1.5" data-ref="page.history.item.time.' + (entry.id || '') + '">' +
            '      ' + renderIconFn({ name: 'clock', size: 12, className: 'shrink-0' }) +
            '      <span>Completed: <span class="text-gr1">' + exactTime + '</span></span>' +
            '    </div>' +
            '    <span class="text-muted">' + ago + '</span>' +
            '  </div>' +
            '</div>';
    }

    /**
     * Render the History tab content into #historyBody.
     */
    function renderPrayerHistoryTab() {
        var body = typeof window.$ === 'function' ? window.$('historyBody') : document.getElementById('historyBody');
        if (!body) return;

        var entries = getPrayerHistory({ prune: true });
        var totalCount = entries.length;

        // Update header subtitle if currently on History tab
        var oldSub = typeof window.$ === 'function' ? window.$('oldSub') : document.getElementById('oldSub');
        if (oldSub && typeof window.trackerSubTab !== 'undefined' && window.trackerSubTab === 'history') {
            oldSub.classList.remove('d-none');
            oldSub.textContent = 'Activity Log · ' + totalCount + (totalCount === 1 ? ' entry' : ' entries');
        }

        // Update Empty header button state
        var emptyBtn = typeof window.$ === 'function' ? window.$('historyEmptyBtn') : document.getElementById('historyEmptyBtn');
        if (emptyBtn) {
            if (totalCount === 0) {
                emptyBtn.classList.add('opacity-50');
            } else {
                emptyBtn.classList.remove('opacity-50');
            }
        }

        // Empty state
        if (totalCount === 0) {
            var renderIconFn = typeof window.renderIcon === 'function' ? window.renderIcon : function (opts) {
                var n = typeof opts === 'object' ? opts.name : opts;
                return '<span class="icon-' + n + '"></span>';
            };

            body.innerHTML =
                '<div class="text-center text-muted py-5 px-3 bg-white border border-borderGrey rounded-4" data-ref="page.history.empty-state">' +
                '  <div class="mb-3">' +
                '    ' + renderIconFn({ name: 'list-check', size: 'display-4', color: 'text-brand', className: 'opacity-50' }) +
                '  </div>' +
                '  <h5 class="fw-bold text-gr1 mb-1">No Activity Yet</h5>' +
                '  <p class="text-muted small mb-0">Whenever a prayer is marked as completed in Current or Old Tracking, its history entry will appear here.</p>' +
                '</div>';
            return;
        }

        // Summary Card + Entries List
        var renderIconFn2 = typeof window.renderIcon === 'function' ? window.renderIcon : function (opts) {
            var n = typeof opts === 'object' ? opts.name : opts;
            return '<span class="icon-' + n + '"></span>';
        };

        var currentCount = entries.filter(function (e) { return e.type === 'Current'; }).length;
        var oldCount = entries.filter(function (e) { return e.type === 'Old'; }).length;

        var summaryCardHtml =
            '<div class="card rounded-4 p-3 bg-white border border-borderGrey mb-3" data-ref="page.history.summary-card">' +
            '  <div class="flex items-center justify-between">' +
            '    <div class="flex items-center gap-2.5 min-w-0">' +
            '      <div class="rounded-3 bg-brand-light text-brand flex items-center justify-center shrink-0" style="width: 40px; height: 40px;">' +
            '        ' + renderIconFn2({ name: 'list-check', size: 20, color: 'text-brand' }) +
            '      </div>' +
            '      <div class="min-w-0">' +
            '        <h6 class="fw-bold text-gr1 mb-0 fs-base lh-sm">Activity Log</h6>' +
            '        <div class="text-muted fs-xs mt-0.5">' + totalCount + ' completed ' + (totalCount === 1 ? 'prayer' : 'prayers') + ' (' + currentCount + ' Current, ' + oldCount + ' Old)</div>' +
            '      </div>' +
            '    </div>' +
            '    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-borderGrey bg-surface fs-xs text-muted fw-medium shrink-0">' +
            '      ' + renderIconFn2({ name: 'clock', size: 13, className: 'shrink-0' }) +
            '      <span>Latest first</span>' +
            '    </div>' +
            '  </div>' +
            '</div>';

        var entriesHtml = entries.map(renderHistoryEntryCard).join('');

        body.innerHTML = summaryCardHtml + '<div class="flex flex-col gap-1" data-ref="page.history.list">' + entriesHtml + '</div>';
    }

    function init() {
        // If tracker is already open on history tab on boot, render it
        if (typeof window.trackerSubTab !== 'undefined' && window.trackerSubTab === 'history') {
            renderPrayerHistoryTab();
        }
    }

    var PrayerHistoryApp = {
        init: init,
        getPrayerHistory: getPrayerHistory,
        savePrayerHistory: savePrayerHistory,
        addPrayerHistoryEntry: addPrayerHistoryEntry,
        removePrayerHistoryEntry: removePrayerHistoryEntry,
        clearPrayerHistory: clearPrayerHistory,
        clearPrayerHistoryByType: clearPrayerHistoryByType,
        emptyPrayerHistory: emptyPrayerHistory,
        renderPrayerHistoryTab: renderPrayerHistoryTab,
        formatHistoryTimestamp: formatHistoryTimestamp,
        formatTimeAgo: formatTimeAgo
    };

    window.PrayerHistoryApp = PrayerHistoryApp;
    window.getPrayerHistory = getPrayerHistory;
    window.addPrayerHistoryEntry = addPrayerHistoryEntry;
    window.removePrayerHistoryEntry = removePrayerHistoryEntry;
    window.clearPrayerHistory = clearPrayerHistory;
    window.clearPrayerHistoryByType = clearPrayerHistoryByType;
    window.emptyPrayerHistory = emptyPrayerHistory;
    window.renderPrayerHistoryTab = renderPrayerHistoryTab;

})(typeof window !== 'undefined' ? window : global);
