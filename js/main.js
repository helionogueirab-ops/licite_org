/**
 * LiciteOrg B2A Landing Page Interactivity & Conversion Logic
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

/* -------------------------------------------------------------------------- */
/* Event Tracking Framework (sem dados pessoais / PII)                         */
/* -------------------------------------------------------------------------- */
function trackEvent(eventName, params = {}) {
  const eventPayload = {
    event: eventName,
    content_variant: 'b2a_pca_institutional_v2',
    form_version: 'v2.1_pca',
    timestamp: new Date().toISOString(),
    ...params
  };

  if (window.dataLayer) {
    window.dataLayer.push(eventPayload);
  }

  // Developer logging
  console.log(`[Analytics Event Tracked]: ${eventName}`, eventPayload);
}

/* -------------------------------------------------------------------------- */
/* Navbar Scroll Effect                                                        */
/* -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* -------------------------------------------------------------------------- */
/* Calendar Interactive Tabs (Fluidez & Navegação por Fases)                  */
/* -------------------------------------------------------------------------- */
function initCalendarTabs() {
  const tabs = document.querySelectorAll('.calendar-tab');
  const panels = document.querySelectorAll('.calendar-tab-panel');

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

/* -------------------------------------------------------------------------- */
/* FAQ Accordion & Event Tracking                                             */
/* -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

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

/* -------------------------------------------------------------------------- */
/* B2A Lead Form & Diagnostic Handling                                        */
/* -------------------------------------------------------------------------- */
function initLeadForm() {
  const leadForm = document.getElementById('main-lead-form');
  const modalOverlay = document.getElementById('success-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const whatsappRedirectBtn = document.getElementById('whatsapp-redirect-btn');

  if (!leadForm) return;

  let currentLeadData = null;

  // Track diagnostic form start when user focuses on any input
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

    // Track analytics form submission event without PII
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

    // Display success modal
    if (modalOverlay) {
      modalOverlay.classList.add('active');
    }

    // Reset form
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

/* -------------------------------------------------------------------------- */
/* Privacy Modal (LGPD)                                                       */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/* Product Cards & CTAs Interactions                                          */
/* -------------------------------------------------------------------------- */
function initProductCtas() {
  const productCtas = document.querySelectorAll('.product-cta');

  productCtas.forEach(cta => {
    cta.addEventListener('click', () => {
      const serviceName = cta.getAttribute('data-service') || 'Serviço PCA';
      trackEvent('service_card_view', { service_name: serviceName });

      // Pre-select service in form if difficulty or stage applies
      const difficultySelect = document.getElementById('lead-difficulty');
      if (difficultySelect && serviceName === 'Calendário Reverso do PCA') {
        difficultySelect.value = 'Consolidação e agrupamento';
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Navigation & Hero CTA Tracking                                             */
/* -------------------------------------------------------------------------- */
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

  // External reference links tracking
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

  // Floating WhatsApp button tracking
  const floatingWa = document.getElementById('floating-whatsapp-btn');
  if (floatingWa) {
    floatingWa.addEventListener('click', () => {
      trackEvent('whatsapp_click', { source: 'floating_button' });
    });
  }
}
