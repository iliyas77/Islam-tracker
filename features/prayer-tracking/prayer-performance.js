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
        var iconBoxFn = typeof window.IconBox === 'function' ? window.IconBox : function (props) {
            return '<div class="icon-box">' + (props.icon || '') + '</div>';
        };
        var buttonFn = typeof window.Button === 'function' ? window.Button : function (props) {
            return '<button type="button" class="btn ' + (props.className || '') + '" data-act="' + (props.dataAct || '') + '">' + (props.label || '') + '</button>';
        };
        var timings = window.T || {};

        // Update header subtitle if currently on performance tab
        var oldSub = typeof window.$ === 'function' ? window.$('oldSub') : document.getElementById('oldSub');
        if (oldSub && typeof window.trackerSubTab !== 'undefined' && window.trackerSubTab === 'performance') {
            oldSub.classList.remove('d-none');
            oldSub.textContent = frFn(stats.startDate) + ' → ' + frFn(stats.endDate) + ' (' + stats.totalDays + (stats.totalDays === 1 ? ' day' : ' days') + ')';
        }

        // Generate individual prayer cards
        var prayerRowsHtml = PRAYER_NAMES.map(function (p) {
            var pLower = p.toLowerCase();
            var pStats = stats.perPrayer[p] || { completed: 0, missed: 0, total: stats.totalDays, percentage: 0 };
            var pIcon = renderIconFn(pLower);
            var pTime = timings[p] || '--:--';

            var badgeClass = 'bg-gr-accent-soft text-gr-accent';
            var barClass = 'bg-gr-accent';
            if (pStats.percentage < 50) {
                badgeClass = 'bg-danger-subtle text-danger';
                barClass = 'bg-danger';
            } else if (pStats.percentage < 80) {
                badgeClass = 'bg-warning-subtle text-warning';
                barClass = 'bg-warning';
            }

            return '<div class="p-2.5 rounded-3 bg-surface border border-brand-subtle flex flex-col gap-1.5" data-ref="page.performance.prayer.' + pLower + '">' +
                '<div class="flex items-center justify-between">' +
                '<div class="flex items-center gap-2.5 min-w-0">' +
                '<span class="fs-4 flex items-center justify-center shrink-0" data-ref="page.performance.prayer.' + pLower + '.icon">' + pIcon + '</span>' +
                '<div class="min-w-0">' +
                '<span class="fw-bold fs-6 text-gr1" data-ref="page.performance.prayer.' + pLower + '.name">' + p + '</span>' +
                '<span class="text-muted fs-xs ms-1.5" data-ref="page.performance.prayer.' + pLower + '.time">(' + pTime + ')</span>' +
                '</div>' +
                '</div>' +
                '<div class="flex items-center gap-1.5 shrink-0">' +
                '<span class="fw-bold text-gr1 fs-6" data-ref="page.performance.prayer.' + pLower + '.count">' + pStats.completed + '</span>' +
                '<span class="text-muted fs-xs">/ ' + stats.totalDays + '</span>' +
                '<span class="badge rounded-pill ' + badgeClass + ' px-2 py-0.5 fw-bold fs-xs ms-1" data-ref="page.performance.prayer.' + pLower + '.pct">' +
                pStats.percentage + '%' +
                '</span>' +
                '</div>' +
                '</div>' +
                '<div class="progress w-100" style="height: 6px;">' +
                '<div class="progress-bar ' + barClass + '" role="progressbar" style="width: ' + pStats.percentage + '%;" aria-valuenow="' + pStats.percentage + '" aria-valuemin="0" aria-valuemax="100"></div>' +
                '</div>' +
                '<div class="flex items-center justify-between text-muted fs-xs">' +
                '<span class="text-gr-accent fw-semibold">' + renderIconFn({ name: 'check', size: 'fs-xs', className: 'me-1' }) + pStats.completed + ' Completed</span>' +
                '<span class="' + (pStats.missed > 0 ? 'text-danger fw-semibold' : 'text-muted') + '">' + pStats.missed + ' Missed</span>' +
                '</div>' +
                '</div>';
        }).join('');

        // Hero badge variant based on completion rate
        var heroBadgeClass = 'badge-done';
        if (stats.totalPercentage < 50) {
            heroBadgeClass = 'badge-missed';
        } else if (stats.totalPercentage < 80) {
            heroBadgeClass = 'badge-warning';
        }

        var html =
            '<!-- Overall Performance Hero Card -->' +
            '<div class="card shadow-sm rounded-4 p-3 mb-2 bg-gr border-0" data-ref="page.performance.hero-card">' +
            '<div class="flex items-center justify-between mb-2">' +
            '<div class="flex items-center gap-2">' +
            iconBoxFn({
                icon: 'chart-simple',
                size: 'sm',
                className: 'bg-brand-light text-brand',
                dataRef: 'page.performance.hero-icon'
            }) +
            '<span class="fw-bold fs-6 text-gr1">Prayer Performance</span>' +
            '</div>' +
            '<span class="badge-pill-custom ' + heroBadgeClass + '" data-ref="page.performance.hero-badge">' +
            stats.totalPercentage + '% Completed' +
            '</span>' +
            '</div>' +

            '<div class="mt-2 mb-1">' +
            '<div class="text-muted small fw-semibold">Total Completed Prayers</div>' +
            '<div class="flex items-baseline gap-2 mt-0.5">' +
            '<span class="fw-bold display-4 text-brand lh-1" data-ref="page.performance.total-completed">' + stats.totalCompleted + '</span>' +
            '<span class="text-muted fs-6" data-ref="page.performance.total-possible">/ ' + stats.totalPossible + ' completed prayers</span>' +
            '</div>' +
            '</div>' +

            '<div class="progress w-100 my-2" style="height: 10px;">' +
            '<div class="progress-bar" role="progressbar" style="width: ' + stats.totalPercentage + '%;" aria-valuenow="' + stats.totalPercentage + '" aria-valuemin="0" aria-valuemax="100"></div>' +
            '</div>' +

            '<div class="flex items-center justify-between small text-muted pt-2 mt-1 border-top">' +
            '<div class="flex items-center gap-1 min-w-0 text-truncate">' +
            renderIconFn({ name: 'calendar', size: 'fs-xs', color: 'text-brand' }) +
            '<span class="text-truncate">From <strong>' + frFn(stats.startDate) + '</strong> to <strong>' + frFn(stats.endDate) + '</strong></span>' +
            '</div>' +
            '<span class="badge rounded-pill bg-brand-light text-brand px-2 py-0.5 fw-bold fs-xs shrink-0">' +
            stats.totalDays + (stats.totalDays === 1 ? ' Day' : ' Days') +
            '</span>' +
            '</div>' +
            '</div>' +

            '<!-- Summary Metrics Row -->' +
            '<div class="row g-2 mb-2" data-ref="page.performance.stats-row">' +
            '<div class="col-4">' +
            '<div class="p-2.5 rounded-3 text-center bg-white shadow-sm border-0 flex flex-col items-center" data-ref="page.performance.stat.completed-card">' +
            '<span class="text-muted fs-xs fw-bold text-uppercase">Completed</span>' +
            '<span class="fw-bold fs-4 text-brand lh-1 mt-1" data-ref="page.performance.stat.completed">' + stats.totalCompleted + '</span>' +
            '<span class="text-muted fs-xs mt-1">prayers</span>' +
            '</div>' +
            '</div>' +
            '<div class="col-4">' +
            '<div class="p-2.5 rounded-3 text-center bg-white shadow-sm border-0 flex flex-col items-center" data-ref="page.performance.stat.missed-card">' +
            '<span class="text-muted fs-xs fw-bold text-uppercase">Missed</span>' +
            '<span class="fw-bold fs-4 text-danger lh-1 mt-1" data-ref="page.performance.stat.missed">' + stats.totalMissed + '</span>' +
            '<span class="text-muted fs-xs mt-1">prayers</span>' +
            '</div>' +
            '</div>' +
            '<div class="col-4">' +
            '<div class="p-2.5 rounded-3 text-center bg-white shadow-sm border-0 flex flex-col items-center" data-ref="page.performance.stat.rate-card">' +
            '<span class="text-muted fs-xs fw-bold text-uppercase">Success</span>' +
            '<span class="fw-bold fs-4 text-gr-accent lh-1 mt-1" data-ref="page.performance.stat.rate">' + stats.totalPercentage + '%</span>' +
            '<span class="text-muted fs-xs mt-1">rate</span>' +
            '</div>' +
            '</div>' +
            '</div>' +

            '<!-- Individual Prayer Statistics -->' +
            '<div class="card shadow-sm rounded-4 p-3 mb-2 bg-gr border-0" data-ref="page.performance.breakdown-card">' +
            '<div class="flex items-center justify-between mb-3">' +
            '<div class="flex items-center gap-2">' +
            renderIconFn({ name: 'list-check', size: 'fs-5', color: 'text-brand' }) +
            '<strong class="text-gr1 fs-6">Individual Prayer Breakdown</strong>' +
            '</div>' +
            '<span class="text-muted fs-xs">' + stats.totalDays + (stats.totalDays === 1 ? ' day' : ' days') + ' tracked</span>' +
            '</div>' +
            '<div class="flex flex-col gap-2" data-ref="page.performance.breakdown-list">' +
            prayerRowsHtml +
            '</div>' +
            '</div>' +

            '<!-- Settings Start Date Footer Card -->' +
            '<div class="card rounded-4 p-3 bg-brand-light border-0 text-center" data-ref="page.performance.footer-card">' +
            '<div class="flex items-center justify-center gap-2 mb-1">' +
            renderIconFn({ name: 'calendar-check', color: 'text-brand' }) +
            '<span class="small fw-bold text-brand">Tracking Start Date: ' + frFn(stats.startDate) + '</span>' +
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
                icon: renderIconFn({ name: 'gear', className: 'me-1' }),
                dataAct: 'goto-settings',
                dataRef: 'page.performance.goto-settings-btn'
            }) +
            '</div>' +
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

