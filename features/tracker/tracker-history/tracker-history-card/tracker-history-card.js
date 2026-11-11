/* ============================================================
   Nur Prayer — Tracker History Card Component
   Path: features/tracker/tracker-history/tracker-history-card/tracker-history-card.js
   Responsibilities:
     - Represents an individual prayer history log card
     - Displays prayer icon, name, date, timestamp, time ago
     - Dispatches delete callback to parent feed
   ============================================================ */
'use strict';

import { unwrap, fr, formatTimeAgo, PRAYER_CARD_ICONS } from '../../tracker-shared/tracker-service.js';

export const TrackerHistoryCardTemplate = {
    element: 'tracker-history-card-template',
    file: 'features/tracker/tracker-history/tracker-history-card/tracker-history-card.html'
};
export const PrayerHistoryCardTemplate = TrackerHistoryCardTemplate;

export function TrackerHistoryCardViewModel(params) {
    if (params instanceof TrackerHistoryCardViewModel) return params;
    if (!(this instanceof TrackerHistoryCardViewModel)) return new TrackerHistoryCardViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var item = (p.item && typeof p.item === 'function') ? p.item() : (p.item || p);
    var self = this;

    self.item = item;
    self.id = unwrap(item.id, '');
    self.prayer = unwrap(item.prayer, 'Prayer');
    self.type = unwrap(item.type, 'Current');
    self.date = unwrap(item.date, '');
    self.timestamp = unwrap(item.timestamp, Date.now());
    self.formattedDate = fr(self.date);
    self.isCurrent = (self.type === 'Current');

    var ts = Number(self.timestamp);
    self.exactTime = !isNaN(ts) ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
    self.ago = formatTimeAgo(ts);

    var rawIcon = unwrap(item.iconClass, (PRAYER_CARD_ICONS && PRAYER_CARD_ICONS[self.prayer]) || 'fa-solid fa-mosque');
    if (typeof rawIcon === 'string' && rawIcon.indexOf('<') !== -1) {
        var m = rawIcon.match(/name:\s*['"]([^'"]+)['"]/);
        if (m) {
            rawIcon = m[1];
        } else {
            var m2 = rawIcon.match(/class=['"][^'"]*fa-([a-z0-9-]+)[^'"]*['"]/);
            if (m2) rawIcon = m2[1];
        }
    }
    self.iconName = rawIcon;

    self.handleDelete = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var cb = p.onDelete || p.onDeleteEntry;
        if (typeof cb === 'function') {
            cb(self.item, event);
        }
    };
}

export default {
    template: TrackerHistoryCardTemplate,
    viewModel: TrackerHistoryCardViewModel
};

