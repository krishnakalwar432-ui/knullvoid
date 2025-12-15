/**
 * KNULLVOID Multigame Portal
 * Based on MonkeyGG2 - Modified to remove cloak/redirect system
 * Added: X/Back button, ESC key support, smooth animations
 */

let currentMenu = $('.homepage');
let currentGameName = '';

// ============================================
// NAVIGATION HANDLERS
// ============================================

$('.column button .card').on('click', function () {
    let nextMenu = this.getAttribute('data');

    if (nextMenu === 'proxy') {
        if (!config['proxy']) {
            $('#disabled').showModal();
            return;
        }
        openGame(config['proxyPath'] || '/proxy', 'Proxy');
        return;
    }

    currentMenu.fadeOut(300, () => {
        $('.' + nextMenu).fadeIn(200);
    });
    currentMenu = $('.' + nextMenu);
});

$('logo img').on('click', returnHome);
$('#refresh').on('click', refreshPage);

$('dialog').on('click', function (e) {
    if (!e.originalEvent.target.closest('div')) {
        e.originalEvent.target.close();
    }
});

// ============================================
// GAME OPEN/CLOSE FUNCTIONS
// ============================================

/**
 * Opens a game in the iframe with smooth animation
 * @param {string} url - The URL of the game to load
 * @param {string} name - The name of the game (optional)
 */
function openGame(url, name = 'Game') {
    currentGameName = name;
    $('#current-game-name').text(name);
    
    $('#everything-else').fadeOut(300, () => {
        $('#page-loader').addClass('opening').fadeIn(300, function() {
            $(this).removeClass('opening');
        });
        $('#page-loader iframe').attr('src', url);
        $('#page-loader iframe')[0].focus();
    });
    currentMenu = $('#page-loader');
    inGame = !preferences.background;
}

/**
 * Closes the current game and returns to main menu
 * This is the main function called by the X button and ESC key
 */
function closeGame() {
    // Add closing animation
    $('#page-loader').addClass('closing');
    
    setTimeout(() => {
        // Clear iframe source to stop game audio/video
        $('#page-loader iframe').attr('src', '');
        
        // Hide game loader and show main content
        $('#page-loader').removeClass('closing').hide();
        $('#everything-else').fadeIn(300);
        
        // Return to homepage
        $('.games').hide();
        $('.settings').hide();
        $('.homepage').fadeIn(200);
        currentMenu = $('.homepage');
        
        // Reset game state
        inGame = !preferences.background;
        currentGameName = '';
    }, 250);
}

/**
 * Returns the user to the home page (from games/settings menu)
 */
function returnHome() {
    // If in a game, close it first
    if (currentMenu.is('#page-loader') || $('#page-loader').is(':visible')) {
        closeGame();
        return;
    }
    
    currentMenu.fadeOut(300, () => {
        $('#everything-else').fadeIn(200);
        $('.games').hide();
        $('.settings').hide();
        $('.homepage').fadeIn(200);
    });
    currentMenu = $('.homepage');
    inGame = !preferences.background;
}

/**
 * Refreshes the current page/game iframe
 */
function refreshPage() {
    const iframe = $('#page-loader iframe');
    const oldUrl = iframe.attr('src');
    
    if (oldUrl) {
        iframe.attr('src', '');
        setTimeout(() => {
            iframe.attr('src', oldUrl);
            iframe[0].focus();
        }, 50);
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

// ESC key to close game
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        e.preventDefault();
        if ($('#page-loader').is(':visible')) {
            closeGame();
        }
    }
});

