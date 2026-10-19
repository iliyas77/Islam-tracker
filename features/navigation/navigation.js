/* ---------- Navigation ---------- */
var PAGES = ['dashboardPage', 'trackerPage', 'settingsPage', 'tasbeehPage', 'duasPage'];
var NAVS = { dashboard: 'navHome', tracker: 'navCur', current: 'navCur', old: 'navCur', settings: 'navSet', tasbeeh: 'navTasbeeh', duas: 'navDuas' };

var trackerSubTab = 'current';

function switchTrackerSubTab(subTab) {
    trackerSubTab = subTab || 'current';
    var btnCur = $('tabTrackCurrent');
    var btnOld = $('tabTrackOld');
    var bodyCur = $('currentBody');
    var bodyOld = $('oldBody');
    var oldSub = $('oldSub');
    var oldActionBtn = $('oldActionBtn');
    var headerIcon = $('trackerHeaderIcon');
    var headerLabel = $('trackerHeaderLabel');

    if (trackerSubTab === 'old') {
        if (btnCur) {
            btnCur.classList.remove('active');
            btnCur.setAttribute('aria-selected', 'false');
        }
        if (btnOld) {
            btnOld.classList.add('active');
            btnOld.setAttribute('aria-selected', 'true');
        }
        if (bodyCur) bodyCur.classList.add('d-none');
        if (bodyOld) bodyOld.classList.remove('d-none');
        if (oldSub) oldSub.classList.remove('d-none');
        if (oldActionBtn) oldActionBtn.classList.remove('d-none');
        if (headerIcon) {
            headerIcon.className = 'fa-solid fa-clock-rotate-left';
            headerIcon.style.color = '#cc7a00';
        }
        if (headerLabel) headerLabel.textContent = 'Old Tracking';
        rOT();
    } else {
        if (btnCur) {
            btnCur.classList.add('active');
            btnCur.setAttribute('aria-selected', 'true');
        }
        if (btnOld) {
            btnOld.classList.remove('active');
            btnOld.setAttribute('aria-selected', 'false');
        }
        if (bodyCur) bodyCur.classList.remove('d-none');
        if (bodyOld) bodyOld.classList.add('d-none');
        if (oldSub) oldSub.classList.add('d-none');
        if (oldActionBtn) oldActionBtn.classList.add('d-none');
        if (headerIcon) {
            headerIcon.className = 'fa-regular fa-calendar text-gr-accent';
            headerIcon.style.color = '';
        }
        if (headerLabel) headerLabel.textContent = 'Current Prayer';
        rn();
    }
}

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
        (kind === 'tracker' || kind === 'current' || kind === 'old') ? 'trackerPage' :
            kind === 'settings' ? 'settingsPage' :
                kind === 'tasbeeh' ? 'tasbeehPage' :
                    kind === 'duas' ? 'duasPage' : null;

    if (!target) return;

    var el = $(target);
    if (el) {
        el.classList.remove('d-none');
        el.classList.add('d-flex');
    }

    setNav(NAVS[kind] || 'navCur');

    if (kind === 'dashboard') {
        rDashboard();
    } else if (kind === 'current') {
        switchTrackerSubTab('current');
    } else if (kind === 'old') {
        switchTrackerSubTab('old');
    } else if (kind === 'tracker') {
        switchTrackerSubTab(trackerSubTab || 'current');
    } else if (kind === 'settings') {
        rSET();
    } else if (kind === 'tasbeeh') {
        if (window.TasbeehApp && typeof window.TasbeehApp.render === 'function') {
            window.TasbeehApp.render();
        }
    } else if (kind === 'duas') {
        if (window.DuasApp && typeof window.DuasApp.render === 'function') {
            window.DuasApp.render();
        }
    }
}
