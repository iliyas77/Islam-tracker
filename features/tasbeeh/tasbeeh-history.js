/* ============================================================
   Nur Prayer — Digital Tasbeeh: History & Settings Module
   Path: features/tasbeeh/tasbeeh-history.js
   Handles:
     - History bottom tab rendering inside Digital Tasbeeh
     - Period settings (start date, end date, presets)
     - Sequential monthly clearance history & progress overview
     - Reopening completed months and resetting history
     - Modal compatibility bridges
   ============================================================ */
'use strict';

window.TasbeehHistoryApp = (function () {
    var PERIOD_KEY = (window.CONSTANTS && window.CONSTANTS.TASBEEH && window.CONSTANTS.TASBEEH.STORAGE_KEYS && window.CONSTANTS.TASBEEH.STORAGE_KEYS.PERIOD) || 'app_tasbeeh_period';
    var PERIOD_PRESETS = (window.CONSTANTS && window.CONSTANTS.TASBEEH && window.CONSTANTS.TASBEEH.PERIOD_PRESETS) || {
        THIS_YEAR: 'this-year',
        LAST_6_MONTHS: '6-months',
        LAST_1_YEAR: '1-year'
    };

    function getEl(id) {
        return document.getElementById(id);
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function showToast(msg, duration) {
        if (window.TasbeehApp && typeof window.TasbeehApp.showToast === 'function') {
            window.TasbeehApp.showToast(msg, duration);
        } else if (typeof window.showToast === 'function') {
            window.showToast(msg, duration);
        }
    }

    /* ---------- Period Storage Layer (Delegated to TasbeehOldApp) ---------- */
    function loadPeriod() {
        if (window.TasbeehOldApp && typeof window.TasbeehOldApp.loadPeriod === 'function') {
            return window.TasbeehOldApp.loadPeriod();
        }
        var raw = localStorage.getItem(PERIOD_KEY);
        var now = new Date();
        var curMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
        var defaultStart = now.getFullYear() + '-01';
        var defaultEnd = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');

        if (!raw) {
            return { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
        }
        try {
            var p = JSON.parse(raw);
            if (!p || !p.startDate) {
                return { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
            }
            var s = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(p.startDate) : String(p.startDate).slice(0, 7)) || defaultStart;
            var e = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(p.endDate) : String(p.endDate).slice(0, 7)) || defaultEnd;
            var initE = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(p.initialEnd) : String(p.initialEnd || '').slice(0, 7)) || e;
            return { startDate: s, endDate: e, initialEnd: initE, updatedAt: p.updatedAt || Date.now() };
        } catch (_) {
            return { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
        }
    }

    function savePeriod(start, end, initialEnd) {
        if (window.TasbeehOldApp && typeof window.TasbeehOldApp.savePeriod === 'function') {
            return window.TasbeehOldApp.savePeriod(start, end, initialEnd);
        }
        var s = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(start) : String(start).slice(0, 7));
        var e = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(end) : String(end).slice(0, 7));
        var initE = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(initialEnd) : String(initialEnd || '').slice(0, 7)) || e;
        var p = { startDate: s, endDate: e, initialEnd: initE, updatedAt: Date.now() };
        try { localStorage.setItem(PERIOD_KEY, JSON.stringify(p)); } catch (_) {}
        return p;
    }

    /* ---------- Render History Tab ---------- */
    function renderHistoryTab() {
        var body = getEl('tbHistoryBody');
        if (!body) return;

        var period = loadPeriod();
        var maxEnd = period.initialEnd || period.endDate;
        var allOldMonths = typeof getPreviousMonthsList === 'function'
            ? getPreviousMonthsList(period.startDate, maxEnd)
            : [];

        var curOldMonth = (window.TasbeehOldApp && typeof window.TasbeehOldApp.getCurrentOldMonth === 'function')
            ? window.TasbeehOldApp.getCurrentOldMonth()
            : (period.endDate >= period.startDate ? period.endDate : null);

        var totalMonthsCount = allOldMonths.length;
        var completedCount = 0;
        allOldMonths.forEach(function (m) {
            if (m > period.endDate || period.endDate < period.startDate) {
                completedCount++;
            }
        });
        var pendingCount = Math.max(0, totalMonthsCount - completedCount - (curOldMonth ? 1 : 0));
        var percent = totalMonthsCount > 0 ? Math.round((completedCount / totalMonthsCount) * 100) : 0;

        // The month eligible to be reopened is the one directly after period.endDate
        var reopenTargetMonth = null;
        if (period.endDate < maxEnd) {
            reopenTargetMonth = typeof getNextMonthKey === 'function' ? getNextMonthKey(period.endDate) : null;
        }

        // Render Months List items
        var monthsListHtml = '';
        if (allOldMonths.length === 0) {
            monthsListHtml =
                '<div class="text-center py-4 text-muted small">' +
                '  <i class="fa-solid fa-calendar-xmark fs-2 opacity-50 mb-2 d-block"></i>' +
                '  No past months found in this period range. Check your Start and End dates.' +
                '</div>';
        } else {
            monthsListHtml = allOldMonths.map(function (mKey, idx) {
                var isCompleted = (mKey > period.endDate) || (period.endDate < period.startDate);
                var isActive = (mKey === curOldMonth);
                var monthLabel = typeof formatMonthLabel === 'function' ? formatMonthLabel(mKey) : mKey;

                var badgeClass = isCompleted ? 'bg-brand-light text-brand border border-brand-subtle'
                    : (isActive ? 'bg-brand text-white border-0'
                        : 'bg-surface text-secondary border');

                var badgeIcon = isCompleted ? '<i class="fa-solid fa-circle-check me-1"></i>'
                    : (isActive ? '<i class="fa-solid fa-play me-1"></i>'
                        : '<i class="fa-regular fa-clock me-1"></i>');

                var badgeText = isCompleted ? 'Completed'
                    : (isActive ? 'In Progress' : 'Pending');

                var canReopenThis = (mKey === reopenTargetMonth);
                var reopenBtn = canReopenThis
                    ? '<button type="button" class="btn btn-sm btn-outline-warning rounded-pill px-2 py-0 ms-auto" style="font-size: 11px; font-weight: 600;" data-act="tb-old-reopen" title="Reopen this month to recount">' +
                      '  <i class="fa-solid fa-arrow-rotate-left me-1"></i> Reopen' +
                      '</button>'
                    : '';

                return (
                    '<div class="flex items-center justify-between p-2 rounded-3 bg-white border shadow-xs mb-2" data-month="' + mKey + '">' +
                    '  <div class="flex items-center gap-2 min-w-0">' +
                    '    <span class="text-muted fw-bold small" style="width: 24px; font-size: 11px;">#' + (totalMonthsCount - idx) + '</span>' +
                    '    <span class="fw-bold text-gr1 small text-truncate" style="font-size: 13.5px;">' + escHtml(monthLabel) + '</span>' +
                    '  </div>' +
                    '  <div class="flex items-center gap-2 shrink-0">' +
                    '    <span class="badge rounded-pill ' + badgeClass + ' inline-flex items-center" style="font-size: 10.5px; font-weight: 600; padding: 4px 8px;">' +
                    badgeIcon + badgeText +
                    '    </span>' +
                    reopenBtn +
                    '  </div>' +
                    '</div>'
                );
            }).join('');
        }

        var startInputVal = period.startDate ? (period.startDate.length === 7 ? period.startDate + '-01' : period.startDate) : '';
        var endInputVal = maxEnd ? (maxEnd.length === 7 ? maxEnd + '-01' : maxEnd) : '';

        body.innerHTML =
            '<div class="flex flex-col gap-3 pt-1 pb-4" data-ref="page.tasbeeh.history.content">' +
            '  <!-- Header Summary Banner -->' +
            '  <div class="card p-3 rounded-4 bg-white border shadow-sm">' +
            '    <div class="flex items-center justify-between mb-2">' +
            '      <div>' +
            '        <h6 class="fw-bold text-gr1 mb-0" style="font-size: 1.05rem;">Tracking Period & History</h6>' +
            '        <div class="text-muted small">Configure timeline and view past monthly clearance</div>' +
            '      </div>' +
            '      <span class="badge bg-brand-light text-brand rounded-pill px-3 py-1 fw-bold" style="font-size: 11px;">' +
            '        ' + percent + '% Cleared' +
            '      </span>' +
            '    </div>' +
            '' +
            '    <!-- Progress Bar -->' +
            '    <div class="progress mb-3" style="height: 6px;">' +
            '      <div class="progress-bar bg-brand rounded-pill" role="progressbar" style="width: ' + percent + '%;" aria-valuenow="' + percent + '" aria-valuemin="0" aria-valuemax="100"></div>' +
            '    </div>' +
            '' +
            '    <!-- Stats Tiles -->' +
            '    <div class="row g-2 text-center">' +
            '      <div class="col-4">' +
            '        <div class="p-2 rounded-3 bg-surface">' +
            '          <div class="text-muted small" style="font-size: 11px;">Total Months</div>' +
            '          <div class="fw-bold text-gr1" style="font-size: 1.1rem;">' + totalMonthsCount + '</div>' +
            '        </div>' +
            '      </div>' +
            '      <div class="col-4">' +
            '        <div class="p-2 rounded-3 bg-brand-light text-brand">' +
            '          <div class="small" style="font-size: 11px; font-weight: 600;">Cleared</div>' +
            '          <div class="fw-bold" style="font-size: 1.1rem;">' + completedCount + '</div>' +
            '        </div>' +
            '      </div>' +
            '      <div class="col-4">' +
            '        <div class="p-2 rounded-3 bg-surface">' +
            '          <div class="text-muted small" style="font-size: 11px;">Pending</div>' +
            '          <div class="fw-bold text-muted" style="font-size: 1.1rem;">' + pendingCount + '</div>' +
            '        </div>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '' +
            '  <!-- Period Settings Card -->' +
            '  <div class="card p-3 rounded-4 bg-white border shadow-sm">' +
            '    <div class="flex items-center gap-2 mb-3">' +
            '      <div class="modal-icon-badge flex items-center justify-center shrink-0" style="width: 36px; height: 36px; border-radius: 10px;">' +
            '        <i class="fa-solid fa-gear fs-6 text-brand"></i>' +
            '      </div>' +
            '      <div>' +
            '        <h6 class="fw-bold text-gr1 mb-0" style="font-size: 0.95rem;">Period Settings</h6>' +
            '        <div class="text-muted small" style="font-size: 11.5px;">Configure range for Old Tasbeeh tracking</div>' +
            '      </div>' +
            '    </div>' +
            '' +
            '    <!-- Start Date Input -->' +
            '    <div class="mb-2">' +
            '      <label class="form-label small fw-bold text-muted mb-1" for="tbHistPeriodStart">' +
            '        <i class="fa-regular fa-calendar text-brand me-1"></i>Start Date' +
            '      </label>' +
            '      <div class="field-group flex items-center" style="border-radius: 8px;">' +
            '        <span class="field-icon flex items-center justify-center shrink-0" style="width: 42px; height: 42px;"><i class="fa-regular fa-calendar-days text-brand" style="font-size: 15px;"></i></span>' +
            '        <input type="date" class="form-control border-0 ps-2" style="height: 42px; font-size: 14px;" id="tbHistPeriodStart" value="' + startInputVal + '">' +
            '      </div>' +
            '    </div>' +
            '' +
            '    <!-- End Date Input -->' +
            '    <div class="mb-3">' +
            '      <label class="form-label small fw-bold text-muted mb-1" for="tbHistPeriodEnd">' +
            '        <i class="fa-regular fa-calendar-check text-brand me-1"></i>End Date' +
            '      </label>' +
            '      <div class="field-group flex items-center" style="border-radius: 8px;">' +
            '        <span class="field-icon flex items-center justify-center shrink-0" style="width: 42px; height: 42px;"><i class="fa-solid fa-calendar-check text-brand" style="font-size: 15px;"></i></span>' +
            '        <input type="date" class="form-control border-0 ps-2" style="height: 42px; font-size: 14px;" id="tbHistPeriodEnd" value="' + endInputVal + '">' +
            '      </div>' +
            '    </div>' +
            '' +
            '    <!-- Presets -->' +
            '    <div class="mb-3">' +
            '      <label class="form-label small fw-bold text-muted text-uppercase mb-1" style="font-size: 10.5px;">Quick Presets</label>' +
            '      <div class="flex gap-2 flex-wrap">' +
            '        <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1" style="font-size: 12px;" data-act="tb-hist-preset" data-preset="this-year">This Year</button>' +
            '        <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1" style="font-size: 12px;" data-act="tb-hist-preset" data-preset="6-months">Last 6 Months</button>' +
            '        <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1" style="font-size: 12px;" data-act="tb-hist-preset" data-preset="1-year">Last 1 Year</button>' +
            '      </div>' +
            '    </div>' +
            '' +
            '    <!-- Action Buttons -->' +
            '    <div class="flex gap-2 pt-1">' +
            '      <button type="button" class="btn btn-sm btn-brand grow rounded-3 py-2 fw-bold" style="font-size: 13.5px;" data-act="tb-hist-save">' +
            '        <i class="fa-solid fa-check me-1"></i> Save Period Settings' +
            '      </button>' +
            '      <button type="button" class="btn btn-sm btn-outline-secondary rounded-3 px-3 py-2" style="font-size: 13.5px;" data-act="tb-hist-reset" title="Reset Period Settings">' +
            '        <i class="fa-solid fa-rotate-left"></i>' +
            '      </button>' +
            '    </div>' +
            '  </div>' +
            '' +
            '  <!-- Monthly Clearance Breakdown -->' +
            '  <div class="card p-3 rounded-4 bg-white border shadow-sm">' +
            '    <div class="flex items-center justify-between mb-2">' +
            '      <h6 class="fw-bold text-gr1 mb-0" style="font-size: 0.95rem;">Monthly Timeline Breakdown</h6>' +
            (completedCount > 0
                ? '<button type="button" class="btn btn-link text-danger text-decoration-none p-0 small fw-bold" style="font-size: 11px;" data-act="tb-reset-all-completed">' +
                  '  <i class="fa-solid fa-rotate-left me-1"></i> Reset Cleared' +
                  '</button>'
                : '') +
            '    </div>' +
            '    <div class="text-muted small mb-3" style="font-size: 11.5px;">Sequential monthly clearance advances backward month-by-month as dhikrs are completed.</div>' +
            '    <div class="tb-history-list">' +
            monthsListHtml +
            '    </div>' +
            '  </div>' +
            '</div>';
    }

    /* ---------- Setting Handlers ---------- */
    function applyPreset(presetType) {
        var now = new Date();
        var curMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
        var prevMonth = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');
        var startInp = getEl('tbHistPeriodStart');
        var endInp = getEl('tbHistPeriodEnd');
        if (!startInp || !endInp) return;

        var startStr = '';
        var endStr = prevMonth + '-01';

        if (presetType === PERIOD_PRESETS.THIS_YEAR) {
            startStr = now.getFullYear() + '-01-01';
        } else if (presetType === PERIOD_PRESETS.LAST_6_MONTHS) {
            var d6 = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            startStr = d6.getFullYear() + '-' + pad2(d6.getMonth() + 1) + '-01';
        } else if (presetType === PERIOD_PRESETS.LAST_1_YEAR) {
            var d12 = new Date(now.getFullYear() - 1, now.getMonth(), 1);
            startStr = d12.getFullYear() + '-' + pad2(d12.getMonth() + 1) + '-01';
        }

        startInp.value = startStr;
        endInp.value = endStr;
    }

    function saveHistoryPeriod() {
        var startInp = getEl('tbHistPeriodStart');
        var endInp = getEl('tbHistPeriodEnd');
        if (!startInp) return;

        var startRaw = startInp.value;
        var endRaw = (endInp && endInp.value) ? endInp.value : td();

        if (!startRaw) {
            alert('Please select a Start Date.');
            startInp.focus();
            return;
        }

        var startMonth = typeof normalizeMonthKey === 'function' ? normalizeMonthKey(startRaw) : startRaw.slice(0, 7);
        var endMonth = typeof normalizeMonthKey === 'function' ? normalizeMonthKey(endRaw) : endRaw.slice(0, 7);

        if (endMonth < startMonth) {
            alert('End Date must be on or after Start Date.');
            if (endInp) endInp.focus();
            return;
        }

        savePeriod(startMonth, endMonth, endMonth);
        showToast('Tasbeeh period settings updated');
        renderHistoryTab();

        // Also notify old tab if needed
        if (window.TasbeehOldApp && typeof window.TasbeehOldApp.renderOldTab === 'function') {
            window.TasbeehOldApp.renderOldTab();
        }
    }

    function resetHistoryPeriod() {
        var now = new Date();
        var curMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
        var defaultStart = now.getFullYear() + '-01';
        var defaultEnd = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');

        savePeriod(defaultStart, defaultEnd, defaultEnd);
        showToast('Period reset to current year');
        renderHistoryTab();

        if (window.TasbeehOldApp && typeof window.TasbeehOldApp.renderOldTab === 'function') {
            window.TasbeehOldApp.renderOldTab();
        }
    }

    function init() {
        loadPeriod();
    }

    var api = {
        init: init,
        loadPeriod: loadPeriod,
        savePeriod: savePeriod,
        renderHistoryTab: renderHistoryTab,
        applyPreset: applyPreset,
        saveHistoryPeriod: saveHistoryPeriod,
        resetHistoryPeriod: resetHistoryPeriod
    };

    if (window.TasbeehApp) {
        window.TasbeehApp.renderHistoryTab = renderHistoryTab;
        window.TasbeehApp.loadPeriod = loadPeriod;
        window.TasbeehApp.savePeriod = savePeriod;
    }

    return api;
})();