// Easter egg sequences
const sequences = [
    { keys: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA', 'Enter'], action: () => alert('Welcome to KNULLVOID!') },
    { keys: ['KeyL', 'KeyE', 'KeyT', 'Space', 'KeyI', 'KeyT', 'Space', 'KeyS', 'KeyN', 'KeyO', 'KeyW'], action: snow },
];

let sequenceIndex = 0;

document.addEventListener('keydown', (event) => {
    // Skip if in game iframe (let game handle keys)
    if ($('#page-loader').is(':visible') && event.key !== 'Escape') {
        return;
    }
    
    var failed = true;
    for (const sequence of sequences) {
        if (event.code === sequence.keys[sequenceIndex]) {
            failed = false;
            sequenceIndex++;

            if (sequenceIndex === sequence.keys.length) {
                sequence.action();
                sequenceIndex = 0;
            }
        } else if (event.code === sequence.keys[0]) {
            failed = false;
            sequenceIndex = 1;
        }
    }
    if (failed) {
        sequenceIndex = 0;
    }
});

// ============================================
// SEARCH AND FILTER
// ============================================

// Jaro-Winkler similarity for fuzzy search
function jaro_distance(s1, s2) {
    if (s1 == s2) return 1.0;

    let len1 = s1.length,
        len2 = s2.length;

    if (len1 == 0 || len2 == 0) return 0.0;

    let max_dist = Math.floor(Math.max(len1, len2) / 2) - 1;
    let match = 0;

    let hash_s1 = new Array(s1.length).fill(0);
    let hash_s2 = new Array(s2.length).fill(0);

    for (let i = 0; i < len1; i++) {
        for (let j = Math.max(0, i - max_dist); j < Math.min(len2, i + max_dist + 1); j++)
            if (s1[i] == s2[j] && hash_s2[j] == 0) {
                hash_s1[i] = 1;
                hash_s2[j] = 1;
                match++;
                break;
            }
    }

    if (match == 0) return 0.0;

    let t = 0;
    let point = 0;

    for (let i = 0; i < len1; i++)
        if (hash_s1[i] == 1) {
            while (hash_s2[point] == 0) point++;
            if (s1[i] != s2[point++]) t++;
        }
    t /= 2;

    return (match / len1 + match / len2 + (match - t) / match) / 3.0;
}

function jaroWinklerSimilarity(s1, s2) {
    let jaro_dist = jaro_distance(s1, s2);

    if (jaro_dist > 0.7) {
        let prefix = 0;
        for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
            if (s1[i] == s2[i]) prefix++;
            else break;
        }
        prefix = Math.min(4, prefix);
        jaro_dist += 0.1 * prefix * (1 - jaro_dist);
    }
    return jaro_dist.toFixed(6);
}

function updateList() {
    const filter = $('#search').val().toLowerCase();
    const elems = Array.from(document.querySelectorAll('#gamesList li'));
    const sortType = $('#sort').val();

    elems.sort(function (a, b) {
        if (sortType === 'alphabetical') {
            return a.textContent.localeCompare(b.textContent);
        } else if (sortType === 'reverse') {
            return b.textContent.localeCompare(a.textContent);
        }
    });

    elems.forEach(function (item) {
        let similarity = jaroWinklerSimilarity(filter, item.innerHTML.toLowerCase().slice(0, filter.length - 1));
        if (item.getAttribute('aliases')) {
            for (alias in item.getAttribute('aliases').split(',')) {
                if (alias.length > 1) {
                    similarity += jaroWinklerSimilarity(filter, alias.toLowerCase().slice(0, filter.length - 1));
                }
            }
        }

        if ((similarity >= 0.7 && item.innerHTML.length > 2) || item.innerHTML.toLowerCase().indexOf(filter) > -1) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });

    elems.sort(function (a, b) {
        let distanceA = jaroWinklerSimilarity(filter, a.textContent.toLowerCase());
        if (a.getAttribute('aliases')) {
            for (alias in a.getAttribute('aliases').split(',')) {
                distanceA += jaroWinklerSimilarity(filter, alias.toLowerCase());
            }
        }

        let distanceB = jaroWinklerSimilarity(filter, b.textContent.toLowerCase());
        if (b.getAttribute('aliases')) {
            for (alias in b.getAttribute('aliases').split(',')) {
                distanceB += jaroWinklerSimilarity(filter, alias.toLowerCase());
            }
        }
        return distanceA - distanceB;
    });

    for (const item of elems) {
        document.getElementById('gamesList').appendChild(item);
        updateGameList();
    }
}

$('#search').on('input', updateList);
$('#sort').on('change', updateList);

// ============================================
// RANDOM GAME
// ============================================

function randomGame() {
    const gameLinks = document.querySelectorAll('#gamesList li');
    const visibleGames = Array.from(gameLinks).filter(li => li.style.display !== 'none');
    
    if (visibleGames.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * visibleGames.length);
    const randomGameLink = visibleGames[randomIndex];
    const url = randomGameLink.getAttribute('url');
    const name = randomGameLink.textContent.trim();
    
    openGame(url, name);
}

