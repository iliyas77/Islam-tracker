/* ============================================================
   Nur Prayer — Reusable Global Bottom Sheet Component (Knockout.js)
   Path: components/bottom-sheet/bottom-sheet.js
   Centralized, accessible, and event-safe Bottom Sheet component.
   Eliminates event bubbling bugs and unifies sheet lifecycle across
   all application modules (Settings, Dashboard, Tasbeeh, Duva, Prayer-Tracking).
   ============================================================ */
'use strict';

// Template configuration referencing standalone components/bottom-sheet/bottom-sheet.html
export const BottomSheetTemplate = {
    element: 'bottom-sheet-template',
    file: 'components/bottom-sheet/bottom-sheet.html'
};
export const BOTTOM_SHEET_TEMPLATE_CONFIG = BottomSheetTemplate;

/**
 * BottomSheetViewModel
 * @param {Object} params
 * @param {KnockoutObservable<boolean>} params.isOpen - Observable boolean controlling visibility
 * @param {string|KnockoutObservable<string>} [params.title=''] - Sheet title
 * @param {string|KnockoutObservable<string>} [params.subtitle=''] - Sheet subtitle
 * @param {string|KnockoutObservable<string>} [params.icon=''] - Icon class for title
 * @param {string} [params.cardId] - Element ID for sheet card
 * @param {string} [params.bodyId] - Element ID for sheet body
 * @param {string} [params.titleId] - Element ID for title element
 * @param {string} [params.subId] - Element ID for subtitle element
 * @param {string} [params.iconId] - Element ID for icon element
 * @param {boolean} [params.showBackBtn=false] - Whether to show back arrow button
 * @param {boolean} [params.showCloseBtn=true] - Whether to show close (x) button
 * @param {Function} [params.onClose] - Optional callback fired when sheet closes
 */
export function BottomSheetViewModel(params) {
    params = params || {};
    var self = this;
    var k = typeof ko !== 'undefined' ? ko : (typeof window !== 'undefined' ? window.ko : null);

    // params.isOpen must be a Knockout observable boolean controlling visibility
    self.isOpen = params.isOpen;
    self.title = params.title || '';
    self.subtitle = params.subtitle || params.sub || '';
    self.icon = params.icon || '';
    self.cardId = params.cardId || params.id || null;
    self.bodyId = params.bodyId || null;
    self.titleId = params.titleId || (self.cardId ? self.cardId + 'Title' : null);
    self.subId = params.subId || (self.cardId ? self.cardId + 'Sub' : null);
    self.iconId = params.iconId || (self.cardId ? self.cardId + 'Icon' : null);
    self.showBackBtn = !!params.showBackBtn;
    self.showCloseBtn = params.showCloseBtn !== false;

    // Close handler triggered by close buttons or programmatic hide
    self.close = function (data, event) {
        if (k && k.isObservable(self.isOpen)) {
            self.isOpen(false);
        } else if (typeof self.isOpen === 'function') {
            self.isOpen(false);
        }
        if (typeof params.onClose === 'function') {
            params.onClose();
        }
    };

    // Close handler triggered only when clicking directly on the backdrop (outside the card)
    self.closeOnBackdrop = function (data, event) {
        if (!event || event.target === event.currentTarget) {
            self.close(data, event);
        }
    };

    // CRITICAL FIX: Prevent clicks inside the sheet card from bubbling up to the backdrop
    self.stopPropagation = function (data, event) {
        if (event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            // Allow delegated action clicks inside the sheet to trigger global handleClick if present
            var actEl = event.target.closest && event.target.closest('[data-act]');
            if (actEl && typeof handleClick === 'function') {
                handleClick(event);
            }
        }
    };

    // Manage body scroll lock when sheet opens/closes
    function updateBodyScroll(open) {
        if (typeof document === 'undefined') return;
        if (open) {
            document.body.classList.add('modal-open');
        } else {
            if (!document.querySelector('.bottom-sheet-backdrop') &&
                !document.querySelector('.modal.show') &&
                !document.querySelector('.offcanvas.show')) {
                document.body.classList.remove('modal-open');
            }
        }
    }

    // Escape key dismiss handler
    function handleKeydown(e) {
        var isOpenVal = k && k.unwrap ? k.unwrap(self.isOpen) : (typeof self.isOpen === 'function' ? self.isOpen() : self.isOpen);
        if ((e.key === 'Escape' || e.keyCode === 27) && isOpenVal) {
            self.close();
        }
    }

    if (typeof document !== 'undefined') {
        document.addEventListener('keydown', handleKeydown);
    }

    if (k && k.isObservable(self.isOpen)) {
        self._sub = self.isOpen.subscribe(function (val) {
            updateBodyScroll(!!val);
        });
        if (self.isOpen()) {
            updateBodyScroll(true);
        }
    }

    // Cleanup on component disposal
    self.dispose = function () {
        if (self._sub) {
            self._sub.dispose();
            self._sub = null;
        }
        if (typeof document !== 'undefined') {
            document.removeEventListener('keydown', handleKeydown);
            updateBodyScroll(false);
        }
    };
}

/**
 * Global Component Registration
 */
export function register(customKo) {
    var k = customKo || (typeof ko !== 'undefined' ? ko : (typeof window !== 'undefined' ? window.ko : null));
    if (!k || !k.components) return;

    if (!k.components.isRegistered('app-bottom-sheet')) {
        k.components.register('app-bottom-sheet', {
            viewModel: BottomSheetViewModel,
            template: BottomSheetTemplate
        });
    }

    if (!k.components.isRegistered('bottom-sheet')) {
        k.components.register('bottom-sheet', {
            viewModel: BottomSheetViewModel,
            template: BottomSheetTemplate
        });
    }
}

// Window global fallback
const AppBottomSheet = {
    viewModel: BottomSheetViewModel,
    template: BottomSheetTemplate,
    register: register
};

if (typeof window !== 'undefined') {
    window.AppBottomSheet = AppBottomSheet;
    window.BottomSheetViewModel = BottomSheetViewModel;
    window.BottomSheetTemplate = BottomSheetTemplate;
}

if (typeof module === 'object' && module.exports) {
    module.exports = AppBottomSheet;
    module.exports.BottomSheetViewModel = BottomSheetViewModel;
    module.exports.BottomSheetTemplate = BottomSheetTemplate;
    module.exports.default = AppBottomSheet;
}

export default AppBottomSheet;
