/* ============================================================
   Nur Prayer — Knockout Component Registration Helper
   Path: components/component-helper.js
   Responsibilities:
     - Centralizes reusable Knockout component registration logic
     - Dispatches to central feature registry when available
     - Handles customKo injection for isolated unit testing
     - Prevents duplicate registration in Knockout registry
   ============================================================ */
'use strict';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

/**
 * Registers a Knockout component with fallback and testing isolation support
 * @param {string} name - Custom HTML component tag name
 * @param {Function} viewModel - Component ViewModel constructor
 * @param {Object|string} template - Component HTML template config or element
 * @param {Object} [customKo] - Optional Knockout instance (for testing or isolation)
 */
export function registerComponent(name, viewModel, template, customKo) {
    var safeTemplate = template || { element: name + '-template' };
    if (!customKo && typeof _win.registerFeatureComponent === 'function') {
        _win.registerFeatureComponent(name, viewModel, safeTemplate);
        return;
    }
    var ko = customKo || (typeof _win.ko !== 'undefined' ? _win.ko : (typeof ko !== 'undefined' ? ko : null));
    if (!ko || !ko.components) return;
    if (!ko.components.isRegistered(name)) {
        ko.components.register(name, {
            viewModel: viewModel,
            template: safeTemplate
        });
    }
}

// Global window registration
if (typeof window !== 'undefined') {
    window.registerComponent = registerComponent;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerComponent: registerComponent
    };
    module.exports.default = registerComponent;
}

export default registerComponent;

