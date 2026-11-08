/* ============================================================
   Nur Prayer — Old Tasbeeh Form Component
   Path: features/tasbeeh/tasbeeh-old/tasbeeh-old-form/tasbeeh-old-form.js
   ============================================================ */

import { CurrentFormViewModel } from '../../tasbeeh-current/tasbeeh-current-form/tasbeeh-current-form.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const OldFormTemplate = {
    element: 'tasbeeh-old-form-template',
    file: 'features/tasbeeh/tasbeeh-old/tasbeeh-old-form/tasbeeh-old-form.html'
};

export function OldFormViewModel(params) {
    if (params instanceof OldFormViewModel) return params;
    if (!(this instanceof OldFormViewModel)) return new OldFormViewModel(params);
    return new CurrentFormViewModel(params);
}

if (typeof window !== 'undefined') {
    window.OldFormViewModel = OldFormViewModel;
}

export default OldFormViewModel;

