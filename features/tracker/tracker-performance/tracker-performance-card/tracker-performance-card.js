/* ============================================================
   Nur Prayer — Tracker Performance Card Component
   Path: features/tracker/tracker-performance/tracker-performance-card/tracker-performance-card.js
   Responsibilities:
     - Represents an individual prayer breakdown card in Performance view
     - Renders icon, timing, progress bar, completed & missed counts
   ============================================================ */
'use strict';

import { unwrap, PRAYER_CARD_ICONS } from '../../tracker-shared/tracker-service.js';

export const TrackerPerformanceCardTemplate = {
    element: 'tracker-performance-card-template',
    file: 'features/tracker/tracker-performance/tracker-performance-card/tracker-performance-card.html'
};

export function TrackerPerformanceCardViewModel(params) {
    if (params instanceof TrackerPerformanceCardViewModel) return params;
    if (!(this instanceof TrackerPerformanceCardViewModel)) return new TrackerPerformanceCardViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var item = (p.item && typeof p.item === 'function') ? p.item() : (p.item || p);
    var self = this;

    self.name = unwrap(item.name, 'Fajr');
    self.time = unwrap(item.time, '--:--');
    self.completed = unwrap(item.completed, 0);
    self.missed = unwrap(item.missed, 0);
    self.total = unwrap(item.total, 0);
    self.percentage = unwrap(item.percentage, 0);
    self.isPerfect = (self.missed === 0);

    var rawIcon = unwrap(item.iconClass, (PRAYER_CARD_ICONS && PRAYER_CARD_ICONS[self.name]) || 'fa-solid fa-mosque');
    if (typeof rawIcon === 'string' && rawIcon.indexOf('<') !== -1) {
        var m = rawIcon.match(/name:\s*['"]([^'"]+)['"]/);
        if (m) {
            rawIcon = m[1];
        } else {
            var m2 = rawIcon.match(/class=['"][^'"]*fa-([a-z0-9-]+)[^'"]*['"]/);
            if (m2) rawIcon = m2[1];
        }
    }
    self.iconClass = rawIcon;
    self.pLower = self.name.toLowerCase();

    self.handleClick = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var cb = p.onClick || p.onCardClick;
        if (typeof cb === 'function') {
            cb(self, event);
        }
    };
}

export default {
    template: TrackerPerformanceCardTemplate,
    viewModel: TrackerPerformanceCardViewModel
};

