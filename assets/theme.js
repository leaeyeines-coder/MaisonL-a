document.documentElement.classList.remove('no-js');

/* ==========================================================================
   Sticky header
   ========================================================================== */
(function stickyHeader() {
  var header = document.querySelector('[data-site-header]');
  if (!header) return;
  var toggle = function () {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
})();

/* ==========================================================================
   Mobile menu
   ========================================================================== */
(function mobileMenu() {
  var menu = document.querySelector('[data-mobile-menu]');
  var toggleBtn = document.querySelector('[data-mobile-menu-toggle]');
  if (!menu || !toggleBtn) return;

  function open() {
    menu.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    menu.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', open);
  menu.querySelectorAll('[data-mobile-menu-close]').forEach(function (el) {
    el.addEventListener('click', close);
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', close);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();

/* ==========================================================================
   Reveal on scroll
   ========================================================================== */
(function revealOnScroll() {
  var items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  items.forEach(function (el) { observer.observe(el); });
})();

/* ==========================================================================
   Cart drawer + Ajax cart
   ========================================================================== */
var MaisonCart = (function () {
  var drawer = document.getElementById('cart-drawer');
  var drawerBody = document.getElementById('cart-drawer-body');
  var cartType = document.documentElement.getAttribute('data-cart-type') || 'drawer';

  function openDrawer() {
    if (!drawer) return;
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateCartCount(count) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
    });
  }

  function refreshDrawer() {
    if (!drawerBody) return Promise.resolve();
    return fetch('/?section_id=cart-drawer')
      .then(function (res) { return res.text(); })
      .then(function (html) {
        drawerBody.innerHTML = html;
        bindDrawerEvents();
      });
  }

  function refreshCartCount() {
    return fetch('/cart.js')
      .then(function (res) { return res.json(); })
      .then(function (cart) { updateCartCount(cart.item_count); return cart; });
  }

  function addToCart(formData) {
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.status) {
          throw new Error(data.description || 'Impossible d\'ajouter cet article.');
        }
        return Promise.all([refreshDrawer(), refreshCartCount()]).then(function () {
          if (cartType === 'drawer') openDrawer();
          return data;
        });
      });
  }

  function changeLine(line, quantity) {
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line: line, quantity: quantity }),
    })
      .then(function (res) { return res.json(); })
      .then(function () {
        return Promise.all([refreshDrawer(), refreshCartCount()]);
      });
  }

  function bindDrawerEvents() {
    if (!drawerBody) return;
    drawerBody.querySelectorAll('[data-cart-qty-decrease]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = btn.parentElement.querySelector('[data-cart-qty-input]');
        var val = Math.max(0, parseInt(input.value, 10) - 1);
        changeLine(input.dataset.line, val);
      });
    });
    drawerBody.querySelectorAll('[data-cart-qty-increase]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = btn.parentElement.querySelector('[data-cart-qty-input]');
        var val = parseInt(input.value, 10) + 1;
        changeLine(input.dataset.line, val);
      });
    });
    drawerBody.querySelectorAll('[data-cart-qty-input]').forEach(function (input) {
      input.addEventListener('change', function () {
        changeLine(input.dataset.line, Math.max(0, parseInt(input.value, 10) || 0));
      });
    });
    drawerBody.querySelectorAll('[data-cart-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () { changeLine(btn.dataset.line, 0); });
    });
    drawerBody.querySelectorAll('[data-cart-drawer-close]').forEach(function (el) {
      el.addEventListener('click', closeDrawer);
    });
  }

  if (drawer) {
    drawer.querySelectorAll('[data-cart-drawer-close]').forEach(function (el) {
      el.addEventListener('click', closeDrawer);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  document.querySelectorAll('[data-cart-icon]').forEach(function (icon) {
    icon.addEventListener('click', function (e) {
      if (cartType === 'drawer') {
        e.preventDefault();
        refreshDrawer();
        openDrawer();
      }
    });
  });

  bindDrawerEvents();

  return { open: openDrawer, close: closeDrawer, addToCart: addToCart, changeLine: changeLine, refreshCartCount: refreshCartCount };
})();

/* Product add-to-cart form */
document.addEventListener('submit', function (e) {
  var form = e.target.closest('[data-product-section] form, .product-card__quick-add');
  if (!form) return;
  e.preventDefault();
  var submitBtn = form.querySelector('[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  MaisonCart.addToCart(new FormData(form))
    .catch(function (err) { alert(err.message || 'Une erreur est survenue.'); })
    .finally(function () { if (submitBtn) submitBtn.disabled = false; });
});

/* Cart page quantity controls (server-rendered, full form) */
(function cartPage() {
  var page = document.querySelector('.cart-page');
  if (!page) return;

  page.querySelectorAll('[data-cart-qty-decrease]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var row = btn.closest('.cart-table__row');
      var input = row.querySelector('[data-cart-qty-input]');
      input.value = Math.max(0, parseInt(input.value, 10) - 1);
      MaisonCart.changeLine(input.dataset.line, input.value).then(function () { window.location.reload(); });
    });
  });
  page.querySelectorAll('[data-cart-qty-increase]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var row = btn.closest('.cart-table__row');
      var input = row.querySelector('[data-cart-qty-input]');
      input.value = parseInt(input.value, 10) + 1;
      MaisonCart.changeLine(input.dataset.line, input.value).then(function () { window.location.reload(); });
    });
  });
  page.querySelectorAll('[data-cart-remove]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      MaisonCart.changeLine(btn.dataset.line, 0).then(function () { window.location.reload(); });
    });
  });
})();

