/* ============================================================
   Nur Prayer — Dashboard Feature Module & Components
   Path: dashboard/dashboard.js
   Matches the Reference UI Layout & Styling Pixel-Perfect
   ============================================================ */
'use strict';

function dashLiveHeaderTime() {
    var now = new Date();
    var h = now.getHours();
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12;
    if (hh === 0) hh = 12;
    return pad2(hh) + ':' + pad2(now.getMinutes()) + ' ' + ap;
}

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

var dashCurrentActivePrayer = null;
var dashLastCheckedDate = typeof td === 'function' ? td() : null;

/* ---------- Dashboard Constants (Referenced from utilities/dashboard-constants.js) ---------- */
var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var DASH_CONSTANTS = _win.DASHBOARD_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.DASHBOARD) || {};
var PRAYER_CONSTANTS = _win.PRAYER_CONSTANTS || (_win.CONSTANTS && _win.CONSTANTS.PRAYER) || {};
var DASH_STATUSES = DASH_CONSTANTS.STATUSES || { ACTIVE: 'active', PASSED: 'passed', NEXT: 'next', UPCOMING: 'upcoming' };
var DASH_STATUS_BADGES = DASH_CONSTANTS.STATUS_BADGES || {
    active: { className: 'badge-active', text: 'Active' },
    passed: { className: 'badge-passed', text: 'Passed' },
    next: { className: 'badge-next', text: 'Next' },
    upcoming: { className: 'badge-upcoming', text: 'Upcoming' }
};
var DASH_CLOCK_INTERVAL = DASH_CONSTANTS.CLOCK_INTERVAL_MS || 1000;
var SCHOOL_NAMES = PRAYER_CONSTANTS.SCHOOL_NAMES || { 1: 'Hanafi', 0: 'Shafi' };
var dashTimer = null;

/* ---------- Dashboard Component Templates ---------- */
export const DashboardHeaderTemplate = { element: 'dashboard-header-template', file: 'dashboard/templates/dashboard-header.html' };
export const DashboardClockTemplate = { element: 'dashboard-clock-template', file: 'dashboard/templates/dashboard-clock.html' };
export const DashboardTimelineItemTemplate = { element: 'dashboard-timeline-item-template', file: 'dashboard/templates/dashboard-timeline-item.html' };
export const DashboardTimelineTemplate = { element: 'dashboard-timeline-template', file: 'dashboard/templates/dashboard-timeline.html' };
export const DashboardNavCardTemplate = { element: 'dashboard-nav-card-template', file: 'dashboard/templates/dashboard-nav-card.html' };
export const DashboardDividerTemplate = { element: 'dashboard-divider-template', file: 'dashboard/templates/dashboard-divider.html' };
export const DashboardPageTemplate = { element: 'dashboard-page-template', file: 'dashboard/dashboard.html' };

/* ---------- Register Dashboard Knockout Components ---------- */
export function registerDashboardComponents(customKo) {
    var k = customKo || (typeof ko !== 'undefined' ? ko : (typeof window !== 'undefined' ? window.ko : null));
    if (!k || !k.components) return;

    if (!k.components.isRegistered('dashboard-header')) {
        k.components.register('dashboard-header', {
            viewModel: function (params) { return params || {}; },
            template: DashboardHeaderTemplate
        });
    }

    if (!k.components.isRegistered('dashboard-clock')) {
        k.components.register('dashboard-clock', {
            viewModel: function (params) { return params || {}; },
            template: DashboardClockTemplate
        });
    }

    if (!k.components.isRegistered('dashboard-timeline-item')) {
        k.components.register('dashboard-timeline-item', {
            viewModel: function (params) { return params || {}; },
            template: DashboardTimelineItemTemplate
        });
    }

    if (!k.components.isRegistered('dashboard-timeline')) {
        k.components.register('dashboard-timeline', {
            viewModel: function (params) { return params || {}; },
            template: DashboardTimelineTemplate
        });
    }

    if (!k.components.isRegistered('dashboard-nav-card')) {
        k.components.register('dashboard-nav-card', {
            viewModel: function (params) { return params || {}; },
            template: DashboardNavCardTemplate
        });
    }

    if (!k.components.isRegistered('dashboard-divider')) {
        k.components.register('dashboard-divider', {
            viewModel: function (params) { return params || {}; },
            template: DashboardDividerTemplate
        });
    }

    if (!k.components.isRegistered('dashboard-page')) {
        k.components.register('dashboard-page', {
            viewModel: function (params) {
                return (params && params.viewModel) ? params.viewModel : getDashboardViewModel();
            },
            template: DashboardPageTemplate
        });
    }
}

