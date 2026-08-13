/**
 * LiciteOrg B2A Landing Page Interactivity Logic (main_v2.js)
 * Plano Anual de Contratações (PCA) - Lei nº 14.133/2021
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initFaqAccordion();
  initLeadForm();
  initPrivacyModal();
  initAnalyticsTracking();
  initProductCtas();
  initCalendarTabs();
});

/* Analytics Event Tracking */
function trackEvent(eventName, params = {}) {
  const eventPayload = {
    event: eventName,
    content_variant: 'b2a_pca_redesign_v3',
    form_version: 'v3.5_pca_hub',
    timestamp: new Date().toISOString(),
    ...params
  };

  if (window.dataLayer) {
    window.dataLayer.push(eventPayload);
  }

  console.log(`[Analytics Event Tracked]: ${eventName}`, eventPayload);
}

/* Navbar Scroll Effect */
function initNavbarScroll() {
  const navbar = document.querySelector('.v2-navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.style.boxShadow = '0 10px 30px rgba(15, 23, 42, 0.1)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });
}

/* Calendar Segmented Tabs */
function initCalendarTabs() {
  const tabs = document.querySelectorAll('.v2-segment-tab');
  const panels = document.querySelectorAll('.v2-tab-panel');

  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');

      const activePanel = document.getElementById(targetTab);
      if (activePanel) {
        activePanel.classList.add('active');
        trackEvent('calendar_tab_click', { tab_id: targetTab });
      }
    });
  });
}

/* FAQ Accordion */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.v2-faq-card');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(i => i.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
        const questionText = questionBtn.querySelector('span')?.textContent || 'FAQ Item';
        trackEvent('faq_open', { faq_title: questionText });
      }
    });
  });
}

/* Form Submission & Lead Handling */
function initLeadForm() {
  const leadForm = document.getElementById('main-lead-form');
  const modalOverlay = document.getElementById('success-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const whatsappRedirectBtn = document.getElementById('whatsapp-redirect-btn');

  if (!leadForm) return;

  let currentLeadData = null;

  const formInputs = leadForm.querySelectorAll('input, select');
  let started = false;
  formInputs.forEach(input => {
    input.addEventListener('focus', () => {
      if (!started) {
        started = true;
        trackEvent('diagnostic_start');
      }
    });
  });

  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('lead-name').value.trim();
    const email = document.getElementById('lead-email').value.trim();
    const entity = document.getElementById('lead-entity').value.trim();
    const uf = document.getElementById('lead-uf').value;
    const role = document.getElementById('lead-role').value;
    const stage = document.getElementById('lead-stage').value;
    const cycle = document.getElementById('lead-cycle').value;
    const difficulty = document.getElementById('lead-difficulty').value;
    const phone = document.getElementById('lead-phone')?.value.trim() || '';
    const optin = document.getElementById('lead-optin')?.checked || false;

    if (!name || !email || !entity || !uf || !role || !stage || !cycle || !difficulty) {
      alert('Por favor, preencha os campos obrigatórios do diagnóstico.');
      trackEvent('form_error', { reason: 'missing_required_fields' });
      return;
    }

    currentLeadData = { name, email, entity, uf, role, stage, cycle, difficulty, phone, optin };

    trackEvent('diagnostic_submit', {
      municipality_state: uf,
      role: role,
      pca_stage: stage,
      target_cycle: cycle,
      pain_category: difficulty
    });

    trackEvent('form_submit', { form_id: 'main-lead-form' });

    if (optin) {
      trackEvent('marketing_optin', { channel: 'email_newsletter' });
    }

    if (modalOverlay) {
      modalOverlay.classList.add('active');
    }

    leadForm.reset();
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });
  }

  if (whatsappRedirectBtn) {
    whatsappRedirectBtn.addEventListener('click', () => {
      if (!currentLeadData) return;

      trackEvent('whatsapp_click', { source: 'success_modal' });

      let text = `Olá! Meu nome é *${currentLeadData.name}*.\n` +
                 `Município/Órgão: *${currentLeadData.entity} - ${currentLeadData.uf}*\n` +
                 `Cargo/Área: *${currentLeadData.role}*\n` +
                 `Estágio Atual do PCA: *${currentLeadData.stage}*\n` +
                 `Ciclo-Alvo: *${currentLeadData.cycle}*\n` +
                 `Principal Dificuldade: *${currentLeadData.difficulty}*\n` +
                 `E-mail: ${currentLeadData.email}\n`;

      if (currentLeadData.phone) {
        text += `WhatsApp: ${currentLeadData.phone}\n`;
      }

      text += `Gostaria de agendar o Diagnóstico de Prontidão do PCA.`;

      const encodedText = encodeURIComponent(text);
      const whatsappUrl = `https://wa.me/5584999660794?text=${encodedText}`;
      window.open(whatsappUrl, '_blank', 'noopener');
    });
  }
}

/* Privacy Modal */
function initPrivacyModal() {
  const privacyModal = document.getElementById('privacy-modal');
  const privacyOpenBtn = document.getElementById('footer-link-privacy');
  const privacyCloseBtn = document.getElementById('privacy-modal-close-btn');

  if (!privacyModal) return;

  if (privacyOpenBtn) {
    privacyOpenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.classList.add('active');
      trackEvent('privacy_open');
    });
  }

  if (privacyCloseBtn) {
    privacyCloseBtn.addEventListener('click', () => {
      privacyModal.classList.remove('active');
    });
  }
}

/* Product CTAs */
function initProductCtas() {
  const productCtas = document.querySelectorAll('.product-cta');

  productCtas.forEach(cta => {
    cta.addEventListener('click', () => {
      const serviceName = cta.getAttribute('data-service') || 'Serviço PCA';
      trackEvent('service_card_view', { service_name: serviceName });

      const difficultySelect = document.getElementById('lead-difficulty');
      if (difficultySelect && serviceName === 'Calendário Reverso do PCA') {
        difficultySelect.value = 'Consolidação e agrupamento';
      }
    });
  });
}

/* Analytics Bindings */
function initAnalyticsTracking() {
  const heroPrimaryCta = document.getElementById('hero-primary-cta');
  const heroSecondaryCta = document.getElementById('hero-secondary-cta');

  if (heroPrimaryCta) {
    heroPrimaryCta.addEventListener('click', () => {
      trackEvent('hero_cta_click', { cta_type: 'primary_diagnostic' });
    });
  }

  if (heroSecondaryCta) {
    heroSecondaryCta.addEventListener('click', () => {
      trackEvent('calendar_reverse_click', { cta_type: 'secondary_calendar' });
    });
  }

  const catalogLink = document.getElementById('link-catmat');
  const dadosLink = document.getElementById('link-dados-abertos');

  if (catalogLink) {
    catalogLink.addEventListener('click', () => {
      trackEvent('catalog_link_click', { catalog: 'compras_gov_br' });
    });
  }

  if (dadosLink) {
    dadosLink.addEventListener('click', () => {
      trackEvent('catalog_link_click', { catalog: 'dados_abertos' });
    });
  }

  const floatingWa = document.getElementById('floating-whatsapp-btn');
  if (floatingWa) {
    floatingWa.addEventListener('click', () => {
      trackEvent('whatsapp_click', { source: 'floating_button' });
    });
  }
}