// ============================================
// SNOW EASTER EGG
// ============================================

function snow() {
    function i() {
        this.D = function () {
            const t = h.atan(this.i / this.d);
            l.save(),
                l.translate(this.b, this.a),
                l.rotate(-t),
                l.scale(this.e, this.e * h.max(1, h.pow(this.j, 0.7) / 15)),
                l.drawImage(m, -v / 2, -v / 2),
                l.restore();
        };
    }
    window;
    const h = Math,
        r = h.random,
        a = document,
        o = Date.now;
    (e = (t) => {
        l.clearRect(0, 0, _, f), l.fill(), requestAnimationFrame(e);
        const i = 0.001 * y.et;
        y.r();
        const s = L.et * g;
        for (var n = 0; n < C.length; ++n) {
            const t = C[n];
            (t.i = h.sin(s + t.g) * t.h),
                (t.j = h.sqrt(t.i * t.i + t.f)),
                (t.a += t.d * i),
                (t.b += t.i * i),
                t.a > w && (t.a = -u),
                t.b > b && (t.b = -u),
                t.b < -u && (t.b = b),
                t.D();
        }
    }),
        (s = (t) => {
            for (var e = 0; e < p; ++e) (C[e].a = r() * (f + u)), (C[e].b = r() * _);
        }),
        (n = (t) => {
            (c.width = _ = innerWidth), (c.height = f = innerHeight), (w = f + u), (b = _ + u), s();
        });
    class d {
        constructor(t, e = !0) {
            (this._ts = o()), (this._p = !0), (this._pa = o()), (this.d = t), e && this.s();
        }
        get et() {
            return this.ip ? this._pa - this._ts : o() - this._ts;
        }
        get rt() {
            return h.max(0, this.d - this.et);
        }
        get ip() {
            return this._p;
        }
        get ic() {
            return this.et >= this.d;
        }
        s() {
            return (this._ts = o() - this.et), (this._p = !1), this;
        }
        r() {
            return (this._pa = this._ts = o()), this;
        }
        p() {
            return (this._p = !0), (this._pa = o()), this;
        }
        st() {
            return (this._p = !0), this;
        }
    }
    const c = a.createElement('canvas');
    (H = c.style),
        (H.position = 'fixed'),
        (H.left = 0),
        (H.top = 0),
        (H.width = '100vw'),
        (H.height = '100vh'),
        (H.zIndex = '100000'),
        (H.pointerEvents = 'none'),
        a.body.insertBefore(c, a.body.children[0]);
    const l = c.getContext('2d'),
        p = 300,
        g = 5e-4,
        u = 20;
    let _ = (c.width = innerWidth),
        f = (c.height = innerHeight),
        w = f + u,
        b = _ + u;
    const v = 15.2,
        m = a.createElement('canvas'),
        E = m.getContext('2d'),
        x = E.createRadialGradient(7.6, 7.6, 0, 7.6, 7.6, 7.6);
    x.addColorStop(0, 'hsla(180,100%,50%,1)'),
        x.addColorStop(1, 'hsla(180,100%,50%,0)'),
        (E.fillStyle = x),
        E.fillRect(0, 0, v, v);
    let y = new d(0, !0),
        C = [],
        L = new d(0, !0);
    for (var j = 0; j < p; ++j) {
        const t = new i();
        (t.a = r() * (f + u)),
            (t.b = r() * _),
            (t.c = 1 * (3 * r() + 0.8)),
            (t.d = 0.1 * h.pow(t.c, 2.5) * 50 * (2 * r() + 1)),
            (t.d = t.d < 65 ? 65 : t.d),
            (t.e = t.c / 7.6),
            (t.f = t.d * t.d),
            (t.g = (r() * h.PI) / 1.3),
            (t.h = 15 * t.c),
            (t.i = 0),
            (t.j = 0),
            C.push(t);
    }
    s(), (EL = a.addEventListener), EL('visibilitychange', () => setTimeout(n, 100), !1), EL('resize', n, !1), e();
}

// ============================================
// SAVE/LOAD FUNCTIONALITY
// ============================================

