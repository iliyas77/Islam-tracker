/* ============================================================
   Nur Prayer — Prayer Performance Feature Module
   Path: features/prayer-tracking/prayer-performance.js
   Calculates and renders prayer statistics from configured start date
   to current date across all prayers (Fajr, Dhuhr, Asr, Maghrib, Isha).
   ============================================================ */

(function (window) {
    'use strict';

    var PRAYER_NAMES = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.NAMES) ||
        window.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    /**
     * Calculate comprehensive prayer performance statistics from Settings start date to today.
     * @returns {Object} statistics object
     */
    function calculatePrayerPerformance() {
        var sdate = (typeof window.rdSD === 'function' ? window.rdSD() : null);
        var today = (typeof window.td === 'function' ? window.td() : new Date().toISOString().slice(0, 10));

        if (!sdate) sdate = today;
        if (sdate > today) sdate = today;

        var dates = typeof window.datesInRange === 'function' ? window.datesInRange(sdate, today) : [today];
        var totalDays = dates.length;
        var totalPossible = totalDays * PRAYER_NAMES.length;

        var curDb = typeof window.rd === 'function' ? window.rd() : {};
        var oldDb = typeof window.rdOC === 'function' ? window.rdOC() : {};

        var perPrayer = {};
        PRAYER_NAMES.forEach(function (p) {
            perPrayer[p] = {
                name: p,
                completed: 0,
                missed: 0,
                total: totalDays,
                percentage: 0
            };
        });

        var totalCompleted = 0;
        var totalMissed = 0;

        dates.forEach(function (d) {
            var isCurToday = (d === today);
            var curEntry = curDb[d];
            var oldEntry = oldDb[d];

            PRAYER_NAMES.forEach(function (p) {
                var isCompleted = false;

                if (curEntry) {
                    // Unified boolean format: false/'done' = completed, true/'missed' = missed
                    isCompleted = (curEntry[p] === false || curEntry[p] === 'done');
                } else if (oldEntry) {
                    // Old tracking records: false = completed, true/'missed' = missed
                    isCompleted = (oldEntry[p] === false);
                } else if (isCurToday) {
                    // Today entry if accessed before explicit storage write
                    var rt = typeof window.gr === 'function' ? window.gr(d) : {};
                    isCompleted = (rt[p] === false || rt[p] === 'done');
                } else {
                    // In Nur Prayer's storage architecture, dates with all prayers completed
                    // are pruned from the database (sr: delete a[d])
                    isCompleted = true;
                }

                if (isCompleted) {
                    perPrayer[p].completed++;
                    totalCompleted++;
                } else {
                    perPrayer[p].missed++;
                    totalMissed++;
                }
            });
        });

        PRAYER_NAMES.forEach(function (p) {
            perPrayer[p].percentage = totalDays > 0
                ? Math.round((perPrayer[p].completed / totalDays) * 100)
                : 0;
        });

        var totalPercentage = totalPossible > 0
            ? Math.round((totalCompleted / totalPossible) * 100)
            : 0;

        return {
            startDate: sdate,
            endDate: today,
            totalDays: totalDays,
            totalPossible: totalPossible,
            totalCompleted: totalCompleted,
            totalMissed: totalMissed,
            totalPercentage: totalPercentage,
            perPrayer: perPrayer
        };
    }

    /**
     * Render the Performance tab content into #performanceBody.
     */
    function renderPerformanceTab() {
        var body = typeof window.$ === 'function' ? window.$('performanceBody') : document.getElementById('performanceBody');
        if (!body) return;

        var stats = calculatePrayerPerformance();
        var frFn = typeof window.fr === 'function' ? window.fr : function (d) { return d; };
        var renderIconFn = typeof window.renderIcon === 'function' ? window.renderIcon : function (opts) {
            var n = typeof opts === 'object' ? opts.name : opts;
            return '<i class="icon-' + n + '"></i>';
        };
        var buttonFn = typeof window.Button === 'function' ? window.Button : function (props) {
            return '<button type="button" class="btn ' + (props.className || '') + '" data-act="' + (props.dataAct || '') + '">' + (props.label || '') + '</button>';
        };
        var timings = window.T || (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.DEFAULT_TIMINGS) || {};

        // Update header subtitle if currently on performance tab
        var oldSub = typeof window.$ === 'function' ? window.$('oldSub') : document.getElementById('oldSub');
        if (oldSub && typeof window.trackerSubTab !== 'undefined' && window.trackerSubTab === 'performance') {
            oldSub.classList.remove('d-none');
            oldSub.textContent = frFn(stats.startDate) + ' → ' + frFn(stats.endDate) + ' (' + stats.totalDays + (stats.totalDays === 1 ? ' day' : ' days') + ')';
        }

        // Hero Card: Circular Progress Ring & Summary
        var heroCardHtml =
            '<!-- Main Stat Card -->' +
            '<div class="card rounded-4 p-3 bg-white border border-borderGrey" data-ref="page.performance.hero-card">' +
            '<div class="flex items-center justify-between gap-3">' +
            '<!-- Circular Progress Ring -->' +
            '<div class="perf-ring-container">' +
            '<svg class="perf-ring-svg" viewBox="0 0 36 36">' +
            '<path class="perf-ring-bg" stroke-width="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />' +
            '<path class="perf-ring-val" stroke-dasharray="' + stats.totalPercentage + ', 100" stroke-width="3.5" stroke-linecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />' +
            '</svg>' +
            '<div class="absolute flex flex-col items-center justify-center text-center">' +
            '<span class="fs-5 fw-bold text-brand lh-1" data-ref="page.performance.hero-percentage">' + stats.totalPercentage + '%</span>' +
            '<span class="text-muted fw-medium mt-0.5" style="font-size: 10px;">completed</span>' +
            '</div>' +
            '</div>' +
            '<!-- Total Stats Info -->' +
            '<div class="flex flex-col items-end gap-2 text-end">' +
            '<div>' +
            '<div class="text-muted fs-xs fw-medium">Total completed prayers</div>' +
            '<div class="fw-bold fs-2 text-brand tracking-tight lh-1 mt-1">' +
            '<span data-ref="page.performance.total-completed">' + stats.totalCompleted + '</span>' +
            '<span class="text-muted fw-normal fs-5" data-ref="page.performance.total-possible"> / ' + stats.totalPossible + '</span>' +
            '</div>' +
            '</div>' +
            '<!-- Date Pill -->' +
            '<div class="inline-flex items-center px-2.5 py-1 rounded-pill bg-brand-light text-brand fs-xs fw-medium border border-borderGrey">' +
            '<span class="fw-bold me-1">' + stats.totalDays + (stats.totalDays === 1 ? ' day' : ' days') + '</span> · ' + frFn(stats.startDate) + ' → ' + frFn(stats.endDate) +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        // Three Summary Cards: Completed, Missed, Success
        var missedCountColor = stats.totalMissed > 0 ? 'text-danger' : 'text-gr1';
        var summaryCardsHtml =
            '<!-- Three Summary Cards -->' +
            '<div class="grid grid-cols-3 gap-2" data-ref="page.performance.stats-row">' +
            '<!-- Completed Card -->' +
            '<div class="card rounded-3 p-3 text-center bg-white border border-borderGrey flex flex-col items-center justify-center" data-ref="page.performance.stat.completed-card">' +
            '<div class="text-muted fw-bold text-uppercase" style="font-size: 10px; letter-spacing: 0.5px;">Completed</div>' +
            '<div class="fw-bold fs-4 text-brand mt-1 lh-1" data-ref="page.performance.stat.completed">' + stats.totalCompleted + '</div>' +
            '<div class="text-muted mt-1" style="font-size: 11px;">prayers</div>' +
            '</div>' +
            '<!-- Missed Card -->' +
            '<div class="card rounded-3 p-3 text-center bg-white border border-borderGrey flex flex-col items-center justify-center" data-ref="page.performance.stat.missed-card">' +
            '<div class="text-muted fw-bold text-uppercase" style="font-size: 10px; letter-spacing: 0.5px;">Missed</div>' +
            '<div class="fw-bold fs-4 ' + missedCountColor + ' mt-1 lh-1" data-ref="page.performance.stat.missed">' + stats.totalMissed + '</div>' +
            '<div class="text-muted mt-1" style="font-size: 11px;">prayers</div>' +
            '</div>' +
            '<!-- Success Card -->' +
            '<div class="card rounded-3 p-3 text-center bg-white border border-borderGrey flex flex-col items-center justify-center" data-ref="page.performance.stat.rate-card">' +
            '<div class="text-muted fw-bold text-uppercase" style="font-size: 10px; letter-spacing: 0.5px;">Success</div>' +
            '<div class="fw-bold fs-4 text-brand mt-1 lh-1" data-ref="page.performance.stat.rate">' + stats.totalPercentage + '%</div>' +
            '<div class="text-muted mt-1" style="font-size: 11px;">rate</div>' +
            '</div>' +
            '</div>';

        // Section Header Card: Individual Prayer Breakdown
        var sectionHeaderHtml =
            '<!-- Section Header Card -->' +
            '<div class="card rounded-4 p-3 bg-white border border-borderGrey flex flex-row items-center justify-between" data-ref="page.performance.breakdown-header">' +
            '<div class="flex items-center gap-3">' +
            '<div class="rounded-3 bg-brand-light text-brand flex items-center justify-center shrink-0" style="width: 40px; height: 40px;">' +
            renderIconFn({ name: 'list-check', size: 20, color: 'text-brand' }) +
            '</div>' +
            '<h6 class="fw-bold text-gr1 fs-base mb-0 lh-sm">Individual Prayer<br>Breakdown</h6>' +
            '</div>' +
            '<div class="shrink-0" style="width: 1px; height: 32px; background-color: var(--border-subtle, #e2e8f0); margin: 0 4px;"></div>' +
            '<div class="flex items-center gap-2 bg-brand-light px-3 py-1.5 rounded-3 border border-subtle text-brand fs-xs fw-medium shrink-0">' +
            renderIconFn({ name: 'calendar', size: 16, color: 'text-brand' }) +
            '<div class="text-end">' +
            '<div class="fw-bold lh-1">' + stats.totalDays + (stats.totalDays === 1 ? ' day' : ' days') + '</div>' +
            '<div class="text-muted lh-1 mt-0.5" style="font-size: 10px;">tracked</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        // Generate individual prayer cards
        var prayerRowsHtml = PRAYER_NAMES.map(function (p) {
            var pLower = p.toLowerCase();
            var pStats = stats.perPrayer[p] || { completed: 0, missed: 0, total: stats.totalDays, percentage: 0 };
            var pIcon = renderIconFn({ name: pLower, size: 22, color: 'text-brand' });
            var pTime = timings[p] || (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.DEFAULT_TIMINGS && window.CONSTANTS.PRAYER.DEFAULT_TIMINGS[p]) || '--:--';
            var isPerfect = (pStats.missed === 0);

            // Badge variant matching reference
            var pctBadge = isPerfect
                ? '<span class="badge-perf-pill badge-perf-pill-success" data-ref="page.performance.prayer.' + pLower + '.pct">' + pStats.percentage + '%</span>'
                : '<span class="badge-perf-pill badge-perf-pill-missed" data-ref="page.performance.prayer.' + pLower + '.pct">' + pStats.percentage + '%</span>';

            // Progress bar with dual/single fill matching reference
            var progressBarHtml;
            if (isPerfect) {
                progressBarHtml =
                    '<div class="perf-bar-track">' +
                    '<div class="perf-bar-fill rounded-pill" style="width: ' + pStats.percentage + '%;"></div>' +
                    '</div>';
            } else {
                var compW = pStats.percentage;
                var missW = Math.max(0, 100 - compW);
                progressBarHtml =
                    '<div class="perf-bar-track">' +
                    (compW > 0 ? '<div class="perf-bar-fill" style="width: ' + compW + '%; border-top-left-radius: 9999px; border-bottom-left-radius: 9999px;"></div>' : '') +
                    (missW > 0 ? '<div class="perf-bar-missed" style="width: ' + missW + '%; border-top-right-radius: 9999px; border-bottom-right-radius: 9999px;"></div>' : '') +
                    '</div>';
            }

            // Bottom indicators matching reference
            var completedStatusHtml =
                '<span class="flex items-center gap-1.5 text-brand fs-xs fw-semibold text-nowrap lh-1">' +
                renderIconFn({ name: 'circle-check', size: 14, className: 'shrink-0' }) +
                '<span>' + pStats.completed + ' Completed</span>' +
                '</span>';

            var missedStatusHtml = isPerfect
                ? '<span class="flex items-center gap-1.5 text-muted fs-xs fw-medium text-nowrap lh-1">' +
                  renderIconFn({ name: 'circle-xmark', size: 14, className: 'shrink-0' }) +
                  '<span>0 Missed</span>' +
                  '</span>'
                : '<span class="flex items-center gap-1.5 text-danger fs-xs fw-semibold text-nowrap lh-1">' +
                  renderIconFn({ name: 'circle-exclamation', size: 14, className: 'shrink-0' }) +
                  '<span>' + pStats.missed + ' Missed</span>' +
                  '</span>';

            return '<div class="card perf-prayer-card rounded-4 p-3 bg-white border border-borderGrey flex flex-row items-center gap-3" data-ref="page.performance.prayer.' + pLower + '">' +
                '<!-- Left Info -->' +
                '<div class="flex items-center gap-2.5 shrink-0" style="width: 126px;">' +
                '<div class="rounded-circle bg-brand-light text-brand flex items-center justify-center shrink-0" style="width: 44px; height: 44px;" data-ref="page.performance.prayer.' + pLower + '.icon">' +
                pIcon +
                '</div>' +
                '<div class="min-w-0">' +
                '<h6 class="fw-bold text-gr1 fs-base mb-0 lh-sm" data-ref="page.performance.prayer.' + pLower + '.name">' + p + '</h6>' +
                '<div class="flex items-center gap-1 text-muted fs-xs mt-0.5" data-ref="page.performance.prayer.' + pLower + '.time">' +
                renderIconFn({ name: 'clock', size: 11, className: 'shrink-0' }) +
                '<span style="font-size: 11px;">' + pTime + '</span>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<!-- Vertical Divider -->' +
                '<div class="perf-divider shrink-0 self-stretch my-1" style="width: 1px; background-color: var(--border-subtle, #e2e8f0);"></div>' +
                '<!-- Right Stat Info & Progress -->' +
                '<div class="flex-1 min-w-0 flex flex-col justify-center gap-1.5">' +
                '<div class="flex items-center justify-between">' +
                '<span class="fs-sm fw-bold text-gr1 lh-1" data-ref="page.performance.prayer.' + pLower + '.count">' +
                pStats.completed + ' <span class="text-muted fw-normal">/ ' + stats.totalDays + '</span>' +
                '</span>' +
                pctBadge +
                '</div>' +
                progressBarHtml +
                '<div class="flex items-center justify-between">' +
                completedStatusHtml +
                missedStatusHtml +
                '</div>' +
                '</div>' +
                '</div>';
        }).join('');

        // Settings Start Date Footer Card
        var footerCardHtml =
            '<!-- Settings Start Date Footer Card -->' +
            '<div class="card rounded-4 p-3 bg-brand-light border border-borderGrey text-center flex flex-col items-center mt-1" data-ref="page.performance.footer-card">' +
            '<div class="flex items-center justify-center gap-1.5 mb-1">' +
            renderIconFn({ name: 'calendar-check', size: 16, color: 'text-brand' }) +
            '<span class="fs-xs fw-bold text-brand">Tracking Start Date: ' + frFn(stats.startDate) + '</span>' +
            '</div>' +
            '<p class="text-muted fs-xs mb-2.5">' +
            'Calculated from your start date configured in Settings up to today (' + frFn(stats.endDate) + ').' +
            '</p>' +
            '<div class="flex justify-center">' +
            buttonFn({
                label: 'Adjust Start Date in Settings',
                variant: 'brand',
                size: 'sm',
                className: 'fw-bold px-3 py-1.5 rounded-pill fs-xs',
                icon: renderIconFn({ name: 'gear', size: 14, className: 'me-1' }),
                dataAct: 'goto-settings',
                dataRef: 'page.performance.goto-settings-btn'
            }) +
            '</div>' +
            '</div>';

        var html =
            '<div class="flex flex-col gap-3 pb-2" data-ref="page.performance.container">' +
            heroCardHtml +
            summaryCardsHtml +
            sectionHeaderHtml +
            '<div class="flex flex-col gap-2.5" data-ref="page.performance.breakdown-list">' +
            prayerRowsHtml +
            '</div>' +
            footerCardHtml +
            '</div>';

        body.innerHTML = html;
    }

    /**
     * Updates the performance view if the tab or body is currently active/visible.
     */
    function updatePerformanceTab() {
        var body = typeof window.$ === 'function' ? window.$('performanceBody') : document.getElementById('performanceBody');
        if (body && (!body.classList.contains('d-none') || (typeof window.trackerSubTab !== 'undefined' && window.trackerSubTab === 'performance'))) {
            renderPerformanceTab();
        }
    }

    // Expose functions globally
    window.calculatePrayerPerformance = calculatePrayerPerformance;
    window.renderPerformanceTab = renderPerformanceTab;
    window.updatePerformanceTab = updatePerformanceTab;

})(typeof window !== 'undefined' ? window : global);

