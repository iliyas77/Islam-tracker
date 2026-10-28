/* ============================================================
   Nur Prayer — Digital Tasbeeh: Home Tab Module
   Path: features/tasbeeh/tasbeeh-home.js
   Handles:
     - Home tab rendering inside Digital Tasbeeh
     - Bookmarked Current and Old counters display in 2x2 grid
     - Quick navigation to Current, Old, and History features
   ============================================================ */
'use strict';

window.TasbeehHomeApp = (function () {
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

    /* ---------- Render Tasbeeh Home Tab ---------- */
    function renderHomeTab() {
        var body = getEl('tbHomeBody');
        if (!body) return;

        var bmData = (window.TasbeehApp && typeof window.TasbeehApp.getBookmarkedChants === 'function')
            ? window.TasbeehApp.getBookmarkedChants()
            : null;

        var items = (window.TasbeehApp && typeof window.TasbeehApp.getItems === 'function')
            ? window.TasbeehApp.getItems()
            : [];

        if (!items || items.length === 0) {
            body.innerHTML =
                '<div class="card p-4 text-center border-0 shadow-sm rounded-4 bg-white mt-3" data-ref="page.tasbeeh.home.empty">' +
                '  <div class="mb-3">' +
                '    <i class="fa-solid fa-hand-holding-heart fs-1 text-muted opacity-50"></i>' +
                '  </div>' +
                '  <h5 class="fw-bold text-gr1 mb-1">No Dhikr Configured</h5>' +
                '  <p class="text-muted small mb-3">Add your first recitation chant in the Current tab to begin tracking bookmarks.</p>' +
                '  <div>' +
                '    <button type="button" class="btn btn-sm btn-brand rounded-pill px-4 py-2" data-act="switch-tb-current">' +
                '      <i class="fa-solid fa-plus me-1"></i> Add First Dhikr' +
                '    </button>' +
                '  </div>' +
                '</div>';
            return;
        }

        var icons = (window.CONSTANTS && window.CONSTANTS.TASBEEH && window.CONSTANTS.TASBEEH.ICONS) || {};
        var misbahaIcon = icons.MISBAHA || '<i class="fa-solid fa-hand-holding-heart"></i>';
        var targetIcon = icons.TARGET || '';
        var checkIcon = icons.CHECK_CIRCLE || '';

        // 1. Current Bookmark Card
        var curHtml = '';
        if (bmData && bmData.current && bmData.current.item) {
            var c = bmData.current;
            curHtml =
                '<div class="tb-card tb-card-bookmark" role="button" tabindex="0" data-act="tb-open-bookmark" data-type="current" data-id="' + c.item.id + '" data-ref="page.tasbeeh.home.bookmark-current" aria-label="Open Current Tasbeeh ' + escHtml(c.item.title) + '">' +
                '  <div class="tb-card-top">' +
                '    <div class="tb-card-icon-box">' +
                misbahaIcon +
                '    </div>' +
                '    <div class="tb-card-actions">' +
                '      <span class="tb-bookmark-pill tb-pill-current">Current</span>' +
                '      ' + ((window.SVG_CONSTANTS && window.SVG_CONSTANTS.TASBEEH && window.SVG_CONSTANTS.TASBEEH.CHEVRON) || '') +
                '    </div>' +
                '  </div>' +
                '  <div class="tb-card-body">' +
                '    <h6 class="tb-card-title">' + escHtml(c.item.title) + '</h6>' +
                '    <div class="tb-card-meta">' +
                '      <div class="tb-meta-row">' +
                targetIcon +
                '        <span class="tb-meta-text">Target: <span class="tb-val-num">' + c.targetDisplay + '</span> / day</span>' +
                '      </div>' +
                '      <div class="tb-meta-row">' +
                checkIcon +
                '        <span class="tb-meta-text"><span class="badge-pill-custom badge-done" style="font-size:0.72rem;padding:0.25rem 0.6rem;">Done</span><strong class="tb-val-done ms-1">' + (c.completedDays || 0) + '</strong><span class="tb-val-total"> / ' + (c.totalDays || 0) + ' days</span></span>' +
                '      </div>' +
                '      <div class="tb-meta-row tb-meta-sub-row">' +
                '        <i class="fa-regular fa-calendar-days text-muted" style="font-size: 11px;"></i>' +
                '        <span class="tb-meta-text">' + escHtml(c.monthName || 'Current Month') + (c.isTodayDone ? ' · <span class="text-brand fw-bold">Today ✓</span>' : '') + '</span>' +
                '      </div>' +
                '    </div>' +
                '  </div>' +
                '</div>';
        }

        // 2. Old Bookmark Card
        var oldHtml = '';
        if (bmData && bmData.old && bmData.old.item) {
            var o = bmData.old;
            oldHtml =
                '<div class="tb-card tb-card-bookmark" role="button" tabindex="0" data-act="tb-open-bookmark" data-type="old" data-id="' + o.item.id + '" data-month="' + (o.monthKey || '') + '" data-ref="page.tasbeeh.home.bookmark-old" aria-label="Open Old Tasbeeh ' + escHtml(o.item.title) + '">' +
                '  <div class="tb-card-top">' +
                '    <div class="tb-card-icon-box">' +
                misbahaIcon +
                '    </div>' +
                '    <div class="tb-card-actions">' +
                '      <span class="tb-bookmark-pill tb-pill-old">Old</span>' +
                '      ' + ((window.SVG_CONSTANTS && window.SVG_CONSTANTS.TASBEEH && window.SVG_CONSTANTS.TASBEEH.CHEVRON) || '') +
                '    </div>' +
                '  </div>' +
                '  <div class="tb-card-body">' +
                '    <h6 class="tb-card-title">' + escHtml(o.item.title) + '</h6>' +
                '    <div class="tb-card-meta">' +
                '      <div class="tb-meta-row">' +
                targetIcon +
                '        <span class="tb-meta-text">Target: <span class="tb-val-num">' + o.targetDisplay + '</span> / day</span>' +
                '      </div>' +
                '      <div class="tb-meta-row">' +
                checkIcon +
                '        <span class="tb-meta-text"><span class="badge-pill-custom badge-done" style="font-size:0.72rem;padding:0.25rem 0.6rem;">Done</span><strong class="tb-val-done ms-1">' + (o.completedDays || 0) + '</strong><span class="tb-val-total"> / ' + (o.totalDays || 0) + ' days</span></span>' +
                '      </div>' +
                '      <div class="tb-meta-row tb-meta-sub-row">' +
                '        <i class="fa-regular fa-calendar-days text-muted" style="font-size: 11px;"></i>' +
                '        <span class="tb-meta-text">' + escHtml(o.monthName) + '</span>' +
                '      </div>' +
                '    </div>' +
                '  </div>' +
                '</div>';
        }

        // Period & History stats overview
        var period = (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.loadPeriod === 'function')
            ? window.TasbeehHistoryApp.loadPeriod()
            : ((window.TasbeehOldApp && typeof window.TasbeehOldApp.loadPeriod === 'function') ? window.TasbeehOldApp.loadPeriod() : null);

        var completedCount = 0;
        if (period && period.startDate && (period.initialEnd || period.endDate)) {
            var maxEnd = period.initialEnd || period.endDate;
            var allOld = typeof getPreviousMonthsList === 'function' ? getPreviousMonthsList(period.startDate, maxEnd) : [];
            allOld.forEach(function (m) {
                if (m > period.endDate || period.endDate < period.startDate) completedCount++;
            });
        }
        var curOldMonth = (window.TasbeehOldApp && typeof window.TasbeehOldApp.getCurrentOldMonth === 'function')
            ? window.TasbeehOldApp.getCurrentOldMonth()
            : null;
        var activeOldLabel = curOldMonth ? (window.TasbeehApp && window.TasbeehApp.formatMonthLabel ? window.TasbeehApp.formatMonthLabel(curOldMonth) : curOldMonth) : 'All Cleared';

        body.innerHTML =
            '<div class="flex flex-col gap-3 pt-1 pb-4" data-ref="page.tasbeeh.home.content">' +
            '  <!-- Header Bar with Quick Action -->' +
            '  <div class="flex items-center justify-between px-1">' +
            '    <div>' +
            '      <h6 class="fw-bold text-gr1 mb-0" style="font-size: 1.02rem;">Bookmarked Counters</h6>' +
            '      <div class="text-muted small">Tap any bookmark to recount directly</div>' +
            '    </div>' +
            '    <button type="button" class="btn btn-sm btn-outline-brand rounded-pill px-3 py-1 inline-flex items-center gap-1" data-act="switch-tb-current" style="font-size: 0.78rem; font-weight: 600;">' +
            '      <span>All Dhikrs</span>' +
            '      <i class="fa-solid fa-chevron-right" style="font-size: 10px;"></i>' +
            '    </button>' +
            '  </div>' +
            '' +
            '  <!-- 2x2 Bookmarks Grid -->' +
            '  <div class="tb-grid" data-ref="page.tasbeeh.home.grid">' +
            curHtml +
            oldHtml +
            '  </div>' +
            '' +
            '  <!-- Quick Navigation / Status Cards -->' +
            '  <div class="row g-2 mt-1">' +
            '    <div class="col-6">' +
            '      <div class="card p-3 rounded-4 bg-white border shadow-sm h-100" role="button" tabindex="0" data-act="switch-tb-current">' +
            '        <div class="flex items-center justify-between mb-2">' +
            '          <span class="badge rounded-pill bg-brand-light text-brand fw-bold" style="font-size: 10px;">CURRENT</span>' +
            '          <i class="fa-regular fa-calendar text-brand" style="font-size: 14px;"></i>' +
            '        </div>' +
            '        <div class="fw-bold text-gr1" style="font-size: 1.15rem;">' + items.length + ' <span class="small fw-normal text-muted" style="font-size: 0.8rem;">Dhikrs</span></div>' +
            '        <div class="text-muted small mt-1" style="font-size: 0.74rem;">Active in Current Month</div>' +
            '      </div>' +
            '    </div>' +
            '    <div class="col-6">' +
            '      <div class="card p-3 rounded-4 bg-white border shadow-sm h-100" role="button" tabindex="0" data-act="switch-tb-history">' +
            '        <div class="flex items-center justify-between mb-2">' +
            '          <span class="badge rounded-pill bg-warning-subtle text-warning fw-bold" style="font-size: 10px;">HISTORY</span>' +
            '          <i class="fa-solid fa-gear text-warning" style="font-size: 14px;"></i>' +
            '        </div>' +
            '        <div class="fw-bold text-gr1" style="font-size: 1.15rem;">' + completedCount + ' <span class="small fw-normal text-muted" style="font-size: 0.8rem;">Cleared</span></div>' +
            '        <div class="text-muted small mt-1" style="font-size: 0.74rem;">Active: ' + escHtml(activeOldLabel) + '</div>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '' +
            '  <!-- Helpful Guidance Banner -->' +
            '  <div class="card p-3 rounded-4 bg-brand-light border-0">' +
            '    <div class="flex items-start gap-2">' +
            '      <i class="fa-solid fa-circle-info text-brand mt-1" style="font-size: 14px;"></i>' +
            '      <div class="small text-muted" style="font-size: 0.78rem; line-height: 1.45;">' +
            '        Whenever you open a Dhikr in <strong>Current</strong> or <strong>Old</strong> tracking, its bookmark updates automatically so you can continue where you left off.' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</div>';
    }

    function init() {
        // Ready for interactions
    }

    var api = {
        init: init,
        renderHomeTab: renderHomeTab
    };

    if (window.TasbeehApp) {
        window.TasbeehApp.renderHomeTab = renderHomeTab;
    }

    return api;
})();