/* Generic quantity inputs on product page (not cart-bound) */
document.addEventListener('click', function (e) {
  var incBtn = e.target.closest('[data-qty-increase]');
  var decBtn = e.target.closest('[data-qty-decrease]');
  if (!incBtn && !decBtn) return;
  var wrapper = (incBtn || decBtn).closest('.quantity-input');
  var input = wrapper.querySelector('[data-qty-input]');
  var value = parseInt(input.value, 10) || 1;
  input.value = incBtn ? value + 1 : Math.max(1, value - 1);
});

/* ==========================================================================
   Product page: variant selection + gallery
   ========================================================================== */
(function productPage() {
  var section = document.querySelector('[data-product-section]');
  if (!section) return;

  var variantScript = section.querySelector('[data-product-json]');
  var variants = variantScript ? JSON.parse(variantScript.textContent) : [];
  var variantIdInput = section.querySelector('[data-product-variant-id]');
  var priceEl = section.querySelector('[data-product-price]');

  function selectedOptionValues() {
    var values = [];
    section.querySelectorAll('.option-pills').forEach(function (group) {
      var active = group.querySelector('.option-pill.is-active');
      values.push(active ? active.dataset.optionValue : null);
    });
    return values;
  }

  function findVariant(values) {
    return variants.find(function (variant) {
      var options = [variant.option1, variant.option2, variant.option3];
      return values.every(function (val, i) { return val === null || options[i] === val; });
    });
  }

  function moneyFormat(cents) {
    return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  }

  section.querySelectorAll('.option-pills').forEach(function (group) {
    group.querySelectorAll('.option-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        group.querySelectorAll('.option-pill').forEach(function (p) { p.classList.remove('is-active'); });
        pill.classList.add('is-active');

        var match = findVariant(selectedOptionValues());
        if (!match) return;
        if (variantIdInput) variantIdInput.value = match.id;
        if (priceEl) {
          var compareHtml = match.compare_at_price && match.compare_at_price > match.price
            ? '<span class="product__price-compare">' + moneyFormat(match.compare_at_price) + '</span>'
            : '';
          priceEl.innerHTML = compareHtml + moneyFormat(match.price) + ' <span class="product__price-unit">/ location, hors caution</span>';
        }
        var addBtn = section.querySelector('[data-add-to-cart]');
        var addText = section.querySelector('[data-add-to-cart-text]');
        if (addBtn) addBtn.disabled = !match.available;
        if (addText) addText.textContent = match.available ? 'Ajouter à ma réservation' : 'Rupture de stock';
      });
    });
  });

  var thumbs = section.querySelectorAll('[data-product-gallery-thumbs] .product__gallery-thumb');
  var slides = section.querySelectorAll('[data-product-gallery-main] .product__gallery-slide');
  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      thumbs.forEach(function (t) { t.classList.remove('is-active'); });
      slides.forEach(function (s) { s.classList.remove('is-active'); });
      thumb.classList.add('is-active');
      var match = section.querySelector('[data-product-gallery-main] [data-media-id="' + thumb.dataset.mediaId + '"]');
      if (match) match.classList.add('is-active');
    });
  });
})();

