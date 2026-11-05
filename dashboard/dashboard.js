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

function dashBigTimeHtml() {
    var now = new Date();
    var h = now.getHours();
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12;
    if (hh === 0) hh = 12;
    return '<span class="dash-clock-digits">' + pad2(hh) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds()) + '</span>' +
        '<span class="dash-clock-ampm">' + ap + '</span>';
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

/* ---------- Dashboard Constants ---------- */
var DASH_CONSTANTS = (window.CONSTANTS && window.CONSTANTS.DASHBOARD) || {};
var DASH_STATUSES = DASH_CONSTANTS.STATUSES || { ACTIVE: 'active', PASSED: 'passed', NEXT: 'next', UPCOMING: 'upcoming' };
var DASH_STATUS_BADGES = DASH_CONSTANTS.STATUS_BADGES || {
    active: { className: 'badge-active', text: 'Active' },
    passed: { className: 'badge-passed', text: 'Passed' },
    next: { className: 'badge-next', text: 'Next' },
    upcoming: { className: 'badge-upcoming', text: 'Upcoming' }
};
var DASH_CLOCK_INTERVAL = DASH_CONSTANTS.CLOCK_INTERVAL_MS || 1000;
var SCHOOL_NAMES = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.SCHOOL_NAMES) || { 1: 'Hanafi', 0: 'Shafi' };
var dashTimer = null;

