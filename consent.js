/* Cookie consent and site events.
   Consent Mode v2 defaults (everything denied) are set inline in <head>,
   before Google Tag Manager loads. This file shows the banner, stores the
   visitor's choice and pushes site events to the dataLayer for GTM. */
(function () {
  var KEY = 'sn-consent';
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function choose(granted) {
    var v = granted ? 'granted' : 'denied';
    save(v);
    gtag('consent', 'update', { analytics_storage: v });
    dataLayer.push({ event: 'consent_update', consent_analytics: v });
    banner.hidden = true;
  }

  var banner = document.createElement('div');
  banner.className = 'consent';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML =
    '<p>This website uses Google Analytics cookies to understand how visitors use it. ' +
    'The SideNote Analytics extension itself does not track you. ' +
    '<a href="privacy.html#website">Learn more</a></p>' +
    '<div class="consent-actions">' +
    '<button type="button" class="btn ghost" data-consent="no">Decline</button>' +
    '<button type="button" class="btn primary" data-consent="yes">Accept</button>' +
    '</div>';
  banner.hidden = read() !== null;
  document.body.appendChild(banner);
  banner.addEventListener('click', function (e) {
    var b = e.target.closest('[data-consent]');
    if (b) choose(b.dataset.consent === 'yes');
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cookie-settings]')) {
      e.preventDefault();
      banner.hidden = false;
      banner.querySelector('[data-consent="yes"]').focus();
      return;
    }
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (a.closest('nav.links')) {
      dataLayer.push({ event: 'nav_click', link_text: a.textContent.trim(), link_url: a.href });
    } else if (a.dataset.track) {
      dataLayer.push({ event: a.dataset.track, link_text: a.textContent.trim(), link_url: a.href });
    } else if (/^https?:/.test(href) && a.host !== location.host) {
      dataLayer.push({ event: 'outbound_click', link_text: a.textContent.trim(), link_url: a.href });
    }
  });

  document.querySelectorAll('.faq details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) dataLayer.push({ event: 'faq_open', faq_question: d.querySelector('summary').textContent.trim() });
    });
  });
})();
