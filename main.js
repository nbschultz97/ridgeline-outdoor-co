/* Twin Cities Animal Rescue — interactive behavior */
(function () {
    'use strict';

    var PETS = [
        { id: 'd-01', title: 'Rosco', category: 'dogs', age: 8, sizeNote: 'Large · Bernese mix', icon: '◆' },
        { id: 'd-02', title: 'Maple', category: 'dogs', age: 2, sizeNote: 'Medium · Shepherd mix', icon: '◇' },
        { id: 'd-03', title: 'Biscuit', category: 'dogs', age: 5, sizeNote: 'Small · Terrier mix', icon: '○' },
        { id: 'c-01', title: 'Juniper', category: 'cats', age: 3, sizeNote: 'Tabby · very affectionate', icon: '▲' },
        { id: 'c-02', title: 'Onyx', category: 'cats', age: 6, sizeNote: 'Domestic shorthair · calm', icon: '△' },
        { id: 'c-03', title: 'Clementine', category: 'cats', age: 1, sizeNote: 'Kitten · playful', icon: '◼' },
        { id: 's-01', title: 'Pip', category: 'small', age: 1, sizeNote: 'Guinea pig · bonded pair available', icon: '◫' },
        { id: 's-02', title: 'Hazel', category: 'small', age: 2, sizeNote: 'Rabbit · litter trained', icon: '◨' },
        { id: 's-03', title: 'Sunny', category: 'small', age: 4, sizeNote: 'Rabbit · loves being held', icon: '◧' }
    ];

    var FAVORITES_STORAGE_KEY = 'tcar-favorites';

    function loadFavorites() {
        try {
            var raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
            var parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            return [];
        }
    }

    function saveFavorites(items) {
        try {
            window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
        } catch (err) {
            // localStorage unavailable (private browsing, quota, etc.) — fail silently, favorites still work in-memory
        }
    }

    var favorites = loadFavorites();

    function renderPetCard(pet) {
        var isSaved = favorites.indexOf(pet.id) !== -1;
        var li = document.createElement('article');
        li.className = 'product';
        li.dataset.category = pet.category;
        li.dataset.age = String(pet.age);
        li.innerHTML =
            '<div class="product-art" data-cat="' + pet.category + '" aria-hidden="true">' + pet.icon + '</div>' +
            '<div class="product-body">' +
                '<p class="product-cat">' + pet.category + '</p>' +
                '<h3 class="product-title">' + pet.title + '</h3>' +
                '<div class="product-meta"><span>' + pet.age + (pet.age === 1 ? ' yr' : ' yrs') + '</span><span class="product-price">' + pet.sizeNote + '</span></div>' +
                '<button type="button" class="product-cta" data-fav="' + pet.id + '" aria-pressed="' + isSaved + '">' + (isSaved ? 'Saved ♥' : 'Save to my list') + '</button>' +
            '</div>';
        return li;
    }

    function updateFavoritesCount() {
        var el = document.getElementById('cart-count');
        if (!el) return;
        var total = favorites.length;
        el.textContent = String(total);
        el.parentElement.setAttribute('aria-label', 'Saved interests, ' + total + ' item' + (total === 1 ? '' : 's'));
    }

    function toggleFavorite(petId) {
        var index = favorites.indexOf(petId);
        var nowSaved;
        if (index === -1) {
            favorites.push(petId);
            nowSaved = true;
        } else {
            favorites.splice(index, 1);
            nowSaved = false;
        }
        saveFavorites(favorites);
        updateFavoritesCount();
        var btn = document.querySelector('[data-fav="' + petId + '"]');
        if (btn) {
            btn.textContent = nowSaved ? 'Saved ♥' : 'Save to my list';
            btn.setAttribute('aria-pressed', String(nowSaved));
        }
    }

    // Restore saved-interests badge from localStorage on every page load
    updateFavoritesCount();

    // Featured pets on home
    var featuredEl = document.getElementById('featured-pets');
    if (featuredEl) {
        PETS.slice(0, 6).forEach(function (pet) {
            featuredEl.appendChild(renderPetCard(pet));
        });
    }

    // Services page: full list with filters
    var shopEl = document.getElementById('shop-products');
    if (shopEl) {
        function applyFilters() {
            var cats = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(function (c) { return c.value; });
            var maxAge = Number(document.getElementById('weight-max').value);
            var filtered = PETS.filter(function (p) {
                return cats.indexOf(p.category) !== -1 && p.age <= maxAge;
            });
            shopEl.innerHTML = '';
            filtered.forEach(function (pet) { shopEl.appendChild(renderPetCard(pet)); });
            var rc = document.getElementById('result-count');
            if (rc) rc.textContent = filtered.length + ' animal' + (filtered.length === 1 ? '' : 's');
        }
        applyFilters();
        document.querySelectorAll('input[name="category"]').forEach(function (cb) {
            cb.addEventListener('change', applyFilters);
        });
        var ageSlider = document.getElementById('weight-max');
        var ageOut = document.getElementById('weight-max-out');
        ageSlider.addEventListener('input', function () {
            ageOut.textContent = ageSlider.value + ' yrs';
            applyFilters();
        });
    }

    // Delegated save-to-list toggle
    document.addEventListener('click', function (event) {
        var t = event.target;
        if (t && t.matches && t.matches('[data-fav]')) {
            toggleFavorite(t.getAttribute('data-fav'));
        }
    });

    // Mobile nav toggle
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    // Newsletter form
    var newsletter = document.getElementById('newsletter-form');
    if (newsletter) {
        var nlInput = document.getElementById('newsletter-email');
        var nlHelp = document.getElementById('newsletter-help');
        newsletter.addEventListener('submit', function (event) {
            event.preventDefault();
            var value = nlInput.value.trim();
            var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            if (!valid) {
                nlHelp.textContent = 'Please enter a valid email address.';
                nlInput.focus();
                return;
            }
            nlHelp.textContent = 'Thanks — you’re on the list. Look for our next update in your inbox.';
            newsletter.reset();
        });
    }

    // Contact form: validation, char count, simulated submit
    var contactForm = document.getElementById('contact-form');
    if (contactForm) {
        var nameInput = document.getElementById('contact-name');
        var emailInput = document.getElementById('contact-email');
        var topicInput = document.getElementById('contact-topic');
        var messageInput = document.getElementById('contact-message');
        var charCount = document.getElementById('char-count');
        var status = document.getElementById('contact-status');

        function setRowValidity(input, helpId, valid, msg) {
            var row = input.closest('.form-row');
            var help = document.getElementById(helpId);
            row.classList.toggle('is-invalid', !valid);
            if (help) help.textContent = valid ? '' : msg;
        }

        function validateName() {
            var v = nameInput.value.trim();
            setRowValidity(nameInput, 'contact-name-help', v.length >= 2, 'Please enter your name.');
            return v.length >= 2;
        }
        function validateEmail() {
            var v = emailInput.value.trim();
            var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            setRowValidity(emailInput, 'contact-email-help', ok, 'Please enter a valid email address.');
            return ok;
        }
        function validateMessage() {
            var v = messageInput.value.trim();
            var ok = v.length >= 10;
            setRowValidity(messageInput, 'contact-message-help', ok, 'Message should be at least 10 characters.');
            return ok;
        }

        messageInput.addEventListener('input', function () {
            charCount.textContent = messageInput.value.length + ' / 600';
        });
        nameInput.addEventListener('blur', validateName);
        emailInput.addEventListener('blur', validateEmail);
        messageInput.addEventListener('blur', validateMessage);

        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();
            // Run all three validators (not short-circuited) so every invalid field shows its own message at once.
            var nameOk = validateName();
            var emailOk = validateEmail();
            var messageOk = validateMessage();
            var ok = nameOk && emailOk && messageOk;
            if (!ok) {
                status.textContent = 'Please fix the highlighted fields and try again.';
                return;
            }
            if (!topicInput.value) {
                status.textContent = 'Please select an interest type.';
                return;
            }
            status.textContent = 'Message sent — we’ll reply within one business day.';
            contactForm.reset();
            charCount.textContent = '0 / 600';
            contactForm.querySelectorAll('.form-row').forEach(function (row) { row.classList.remove('is-invalid'); });
        });
    }
})();
