/* ============================================================
   Nur Prayer — Tracker Feature Root Barrel Entry Point
   Path: features/tracker/index.js
   Responsibilities:
     - Unified entry point for the entire Prayer Tracker feature
     - Re-exports all shared services, storage, constants, and utilities
     - Re-exports component registrations and template configurations
     - Re-exports feature root ViewModel, lifecycle interfaces, and helpers
     - Re-exports all submodules: Current, Old, Performance, and History
   ============================================================ */
'use strict';

// 1. Shared Services, Constants & Utilities
export * from './tracker-shared/tracker-service.js';

// 2. Component Registrations & Templates
export * from './tracker-shared/tracker-registration.js';

// 3. Main Feature ViewModel & Controller Interfaces
export * from './tracker-main/tracker-main.js';

// 4. Current Prayer Tab Submodules (direct component exports)
export * from './tracker-current/tracker-current-card/tracker-current-card.js';
export * from './tracker-current/tracker-current-feed/tracker-current-feed.js';
export * from './tracker-current/tracker-current-form/tracker-current-form.js';
export * from './tracker-current/tracker-current-home/tracker-current-home.js';

// 5. Old Prayer Tab Submodules (direct component exports)
export * from './tracker-old/tracker-old-card/tracker-old-card.js';
export * from './tracker-old/tracker-old-feed/tracker-old-feed.js';
export * from './tracker-old/tracker-old-form/tracker-old-form.js';
export * from './tracker-old/tracker-old-page/tracker-old-page.js';

// 6. Performance Tab Submodules
export * from './tracker-performance/tracker-performance.js';

// 7. History Tab Submodules (direct component exports)
export * from './tracker-history/tracker-history-card/tracker-history-card.js';
export * from './tracker-history/tracker-history-feed/tracker-history-feed.js';
export * from './tracker-history/tracker-history-page/tracker-history-page.js';

// Disambiguate explicit exports
export { rOT } from './tracker-old/tracker-old-page/tracker-old-page.js';

// Default export: root TrackerApp
export { default } from './tracker-main/tracker-main.js';

