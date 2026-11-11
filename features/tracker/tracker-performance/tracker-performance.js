/* ============================================================
   Nur Prayer — Tracker Performance Submodules Re-export
   Path: features/tracker/tracker-performance/tracker-performance.js
   ============================================================ */
export * from './tracker-performance-card/tracker-performance-card.js';
export * from './tracker-performance-feed/tracker-performance-feed.js';
export * from './tracker-performance-page/tracker-performance-page.js';

export const TrackerPerfRingTemplate = {
    element: 'prayer-perf-ring-template',
    file: 'features/tracker/tracker-performance/prayer-perf-ring.html'
};

export const TrackerStatCardTemplate = {
    element: 'prayer-stat-card-template',
    file: 'features/tracker/tracker-performance/prayer-stat-card.html'
};

export const PrayerPerfRingTemplate = TrackerPerfRingTemplate;
export const PrayerStatCardTemplate = TrackerStatCardTemplate;

