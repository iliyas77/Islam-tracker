// components/registry.js
import { registerCustomBindings } from './bindings.js';
import { IconViewModel, IconTemplate } from './icon/icon.js';
import { BottomSheetViewModel, BottomSheetTemplate } from './bottom-sheet/bottom-sheet.js';
import { TabsViewModel, TabsTemplate } from './tabs/tabs.js';
import { registerDashboardComponents } from '../features/dashboard/dashboard-registration.js';
import { registerTrackerComponents } from '../features/tracker/tracker-registration.js';
import { registerTasbeehComponents } from '../features/tasbeeh/tasbeeh-registration.js';
import { registerDuaComponents } from '../features/dua/dua-registration.js';
import { registerQuranComponents } from '../features/quran/quran-registration.js';
import { registerSettingsComponents } from '../features/settings/settings-registration.js';
import { registerComponent } from './component-helper.js';

export { registerComponent };

// Central map for tracking registered components
export const componentRegistry = new Map();

/**
 * Registers a component with Knockout and tracks it in the registry map
 * @param {string} name - Custom HTML tag name (e.g., 'app-icon')
 * @param {Function} viewModel - Component ViewModel constructor
 * @param {string|Object} template - HTML template string or element binding
 */
export function registerFeatureComponent(name, viewModel, template) {
    var k = typeof ko !== 'undefined' ? ko : (typeof window !== 'undefined' ? window.ko : null);
    if (!k || !k.components) {
        console.warn(`Knockout is not available. Skipping registration for [${name}].`);
        return;
    }

    var safeTemplate = template || { element: name + '-template' };
    componentRegistry.set(name, { viewModel, template: safeTemplate });

    if (k.components.isRegistered(name)) {
        return;
    }

    k.components.register(name, {
        viewModel: viewModel,
        template: safeTemplate
    });
}

/**
 * Startup registration: Registers Core UI components + Dashboard Feature components.
 */
export function registerStartupComponents() {
    // 0. Register Custom Binding Handlers
    registerCustomBindings();

    // 1. Core UI Components
    registerFeatureComponent('app-icon', IconViewModel, IconTemplate);
    registerFeatureComponent('app-bottom-sheet', BottomSheetViewModel, BottomSheetTemplate);
    registerFeatureComponent('app-tabs', TabsViewModel, TabsTemplate);

    // 2. Dashboard Feature Components (Isolated Modular Feature)
    registerDashboardComponents();
}

/**
 * Bulk registration function: Registers Core UI, Dashboard, and all feature components.
 */
export function registerAllComponents() {
    registerStartupComponents();
    if (typeof registerTrackerComponents === 'function') registerTrackerComponents();
    if (typeof registerTasbeehComponents === 'function') registerTasbeehComponents();
    if (typeof registerDuaComponents === 'function') registerDuaComponents();
    if (typeof registerQuranComponents === 'function') registerQuranComponents();
    if (typeof registerSettingsComponents === 'function') registerSettingsComponents();
    console.info(`Successfully registered ${componentRegistry.size} application components.`);
}

// Backward compatibility with window global
if (typeof window !== 'undefined') {
    window.componentRegistry = componentRegistry;
    window.registerFeatureComponent = registerFeatureComponent;
    window.registerStartupComponents = registerStartupComponents;
    window.registerAllComponents = registerAllComponents;
}

export default {
    componentRegistry,
    registerFeatureComponent,
    registerStartupComponents,
    registerAllComponents
};
