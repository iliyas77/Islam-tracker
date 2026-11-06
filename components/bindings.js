/* ============================================================
   Nur Prayer — Knockout.js Custom Binding Handlers
   Path: components/bindings.js
   Provides declarative bindings for modals, bottom sheets,
   date pickers, and ripple interactions.
   ============================================================ */
'use strict';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

/**
 * Custom Binding: modal
 * Usage: data-bind="modal: isModalOpen"
 * Automatically handles:
 * - Opening / closing (toggling active/show classes, removing hidden/d-none)
 * - Backdrop click to close
 * - Escape key to close
 * - Close buttons ([data-bs-dismiss="modal"] or [data-modal-close])
 * - Accessibility (aria-modal, aria-hidden)
 */
export const ModalBinding = {
    init: function (element, valueAccessor) {
        var k = typeof ko !== 'undefined' ? ko : _ko;
        var value = valueAccessor();

        // 1. Accessibility attributes
        element.setAttribute('role', 'dialog');
        element.setAttribute('aria-modal', 'true');

        // 2. Backdrop click handler (clicking backdrop closes modal)
        var onBackdropClick = function (e) {
            if (e.target === element) {
                if (k.isWriteableObservable(value)) {
                    value(false);
                } else if (typeof value === 'function') {
                    value(false);
                }
            }
        };
        element.addEventListener('click', onBackdropClick);

        // 3. Dismiss button handler
        var onDismissClick = function (e) {
            var closeBtn = e.target.closest('[data-bs-dismiss="modal"], [data-modal-close], .btn-close');
            if (closeBtn) {
                if (k.isWriteableObservable(value)) {
                    value(false);
                } else if (typeof value === 'function') {
                    value(false);
                }
            }
        };
        element.addEventListener('click', onDismissClick);

        // 4. Escape key handler
        var onKeyDown = function (e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                var isOpen = k.unwrap(valueAccessor());
                if (isOpen) {
                    if (k.isWriteableObservable(value)) {
                        value(false);
                    } else if (typeof value === 'function') {
                        value(false);
                    }
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);

        // Clean up event listeners on element disposal
        k.utils.domNodeDisposal.addDisposeCallback(element, function () {
            element.removeEventListener('click', onBackdropClick);
            element.removeEventListener('click', onDismissClick);
            window.removeEventListener('keydown', onKeyDown);
        });
    },
    update: function (element, valueAccessor) {
        var k = typeof ko !== 'undefined' ? ko : _ko;
        var isOpen = !!k.unwrap(valueAccessor());

        if (isOpen) {
            element.classList.remove('hidden', 'd-none');
            element.classList.add('active', 'show');
            element.style.display = 'flex';
            element.setAttribute('aria-hidden', 'false');
        } else {
            element.classList.remove('active', 'show');
            element.classList.add('hidden', 'd-none');
            element.style.display = 'none';
            element.setAttribute('aria-hidden', 'true');
        }
    }
};

/**
 * Custom Binding: datePicker
 * Usage: data-bind="datePicker: selectedDate, targetInput: 'dp'"
 * Bridges a styled date chip button to a native hidden <input type="date">.
 */
export const DatePickerBinding = {
    init: function (element, valueAccessor, allBindings) {
        var k = typeof ko !== 'undefined' ? ko : _ko;
        var value = valueAccessor();
        var targetInputId = allBindings.get('targetInput') || 'dp';

        var onClick = function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            var input = document.getElementById(targetInputId);
            if (input) {
                if (typeof input.showPicker === 'function') {
                    try {
                        input.showPicker();
                    } catch (_) {
                        input.click();
                    }
                } else {
                    input.click();
                }
            }
        };

        element.addEventListener('click', onClick);

        // Listen for change on the target input to update the observable
        var input = document.getElementById(targetInputId);
        if (input) {
            var onInputChange = function (e) {
                var newDate = e.target.value;
                if (newDate) {
                    if (k.isWriteableObservable(value)) {
                        value(newDate);
                    } else if (typeof value === 'function') {
                        value(newDate);
                    }
                }
            };
            input.addEventListener('change', onInputChange);

            k.utils.domNodeDisposal.addDisposeCallback(element, function () {
                input.removeEventListener('change', onInputChange);
            });
        }

        k.utils.domNodeDisposal.addDisposeCallback(element, function () {
            element.removeEventListener('click', onClick);
        });
    }
};

/**
 * Custom Binding: ripple
 * Usage: data-bind="ripple: true"
 * Adds material-style subtle ripple effect on click.
 */
export const RippleBinding = {
    init: function (element) {
        var onPointerDown = function (e) {
            var rect = element.getBoundingClientRect();
            var ripple = document.createElement('span');
            var size = Math.max(rect.width, rect.height);
            var x = e.clientX - rect.left - size / 2;
            var y = e.clientY - rect.top - size / 2;

            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.width = size + 'px';
            ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.pointerEvents = 'none';
            ripple.style.backgroundColor = 'rgba(18, 61, 46, 0.15)';
            ripple.style.transform = 'scale(0)';
            ripple.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
            ripple.className = 'touch-ripple-effect';

            var prevPos = window.getComputedStyle(element).position;
            if (prevPos === 'static') {
                element.style.position = 'relative';
            }
            element.style.overflow = 'hidden';
            element.appendChild(ripple);

            requestAnimationFrame(function () {
                ripple.style.transform = 'scale(2.5)';
                ripple.style.opacity = '0';
            });

            setTimeout(function () {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 450);
        };

        element.addEventListener('pointerdown', onPointerDown);

        var k = typeof ko !== 'undefined' ? ko : _ko;
        if (k && k.utils && k.utils.domNodeDisposal) {
            k.utils.domNodeDisposal.addDisposeCallback(element, function () {
                element.removeEventListener('pointerdown', onPointerDown);
            });
        }
    }
};

/**
 * Register all custom Knockout bindings
 */
export function registerCustomBindings(customKo) {
    var k = customKo || (typeof ko !== 'undefined' ? ko : _win.ko);
    if (!k || !k.bindingHandlers) {
        console.warn('Knockout not available. Skipping custom binding registration.');
        return;
    }

    if (!k.bindingHandlers.modal) {
        k.bindingHandlers.modal = ModalBinding;
    }
    if (!k.bindingHandlers.datePicker) {
        k.bindingHandlers.datePicker = DatePickerBinding;
    }
    if (!k.bindingHandlers.ripple) {
        k.bindingHandlers.ripple = RippleBinding;
    }

    console.info('Successfully registered Knockout custom bindings: modal, datePicker, ripple.');
}

if (typeof window !== 'undefined') {
    window.registerCustomBindings = registerCustomBindings;
    window.ModalBinding = ModalBinding;
    window.DatePickerBinding = DatePickerBinding;
    window.RippleBinding = RippleBinding;
}

