/* ============================================================
   Nur Prayer — Dashboard Feature Module & Root ViewModel
   Path: features/dashboard/dashboard.js
   Responsibilities:
     - Root ViewModel orchestrating sub-viewmodels (clock, timeline, featuresGrid)
     - Feature coordinator and lifecycle (initDashboard, rDashboard)
     - Centralizes DashboardApp facade interface
     - Defines Dashboard mobile view and page templates
     - Re-exports all submodules, templates, services, and registration
   ============================================================ */
'use strict';

import {
    DashboardService,
    DASH_STATUSES,
    DASH_STATUS_BADGES,
    getLocationInfo,
    getMissedPrayerCount,
    getTimelinePrayerStatuses,
    getActivePrayerInfo,
    startDashClock,
    setDashCurrentActivePrayer
} from './dashboard-service.js';

import {
    DashboardClockTemplate,
    DashboardClockViewModel
} from './components/dashboard-clock/dashboard-clock.js';

import {
    DashboardTimelineTemplate,
    DashboardTimelineViewModel
} from './components/dashboard-timeline/dashboard-timeline.js';

import {
    DashboardFeaturesGridTemplate,
    DashboardFeaturesGridViewModel
} from './components/dashboard-features-grid/dashboard-features-grid.js';

import {
    registerDashboardComponents
} from './dashboard-registration.js';

// Re-export modular components and layers
export * from './dashboard-service.js';
export { registerDashboardComponents } from './dashboard-registration.js';
export * from './components/dashboard-clock/dashboard-clock.js';
export * from './components/dashboard-timeline/dashboard-timeline.js';
export * from './components/dashboard-features-grid/dashboard-features-grid.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

/* ---------- Dashboard Page Template (re-exported from dashboard-registration.js) ---------- */
export { DashboardPageTemplate } from './dashboard-registration.js';

/* ---------- Dashboard Root ViewModel ---------- */
var dashboardViewModelInstance = null;

export function getDashboardViewModel() {
    if (!dashboardViewModelInstance && typeof DashboardViewModel === 'function') {
        dashboardViewModelInstance = new DashboardViewModel();
    }
    return dashboardViewModelInstance;
}

export function DashboardViewModel() {
    var self = this;

    function obs(val) {
        return (_ko && typeof _ko.observable === 'function')
            ? _ko.observable(val)
            : function (v) { if (arguments.length) val = v; return val; };
    }

    // 1. Header (Location & Mosque Silhouette)
    var locInfo = getLocationInfo();
    self.header = {
        locationText: obs(locInfo.locationText)
    };

    // 2. Clock Component
    self.clock = new DashboardClockViewModel();

    // 3. Daily Prayer Timeline Component
    self.timeline = new DashboardTimelineViewModel();

    // 4. Features Grid Component
    self.featuresGrid = new DashboardFeaturesGridViewModel();

    // Direct navCards reference for backward compatibility
    self.navCards = self.featuresGrid.navCards;

    // Delegated update methods
    self.updateClock = function () {
        if (self.clock && typeof self.clock.updateClock === 'function') {
            self.clock.updateClock();
        }
    };

    self.updateTimeline = function () {
        if (self.timeline && typeof self.timeline.updateTimeline === 'function') {
            self.timeline.updateTimeline();
        }
    };

    self.updateTrackerBadge = function () {
        if (self.featuresGrid && typeof self.featuresGrid.updateTrackerBadge === 'function') {
            self.featuresGrid.updateTrackerBadge();
        }
    };
}

