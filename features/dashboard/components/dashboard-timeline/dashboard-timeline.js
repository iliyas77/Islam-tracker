/* ============================================================
   Nur Prayer — Dashboard Timeline Component
   Path: features/dashboard/components/dashboard-timeline/dashboard-timeline.js
   Responsibilities:
     - Owns Timeline UI/template and ViewModel logic
     - Manages daily prayer timeline nodes, statuses, and badges
     - Calculates active, next, upcoming, and passed prayer states
   ============================================================ */
'use strict';

import {
    DashboardService,
    TIMELINE_ICONS,
    DASH_STATUSES,
    DASH_STATUS_BADGES
} from '../../dashboard-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const DashboardTimelineTemplate = {
    element: 'dashboard-timeline-template',
    file: 'features/dashboard/components/dashboard-timeline/dashboard-timeline.html'
};

export function DashboardTimelineViewModel(params) {
    if (params instanceof DashboardTimelineViewModel) return params;
    if (!(this instanceof DashboardTimelineViewModel)) return new DashboardTimelineViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var self = this;

    function obs(val) {
        return (_ko && typeof _ko.observable === 'function')
            ? _ko.observable(val)
            : function (v) { if (arguments.length) val = v; return val; };
    }
    function obsArr(arr) {
        return (_ko && typeof _ko.observableArray === 'function')
            ? _ko.observableArray(arr)
            : function () { return arr; };
    }

    self.title = p.title || 'Daily Prayer Timeline';

    if (p.items && typeof p.items === 'function') {
        self.items = p.items;
    } else {
        var prayerNames = _win.P || ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        var initialItems = prayerNames.map(function (prayer) {
            return {
                name: prayer,
                iconClass: (TIMELINE_ICONS && TIMELINE_ICONS[prayer]) || 'fa-solid fa-mosque',
                time: obs((_win.T && _win.T[prayer]) || '--:--'),
                statusText: obs('Upcoming'),
                statusBadgeClass: obs('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200'),
                isActive: obs(false)
            };
        });
        self.items = obsArr(initialItems);
    }

    self.updateTimeline = function () {
        var statuses = DashboardService.getTimelinePrayerStatuses();
        var itemsList = typeof self.items === 'function' ? self.items() : self.items;

        itemsList.forEach(function (item) {
            var prayer = item.name;
            var st = statuses[prayer] || DASH_STATUSES.UPCOMING;
            var isActive = (st === DASH_STATUSES.ACTIVE);
            var badgeInfo = DASH_STATUS_BADGES[st] || DASH_STATUS_BADGES[DASH_STATUSES.UPCOMING];

            if (typeof item.time === 'function') {
                item.time((_win.T && _win.T[prayer]) || '--:--');
            }
            if (typeof item.statusText === 'function') {
                item.statusText(badgeInfo.text);
            }
            if (typeof item.statusBadgeClass === 'function') {
                item.statusBadgeClass('dash-timeline-badge ' + badgeInfo.className);
            }
            if (typeof item.isActive === 'function') {
                item.isActive(isActive);
            }
        });
    };

    // Initial update
    self.updateTimeline();
}

export default {
    DashboardTimelineViewModel: DashboardTimelineViewModel,
    DashboardTimelineTemplate: DashboardTimelineTemplate
};
