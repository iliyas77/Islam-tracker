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

    /* ---------- Period Storage Layer ---------- */
    function loadPeriod() {
        var raw = localStorage.getItem(PERIOD_KEY);
        var now = new Date();
        var defaultStart = now.getFullYear() + '-01-01';
        var defaultEnd = td();

        if (!raw) {
            var initial = { startDate: defaultStart, endDate: defaultEnd, completedMonths: [], updatedAt: Date.now() };
            try { localStorage.setItem(PERIOD_KEY, JSON.stringify(initial)); } catch (_) { }
            return initial;
        }
        try {
            var p = JSON.parse(raw);
            if (!p || !p.startDate) {
                return { startDate: defaultStart, endDate: defaultEnd, completedMonths: [], updatedAt: Date.now() };
            }
            return {
                startDate: p.startDate || defaultStart,
                endDate: p.endDate || defaultEnd,
                completedMonths: Array.isArray(p.completedMonths) ? p.completedMonths : [],
                updatedAt: p.updatedAt || Date.now()
            };
        } catch (_) {
            return { startDate: defaultStart, endDate: defaultEnd, completedMonths: [], updatedAt: Date.now() };
        }
    }

    function savePeriod(start, end, completedMonths) {
        var cur = loadPeriod();
        var p = {
            startDate: start,
            endDate: end,
            completedMonths: Array.isArray(completedMonths) ? completedMonths : (cur.completedMonths || []),
            updatedAt: Date.now()
        };
        try { localStorage.setItem(PERIOD_KEY, JSON.stringify(p)); } catch (_) { }
        return p;
    }

    /* ---------- Render History Tab ---------- */
    function renderHistoryTab() {
        var body = getEl('tbHistoryBody');
        if (!body) return;

        var period = loadPeriod();
        var allOldMonths = typeof getPreviousMonthsList === 'function'
            ? getPreviousMonthsList(period.startDate, period.endDate)
            : [];

        var completed = period.completedMonths || [];
        var totalMonthsCount = allOldMonths.length;
        var completedCount = 0;
        allOldMonths.forEach(function (m) {
            if (completed.indexOf(m) !== -1) completedCount++;
        });
        var pendingCount = Math.max(0, totalMonthsCount - completedCount);
        var percent = totalMonthsCount > 0 ? Math.round((completedCount / totalMonthsCount) * 100) : 0;

        var curOldMonth = (window.TasbeehOldApp && typeof window.TasbeehOldApp.getCurrentOldMonth === 'function')
            ? window.TasbeehOldApp.getCurrentOldMonth()
            : null;

        // Render Months List items
        var monthsListHtml = '';
        if (allOldMonths.length === 0) {
            monthsListHtml =
                '<div class="text-center py-4 text-muted small">' +
                '  <i class="fa-solid fa-calendar-xmark fs-2 opacity-50 mb-2 d-block"></i>' +
                '  No past months found in this period range. Check your Start and End dates.' +
                '</div>';
        } else {
            var lastCompletedMonth = completed.length > 0 ? completed[completed.length - 1] : null;

            monthsListHtml = allOldMonths.map(function (mKey, idx) {
                var isCompleted = completed.indexOf(mKey) !== -1;
                var isActive = (mKey === curOldMonth);
                var isLastCompleted = (mKey === lastCompletedMonth);
                var monthLabel = typeof formatMonthLabel === 'function' ? formatMonthLabel(mKey) : mKey;

                var badgeClass = isCompleted ? 'bg-success-subtle text-success border border-success-subtle'
                    : (isActive ? 'bg-primary-subtle text-primary border border-primary-subtle'
                        : 'bg-secondary-subtle text-secondary border border-secondary-subtle');

                var badgeIcon = isCompleted ? '<i class="fa-solid fa-circle-check me-1"></i>'
                    : (isActive ? '<i class="fa-solid fa-play me-1"></i>'
                        : '<i class="fa-regular fa-clock me-1"></i>');

                var badgeText = isCompleted ? 'Completed'
                    : (isActive ? 'In Progress' : 'Pending');

                var reopenBtn = isLastCompleted
                    ? '<button type="button" class="btn btn-sm btn-outline-warning rounded-pill px-2 py-0 ms-auto" style="font-size: 11px; font-weight: 600;" data-act="tb-old-reopen" title="Reopen this month to recount">' +
                      '  <i class="fa-solid fa-arrow-rotate-left me-1"></i> Reopen' +
                      '</button>'
                    : '';

                return (
                    '<div class="d-flex align-items-center justify-content-between p-2 rounded-3 bg-white border border-light-subtle shadow-xs mb-2" data-month="' + mKey + '">' +
                    '  <div class="d-flex align-items-center gap-2 min-w-0">' +
                    '    <span class="text-muted fw-bold small" style="width: 24px; font-size: 11px;">#' + (totalMonthsCount - idx) + '</span>' +
                    '    <span class="fw-bold text-gr1 small text-truncate" style="font-size: 13.5px;">' + escHtml(monthLabel) + '</span>' +
                    '  </div>' +
                    '  <div class="d-flex align-items-center gap-2 flex-shrink-0">' +
                    '    <span class="badge rounded-pill ' + badgeClass + ' d-inline-flex align-items-center" style="font-size: 10.5px; font-weight: 600; padding: 4px 8px;">' +
                    badgeIcon + badgeText +
                    '    </span>' +
                    reopenBtn +
                    '  </div>' +
                    '</div>'
                );
            }).join('');
        }

        body.innerHTML =
            '<div class="d-flex flex-column gap-3 pt-1 pb-4" data-ref="page.tasbeeh.history.content">' +
            '  <!-- Header Summary Banner -->' +
            '  <div class="card p-3 rounded-4 bg-white border border-light-subtle shadow-sm">' +
            '    <div class="d-flex align-items-center justify-content-between mb-2">' +
            '      <div>' +
            '        <h6 class="fw-bold text-gr1 mb-0" style="font-size: 1.05rem;">Tracking Period & History</h6>' +
            '        <div class="text-muted small">Configure timeline and view past monthly clearance</div>' +
            '      </div>' +
            '      <span class="badge bg-success-subtle text-success rounded-pill px-3 py-1 fw-bold" style="font-size: 11px;">' +
            '        ' + percent + '% Cleared' +
            '      </span>' +
            '    </div>' +
            '' +
            '    <!-- Progress Bar -->' +
            '    <div class="progress mb-3" style="height: 6px;">' +
            '      <div class="progress-bar bg-success rounded-pill" role="progressbar" style="width: ' + percent + '%;" aria-valuenow="' + percent + '" aria-valuemin="0" aria-valuemax="100"></div>' +
            '    </div>' +
            '' +
            '    <!-- Stats Tiles -->' +
            '    <div class="row g-2 text-center">' +
            '      <div class="col-4">' +
            '        <div class="p-2 rounded-3 bg-body-tertiary">' +
            '          <div class="text-muted small" style="font-size: 11px;">Total Months</div>' +
            '          <div class="fw-bold text-gr1" style="font-size: 1.1rem;">' + totalMonthsCount + '</div>' +
            '        </div>' +
            '      </div>' +
            '      <div class="col-4">' +
            '        <div class="p-2 rounded-3 bg-success-subtle text-success">' +
            '          <div class="small" style="font-size: 11px; font-weight: 600;">Cleared</div>' +
            '          <div class="fw-bold" style="font-size: 1.1rem;">' + completedCount + '</div>' +
            '        </div>' +
            '      </div>' +
            '      <div class="col-4">' +
            '        <div class="p-2 rounded-3 bg-body-tertiary">' +
            '          <div class="text-muted small" style="font-size: 11px;">Pending</div>' +
            '          <div class="fw-bold text-muted" style="font-size: 1.1rem;">' + pendingCount + '</div>' +
            '        </div>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '' +
            '  <!-- Period Settings Card -->' +
            '  <div class="card p-3 rounded-4 bg-white border border-light-subtle shadow-sm">' +
            '    <div class="d-flex align-items-center gap-2 mb-3">' +
            '      <div class="modal-icon-badge" style="width: 36px; height: 36px; border-radius: 10px;">' +
            '        <i class="fa-solid fa-gear fs-6 text-success"></i>' +
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
            '        <i class="fa-regular fa-calendar text-success me-1"></i>Start Date' +
            '      </label>' +
            '      <div class="field-group" style="border-radius: 8px;">' +
            '        <span class="field-icon" style="width: 42px; height: 42px;"><i class="fa-regular fa-calendar-days text-success" style="font-size: 15px;"></i></span>' +
            '        <input type="date" class="form-control border-0 ps-2" style="height: 42px; font-size: 14px;" id="tbHistPeriodStart" value="' + (period.startDate || '') + '">' +
            '      </div>' +
            '    </div>' +
            '' +
            '    <!-- End Date Input -->' +
            '    <div class="mb-3">' +
            '      <label class="form-label small fw-bold text-muted mb-1" for="tbHistPeriodEnd">' +
            '        <i class="fa-regular fa-calendar-check text-success me-1"></i>End Date' +
            '      </label>' +
            '      <div class="field-group" style="border-radius: 8px;">' +
            '        <span class="field-icon" style="width: 42px; height: 42px;"><i class="fa-solid fa-calendar-check text-success" style="font-size: 15px;"></i></span>' +
            '        <input type="date" class="form-control border-0 ps-2" style="height: 42px; font-size: 14px;" id="tbHistPeriodEnd" value="' + (period.endDate || td()) + '">' +
            '      </div>' +
            '    </div>' +
            '' +
            '    <!-- Presets -->' +
            '    <div class="mb-3">' +
            '      <label class="form-label small fw-bold text-muted text-uppercase mb-1" style="font-size: 10.5px;">Quick Presets</label>' +
            '      <div class="d-flex gap-2 flex-wrap">' +
            '        <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1" style="font-size: 12px;" data-act="tb-hist-preset" data-preset="this-year">This Year</button>' +
            '        <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1" style="font-size: 12px;" data-act="tb-hist-preset" data-preset="6-months">Last 6 Months</button>' +
            '        <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1" style="font-size: 12px;" data-act="tb-hist-preset" data-preset="1-year">Last 1 Year</button>' +
            '      </div>' +
            '    </div>' +
            '' +
            '    <!-- Action Buttons -->' +
            '    <div class="d-flex gap-2 pt-1">' +
            '      <button type="button" class="btn btn-sm btn-brand flex-grow-1 rounded-3 py-2 fw-bold" style="font-size: 13.5px;" data-act="tb-hist-save">' +
            '        <i class="fa-solid fa-check me-1"></i> Save Period Settings' +
            '      </button>' +
            '      <button type="button" class="btn btn-sm btn-outline-secondary rounded-3 px-3 py-2" style="font-size: 13.5px;" data-act="tb-hist-reset" title="Reset Period Settings">' +
            '        <i class="fa-solid fa-rotate-left"></i>' +
            '      </button>' +
            '    </div>' +
            '  </div>' +
            '' +
            '  <!-- Monthly Clearance Breakdown -->' +
            '  <div class="card p-3 rounded-4 bg-white border border-light-subtle shadow-sm">' +
            '    <div class="d-flex align-items-center justify-content-between mb-2">' +
            '      <h6 class="fw-bold text-gr1 mb-0" style="font-size: 0.95rem;">Monthly Timeline Breakdown</h6>' +
            (completed.length > 0
                ? '<button type="button" class="btn btn-link text-danger text-decoration-none p-0 small fw-bold" style="font-size: 11px;" data-act="tb-reset-all-completed">' +
                  '  <i class="fa-solid fa-rotate-left me-1"></i> Reset Cleared' +
                  '</button>'
                : '') +
            '    </div>' +
            '    <div class="text-muted small mb-3" style="font-size: 11.5px;">Sequential monthly clearance advances automatically as dhikrs are completed.</div>' +
            '    <div class="tb-history-list">' +
            monthsListHtml +
            '    </div>' +
            '  </div>' +
            '</div>';
    }

    /* ---------- Setting Handlers ---------- */
    function applyPreset(presetType) {
        var now = new Date();
        var startInp = getEl('tbHistPeriodStart');
        var endInp = getEl('tbHistPeriodEnd');
        if (!startInp || !endInp) return;

        var startStr = '';
        var endStr = td();

        if (presetType === 'this-year') {
            startStr = now.getFullYear() + '-01-01';
        } else if (presetType === '6-months') {
            var d6 = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            startStr = d6.getFullYear() + '-' + pad2(d6.getMonth() + 1) + '-01';
        } else if (presetType === '1-year') {
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

        var startVal = startInp.value;
        var endVal = (endInp && endInp.value) ? endInp.value : td();

        if (!startVal) {
            alert('Please select a Start Date.');
            startInp.focus();
            return;
        }

        if (endVal && endVal < startVal) {
            alert('End Date must be on or after Start Date.');
            if (endInp) endInp.focus();
            return;
        }

        var cur = loadPeriod();
        savePeriod(startVal, endVal, cur.completedMonths || []);
        showToast('Tasbeeh period settings updated');
        renderHistoryTab();

        // Also notify old tab if needed
        if (window.TasbeehOldApp && typeof window.TasbeehOldApp.renderOldTab === 'function') {
            window.TasbeehOldApp.renderOldTab();
        }
    }

    function resetHistoryPeriod() {
        var now = new Date();
        var defaultStart = now.getFullYear() + '-01-01';
        var defaultEnd = td();

        savePeriod(defaultStart, defaultEnd, []);
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
