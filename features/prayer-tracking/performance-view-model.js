/* ============================================================
   Nur Prayer — Prayer Performance Feature Module
   Path: features/prayer-tracking/performance-view-model.js
   Responsibilities:
     - Calculates comprehensive prayer completion statistics
     - Updates circular progress ring, summary stat cards, and breakdown
     - Pure MVVM observables integration with TrackerPageViewModel
   ============================================================ */
'use strict';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

var PRAYER_NAMES = (_win.CONSTANTS && _win.CONSTANTS.PRAYER && _win.CONSTANTS.PRAYER.NAMES) ||
    _win.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/**
 * Calculate comprehensive prayer performance statistics from Settings start date to today.
 * @returns {Object} statistics object
 */
export function calculatePrayerPerformance() {
    var sdate = (typeof _win.rdSD === 'function' ? _win.rdSD() : null);
    var today = (typeof _win.td === 'function' ? _win.td() : new Date().toISOString().slice(0, 10));

    if (!sdate) sdate = today;
    if (sdate > today) sdate = today;

    var dates = typeof _win.datesInRange === 'function' ? _win.datesInRange(sdate, today) : [today];
    var totalDays = dates.length;
    var totalPossible = totalDays * PRAYER_NAMES.length;

    var curDb = typeof _win.rd === 'function' ? _win.rd() : {};
    var oldDb = typeof _win.rdOC === 'function' ? _win.rdOC() : {};

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
                var rt = typeof _win.gr === 'function' ? _win.gr(d) : {};
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
 * Render the Performance tab content into #performanceBody and update Knockout observables.
 */
export function renderPerformanceTab() {
    var body = typeof _win.$ === 'function' ? _win.$('performanceBody') : (_win.document ? _win.document.getElementById('performanceBody') : null);
    if (!body) return;

    var stats = calculatePrayerPerformance();
    var frFn = typeof _win.fr === 'function' ? _win.fr : function (d) { return d; };
    var renderIconFn = typeof _win.renderIcon === 'function' ? _win.renderIcon : function (opts) {
        var n = typeof opts === 'object' ? opts.name : opts;
        return '<app-icon params="name: \'' + n + '\'"></app-icon>';
    };
    var timings = _win.T || (_win.CONSTANTS && _win.CONSTANTS.PRAYER && _win.CONSTANTS.PRAYER.DEFAULT_TIMINGS) || {};

    // Update header subtitle if currently on performance tab
    var oldSub = typeof _win.$ === 'function' ? _win.$('oldSub') : (_win.document ? _win.document.getElementById('oldSub') : null);
    if (oldSub && typeof _win.trackerSubTab !== 'undefined' && _win.trackerSubTab === 'performance') {
        oldSub.classList.remove('d-none');
        oldSub.textContent = frFn(stats.startDate) + ' → ' + frFn(stats.endDate) + ' (' + stats.totalDays + (stats.totalDays === 1 ? ' day' : ' days') + ')';
    }

    // Update Knockout Performance ViewModel observables
    var vm = _win.trackerViewModel || (typeof _win.getTrackerViewModel === 'function' ? _win.getTrackerViewModel() : null);
    if (vm && vm.performance) {
        var perf = vm.performance;
        if (perf.hero) {
            if (typeof perf.hero.dashArray === 'function') perf.hero.dashArray(stats.totalPercentage + ', 100');
            if (typeof perf.hero.percentageText === 'function') perf.hero.percentageText(stats.totalPercentage + '%');
            if (typeof perf.hero.totalCompleted === 'function') perf.hero.totalCompleted(stats.totalCompleted);
            if (typeof perf.hero.totalPossible === 'function') perf.hero.totalPossible(stats.totalPossible);
            if (typeof perf.hero.datePillText === 'function') {
                perf.hero.datePillText(stats.totalDays + (stats.totalDays === 1 ? ' day' : ' days') + ' · ' + frFn(stats.startDate) + ' → ' + frFn(stats.endDate));
            }
        }
        if (perf.stats) {
            if (typeof perf.stats.completed === 'function') perf.stats.completed(stats.totalCompleted);
            if (typeof perf.stats.missed === 'function') perf.stats.missed(stats.totalMissed);
            if (typeof perf.stats.rate === 'function') perf.stats.rate(stats.totalPercentage + '%');
        }
        if (typeof perf.trackedDays === 'function') {
            perf.trackedDays(stats.totalDays + (stats.totalDays === 1 ? ' day' : ' days'));
        }
        if (typeof perf.footerLabel === 'function') {
            perf.footerLabel('Tracking Start Date: ' + frFn(stats.startDate));
        }
    }

    // Update DOM indicators
    if (_win.document) {
        var ringVal = _win.document.getElementById('perfRingVal');
        if (ringVal) ringVal.setAttribute('stroke-dasharray', stats.totalPercentage + ', 100');
        var heroPercentage = _win.document.getElementById('perfHeroPercentage');
        if (heroPercentage) heroPercentage.textContent = stats.totalPercentage + '%';
        var totalCompleted = _win.document.getElementById('perfTotalCompleted');
        if (totalCompleted) totalCompleted.textContent = stats.totalCompleted;
        var totalPossible = _win.document.getElementById('perfTotalPossible');
        if (totalPossible) totalPossible.textContent = ' / ' + stats.totalPossible;
        var datePill = _win.document.getElementById('perfDatePill');
        if (datePill) datePill.innerHTML = '<span class="font-bold mr-1">' + stats.totalDays + (stats.totalDays === 1 ? ' day' : ' days') + '</span> · ' + frFn(stats.startDate) + ' → ' + frFn(stats.endDate);

        var completedStat = _win.document.getElementById('perfCompletedStat');
        if (completedStat) completedStat.textContent = stats.totalCompleted;
        var missedStat = _win.document.getElementById('perfMissedStat');
        if (missedStat) {
            missedStat.textContent = stats.totalMissed;
            missedStat.className = 'font-bold text-xl mt-1.5 leading-none ' + (stats.totalMissed > 0 ? 'text-gr-danger' : 'text-brand');
        }
        var rateStat = _win.document.getElementById('perfRateStat');
        if (rateStat) rateStat.textContent = stats.totalPercentage + '%';
        var trackedDays = _win.document.getElementById('perfTrackedDays');
        if (trackedDays) trackedDays.textContent = stats.totalDays + (stats.totalDays === 1 ? ' day' : ' days');

        var filledCircleCheckSvg = '<app-icon params="name: \'circle-check\', customClass: \'shrink-0\', size: \'14px\'"></app-icon>';
        var prayerRowsHtml = PRAYER_NAMES.map(function (p) {
            var pLower = p.toLowerCase();
            var pStats = stats.perPrayer[p] || { completed: 0, missed: 0, total: stats.totalDays, percentage: 0 };
            var pIcon = renderIconFn({ name: pLower, size: 22, color: 'text-brand' });
            var pTime = timings[p] || (_win.CONSTANTS && _win.CONSTANTS.PRAYER && _win.CONSTANTS.PRAYER.DEFAULT_TIMINGS && _win.CONSTANTS.PRAYER.DEFAULT_TIMINGS[p]) || '--:--';
            var isPerfect = (pStats.missed === 0);

            var pctBadge = isPerfect
                ? '<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand" data-ref="page.performance.prayer.' + pLower + '.pct">' + pStats.percentage + '%</span>'
                : '<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-gr-dangerSoft text-gr-danger" data-ref="page.performance.prayer.' + pLower + '.pct">' + pStats.percentage + '%</span>';

            var progressBarHtml;
            if (isPerfect) {
                progressBarHtml =
                    '<div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">' +
                    '<div class="h-full bg-brand rounded-full" style="width: ' + pStats.percentage + '%;"></div>' +
                    '</div>';
            } else {
                var compW = pStats.percentage;
                var missW = Math.max(0, 100 - compW);
                progressBarHtml =
                    '<div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">' +
                    (compW > 0 ? '<div class="perf-bar-fill" style="width: ' + compW + '%; border-top-left-radius: 9999px; border-bottom-left-radius: 9999px;"></div>' : '') +
                    (missW > 0 ? '<div class="perf-bar-missed" style="width: ' + missW + '%; border-top-right-radius: 9999px; border-bottom-right-radius: 9999px;"></div>' : '') +
                    '</div>';
            }

            var completedStatusHtml =
                '<span class="flex items-center gap-1.5 text-brand fw-semibold text-nowrap lh-1">' +
                filledCircleCheckSvg +
                '<span>' + pStats.completed + ' Completed</span>' +
                '</span>';

            var missedStatusHtml = isPerfect
                ? '<span class="flex items-center gap-1.5 text-muted fw-medium text-nowrap lh-1">' +
                  renderIconFn({ name: 'circle-xmark', size: 14, className: 'shrink-0' }) +
                  '<span>0 Missed</span>' +
                  '</span>'
                : '<span class="flex items-center gap-1.5 text-danger fw-semibold text-nowrap lh-1">' +
                  renderIconFn({ name: 'circle-exclamation', size: 14, className: 'shrink-0' }) +
                  '<span>' + pStats.missed + ' Missed</span>' +
                  '</span>';

            return '<div class="rounded-2xl p-4 bg-white border border-borderGrey flex flex-col gap-3" data-ref="page.performance.prayer.' + pLower + '">' +
                '<div class="flex items-center justify-between">' +
                '<div class="flex items-center gap-2.5 min-w-0">' +
                '<div class="w-11 h-11 rounded-xl bg-brand-light text-brand flex items-center justify-center shrink-0" style="width: 44px; height: 44px;" data-ref="page.performance.prayer.' + pLower + '.icon">' +
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
                '<div class="flex items-center gap-2 shrink-0">' +
                '<span class="fs-sm fw-bold text-gr1 lh-1" data-ref="page.performance.prayer.' + pLower + '.count">' +
                pStats.completed + ' <span class="text-muted fw-normal">/ ' + stats.totalDays + '</span>' +
                '</span>' +
                pctBadge +
                '</div>' +
                '</div>' +
                progressBarHtml +
                '<div class="flex items-center justify-between fs-xs">' +
                completedStatusHtml +
                missedStatusHtml +
                '</div>' +
                '</div>';
        }).join('');

        var breakdownList = _win.document.getElementById('perfBreakdownList');
        if (breakdownList) breakdownList.innerHTML = prayerRowsHtml;

        var footerLabel = _win.document.getElementById('perfFooterLabel');
        if (footerLabel) footerLabel.textContent = 'Tracking Start Date: ' + frFn(stats.startDate);
        var footerDesc = _win.document.getElementById('perfFooterDesc');
        if (footerDesc) footerDesc.textContent = 'Calculated from your start date configured in Settings up to today (' + frFn(stats.endDate) + ').';
    }
}

/**
 * Updates the performance view if the tab or body is currently active/visible.
 */
export function updatePerformanceTab() {
    var body = typeof _win.$ === 'function' ? _win.$('performanceBody') : (_win.document ? _win.document.getElementById('performanceBody') : null);
    if (body && (!body.classList.contains('d-none') || (typeof _win.trackerSubTab !== 'undefined' && _win.trackerSubTab === 'performance'))) {
        renderPerformanceTab();
    }
}

if (typeof window !== 'undefined') {
    window.calculatePrayerPerformance = calculatePrayerPerformance;
    window.renderPerformanceTab = renderPerformanceTab;
    window.updatePerformanceTab = updatePerformanceTab;
}

