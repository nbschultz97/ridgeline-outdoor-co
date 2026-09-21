/* Ridgeline Outdoor Co. — interactive behavior */
(function () {
    'use strict';

    var PRODUCTS = [
        { id: 't-01', title: 'Sierra 2P Tent', category: 'tents', weight: 1850, price: 489, icon: '▲' },
        { id: 't-02', title: 'Cirrus 1P Shelter', category: 'tents', weight: 780, price: 329, icon: '△' },
        { id: 't-03', title: 'Four-Season Basecamp', category: 'tents', weight: 2950, price: 695, icon: '◼' },
        { id: 'p-01', title: 'JMT 50L Pack', category: 'packs', weight: 1280, price: 249, icon: '◫' },
        { id: 'p-02', title: 'Weekender 30L', category: 'packs', weight: 760, price: 159, icon: '◨' },
        { id: 'p-03', title: 'Hauler 65L', category: 'packs', weight: 1640, price: 319, icon: '◧' },
        { id: 'a-01', title: 'Down Sweater', category: 'apparel', weight: 380, price: 219, icon: '◆' },
        { id: 'a-02', title: 'Hardshell Jacket', category: 'apparel', weight: 410, price: 329, icon: '◇' },
        { id: 'a-03', title: 'Merino Base Layer', category: 'apparel', weight: 220, price: 89, icon: '○' }
    ];

    var CART_STORAGE_KEY = 'ridgeline-cart';

    function loadCart() {
        try {
            var raw = window.localStorage.getItem(CART_STORAGE_KEY);
            var parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            return [];
        }
    }

    function saveCart(items) {
        try {
            window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch (err) {
            // localStorage unavailable (private browsing, quota, etc.) — fail silently, cart still works in-memory
        }
    }

    var cart = loadCart();

    function renderProductCard(product) {
        var li = document.createElement('article');
        li.className = 'product';
        li.dataset.category = product.category;
        li.dataset.weight = String(product.weight);
        li.innerHTML =
            '<div class="product-art" data-cat="' + product.category + '" aria-hidden="true">' + product.icon + '</div>' +
            '<div class="product-body">' +
                '<p class="product-cat">' + product.category + '</p>' +
                '<h3 class="product-title">' + product.title + '</h3>' +
                '<div class="product-meta"><span>' + product.weight + ' g</span><span class="product-price">$' + product.price + '</span></div>' +
                '<button type="button" class="product-cta" data-add="' + product.id + '">Add to cart</button>' +
            '</div>';
        return li;
    }

    function updateCartCount() {
        var el = document.getElementById('cart-count');
        if (!el) return;
        var total = cart.reduce(function (sum, entry) { return sum + entry.qty; }, 0);
        el.textContent = String(total);
        el.parentElement.setAttribute('aria-label', 'Cart, ' + total + ' item' + (total === 1 ? '' : 's'));
    }

    function addToCart(productId) {
        var existing = cart.find(function (e) { return e.id === productId; });
        if (existing) { existing.qty += 1; }
        else { cart.push({ id: productId, qty: 1 }); }
        saveCart(cart);
        updateCartCount();
        var btn = document.querySelector('[data-add="' + productId + '"]');
        if (btn) {
            var original = btn.textContent;
            btn.textContent = 'Added ✓';
            btn.disabled = true;
            setTimeout(function () {
                btn.textContent = original;
                btn.disabled = false;
            }, 1200);
        }
    }

    // Restore cart badge from localStorage on every page load
    updateCartCount();

    // Featured products on home
    var featuredEl = document.getElementById('featured-products');
    if (featuredEl) {
        PRODUCTS.slice(0, 6).forEach(function (product) {
            featuredEl.appendChild(renderProductCard(product));
        });
    }

    // Shop with filters
    var shopEl = document.getElementById('shop-products');
    if (shopEl) {
        function applyFilters() {
            var cats = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(function (c) { return c.value; });
            var maxWeight = Number(document.getElementById('weight-max').value);
            var filtered = PRODUCTS.filter(function (p) {
                return cats.indexOf(p.category) !== -1 && p.weight <= maxWeight;
            });
            shopEl.innerHTML = '';
            filtered.forEach(function (product) { shopEl.appendChild(renderProductCard(product)); });
            var rc = document.getElementById('result-count');
            if (rc) rc.textContent = filtered.length + ' product' + (filtered.length === 1 ? '' : 's');
        }
        applyFilters();
        document.querySelectorAll('input[name="category"]').forEach(function (cb) {
            cb.addEventListener('change', applyFilters);
        });
        var weight = document.getElementById('weight-max');
        var weightOut = document.getElementById('weight-max-out');
        weight.addEventListener('input', function () {
            weightOut.textContent = weight.value + ' g';
            applyFilters();
        });
    }

    // Delegated add-to-cart
    document.addEventListener('click', function (event) {
        var t = event.target;
        if (t && t.matches && t.matches('[data-add]')) {
            addToCart(t.getAttribute('data-add'));
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
            nlHelp.textContent = 'Thanks — you’re on the list. Look for our next field note in your inbox.';
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
                status.textContent = 'Please pick a topic.';
                return;
            }
            status.textContent = 'Message sent — we’ll reply within one business day.';
            contactForm.reset();
            charCount.textContent = '0 / 600';
            contactForm.querySelectorAll('.form-row').forEach(function (row) { row.classList.remove('is-invalid'); });
        });
    }
})();
