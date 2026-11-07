/* ============================================================
   Nur Prayer — Reusable Global Tabs Component (Knockout.js)
   Path: components/tabs/tabs.js
   Generic, accessible tab navigation component reusable across
   all features (Tasbeeh, Prayer Tracking, Duas, Settings, etc.).
   Supports 'underline', 'bottom-nav', and 'pills' variants.
   ============================================================ */
'use strict';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

// Template configuration referencing standalone components/tabs/tabs.html
export const TabsTemplate = {
    element: 'app-tabs-template',
    file: 'components/tabs/tabs.html'
};
export const TABS_TEMPLATE_CONFIG = TabsTemplate;

/**
 * TabsViewModel
 * @param {Object} params
 * @param {Array|KnockoutObservableArray} params.tabs - Tab items configuration
 * @param {string|KnockoutObservable<string>} [params.activeTab] - Active tab identifier
 * @param {Function} [params.onTabChange] - Callback invoked when a tab is selected (tabId, tabItem, event)
 * @param {string} [params.variant='underline'] - Tab style variant: 'underline' | 'bottom-nav' | 'pills'
 * @param {string} [params.ariaLabel='Navigation Tabs'] - Accessibility label for tablist
 * @param {string} [params.containerId] - ID for the tab container element
 * @param {string} [params.customClass] - Extra CSS classes for the container
 * @param {string} [params.dataRef] - Optional data-ref attribute for container
 */