/* ---------- Dashboard Render ---------- */
export function rDashboard() {
    var activeP = typeof getActivePrayerInfo === 'function' ? getActivePrayerInfo() : {
        name: 'Fajr',
        time: (_win.T && _win.T.Fajr) || '--:--',
        isYesterday: false
    };
    setDashCurrentActivePrayer(activeP.name);

    var locInfo = getLocationInfo();
    var locText = locInfo.locationText;

    if (!dashboardViewModelInstance && typeof initDashboard === 'function') {
        initDashboard();
    }

    if (dashboardViewModelInstance) {
        if (dashboardViewModelInstance.header && typeof dashboardViewModelInstance.header.locationText === 'function') {
            dashboardViewModelInstance.header.locationText(locText);
        }
        if (typeof dashboardViewModelInstance.updateTimeline === 'function') {
            dashboardViewModelInstance.updateTimeline();
        }
        if (typeof dashboardViewModelInstance.updateTrackerBadge === 'function') {
            dashboardViewModelInstance.updateTrackerBadge();
        }
    }

    var locEl = typeof _win.$ === 'function' ? _win.$('dashLocationText') : null;
    if (locEl) {
        locEl.innerHTML = locText;
    }

    // Direct DOM fallbacks for legacy templates/tests
    var statuses = getTimelinePrayerStatuses();
    var prayers = _win.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    prayers.forEach(function (p) {
        var st = statuses[p] || DASH_STATUSES.UPCOMING;
        var isActive = st === DASH_STATUSES.ACTIVE;

        var timeEl = typeof _win.$ === 'function' ? _win.$('dashTime' + p) : null;
        if (timeEl) {
            timeEl.textContent = (_win.T && _win.T[p]) || '--:--';
        }

        var badgeEl = typeof _win.$ === 'function' ? _win.$('dashBadge' + p) : null;
        if (badgeEl) {
            var badgeInfo = DASH_STATUS_BADGES[st] || DASH_STATUS_BADGES[DASH_STATUSES.UPCOMING];
            badgeEl.className = 'dash-timeline-badge ' + badgeInfo.className;
            badgeEl.textContent = badgeInfo.text;
        }

        var iconBox = typeof _win.$ === 'function' ? _win.$('dashIconBox' + p) : null;
        if (iconBox) {
            if (isActive) {
                iconBox.classList.add('icon-box-active');
            } else {
                iconBox.classList.remove('icon-box-active');
            }
        }
    });

    var totalMissed = getMissedPrayerCount();
    var trackerBadgeEl = typeof _win.$ === 'function' ? _win.$('trackerMissedBadge') : null;
    if (trackerBadgeEl) {
        if (totalMissed > 0) {
            trackerBadgeEl.className = 'dash-tracker-badge dash-tracker-badge-missed';
            trackerBadgeEl.textContent = totalMissed + ' missed';
        } else {
            trackerBadgeEl.className = 'dash-tracker-badge dash-tracker-badge-missed d-none';
            trackerBadgeEl.textContent = '';
        }
    }

    startDashClock();
}

/* ---------- Dashboard Initialization ---------- */
export function initDashboard() {
    registerDashboardComponents();
    var el = (_win.document && typeof _win.document.getElementById === 'function')
        ? _win.document.getElementById('dashboardPage')
        : null;
    if (_win.document && !_win.document.getElementById('app') && el && typeof ko !== 'undefined') {
        var vm = getDashboardViewModel();
        if (!ko.dataFor(el)) {
            ko.applyBindings(vm, el);
        }
    }
}

export var dashboardViewModel = dashboardViewModelInstance;

export const DashboardApp = {
    init: initDashboard,
    render: rDashboard,
    registerComponents: registerDashboardComponents,
    getViewModel: getDashboardViewModel
};

// Minimal window bridge for legacy scripts (app.js, navigation.js, app-view-model.js)
if (typeof window !== 'undefined') {
    window.DashboardApp = DashboardApp;
    window.rDashboard = rDashboard;
    window.initDashboard = initDashboard;
    window.DashboardViewModel = DashboardViewModel;
    window.getDashboardViewModel = getDashboardViewModel;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initDashboard: initDashboard,
        rDashboard: rDashboard,
        registerDashboardComponents: registerDashboardComponents,
        DashboardViewModel: DashboardViewModel,
        getDashboardViewModel: getDashboardViewModel,
        DashboardApp: DashboardApp,
        DashboardPageTemplate: DashboardPageTemplate
    };
    module.exports.default = DashboardApp;
}

export default DashboardApp;