/* ---------- Dashboard ViewModel ---------- */
var dashboardViewModel = null;

export function getDashboardViewModel() {
    if (!dashboardViewModel && typeof DashboardViewModel === 'function') {
        dashboardViewModel = new DashboardViewModel();
    }
    return dashboardViewModel;
}

export function DashboardViewModel() {
    var self = this;

    var cfg = typeof getPrayerConfig === 'function' ? getPrayerConfig() : { city: 'Guntur', school: 1 };
    var initialLocationText = (cfg.city || 'Guntur') + ' &bull; ' + (SCHOOL_NAMES[cfg.school] || 'Hanafi');

    self.header = {
        locationText: ko.observable(initialLocationText)
    };

    self.clock = {
        digits: ko.observable('--:--:--'),
        ampm: ko.observable('--')
    };

    var timelineIcons = {
        Fajr: 'fa-solid fa-cloud-sun',
        Dhuhr: 'fa-solid fa-sun',
        Asr: 'fa-solid fa-sun',
        Maghrib: 'fa-solid fa-cloud-sun',
        Isha: 'fa-solid fa-moon'
    };

    var prayerItems = (window.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']).map(function (p) {
        return {
            name: p,
            iconClass: timelineIcons[p] || 'fa-solid fa-mosque',
            time: ko.observable((window.T && window.T[p]) || '--:--'),
            statusText: ko.observable('Upcoming'),
            statusBadgeClass: ko.observable('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200'),
            isActive: ko.observable(false)
        };
    });

    self.timeline = {
        title: 'Daily Prayer Timeline',
        items: ko.observableArray(prayerItems)
    };

    var missedCount = (typeof getConsolidatedMissedCount === 'function')
        ? getConsolidatedMissedCount()
        : (typeof tMT === 'function' ? tMT() : 0);

    var trackerBadgeVisible = ko.observable(missedCount > 0);
    var trackerBadgeText = ko.observable(missedCount > 0 ? (missedCount + ' missed') : '');

    self.navCards = [
        {
            title: 'Tracker',
            action: 'goto-tracker',
            iconClass: 'fa-solid fa-calendar-check',
            dataRef: 'page.dashboard.card.tracker',
            iconDataRef: 'page.dashboard.card.tracker-icon',
            titleDataRef: 'page.dashboard.card.tracker-label',
            hasBadge: true,
            badgeId: 'trackerMissedBadge',
            badgeDataRef: 'page.dashboard.card.tracker-missed-badge',
            badgeText: trackerBadgeText,
            badgeVisible: trackerBadgeVisible,
            onClick: function (d, e) {
                if (e && e.stopPropagation) e.stopPropagation();
                if (typeof showPage === 'function') showPage('tracker');
            }
        },
        {
            title: 'Tasbeeh',
            action: 'goto-tasbeeh',
            iconClass: 'fa-solid fa-hands-praying',
            dataRef: 'page.dashboard.card.tasbeeh',
            iconDataRef: 'page.dashboard.card.tasbeeh-icon',
            titleDataRef: 'page.dashboard.card.tasbeeh-label',
            hasBadge: false,
            onClick: function (d, e) {
                if (e && e.stopPropagation) e.stopPropagation();
                if (typeof showPage === 'function') showPage('tasbeeh');
            }
        },
        {
            title: 'Duas',
            action: 'goto-duas',
            iconClass: 'fa-solid fa-hands-praying',
            dataRef: 'page.dashboard.card.duas',
            iconDataRef: 'page.dashboard.card.duas-icon',
            titleDataRef: 'page.dashboard.card.duas-label',
            hasBadge: false,
            onClick: function (d, e) {
                if (e && e.stopPropagation) e.stopPropagation();
                if (typeof showPage === 'function') showPage('duas');
            }
        },
        {
            title: 'Settings',
            action: 'goto-settings',
            iconClass: 'fa-solid fa-gear',
            dataRef: 'page.dashboard.card.settings',
            iconDataRef: 'page.dashboard.card.settings-icon',
            titleDataRef: 'page.dashboard.card.settings-label',
            hasBadge: false,
            onClick: function (d, e) {
                if (e && e.stopPropagation) e.stopPropagation();
                if (typeof showPage === 'function') showPage('settings');
            }
        }
    ];

    self.updateClock = function () {
        var now = new Date();
        var h = now.getHours();
        var ap = h >= 12 ? 'PM' : 'AM';
        var hh = h % 12;
        if (hh === 0) hh = 12;
        self.clock.digits(pad2(hh) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds()));
        self.clock.ampm(ap);
    };

    self.updateTimeline = function () {
        var statuses = getTimelinePrayerStatuses();
        self.timeline.items().forEach(function (item) {
            var p = item.name;
            var st = statuses[p] || DASH_STATUSES.UPCOMING;
            var isActive = (st === DASH_STATUSES.ACTIVE);
            var badgeInfo = DASH_STATUS_BADGES[st] || DASH_STATUS_BADGES[DASH_STATUSES.UPCOMING];

            item.time((window.T && window.T[p]) || '--:--');
            item.statusText(badgeInfo.text);
            item.statusBadgeClass('dash-timeline-badge ' + badgeInfo.className);
            item.isActive(isActive);
        });
    };

    self.updateTrackerBadge = function () {
        var totalMissed = typeof getConsolidatedMissedCount === 'function'
            ? getConsolidatedMissedCount()
            : (typeof tMT === 'function' ? tMT() : 0);
        trackerBadgeVisible(totalMissed > 0);
        trackerBadgeText(totalMissed > 0 ? (totalMissed + ' missed') : '');
    };
}

