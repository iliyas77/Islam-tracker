/* ============================================================
   Nur Prayer — Reusable Button Component
   Path: components/button.js
   Centralized, pure Button component with configurable properties:
   - label (text, HTML, or children)
   - type ('button', 'submit', 'reset')
   - variant ('brand', 'outline-brand', 'light', 'danger',
              'outline-danger', 'outline-secondary', 'outline-warning',
              'link', 'close', 'action', 'action-primary', 'action-missed',
              'completed', 'upcoming', 'text', 'sheet-back', 'pill-action', 'raw')
   - size ('sm', 'md', 'lg')
   - disabled (boolean, sets disabled & aria-disabled="true")
   - clickHandler / onClick / dataAct
   - icon & iconPosition ('left' | 'right')
   - className, id, title, ariaLabel, dataRef, data-bs-* attributes
   ============================================================ */

(function (window) {
    'use strict';

    var BUTTON_VARIANTS = {
        brand: 'btn btn-brand',
        'outline-brand': 'btn btn-outline-brand',
        light: 'btn btn-light',
        danger: 'btn btn-danger',
        'outline-danger': 'btn btn-outline-danger',
        'outline-secondary': 'btn btn-outline-secondary',
        'outline-warning': 'btn btn-outline-warning',
        link: 'btn btn-link',
        close: 'btn-close',
        action: 'btn-action',
        'action-primary': 'btn-action btn-action-primary',
        'action-missed': 'btn-action btn-action-missed',
        completed: 'btn-action btn-completed',
        upcoming: 'btn-action btn-upcoming',
        text: 'btn-text',
        'sheet-back': 'btn-sheet-back',
        'pill-action': 'btn-pill-action',
        raw: '',
        none: ''
    };

    var BUTTON_SIZES = {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg'
    };

    function Button(props) {
        props = props || {};
        var type = props.type || 'button';
        var variant = props.variant !== undefined ? props.variant : 'brand';
        var size = props.size || 'md';
        var disabled = !!props.disabled;
        var label = props.label !== undefined ? props.label : (props.text !== undefined ? props.text : (props.children !== undefined ? props.children : ''));
        var icon = props.icon;
        var iconPosition = props.iconPosition || 'left';
        var className = props.className || props.class || '';

        var idAttr = props.id ? ' id="' + props.id + '"' : '';
        var titleAttr = props.title ? ' title="' + props.title + '"' : '';
        var ariaLabel = props.ariaLabel || props['aria-label'];
        var ariaLabelAttr = ariaLabel ? ' aria-label="' + ariaLabel + '"' : '';
        var ariaDisabled = disabled ? ' aria-disabled="true"' : (props['aria-disabled'] ? ' aria-disabled="' + props['aria-disabled'] + '"' : '');
        var ariaExpanded = (props['aria-expanded'] !== undefined || props.ariaExpanded !== undefined)
            ? ' aria-expanded="' + (props['aria-expanded'] !== undefined ? props['aria-expanded'] : props.ariaExpanded) + '"'
            : '';
        var roleAttr = props.role ? ' role="' + props.role + '"' : '';
        var tabIndexAttr = (props.tabindex !== undefined || props.tabIndex !== undefined)
            ? ' tabindex="' + (props.tabindex !== undefined ? props.tabindex : props.tabIndex) + '"'
            : '';

        var dataAct = props.dataAct || props['data-act'];
        var dataActAttr = dataAct ? ' data-act="' + dataAct + '"' : '';

        var dataP = props.dataP || props['data-p'];
        var dataPAttr = dataP ? ' data-p="' + dataP + '"' : '';

        var dataD = props.dataD || props['data-d'];
        var dataDAttr = dataD ? ' data-d="' + dataD + '"' : '';

        var dataRef = props.dataRef || props['data-ref'];
        var dataRefAttr = dataRef ? ' data-ref="' + dataRef + '"' : '';

        var dataIdx = props.dataIdx !== undefined ? props.dataIdx : props['data-idx'];
        var dataIdxAttr = dataIdx !== undefined ? ' data-idx="' + dataIdx + '"' : '';

        var dataCount = props.dataCount !== undefined ? props.dataCount : props['data-count'];
        var dataCountAttr = dataCount !== undefined ? ' data-count="' + dataCount + '"' : '';

        var dataOldIdx = props.dataOldIdx !== undefined ? props.dataOldIdx : props['data-old-idx'];
        var dataOldIdxAttr = dataOldIdx !== undefined ? ' data-old-idx="' + dataOldIdx + '"' : '';

        var dataDismiss = props.dataDismiss || props['data-bs-dismiss'];
        var dataDismissAttr = dataDismiss ? ' data-bs-dismiss="' + dataDismiss + '"' : '';

        var dataToggle = props.dataToggle || props['data-bs-toggle'];
        var dataToggleAttr = dataToggle ? ' data-bs-toggle="' + dataToggle + '"' : '';

        var dataTarget = props.dataTarget || props['data-bs-target'];
        var dataTargetAttr = dataTarget ? ' data-bs-target="' + dataTarget + '"' : '';

        var styleAttr = props.style ? ' style="' + props.style + '"' : '';
        var disabledAttr = disabled ? ' disabled' : '';

        var onclickAttr = '';
        var clickHandler = props.onClick || props.onclick || props.clickHandler;
        if (typeof clickHandler === 'string') {
            onclickAttr = ' onclick="' + clickHandler + '"';
        }

        var baseVariantCls = BUTTON_VARIANTS[variant] !== undefined ? BUTTON_VARIANTS[variant] : (variant || '');
        var sizeCls = BUTTON_SIZES[size] !== undefined ? BUTTON_SIZES[size] : (size || '');

        var classList = [];
        if (baseVariantCls) classList.push(baseVariantCls);
        if (sizeCls) classList.push(sizeCls);
        if (className) classList.push(className);
        var fullClass = classList.join(' ').trim();
        var classAttr = fullClass ? ' class="' + fullClass + '"' : '';

        var iconHtml = '';
        if (icon) {
            if (typeof icon === 'string' && (icon.trim().startsWith('<') || icon.trim().startsWith('&'))) {
                iconHtml = icon;
            } else if (typeof renderIcon === 'function') {
                var iconOpts = typeof icon === 'string' ? { name: icon } : icon;
                iconHtml = renderIcon(iconOpts);
            }
        }

        var content = '';
        if (iconHtml) {
            if (iconPosition === 'right') {
                content = (label ? label + ' ' : '') + iconHtml;
            } else {
                content = iconHtml + (label ? (iconHtml.endsWith(' ') || String(label).startsWith(' ') ? '' : ' ') + label : '');
            }
        } else {
            content = label;
        }

        var extraAttrs = '';
        if (props.attrs) {
            if (typeof props.attrs === 'string') {
                extraAttrs = ' ' + props.attrs.trim();
            } else if (typeof props.attrs === 'object') {
                Object.keys(props.attrs).forEach(function (k) {
                    extraAttrs += ' ' + k + '="' + props.attrs[k] + '"';
                });
            }
        }

        return '<button type="' + type + '"' +
            classAttr +
            idAttr +
            titleAttr +
            ariaLabelAttr +
            ariaDisabled +
            ariaExpanded +
            roleAttr +
            tabIndexAttr +
            dataActAttr +
            dataPAttr +
            dataDAttr +
            dataRefAttr +
            dataIdxAttr +
            dataCountAttr +
            dataOldIdxAttr +
            dataDismissAttr +
            dataToggleAttr +
            dataTargetAttr +
            onclickAttr +
            styleAttr +
            disabledAttr +
            extraAttrs +
            '>' + content + '</button>';
    }

    Button.render = Button;

    Button.create = function (props) {
        props = props || {};
        var html = Button(props);
        if (typeof document !== 'undefined') {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = html.trim();
            var el = wrapper.firstElementChild;
            var clickHandler = props.onClick || props.onclick || props.clickHandler;
            if (typeof clickHandler === 'function' && el) {
                el.addEventListener('click', clickHandler);
            }
            return el;
        }
        return null;
    };

    window.BUTTON_VARIANTS = BUTTON_VARIANTS;
    window.BUTTON_SIZES = BUTTON_SIZES;
    window.Button = Button;
    window.renderButton = Button;

    /* Custom Element: <app-button> */
    if (typeof window !== 'undefined' && typeof window.customElements !== 'undefined' && typeof HTMLElement !== 'undefined') {
        if (!customElements.get('app-button')) {
            var AppButton = class extends HTMLElement {
                static get observedAttributes() {
                    return [
                        'label', 'type', 'variant', 'size', 'disabled',
                        'icon', 'icon-position', 'class', 'class-name',
                        'data-act', 'data-p', 'data-d', 'data-ref', 'data-idx',
                        'data-count', 'data-old-idx', 'data-bs-dismiss',
                        'data-bs-toggle', 'data-bs-target', 'title', 'aria-label',
                        'id', 'style'
                    ];
                }
                connectedCallback() {
                    this.render();
                }
                render() {
                    if (!this.parentNode) return;
                    var props = {};
                    for (var i = 0; i < this.attributes.length; i++) {
                        var attr = this.attributes[i];
                        props[attr.name] = attr.value;
                    }
                    props.label = this.getAttribute('label') !== null ? this.getAttribute('label') : this.innerHTML.trim();
                    props.type = this.getAttribute('type') || 'button';
                    props.variant = this.getAttribute('variant') || 'brand';
                    props.size = this.getAttribute('size') || 'md';
                    props.disabled = this.hasAttribute('disabled');
                    props.className = this.getAttribute('class-name') || this.getAttribute('class') || '';
                    props.icon = this.getAttribute('icon') || undefined;
                    props.iconPosition = this.getAttribute('icon-position') || 'left';
                    var div = document.createElement('div');
                    div.innerHTML = Button(props).trim();
                    var newBtn = div.firstElementChild;
                    if (newBtn) {
                        this.replaceWith(newBtn);
                    }
                }
            };
            customElements.define('app-button', AppButton);
        }
    }

})(typeof window !== 'undefined' ? window : global);
