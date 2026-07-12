/**
 * MetroTec Forms JavaScript
 * Handles form submissions via AJAX (vanilla JS, no jQuery)
 */

// Accordion functionality
document.addEventListener('DOMContentLoaded', function () {
  const accordionTriggers = document.querySelectorAll('.accordion-trigger');

  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener('click', function () {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      const content = this.nextElementSibling;

      const card = this.closest('.card');
      if (card) {
        card.querySelectorAll('.accordion-trigger').forEach((t) => {
          if (t !== this) {
            t.setAttribute('aria-expanded', 'false');
            t.nextElementSibling?.classList.remove('open');
          }
        });
      }

      this.setAttribute('aria-expanded', !isExpanded);
      content?.classList.toggle('open');
    });
  });

  // Handle contact forms
  const forms = document.querySelectorAll('.metrotec-contact-form');
  forms.forEach((form) => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.textContent = '⏳ Sending...';
      submitBtn.disabled = true;

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      try {
        const response = await fetch(form.action || '/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          form.innerHTML =
            '<div style="background: #10b981; color: white; padding: 2rem; border-radius: 0.5rem; text-align: center;">✓ ' +
            (result.message || 'Thank you! We will contact you soon.') +
            '</div>';

          if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
              event_category: 'Lead Generation',
              event_label: data.form_type || 'general',
            });
          }
        } else {
          showMessage(form, result.message || 'Error submitting form', 'error');
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      } catch (error) {
        showMessage(
          form,
          'Network error. Please call (248) 555-0123.',
          'error'
        );
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  });

  // Quick quote calculator
  const quoteCalc = document.getElementById('quick-quote-calc');
  if (quoteCalc) {
    quoteCalc.addEventListener('change', calculateQuote);
  }

  function calculateQuote() {
    const employees = parseInt(document.getElementById('employees')?.value) || 0;
    const services = document.querySelectorAll(
      'input[name="services[]"]:checked'
    ).length;

    const basePrice = employees * 150;
    const servicePrice = services * 50;
    const total = basePrice + servicePrice;

    const resultEl = document.getElementById('quote-result');
    if (resultEl) {
      resultEl.textContent =
        'Estimated Monthly Cost: $' + total.toLocaleString();
    }
  }

  function showMessage(form, message, type) {
    const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
    const icon = type === 'error' ? '⚠️' : '✓';

    const messageHtml =
      '<div class="alert ' +
      alertClass +
      '" style="margin-top: 1rem; padding: 1rem; border-radius: 0.5rem;">' +
      icon +
      ' ' +
      message +
      '</div>';

    const existing = form.querySelector('.form-messages');
    if (existing) existing.remove();

    const wrapper = document.createElement('div');
    wrapper.className = 'form-messages';
    wrapper.innerHTML = messageHtml;
    form.appendChild(wrapper);

    if (type === 'success') {
      setTimeout(() => {
        wrapper.style.opacity = '0';
        wrapper.style.transition = 'opacity 0.3s';
      }, 5000);
    }
  }
});
