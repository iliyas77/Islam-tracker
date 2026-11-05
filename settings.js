/* ============================================================
   Nur Prayer — Settings Feature Logic (Forwarder)
   Path: settings.js
   Redirects to modular settings/settings.js
   ============================================================ */
'use strict';

// Load settings from settings/settings.js
if (typeof require !== 'undefined' && typeof module !== 'undefined' && module.exports) {
    module.exports = require('./settings/settings.js');
}