/* ---------- Dashboard Clock & Lifecycle ---------- */
function dashTick() {
    var curDate = typeof td === 'function' ? td() : null;
    if (curDate && dashLastCheckedDate && curDate !== dashLastCheckedDate) {
        dashLastCheckedDate = curDate;
        if (typeof ensureCurrentDateInitialized === 'function') {
            ensureCurrentDateInitialized();
        }
        if (typeof refreshPrayerTimesUI === 'function') {
            refreshPrayerTimesUI(curDate);
        }
    } else if (curDate && !dashLastCheckedDate) {
        dashLastCheckedDate = curDate;
    }

    if (dashboardViewModel) {
        dashboardViewModel.updateClock();
    } else {
        var digitsEl = $('dashClockDigits');
        var ampmEl = $('dashClockAmPm');
        if (digitsEl && ampmEl) {
            var now = new Date();
            var h = now.getHours();
            var ap = h >= 12 ? 'PM' : 'AM';
            var hh = h % 12;
            if (hh === 0) hh = 12;
            digitsEl.textContent = pad2(hh) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
            ampmEl.textContent = ap;
        }
    }

    var liveTimeEl = $('dashLiveTime');
    if (liveTimeEl) {
        liveTimeEl.textContent = dashLiveHeaderTime();
    }

    if (dashboardViewModel) {
        dashboardViewModel.updateTrackerBadge();
    } else {
        var trackerBadgeEl = document.getElementById('trackerMissedBadge');
        if (trackerBadgeEl && typeof getConsolidatedMissedCount === 'function') {
            var tm = getConsolidatedMissedCount();
            if (tm > 0) {
                trackerBadgeEl.className = 'dash-tracker-badge dash-tracker-badge-missed';
                trackerBadgeEl.textContent = tm + ' missed';
            } else {
                trackerBadgeEl.className = 'dash-tracker-badge dash-tracker-badge-missed d-none';
                trackerBadgeEl.textContent = '';
            }
        }
    }

    if (typeof getActivePrayerInfo === 'function') {
        var curActive = getActivePrayerInfo();
        if (dashCurrentActivePrayer && curActive && curActive.name !== dashCurrentActivePrayer) {
            rDashboard();
            return;
        }
    }
}

