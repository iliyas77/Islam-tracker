/* ============================================================
   Nur Prayer — Dashboard Features Grid Component
   Path: features/dashboard/components/dashboard-features-grid/dashboard-features-grid.js
   Responsibilities:
     - Owns Features Grid UI/template and ViewModel logic
     - Renders 2x2 navigation cards for Tracker, Tasbeeh, Quran, Duas, Settings
     - Manages missed prayer badge visibility and reactive updates
     - Dispatches navigation to selected features
   ============================================================ */
'use strict';

import { DashboardService } from '../../dashboard-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const DashboardFeaturesGridTemplate = {
    element: 'dashboard-features-grid-template',
    file: 'features/dashboard/components/dashboard-features-grid/dashboard-features-grid.html'
};

export function DashboardFeaturesGridViewModel(params) {
    if (params instanceof DashboardFeaturesGridViewModel) return params;
    if (!(this instanceof DashboardFeaturesGridViewModel)) return new DashboardFeaturesGridViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var self = this;

    function obs(val) {
        return (_ko && typeof _ko.observable === 'function')
            ? _ko.observable(val)
            : function (v) { if (arguments.length) val = v; return val; };
    }

    var missedCount = DashboardService.getMissedPrayerCount();
    var trackerBadgeVisible = obs(missedCount > 0);
    var trackerBadgeText = obs(missedCount > 0 ? (missedCount + ' missed') : '');

    var store = _win.PrayerStore || null;
    if (store && _ko && typeof store.missedCount === 'function' && typeof store.missedCount.subscribe === 'function') {
        store.missedCount.subscribe(function (val) {
            if (typeof trackerBadgeVisible === 'function') trackerBadgeVisible(val > 0);
            if (typeof trackerBadgeText === 'function') trackerBadgeText(val > 0 ? (val + ' missed') : '');
        });
    }

    if (p.navCards) {
        self.navCards = p.navCards;
    } else {
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
                    if (typeof _win.showPage === 'function') _win.showPage('tracker');
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
                    if (typeof _win.showPage === 'function') _win.showPage('tasbeeh');
                }
            },
            {
                title: 'Quran',
                action: 'goto-quran',
                iconClass: 'fa-solid fa-book-quran',
                dataRef: 'page.dashboard.card.quran',
                iconDataRef: 'page.dashboard.card.quran-icon',
                titleDataRef: 'page.dashboard.card.quran-label',
                hasBadge: false,
                onClick: function (d, e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                    if (typeof _win.showPage === 'function') _win.showPage('quran');
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
                    if (typeof _win.showPage === 'function') _win.showPage('duas');
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
                    if (typeof _win.showPage === 'function') _win.showPage('settings');
                }
            }
        ];
    }

    self.updateTrackerBadge = function () {
        var pStore = _win.PrayerStore || null;
        if (pStore && typeof pStore.sync === 'function') {
            pStore.sync();
        }
        var totalMissed = DashboardService.getMissedPrayerCount();
        var canWrite = function (obsTarget) {
            if (!obsTarget || typeof obsTarget !== 'function') return false;
            if (_ko && typeof _ko.isWriteableObservable === 'function') {
                return _ko.isWriteableObservable(obsTarget);
            }
            return true;
        };
        try {
            if (canWrite(trackerBadgeVisible)) {
                trackerBadgeVisible(totalMissed > 0);
            }
        } catch (_) {}
        try {
            if (canWrite(trackerBadgeText)) {
                trackerBadgeText(totalMissed > 0 ? (totalMissed + ' missed') : '');
            }
        } catch (_) {}
    };

    self.trackerBadgeVisible = trackerBadgeVisible;
    self.trackerBadgeText = trackerBadgeText;
}

export default {
    DashboardFeaturesGridViewModel: DashboardFeaturesGridViewModel,
    DashboardFeaturesGridTemplate: DashboardFeaturesGridTemplate
};