function getMainSave() {
    var mainSave = {};
    localStorageSave = Object.entries(localStorage);
    localStorageSave = btoa(JSON.stringify(localStorageSave));
    mainSave.localStorage = localStorageSave;
    cookiesSave = document.cookie;
    cookiesSave = btoa(cookiesSave);
    mainSave.cookies = cookiesSave;
    mainSave = btoa(JSON.stringify(mainSave));
    mainSave = CryptoJS.AES.encrypt(mainSave, 'save').toString();
    return mainSave;
}

function downloadMainSave() {
    var data = new Blob([getMainSave()]);
    var dataURL = URL.createObjectURL(data);
    var fakeElement = document.createElement('a');
    fakeElement.href = dataURL;
    fakeElement.download = 'knullvoid.data';
    fakeElement.click();
    URL.revokeObjectURL(dataURL);
}

function getMainSaveFromUpload(data) {
    data = CryptoJS.AES.decrypt(data, 'save').toString(CryptoJS.enc.Utf8);
    var mainSave = JSON.parse(atob(data));
    var mainLocalStorageSave = JSON.parse(atob(mainSave.localStorage));
    var cookiesSave = atob(mainSave.cookies);

    for (let item in mainLocalStorageSave) {
        localStorage.setItem(mainLocalStorageSave[item][0], mainLocalStorageSave[item][1]);
    }
    document.cookie = cookiesSave;
}

function uploadMainSave() {
    var hiddenUpload = document.createElement('input');
    hiddenUpload.type = 'file';
    hiddenUpload.accept = '.data';
    document.body.appendChild(hiddenUpload);
    hiddenUpload.click();

    hiddenUpload.addEventListener('change', function (e) {
        var files = e.target.files;
        var file = files[0];

        if (!file) return;

        var reader = new FileReader();
        reader.onload = function (e) {
            getMainSaveFromUpload(e.target.result);
            var uploadResult = document.querySelector('.upload-result');
            uploadResult.innerText = 'Uploaded save!';
            setTimeout(function () {
                uploadResult.innerText = '';
            }, 3000);
        };
        reader.readAsText(file);
        document.body.removeChild(hiddenUpload);
    });
}

// ============================================
// KEYBIND CONFIGURATION
// ============================================

const keyConfig = JSON.parse(localStorage.getItem('keyConfig')) || {};
const keySlots = document.querySelectorAll('.keySlot');
const actions = document.querySelectorAll('.slot-action');