function startDashClock() {
    if (dashTimer) clearInterval(dashTimer);
    dashTick();
    dashTimer = setInterval(dashTick, DASH_CLOCK_INTERVAL);
}

/* ---------- Timeline Prayer Statuses ---------- */
function getTimelinePrayerStatuses() {
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();

    var fajrMin = parseTimeToMin(T.Fajr);
    var dhuhrMin = parseTimeToMin(T.Dhuhr);
    var asrMin = parseTimeToMin(T.Asr);
    var maghribMin = parseTimeToMin(T.Maghrib);
    var ishaMin = parseTimeToMin(T.Isha);

    var statuses = {};

    if (nowMin >= ishaMin || nowMin < fajrMin) {
        statuses.Fajr = nowMin >= ishaMin ? DASH_STATUSES.PASSED : DASH_STATUSES.UPCOMING;
        statuses.Dhuhr = nowMin >= ishaMin ? DASH_STATUSES.PASSED : DASH_STATUSES.UPCOMING;
        statuses.Asr = nowMin >= ishaMin ? DASH_STATUSES.PASSED : DASH_STATUSES.UPCOMING;
        statuses.Maghrib = nowMin >= ishaMin ? DASH_STATUSES.PASSED : DASH_STATUSES.UPCOMING;
        statuses.Isha = DASH_STATUSES.ACTIVE;
    } else if (nowMin >= maghribMin && nowMin < ishaMin) {
        statuses.Fajr = DASH_STATUSES.PASSED;
        statuses.Dhuhr = DASH_STATUSES.PASSED;
        statuses.Asr = DASH_STATUSES.PASSED;
        statuses.Maghrib = DASH_STATUSES.ACTIVE;
        statuses.Isha = DASH_STATUSES.NEXT;
    } else if (nowMin >= asrMin && nowMin < maghribMin) {
        statuses.Fajr = DASH_STATUSES.PASSED;
        statuses.Dhuhr = DASH_STATUSES.PASSED;
        statuses.Asr = DASH_STATUSES.ACTIVE;
        statuses.Maghrib = DASH_STATUSES.NEXT;
        statuses.Isha = DASH_STATUSES.UPCOMING;
    } else if (nowMin >= dhuhrMin && nowMin < asrMin) {
        statuses.Fajr = DASH_STATUSES.PASSED;
        statuses.Dhuhr = DASH_STATUSES.ACTIVE;
        statuses.Asr = DASH_STATUSES.NEXT;
        statuses.Maghrib = DASH_STATUSES.UPCOMING;
        statuses.Isha = DASH_STATUSES.UPCOMING;
    } else {
        statuses.Fajr = DASH_STATUSES.ACTIVE;
        statuses.Dhuhr = DASH_STATUSES.NEXT;
        statuses.Asr = DASH_STATUSES.UPCOMING;
        statuses.Maghrib = DASH_STATUSES.UPCOMING;
        statuses.Isha = DASH_STATUSES.UPCOMING;
    }

    return statuses;
}

function getActivePrayerInfo() {
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var fajrMin = parseTimeToMin(T.Fajr);
    var statuses = getTimelinePrayerStatuses();
    var activeName = 'Fajr';
    for (var i = 0; i < P.length; i++) {
        if (statuses[P[i]] === 'active') {
            activeName = P[i];
            break;
        }
    }
    return {
        name: activeName,
        time: T[activeName] || '--:--',
        isYesterday: (activeName === 'Isha' && nowMin < fajrMin)
    };
}

