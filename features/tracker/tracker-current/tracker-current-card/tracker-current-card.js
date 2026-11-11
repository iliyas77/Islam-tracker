/* ============================================================
   Nur Prayer — Tracker Current Card Component
   Path: features/tracker/tracker-current/tracker-current-card/tracker-current-card.js
   Responsibilities:
     - Represents an individual prayer item card/row in Current tracking
     - Renders prayer icon, timing, state (Done, Upcoming, Missed, Current)
     - Dispatches user toggle actions to parent via explicit onToggle callback
   ============================================================ */
'use strict';

import { unwrap, PRAYER_CARD_ICONS } from '../../tracker-shared/tracker-service.js';

export const TrackerCurrentCardTemplate = {
    element: 'tracker-current-card-template',
    file: 'features/tracker/tracker-current/tracker-current-card/tracker-current-card.html'
};
export const PrayerRowTemplate = TrackerCurrentCardTemplate;

export function TrackerCurrentCardViewModel(params) {
    if (params instanceof TrackerCurrentCardViewModel) return params;
    if (!(this instanceof TrackerCurrentCardViewModel)) return new TrackerCurrentCardViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var item = (p.item && typeof p.item === 'function') ? p.item() : (p.item || p);
    var self = this;

    self.prayer = unwrap(item.prayer, '');
    self.time = unwrap(item.time, '--:--');
    self.isDone = !!unwrap(item.isDone, false);
    self.isUpcoming = !self.isDone && !!unwrap(item.isUpcoming, false);
    self.isMissed = !self.isDone && !self.isUpcoming && !!unwrap(item.isMissed, false);
    self.isCurrent = !self.isDone && !self.isUpcoming && !self.isMissed && !!unwrap(item.isCurrent, false);
    self.isStandard = !self.isDone && !self.isUpcoming && !self.isMissed;
    self.prefix = unwrap(item.prefix || p.prefix, 'page.current');
    self.actionAct = unwrap(item.actionAct || p.actionAct, 'toggle-cur');
    self.date = unwrap(item.date || p.date, '');

    var rawIcon = unwrap(item.iconClass || p.iconClass, (PRAYER_CARD_ICONS && PRAYER_CARD_ICONS[self.prayer]) || 'fa-solid fa-mosque');
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

    self.onToggle = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var cb = p.onToggle || p.onClick;
        if (typeof cb === 'function') {
            cb(self, event);
        }
    };
}

export default {
    template: TrackerCurrentCardTemplate,
    viewModel: TrackerCurrentCardViewModel
};