for (var slot in keyConfig) {
    if (keyConfig.hasOwnProperty(slot)) {
        for (var key in keyConfig[slot]) {
            if (keyConfig[slot].hasOwnProperty(key)) {
                var correctKey = keyConfig[slot][key];
                var slotDiv = document.getElementById(slot);
                if (slotDiv) {
                    if (key.includes('keySlot')) {
                        key = key.replace(/-/g, ' ');
                    }
                    var keyElement = slotDiv.getElementsByClassName(key)[0];
                    if (keyElement) {
                        if (key != 'slot-action') {
                            keyElement.textContent = correctKey;
                        } else {
                            for (var i = 0; i < keyElement.options.length; i++) {
                                if (keyElement.options[i].value === correctKey) {
                                    keyElement.selectedIndex = i;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

actions.forEach((action) => {
    action.addEventListener('change', () => {
        slot = action.parentNode.id;
        if (!keyConfig[slot]) {
            keyConfig[slot] = {};
        }
        keyConfig[slot]["slot-action"] = action.value;
        localStorage.setItem('keyConfig', JSON.stringify(keyConfig));
    });
});

keySlots.forEach((slot) => {
    slot.addEventListener('click', () => {
        slot.textContent = 'Press any key';

        const keyPressHandler = (event) => {
            slot.textContent = event.key;
            document.removeEventListener('keydown', keyPressHandler);
            parSlot = event.target.parentNode.id;
            if (!keyConfig[parSlot]) {
                keyConfig[parSlot] = {};
            }
            key = event.target.className.replace(/ /g, "-");
            keyConfig[parSlot][key] = event.key;
            localStorage.setItem('keyConfig', JSON.stringify(keyConfig));
        };

        document.addEventListener('keydown', keyPressHandler);
    });
});

var pressedKeys = {};

function onKeyRelease(event) {
    var key = event.key.toLowerCase();
    pressedKeys[key] = false;
}

function onKeyPress(event) {
    var key = event.key.toLowerCase();
    pressedKeys[key] = true;
    for (var slot in keyConfig) {
        if (keyConfig.hasOwnProperty(slot)) {
            if (
                keyConfig[slot]["keySlot-1"] &&
                keyConfig[slot]["keySlot-1"] &&
                keyConfig[slot]["slot-action"]
            ) {
                var keyPressed = event.key.toLowerCase();
                var key1Config = keyConfig[slot]["keySlot-1"].toLowerCase();
                var key2Config = keyConfig[slot]["keySlot-2"].toLowerCase();
                var key3Config = (keyConfig[slot]["keySlot-3"] || "").toLowerCase();
                if (pressedKeys[key1Config] && pressedKeys[key2Config] && ((key3Config) ? pressedKeys[key3Config] : true)) {
                    eval(keyConfig[slot]["slot-action"]);
                }
            }
        }
    }
}

document.addEventListener('keydown', onKeyPress);
document.addEventListener('keyup', onKeyRelease);

// ============================================
// COLOR SETTINGS
// ============================================

const defaultColorSettings = {
    bg: '#0a0a12',
    'block-color': '#0f1a2b',
    'button-color': '#0d1520',
    'games-color': '#0d1520',
    'hover-color': '#1a2a40',
    'scrollbar-color': '#00ffff',
    'scroll-track-color': '#0a0a12',
    'font-color': '#e0f7ff',
};

const colorSettings = JSON.parse(localStorage.getItem('colorSettings')) || defaultColorSettings;

// Set input values
Object.keys(colorSettings).forEach((key) => {
    const inputElement = document.getElementById(key);
    if (inputElement) {
        inputElement.value = colorSettings[key];
    }
});

// Set CSS variables
Object.entries(colorSettings).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
});

function saveColorChanges() {
    const inputs = document.querySelectorAll('input[type="color"]');
    const newColorSettings = {};

    inputs.forEach((input) => {
        newColorSettings[input.id] = input.value;
    });

    localStorage.setItem('colorSettings', JSON.stringify(newColorSettings));

    Object.entries(newColorSettings).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
    });
}

function restoreColorChanges() {
    localStorage.removeItem('colorSettings');
    
    Object.entries(defaultColorSettings).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
    });
    
    // Update input values
    Object.keys(defaultColorSettings).forEach((key) => {
        const inputElement = document.getElementById(key);
        if (inputElement) {
            inputElement.value = defaultColorSettings[key];
        }
    });
}

// ============================================
// PREFERENCES (Background only - no cloak/mask)
// ============================================

const preferencesDefaults = {
    background: true,
};

if (localStorage.getItem('preferences') == null) {
    localStorage.setItem('preferences', JSON.stringify(preferencesDefaults));
}

const preferences = JSON.parse(localStorage.getItem('preferences'));
const backgroundCheckbox = document.getElementById('backgroundCheckboxInput');

if (backgroundCheckbox) {
    backgroundCheckbox.checked = preferences.background;
    
    backgroundCheckbox.addEventListener('change', function () {
        preferences.background = backgroundCheckbox.checked;
        localStorage.setItem('preferences', JSON.stringify(preferences));
        inGame = !preferences.background;
    });
}

// ============================================
// DOWNLOAD/UPLOAD BUTTONS
// ============================================

document.getElementById('download')?.addEventListener('click', function () {
    downloadMainSave();
});

document.getElementById('upload')?.addEventListener('click', function () {
    uploadMainSave();
});

// ============================================
// GAME LIST CLICK HANDLER
// ============================================

// This function is called from loading.js to set up game click handlers
function setupGameClickHandlers() {
    $('#gamesList li').on('click', function() {
        const url = $(this).attr('url');
        const name = $(this).text().trim();
        if (url) {
            openGame(url, name);
        }
    });
}

// Make functions globally available
window.openGame = openGame;
window.closeGame = closeGame;
window.returnHome = returnHome;
window.refreshPage = refreshPage;
window.randomGame = randomGame;
window.setupGameClickHandlers = setupGameClickHandlers;