/* ---------- Dashboard Render ---------- */
function rDashboard() {
    var activeP = typeof getActivePrayerInfo === 'function' ? getActivePrayerInfo() : {
        name: 'Fajr',
        time: T.Fajr,
        isYesterday: false
    };
    dashCurrentActivePrayer = activeP.name;

    var cfg = typeof getPrayerConfig === 'function' ? getPrayerConfig() : { city: 'Guntur', school: 1 };
    var locText = cfg.city + ' &bull; ' + (SCHOOL_NAMES[cfg.school] || 'Hanafi');

    if (!dashboardViewModel && typeof initDashboard === 'function') {
        initDashboard();
    }

    if (dashboardViewModel) {
        dashboardViewModel.header.locationText(locText);
        dashboardViewModel.updateTimeline();
        dashboardViewModel.updateTrackerBadge();
    }

    var locEl = $('dashLocationText');
    if (locEl) {
        locEl.innerHTML = locText;
    }

    var statuses = getTimelinePrayerStatuses();
    P.forEach(function (p) {
        var st = statuses[p] || DASH_STATUSES.UPCOMING;
        var isActive = st === DASH_STATUSES.ACTIVE;

        var timeEl = $('dashTime' + p);
        if (timeEl) {
            timeEl.textContent = T[p] || '--:--';
        }

        var badgeEl = $('dashBadge' + p);
        if (badgeEl) {
            var badgeInfo = DASH_STATUS_BADGES[st] || DASH_STATUS_BADGES[DASH_STATUSES.UPCOMING];
            badgeEl.className = 'dash-timeline-badge ' + badgeInfo.className;
            badgeEl.textContent = badgeInfo.text;
        }

        var iconBox = $('dashIconBox' + p);
        if (iconBox) {
            if (isActive) {
                iconBox.classList.add('icon-box-active');
            } else {
                iconBox.classList.remove('icon-box-active');
            }
        }
    });

    var totalMissed = typeof getConsolidatedMissedCount === 'function'
        ? getConsolidatedMissedCount()
        : (typeof tMT === 'function' ? tMT() : 0);
    var hasMissed = totalMissed > 0;
    var trackerBadgeEl = $('trackerMissedBadge');
    if (trackerBadgeEl) {
        if (hasMissed) {
            trackerBadgeEl.className = 'dash-tracker-badge dash-tracker-badge-missed';
            trackerBadgeEl.textContent = totalMissed + ' missed';
        } else {
            trackerBadgeEl.className = 'dash-tracker-badge dash-tracker-badge-missed d-none';
            trackerBadgeEl.textContent = '';
        }
    }

    startDashClock();
}

export function initDashboard() {
    registerDashboardComponents();
    var el = document.getElementById('dashboardPage');
    if (el && typeof ko !== 'undefined') {
        var vm = getDashboardViewModel();
        if (!ko.dataFor(el)) {
            ko.applyBindings(vm, el);
        }
    }
}

export { rDashboard, dashboardViewModel };

const DashboardApp = {
    init: initDashboard,
    render: rDashboard,
    registerComponents: registerDashboardComponents,
    getViewModel: getDashboardViewModel
};

if (typeof window !== 'undefined') {
    window.DashboardApp = DashboardApp;
    window.rDashboard = rDashboard;
    window.initDashboard = initDashboard;
    window.startDashClock = startDashClock;
    window.dashTick = dashTick;
    window.getTimelinePrayerStatuses = getTimelinePrayerStatuses;
    window.getActivePrayerInfo = getActivePrayerInfo;
    window.DashboardViewModel = DashboardViewModel;
    window.getDashboardViewModel = getDashboardViewModel;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initDashboard: initDashboard,
        rDashboard: rDashboard,
        registerDashboardComponents: registerDashboardComponents,
        DashboardViewModel: DashboardViewModel,
        getDashboardViewModel: getDashboardViewModel
    };
    module.exports.default = DashboardApp;
}

export default DashboardApp;

