/* ============================================================
   Nur Prayer — Dashboard Clock Component
   Path: features/dashboard/components/dashboard-clock/dashboard-clock.js
   Responsibilities:
     - Owns Clock UI/template and ViewModel logic
     - Formats hours, minutes, seconds and AM/PM indicators
     - Provides updateClock() behavior
   ============================================================ */
'use strict';

import { DashboardService } from '../../dashboard-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const DashboardClockTemplate = {
    element: 'dashboard-clock-template',
    file: 'features/dashboard/components/dashboard-clock/dashboard-clock.html'
};

export const ClockTemplate = DashboardClockTemplate;

export function DashboardClockViewModel(params) {
    if (params instanceof DashboardClockViewModel) return params;
    if (!(this instanceof DashboardClockViewModel)) return new DashboardClockViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var self = this;

    function obs(val) {
        return (_ko && typeof _ko.observable === 'function')
            ? _ko.observable(val)
            : function (v) { if (arguments.length) val = v; return val; };
    }

    self.digits = (p.digits && typeof p.digits === 'function')
        ? p.digits
        : obs('--:--:--');

    self.ampm = (p.ampm && typeof p.ampm === 'function')
        ? p.ampm
        : obs('--');

    self.updateClock = function () {
        var t = DashboardService.getCurrentClockTime();
        if (typeof self.digits === 'function') self.digits(t.digits);
        if (typeof self.ampm === 'function') self.ampm(t.ampm);
    };

    // Initialize with current time if placeholder
    if (self.digits() === '--:--:--') {
        self.updateClock();
    }
}

export const ClockViewModel = DashboardClockViewModel;

// Global backward compatibility
if (typeof window !== 'undefined') {
    window.DashboardClockViewModel = DashboardClockViewModel;
    window.ClockViewModel = DashboardClockViewModel;
    window.DashboardClockTemplate = DashboardClockTemplate;
    window.ClockTemplate = DashboardClockTemplate;
}

export default {
    DashboardClockViewModel: DashboardClockViewModel,
    ClockViewModel: DashboardClockViewModel,
    DashboardClockTemplate: DashboardClockTemplate,
    ClockTemplate: DashboardClockTemplate
};