/* ---------- Embedded Component Templates ---------- */
var DASHBOARD_TEMPLATES = {
    'dashboard-header':
        '<header class="flex items-center justify-between text-brand text-xs font-semibold py-1 z-10" data-ref="page.dashboard.header">' +
            '<div class="flex items-center gap-1.5 text-xs text-brand font-medium" data-ref="page.dashboard.header.location">' +
                '<i class="fa-solid fa-location-dot text-brand text-sm" data-ref="page.dashboard.header.location-icon"></i>' +
                '<span id="dashLocationText" data-ref="page.dashboard.header.location-text" data-bind="html: locationText">Guntur &bull; Hanafi</span>' +
            '</div>' +
            '<div class="w-8 h-8 rounded-full bg-dash-mintBg text-brand flex items-center justify-center text-sm" data-ref="page.dashboard.header.mosque-icon">' +
                '<i class="fa-solid fa-mosque"></i>' +
            '</div>' +
        '</header>',

    'dashboard-clock':
        '<div class="dash-clock-card bg-white rounded-2xl p-4 border border-borderGrey flex items-center justify-between shadow-none relative overflow-hidden min-h-[96px]" data-ref="page.dashboard.clock-card">' +
            '<div class="text-2xl text-brand/30" data-ref="page.dashboard.clock-card.left-icon">' +
                '<i class="fa-solid fa-mosque"></i>' +
            '</div>' +
            '<div class="dash-clock-wrap flex items-baseline justify-center" id="dashTime" data-ref="page.dashboard.clock-card.time">' +
                '<span class="text-3xl font-bold tracking-tight text-brand font-mono" id="dashClockDigits" data-bind="text: digits">--:--:--</span>' +
                '<span class="text-sm font-bold uppercase ml-1.5 text-brand" id="dashClockAmPm" data-bind="text: ampm">--</span>' +
            '</div>' +
            '<div class="text-2xl text-brand/30" data-ref="page.dashboard.clock-card.right-icon">' +
                '<i class="fa-solid fa-star-and-crescent"></i>' +
            '</div>' +
        '</div>',

    'dashboard-timeline-item':
        '<div class="flex-1 flex flex-col items-center gap-1.5 text-center min-w-0" data-bind="attr: { id: \'dashTimeline\' + name, \'data-ref\': \'page.dashboard.timeline.item.\' + name.toLowerCase() }">' +
            '<div class="icon-box icon-box-md" data-bind="attr: { id: \'dashIconBox\' + name, \'data-ref\': \'page.dashboard.timeline.icon.\' + name.toLowerCase() }, css: { \'icon-box-active\': isActive }">' +
                '<i data-bind="attr: { class: iconClass }"></i>' +
            '</div>' +
            '<div class="text-xs font-bold text-brand mt-1 truncate" data-bind="text: name, attr: { \'data-ref\': \'page.dashboard.timeline.name.\' + name.toLowerCase() }"></div>' +
            '<div class="text-[11px] text-gr-text font-medium" data-bind="text: time, attr: { id: \'dashTime\' + name, \'data-ref\': \'page.dashboard.timeline.time.\' + name.toLowerCase() }">--:--</div>' +
            '<span class="dash-timeline-badge text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" data-bind="text: statusText, attr: { id: \'dashBadge\' + name, \'data-ref\': \'page.dashboard.timeline.badge.\' + name.toLowerCase() }, css: statusBadgeClass">Upcoming</span>' +
        '</div>',

    'dashboard-timeline':
        '<div class="dash-timeline-card bg-white rounded-2xl p-4 border border-borderGrey flex flex-col gap-3 shadow-none" data-ref="page.dashboard.timeline-card">' +
            '<div class="flex items-center justify-between gap-2" data-ref="page.dashboard.timeline.header">' +
                '<span class="text-xs font-bold uppercase tracking-wider text-brand" data-ref="page.dashboard.timeline.title" data-bind="text: title || \'Daily Prayer Timeline\'">Daily Prayer Timeline</span>' +
                '<div class="h-[1px] bg-borderGrey flex-1" data-ref="page.dashboard.timeline.line"></div>' +
                '<div class="w-6 h-6 rounded-full bg-dash-mintBg text-brand flex items-center justify-center text-xs shrink-0" title="Daily Prayers" aria-hidden="true" data-ref="page.dashboard.timeline.alarm-icon">' +
                    '<i class="fa-solid fa-bell"></i>' +
                '</div>' +
            '</div>' +
            '<div class="flex justify-between items-stretch gap-1 w-full" id="dashTimelineNodes" data-ref="page.dashboard.timeline.nodes" data-bind="template: { name: \'dashboard-timeline-item-template\', foreach: items }">' +
            '</div>' +
        '</div>',

    'dashboard-nav-card':
        '<div class="dash-nav-card bg-white border border-borderGrey rounded-2xl p-4 flex flex-col items-center justify-between cursor-pointer hover:border-brand hover:shadow-sm transition-all min-h-[120px] relative shadow-none" role="button" tabindex="0" data-bind="attr: { \'data-act\': action, \'data-ref\': dataRef }">' +
            '<!-- ko if: hasBadge -->' +
            '<span class="dash-tracker-badge absolute top-2.5 right-2.5 text-[10.5px] font-bold leading-none px-2 py-0.5 rounded-full inline-flex items-center justify-center whitespace-nowrap z-[3] pointer-events-none bg-red-100 text-red-600 border border-red-300" data-bind="text: badgeText, attr: { id: badgeId, \'data-ref\': badgeDataRef }, css: { \'d-none\': !badgeVisible() }"></span>' +
            '<!-- /ko -->' +
            '<div class="icon-box icon-box-lg" data-bind="attr: { \'data-ref\': iconDataRef }">' +
                '<i data-bind="attr: { class: iconClass }"></i>' +
            '</div>' +
            '<div class="flex items-center justify-center gap-1 text-xs font-bold text-brand mt-2">' +
                '<span class="text-xs font-bold text-brand" data-bind="text: title, attr: { \'data-ref\': titleDataRef }"></span>' +
                '<i class="fa-solid fa-chevron-right"></i>' +
            '</div>' +
        '</div>',

    'dashboard-divider':
        '<div class="flex items-center justify-center gap-2 py-3 w-full text-brand/30" data-ref="page.dashboard.bottom-divider">' +
            '<div class="h-[1px] bg-borderGrey flex-1"></div>' +
            '<div class="text-xs text-brand/40 px-2"><i class="fa-solid fa-star-and-crescent"></i></div>' +
            '<div class="h-[1px] bg-borderGrey flex-1"></div>' +
        '</div>',

    'dashboard-page':
        '<div id="dashboardPage" class="flex flex-col grow page">' +
            '<div class="grow overflow-auto p-0 relative" id="dashScroll">' +
                '<div id="dashBody">' +
                    '<div class="p-2.5 pt-2 pb-3 relative flex flex-col gap-3.5 w-full min-h-full box-border" data-ref="page.dashboard.container">' +
                        '<div class="absolute top-0 left-0 right-0 h-[220px] pointer-events-none opacity-20 z-0 flex justify-between p-4" aria-hidden="true">' +
                            '<i class="fa-solid fa-star-and-crescent" style="opacity: 0.15; font-size: 1.5rem;"></i>' +
                            '<i class="fa-solid fa-star-and-crescent" style="opacity: 0.15; font-size: 1.5rem;"></i>' +
                        '</div>' +
                        '<!-- ko component: { name: \'dashboard-header\', params: header } --><!-- /ko -->' +
                        '<!-- ko component: { name: \'dashboard-clock\', params: clock } --><!-- /ko -->' +
                        '<!-- ko component: { name: \'dashboard-timeline\', params: timeline } --><!-- /ko -->' +
                        '<div class="grid grid-cols-2 gap-3 w-full" data-ref="page.dashboard.nav-grid" data-bind="template: { name: \'dashboard-nav-card-template\', foreach: navCards }"></div>' +
                        '<!-- ko component: { name: \'dashboard-divider\', params: {} } --><!-- /ko -->' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>'
};