export function TabsViewModel(params) {
    if (params instanceof TabsViewModel) return params;
    if (!(this instanceof TabsViewModel)) return new TabsViewModel(params);

    params = (params && typeof params === 'function') ? params() : (params || {});
    var self = this;
    var k = typeof ko !== 'undefined' ? ko : (_win.ko || null);

    function unwrap(val, def) {
        var v = val;
        if (typeof val === 'function') {
            try { v = val(); } catch (_) { return def; }
        }
        return (v !== undefined && v !== null) ? v : def;
    }

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }

    function comp(fn) {
        return (k && k.pureComputed) ? k.pureComputed(fn) : fn;
    }

    // Active tab state
    if (params.activeTab && k && k.isObservable(params.activeTab)) {
        self.activeTab = params.activeTab;
    } else {
        self.activeTab = obs(unwrap(params.activeTab, unwrap(params.initialTab, '')));
    }

    // Container attributes
    self.variant = comp(function () {
        return unwrap(params.variant, unwrap(params.type, 'underline'));
    });

    self.ariaLabel = unwrap(params.ariaLabel, 'Navigation Tabs');
    self.containerId = unwrap(params.containerId, unwrap(params.id, null));
    self.customClass = unwrap(params.customClass, unwrap(params.containerClass, ''));
    self.dataRef = unwrap(params.dataRef, null);

    // Normalize raw tab items into structured tab objects
    self.tabs = comp(function () {
        var rawList = unwrap(params.tabs, unwrap(params.items, []));
        if (!Array.isArray(rawList)) return [];

        return rawList.map(function (item, index) {
            if (typeof item === 'string') {
                return {
                    id: item,
                    label: item,
                    icon: null,
                    iconPrefix: 'fa-solid',
                    iconClass: '',
                    badgeValue: null,
                    hasBadge: false,
                    elementId: null,
                    badgeId: null,
                    dataAct: null,
                    dataRef: null,
                    disabled: false,
                    aliases: []
                };
            }

            var id = unwrap(item.id, unwrap(item.key, unwrap(item.value, 'tab-' + index)));
            var label = unwrap(item.label, unwrap(item.title, unwrap(item.name, id)));
            var badgeRaw = item.badge !== undefined ? item.badge : (item.count !== undefined ? item.count : null);
            var badgeVal = unwrap(badgeRaw, null);
            var hasBadge = badgeVal !== null && badgeVal !== undefined;

            return {
                id: id,
                label: label,
                icon: unwrap(item.icon, null),
                iconPrefix: unwrap(item.iconPrefix, 'fa-solid'),
                iconClass: unwrap(item.iconClass, ''),
                badgeRaw: badgeRaw,
                badgeValue: comp(function () { return unwrap(badgeRaw, ''); }),
                hasBadge: comp(function () {
                    var v = unwrap(badgeRaw, null);
                    return v !== null && v !== undefined;
                }),
                elementId: unwrap(item.elementId, unwrap(item.btnId, unwrap(item.idAttr, null))),
                badgeId: unwrap(item.badgeId, null),
                dataAct: unwrap(item.dataAct, null),
                dataRef: unwrap(item.dataRef, null),
                disabled: unwrap(item.disabled, false),
                aliases: Array.isArray(item.aliases) ? item.aliases : [],
                raw: item
            };
        });
    });

    // Check if a tab is currently active (supports aliases)
    self.isActive = function (tab) {
        var cur = unwrap(self.activeTab);
        var tabId = (tab && tab.id) ? tab.id : tab;
        if (cur === tabId) return true;
        if (tab && tab.aliases && Array.isArray(tab.aliases)) {
            return tab.aliases.indexOf(cur) !== -1;
        }
        return false;
    };

    // Tab selection handler
    self.selectTab = function (tab, event) {
        if (event && event.stopPropagation) event.stopPropagation();
        if (tab && tab.disabled) return;

        var tabId = (tab && tab.id) ? tab.id : tab;

        if (typeof self.activeTab === 'function') {
            self.activeTab(tabId);
        }

        // Notify parent callback
        var onTabChange = params.onTabChange || params.onSelect || params.onChange || params.onTabSwitch;
        if (typeof onTabChange === 'function') {
            onTabChange(tabId, tab, event);
        }

        // Call tab-level action if provided
        if (tab && typeof tab.raw === 'object' && typeof tab.raw.action === 'function') {
            tab.raw.action(tabId, tab, event);
        } else if (tab && typeof tab.action === 'function') {
            tab.action(tabId, tab, event);
        }
    };

    // Styling helpers
    self.getUnderlineTabClass = function (tab) {
        var active = self.isActive(tab);
        var base = 'flex-1 py-3 flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-colors cursor-pointer select-none';
        return active
            ? (base + ' border-b-2 border-brand text-brand font-bold')
            : (base + ' border-b-2 border-transparent text-gr-textMuted font-semibold hover:text-gr-text');
    };

    self.getNavTabClass = function (tab) {
        var active = self.isActive(tab);
        var base = 'nav-tab flex-1 h-full bg-transparent border-0 flex flex-col items-center justify-center gap-1 font-medium py-1.5 relative cursor-pointer select-none transition-colors';
        return active ? (base + ' text-brand active') : (base + ' text-gr-textMuted');
    };

    self.getPillTabClass = function (tab) {
        var active = self.isActive(tab);
        var base = 'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none flex items-center gap-1.5';
        return active
            ? (base + ' bg-white text-brand shadow-sm font-bold')
            : (base + ' text-gr-textMuted hover:text-gr-text');
    };

    self.getBadgeClass = function (tab) {
        var active = self.isActive(tab);
        return active
            ? 'bg-brand-light text-brand'
            : 'bg-surfaceBg text-gr-textMuted border border-borderGrey';
    };
}

/**
 * Registers the Tabs component with Knockout
 * @param {Object} [customKo]
 */
export function registerTabsComponent(customKo) {
    var k = customKo || (typeof ko !== 'undefined' ? ko : (_win.ko || null));
    if (!k || !k.components) return;

    if (!k.components.isRegistered('app-tabs')) {
        k.components.register('app-tabs', {
            viewModel: TabsViewModel,
            template: TabsTemplate
        });
    }
}

// Auto-register if Knockout is globally present
if (typeof ko !== 'undefined' && ko.components) {
    registerTabsComponent(ko);
}

// Global window registration
const AppTabs = {
    viewModel: TabsViewModel,
    template: TabsTemplate,
    register: registerTabsComponent
};

if (typeof window !== 'undefined') {
    window.AppTabs = AppTabs;
    window.TabsViewModel = TabsViewModel;
    window.TabsTemplate = TabsTemplate;
    window.registerTabsComponent = registerTabsComponent;
}

if (typeof module === 'object' && module.exports) {
    module.exports = AppTabs;
    module.exports.TabsViewModel = TabsViewModel;
    module.exports.TabsTemplate = TabsTemplate;
    module.exports.default = AppTabs;
}

export default AppTabs;

