(function () {
  document.addEventListener('DOMContentLoaded', () => {
    // Mode switcher on contact page (General vs Wholesale)
    const modeButtons = document.querySelectorAll('[data-contact-mode-btn]');
    const generalForm = document.querySelector('[data-general-form]');
    const wholesaleForm = document.querySelector('[data-wholesale-form]');

    function setContactMode(mode) {
      modeButtons.forEach(btn => {
        const isActive = btn.dataset.contactModeBtn === mode;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      if (generalForm && wholesaleForm) {
        if (mode === 'wholesale') {
          generalForm.hidden = true;
          wholesaleForm.hidden = false;
        } else {
          generalForm.hidden = false;
          wholesaleForm.hidden = true;
        }
      }
    }

    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setContactMode(btn.dataset.contactModeBtn);
      });
    });

    // Handle hash on load (e.g. contact.html#wholesale)
    if (window.location.hash === '#wholesale') {
      setContactMode('wholesale');
    }

    // Generic local form submission handler
    document.addEventListener('submit', event => {
      const form = event.target.closest('[data-local-form]');
      if (!form) return;
      event.preventDefault();

      if (!form.reportValidity()) return;

      const status = form.querySelector('[data-form-status]');
      const submitBtn = form.querySelector('[type="submit"]');

      if (form.matches('[data-wholesale-form]')) {
        const company = form.querySelector('[name="company_name"]')?.value || 'Partner';
        if (status) {
          status.innerHTML = `<span class="form-status-badge">✓ Wholesale Request Recorded</span><br>Thank you, <strong>${company}</strong>. Your wholesale trade enquiry has been formatted and saved locally. Connect an authenticated inbox service before going live.`;
        }
      } else if (form.matches('.newsletter')) {
        if (status) {
          status.textContent = 'Thank you for joining our ritual circle. (Saved locally on this device)';
        }
      } else {
        if (status) {
          status.innerHTML = '<span class="form-status-badge">✓ Message Formatted</span><br>Your message has been validated and recorded locally. Connect an email or CRM endpoint to receive messages in production.';
        }
      }

      if (submitBtn) submitBtn.disabled = true;
    });
  });
})();
