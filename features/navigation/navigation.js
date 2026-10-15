/* ---------- Navigation ---------- */
var PAGES = ['dashboardPage', 'currentPage', 'oldPage', 'settingsPage', 'tasbeehPage'];
var NAVS = { dashboard: 'navHome', current: 'navCur', old: 'navOld', settings: 'navSet', tasbeeh: 'navTasbeeh' };

function setNav(id) {
    Object.values(NAVS).forEach(function (n) {
        var b = $(n);
        if (!b) return;
        b.classList.remove('text-success');
        b.classList.add('text-secondary');
        var bar = b.querySelector('.bg-success');
        if (bar) bar.remove();
    });
    var el = $(id);
    if (!el) return;
    el.classList.remove('text-secondary');
    el.classList.add('text-success');
    var bar = document.createElement('span');
    bar.className = 'bg-success rounded-pill';
    bar.style.width = '30px';
    bar.style.height = '3px';
    bar.style.marginTop = '2px';
    el.appendChild(bar);
}

function showPage(kind) {
    PAGES.forEach(function (id) {
        var el = $(id);
        if (el) { el.classList.add('d-none'); el.classList.remove('d-flex'); }
    });

    var target = kind === 'dashboard' ? 'dashboardPage' :
        kind === 'current' ? 'currentPage' :
            kind === 'old' ? 'oldPage' :
                kind === 'settings' ? 'settingsPage' :
                    kind === 'tasbeeh' ? 'tasbeehPage' : null;

    if (!target) return;

    $(target).classList.remove('d-none');
    $(target).classList.add('d-flex');

    setNav(NAVS[kind]);

    if (kind === 'dashboard') rDashboard();
    else if (kind === 'current') rn();
    else if (kind === 'old') rOT();
    else if (kind === 'settings') rSET();
    else if (kind === 'tasbeeh') {
        if (window.TasbeehApp && typeof window.TasbeehApp.render === 'function') {
            window.TasbeehApp.render();
        }
    }
}