/* ---------- Register Dashboard Knockout Components ---------- */
function registerDashboardComponents() {
    if (typeof ko === 'undefined' || !ko.components) return;

    function ensureScriptTemplate(id, html) {
        if (!document.getElementById(id)) {
            var script = document.createElement('script');
            script.type = 'text/html';
            script.id = id;
            script.text = html;
            document.head.appendChild(script);
        }
    }

    ensureScriptTemplate('dashboard-header-template', DASHBOARD_TEMPLATES['dashboard-header']);
    ensureScriptTemplate('dashboard-clock-template', DASHBOARD_TEMPLATES['dashboard-clock']);
    ensureScriptTemplate('dashboard-timeline-item-template', DASHBOARD_TEMPLATES['dashboard-timeline-item']);
    ensureScriptTemplate('dashboard-timeline-template', DASHBOARD_TEMPLATES['dashboard-timeline']);
    ensureScriptTemplate('dashboard-nav-card-template', DASHBOARD_TEMPLATES['dashboard-nav-card']);
    ensureScriptTemplate('dashboard-divider-template', DASHBOARD_TEMPLATES['dashboard-divider']);

    if (!ko.components.isRegistered('dashboard-header')) {
        ko.components.register('dashboard-header', {
            viewModel: function (params) { return params || {}; },
            template: DASHBOARD_TEMPLATES['dashboard-header']
        });
    }

    if (!ko.components.isRegistered('dashboard-clock')) {
        ko.components.register('dashboard-clock', {
            viewModel: function (params) { return params || {}; },
            template: DASHBOARD_TEMPLATES['dashboard-clock']
        });
    }

    if (!ko.components.isRegistered('dashboard-timeline-item')) {
        ko.components.register('dashboard-timeline-item', {
            viewModel: function (params) { return params || {}; },
            template: DASHBOARD_TEMPLATES['dashboard-timeline-item']
        });
    }

    if (!ko.components.isRegistered('dashboard-timeline')) {
        ko.components.register('dashboard-timeline', {
            viewModel: function (params) { return params || {}; },
            template: DASHBOARD_TEMPLATES['dashboard-timeline']
        });
    }

    if (!ko.components.isRegistered('dashboard-nav-card')) {
        ko.components.register('dashboard-nav-card', {
            viewModel: function (params) { return params || {}; },
            template: DASHBOARD_TEMPLATES['dashboard-nav-card']
        });
    }

    if (!ko.components.isRegistered('dashboard-divider')) {
        ko.components.register('dashboard-divider', {
            viewModel: function (params) { return params || {}; },
            template: DASHBOARD_TEMPLATES['dashboard-divider']
        });
    }

    if (!ko.components.isRegistered('dashboard-page')) {
        ko.components.register('dashboard-page', {
            viewModel: function (params) {
                return (params && params.viewModel) ? params.viewModel : (dashboardViewModel || params);
            },
            template: DASHBOARD_TEMPLATES['dashboard-page']
        });
    }
}

/* ---------- Dashboard ViewModel ---------- */
var dashboardViewModel = null;

function DashboardViewModel() {
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
            badgeVisible: trackerBadgeVisible
        },
        {
            title: 'Tasbeeh',
            action: 'goto-tasbeeh',
            iconClass: 'fa-solid fa-hands-praying',
            dataRef: 'page.dashboard.card.tasbeeh',
            iconDataRef: 'page.dashboard.card.tasbeeh-icon',
            titleDataRef: 'page.dashboard.card.tasbeeh-label',
            hasBadge: false
        },
        {
            title: 'Duas',
            action: 'goto-duas',
            iconClass: 'fa-solid fa-hands-praying',
            dataRef: 'page.dashboard.card.duas',
            iconDataRef: 'page.dashboard.card.duas-icon',
            titleDataRef: 'page.dashboard.card.duas-label',
            hasBadge: false
        },
        {
            title: 'Settings',
            action: 'goto-settings',
            iconClass: 'fa-solid fa-gear',
            dataRef: 'page.dashboard.card.settings',
            iconDataRef: 'page.dashboard.card.settings-icon',
            titleDataRef: 'page.dashboard.card.settings-label',
            hasBadge: false
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

function initDashboard() {
    registerDashboardComponents();
    var el = document.getElementById('dashboardPage');
    if (el && !dashboardViewModel && typeof ko !== 'undefined') {
        dashboardViewModel = new DashboardViewModel();
        ko.applyBindings(dashboardViewModel, el);
    }
}

if (typeof window !== 'undefined') {
    window.DashboardApp = {
        init: initDashboard,
        render: rDashboard,
        registerComponents: registerDashboardComponents
    };
    window.rDashboard = rDashboard;
    window.startDashClock = startDashClock;
    window.dashTick = dashTick;
    window.getTimelinePrayerStatuses = getTimelinePrayerStatuses;
    window.getActivePrayerInfo = getActivePrayerInfo;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initDashboard: initDashboard,
        rDashboard: rDashboard,
        registerDashboardComponents: registerDashboardComponents
    };
}