/* ==========================================================================
   Collection filters + sort
   ========================================================================== */
(function collectionFilters() {
  var root = document.querySelector('[data-collection-filters]');
  if (!root) return;

  var grid = root.querySelector('[data-product-grid]');
  var items = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-grid-item]')) : [];
  var originalOrder = items.slice();
  var chips = root.querySelectorAll('[data-filter-tier]');
  var noResults = root.querySelector('[data-no-results]');
  var sortSelect = root.querySelector('[data-sort-select]');
  var activeTier = 'all';

  function applyFilter() {
    var visibleCount = 0;
    items.forEach(function (item) {
      var card = item.querySelector('.product-card');
      var tier = card ? card.dataset.tier : 'standard';
      var visible = activeTier === 'all' || tier === activeTier;
      item.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    if (noResults) noResults.hidden = visibleCount > 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      activeTier = chip.dataset.filterTier;
      applyFilter();
    });
  });

  if (sortSelect && grid) {
    sortSelect.addEventListener('change', function () {
      var sorted;
      if (sortSelect.value === 'manual') {
        sorted = originalOrder;
      } else if (sortSelect.value === 'title-ascending') {
        sorted = items.slice().sort(function (a, b) { return a.dataset.title.localeCompare(b.dataset.title, 'fr'); });
      } else if (sortSelect.value === 'price-ascending') {
        sorted = items.slice().sort(function (a, b) { return parseFloat(a.dataset.price) - parseFloat(b.dataset.price); });
      } else if (sortSelect.value === 'price-descending') {
        sorted = items.slice().sort(function (a, b) { return parseFloat(b.dataset.price) - parseFloat(a.dataset.price); });
      }
      sorted.forEach(function (item) { grid.appendChild(item); });
    });
  }
})();

/* ==========================================================================
   Inspirations slider
   ========================================================================== */
(function inspirationsSlider() {
  var slider = document.querySelector('[data-slider]');
  if (!slider) return;

  var prevBtn = document.querySelector('[data-slider-prev]');
  var nextBtn = document.querySelector('[data-slider-next]');
  var scrollByCard = function (direction) {
    var card = slider.querySelector('.inspiration-card');
    var amount = card ? card.getBoundingClientRect().width + 20 : 280;
    slider.scrollBy({ left: amount * direction, behavior: 'smooth' });
  };
  if (prevBtn) prevBtn.addEventListener('click', function () { scrollByCard(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { scrollByCard(1); });
})();

/* ==========================================================================
   Préremplissage du devis depuis un thème d'inspiration
   ========================================================================== */
(function prefillDevisStyle() {
  var params = new URLSearchParams(window.location.search);
  var style = params.get('style');
  if (!style) return;

  var styleField = document.getElementById('DevisStyleField');
  var styleNote = document.getElementById('DevisStyleNote');
  var messageField = document.getElementById('DevisMessage');

  if (styleField) styleField.value = style;
  if (styleNote) {
    styleNote.hidden = false;
    var valueEl = styleNote.querySelector('[data-style-note-value]');
    if (valueEl) valueEl.textContent = style;
  }
  if (messageField && !messageField.value) {
    messageField.value = 'Je suis intéressé·e par le thème "' + style + '". ';
  }
})();
