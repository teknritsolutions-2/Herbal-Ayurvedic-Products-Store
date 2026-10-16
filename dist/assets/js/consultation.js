(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('[data-consultation-form]');
    if (!form) return;

    let step = 1;
    const max = 5;

    // Prevent past dates
    const dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
    }

    const show = n => {
      step = Math.max(1, Math.min(max, n));

      form.querySelectorAll('[data-step]').forEach(panel => {
        panel.hidden = Number(panel.dataset.step) !== step;
      });

      form.querySelectorAll('[data-step-dot]').forEach(dot => {
        const dotStep = Number(dot.dataset.stepDot);
        dot.classList.toggle('is-active', dotStep <= step);
        dot.setAttribute('aria-current', dotStep === step ? 'step' : 'false');
      });

      const label = form.querySelector('[data-step-label]');
      if (label) label.textContent = `Step ${step} of ${max}`;

      const prevBtn = form.querySelector('[data-prev]');
      const nextBtn = form.querySelector('[data-next]');
      const submitBtn = form.querySelector('[data-submit-consult]');

      if (prevBtn) prevBtn.hidden = step === 1;
      if (nextBtn) nextBtn.hidden = step === max;
      if (submitBtn) submitBtn.hidden = step !== max;

      // When arriving at step 5 (Review), populate review summary
      if (step === 5) {
        populateReview();
      }

      // Focus first actionable field in active step
      const activePanel = form.querySelector(`[data-step="${step}"]`);
      activePanel?.querySelector('input, select, textarea, button')?.focus();
    };

    function populateReview() {
      const mode = form.querySelector('input[name="mode"]:checked')?.value || 'Online Consultation';
      const date = form.querySelector('input[name="date"]')?.value || 'Date pending';
      const timeWindow = form.querySelector('select[name="time_window"]')?.value || 'Morning (09:00 – 12:00)';
      const timeZone = form.querySelector('select[name="timezone"]')?.value || 'IST (UTC+5:30)';
      const name = form.querySelector('input[name="name"]')?.value || '';
      const email = form.querySelector('input[name="email"]')?.value || '';
      const phone = form.querySelector('input[name="phone"]')?.value || 'Not provided';
      const reasonCategory = form.querySelector('select[name="reason_category"]')?.value || 'General Ayurvedic Guidance';
      const notes = form.querySelector('textarea[name="reason_notes"]')?.value || 'None specified';

      const summaryTarget = form.querySelector('[data-review-summary]');
      if (summaryTarget) {
        summaryTarget.innerHTML = `
          <div class="review-card">
            <div class="review-card__header">
              <span class="status-badge status-badge--pending">Status: Request Awaiting Provider Confirmation</span>
              <p class="review-notice">Your preferences will be checked against verified practitioner availability. No appointment is locked until verified.</p>
            </div>
            <dl class="review-details">
              <div><dt>Consultation Format</dt><dd>${mode}</dd></div>
              <div><dt>Preferred Window</dt><dd>${date} · ${timeWindow} (${timeZone})</dd></div>
              <div><dt>Contact Details</dt><dd>${name} (${email}) · Tel: ${phone}</dd></div>
              <div><dt>Primary Focus</dt><dd>${reasonCategory}</dd></div>
              <div><dt>Consultation Notes</dt><dd>${notes}</dd></div>
            </dl>
          </div>`;
      }
    }

    form.addEventListener('click', e => {
      if (e.target.closest('[data-next]')) {
        const panel = form.querySelector(`[data-step="${step}"]`);
        const required = [...panel.querySelectorAll('[required]')];
        const allValid = required.every(field => field.reportValidity());

        if (!allValid) return;

        // Custom validation for step 2 (date)
        if (step === 2 && dateInput) {
          const selectedDate = new Date(dateInput.value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            dateInput.setCustomValidity('Appointment date cannot be in the past.');
            dateInput.reportValidity();
            return;
          } else {
            dateInput.setCustomValidity('');
          }
        }

        show(step + 1);
      }

      if (e.target.closest('[data-prev]')) {
        show(step - 1);
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const refCode = 'VV-REQ-' + Math.floor(100000 + Math.random() * 900000);
      const name = form.querySelector('input[name="name"]')?.value || 'Patient';

      form.innerHTML = `
        <div class="request-complete" data-reveal>
          <span class="complete-icon">✓</span>
          <p class="eyebrow">Booking Request Prepared</p>
          <h2>Thank you, ${name}. Your request has been recorded.</h2>
          <div class="booking-receipt">
            <p><strong>Request Reference:</strong> <code>${refCode}</code></p>
            <p><strong>Current Status:</strong> <span class="status-awaiting">Pending Clinic Verification</span></p>
          </div>
          <p class="complete-disclaimer">
            This booking request was processed locally. A healthcare coordinator will contact you via email or phone within 1 business day to confirm doctor credentials, agree upon an exact time slot, and furnish clinical onboarding details. No payment has been taken.
          </p>
          <div class="complete-actions">
            <a class="button" href="products.html">Browse the Apothecary</a>
            <a class="button button--outline" href="index.html">Return to Home</a>
          </div>
        </div>`;
      document.dispatchEvent(new CustomEvent('vanaveda:rerender'));
    });

    show(1);
  });
})();
