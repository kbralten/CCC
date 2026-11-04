/**
 * Couples Conversation Cards (CCC) - HTML & CSS Card Generator
 * Formats 24 conversation cards into 4x6 print-ready pages.
 * Supports Portrait (4in x 6in) and Landscape (6in x 4in) layouts.
 */

const fs = require('fs');
const path = require('path');

// Curated high-contrast, premium color schemes for each category
const CATEGORY_THEMES = {
  'Meta / Anchor': {
    name: 'Gold (Anchor)',
    primary: '#B45309',
    secondary: '#D4AF37',
    dark: '#78350F',
    light: '#FFFDF5',
    subtle: '#FEF3C7',
    border: '#FDE68A',
    badgeBg: '#F59E0B',
    badgeText: '#FFFFFF',
    accentGradient: 'linear-gradient(135deg, #D4AF37 0%, #B45309 100%)',
    iconColor: '#B45309'
  },
  'Setting the Stage & Pacing': {
    name: 'Blue',
    primary: '#1D4ED8',
    secondary: '#2563EB',
    dark: '#1E3A8A',
    light: '#F8FAFF',
    subtle: '#DBEAFE',
    border: '#BFDBFE',
    badgeBg: '#2563EB',
    badgeText: '#FFFFFF',
    accentGradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    iconColor: '#2563EB'
  },
  'Inner World & Bids': {
    name: 'Teal',
    primary: '#0891B2',
    secondary: '#06B6D4',
    dark: '#155E75',
    light: '#F0FDFF',
    subtle: '#CFFAFE',
    border: '#A5F3FC',
    badgeBg: '#0891B2',
    badgeText: '#FFFFFF',
    accentGradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    iconColor: '#0891B2'
  },
  'Attunement & Inquiry': {
    name: 'Purple',
    primary: '#6D28D9',
    secondary: '#7C3AED',
    dark: '#4C1D95',
    light: '#FAF7FF',
    subtle: '#EDE9FE',
    border: '#DDD6FE',
    badgeBg: '#7C3AED',
    badgeText: '#FFFFFF',
    accentGradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    iconColor: '#7C3AED'
  },
  'Perspective & Context': {
    name: 'Amber',
    primary: '#C2410C',
    secondary: '#EA580C',
    dark: '#7C2D12',
    light: '#FFF9F5',
    subtle: '#FFEDD5',
    border: '#FED7AA',
    badgeBg: '#EA580C',
    badgeText: '#FFFFFF',
    accentGradient: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
    iconColor: '#EA580C'
  },
  'Collaboration & Bridges': {
    name: 'Green',
    primary: '#047857',
    secondary: '#059669',
    dark: '#064E3B',
    light: '#F5FCF8',
    subtle: '#D1FAE5',
    border: '#A7F3D0',
    badgeBg: '#059669',
    badgeText: '#FFFFFF',
    accentGradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
    iconColor: '#059669'
  },
  'Circuit Breakers': {
    name: 'Coral',
    primary: '#BE123C',
    secondary: '#E11D48',
    dark: '#881337',
    light: '#FFF5F6',
    subtle: '#FFE4E6',
    border: '#FECDD3',
    badgeBg: '#E11D48',
    badgeText: '#FFFFFF',
    accentGradient: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
    iconColor: '#E11D48'
  }
};

// SVG icons embedded inline
const ICONS = {
  compass: `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
  shield: `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  warning: `<svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>`,
  quote: `<svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" width="9" height="9" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  pin: `<svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3m0 14v3M2 12h3m14 0h3"></path></svg>`,
  cards: `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`
};

function getTheme(category) {
  return CATEGORY_THEMES[category] || CATEGORY_THEMES['Setting the Stage & Pacing'];
}

function getNextCategoryTheme(catName) {
  const norm = (catName || '').toLowerCase();
  if (norm.includes('gold') || norm.includes('meta') || norm.includes('anchor')) {
    return { ...CATEGORY_THEMES['Meta / Anchor'], categoryName: 'Meta / Anchor' };
  }
  if (norm.includes('blue') || norm.includes('stage') || norm.includes('pacing')) {
    return { ...CATEGORY_THEMES['Setting the Stage & Pacing'], categoryName: 'Setting the Stage & Pacing' };
  }
  if (norm.includes('teal') || norm.includes('inner') || norm.includes('bid')) {
    return { ...CATEGORY_THEMES['Inner World & Bids'], categoryName: 'Inner World & Bids' };
  }
  if (norm.includes('purple') || norm.includes('attun') || norm.includes('inquiry')) {
    return { ...CATEGORY_THEMES['Attunement & Inquiry'], categoryName: 'Attunement & Inquiry' };
  }
  if (norm.includes('amber') || norm.includes('perspective') || norm.includes('context')) {
    return { ...CATEGORY_THEMES['Perspective & Context'], categoryName: 'Perspective & Context' };
  }
  if (norm.includes('green') || norm.includes('collab') || norm.includes('bridge')) {
    return { ...CATEGORY_THEMES['Collaboration & Bridges'], categoryName: 'Collaboration & Bridges' };
  }
  if (norm.includes('coral') || norm.includes('circuit') || norm.includes('breaker')) {
    return { ...CATEGORY_THEMES['Circuit Breakers'], categoryName: 'Circuit Breakers' };
  }
  if (norm.includes('previous')) {
    return {
      categoryName: 'Previous Active Card',
      primary: '#475569',
      secondary: '#64748B',
      dark: '#1E293B',
      light: '#F8FAFC',
      subtle: '#F1F5F9',
      border: '#CBD5E1',
      badgeBg: '#475569',
      badgeText: '#FFFFFF',
      accentGradient: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
      iconColor: '#475569'
    };
  }
  return {
    categoryName: catName || 'Next Category',
    primary: '#475569',
    secondary: '#64748B',
    dark: '#1E293B',
    light: '#F8FAFC',
    subtle: '#F1F5F9',
    border: '#CBD5E1',
    badgeBg: '#475569',
    badgeText: '#FFFFFF',
    accentGradient: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
    iconColor: '#475569'
  };
}

/**
 * Generate Card HTML for Portrait Orientation (4" x 6")
 */
function renderCardPortrait(card, index, total) {
  const theme = getTheme(card.category);
  const hasBadge = !!card.special_badge;
  const hasFormulas = card.verbal_formulas && card.verbal_formulas.length > 0;
  const hasNext = card.allowed_next && card.allowed_next.length > 0;

  // Determine if this is an anchor card or standard card
  const isAnchor = card.category.includes('Anchor') || card.category.includes('Meta');

  return `
  <section class="card-page portrait-page" data-card-id="${card.id}">
    <div class="card-outer-frame" style="--cat-primary: ${theme.primary}; --cat-secondary: ${theme.secondary}; --cat-light: ${theme.light}; --cat-subtle: ${theme.subtle}; --cat-border: ${theme.border};">
      <div class="card-inner-frame">
      
      <!-- TOP HEADER BAR -->
      <div class="card-header">
        <div class="header-left">
          <span class="cat-pill" style="background: ${theme.badgeBg}; color: ${theme.badgeText};">
            ${card.category.toUpperCase()}
          </span>
          <span class="position-tag">${card.position || 'CONVERSATION TRAIL'}</span>
        </div>
        <div class="card-id-badge" style="background: ${theme.badgeBg};">
          ${card.id}
        </div>
      </div>

      <!-- TITLE & SPECIAL BADGE -->
      <div class="card-title-section">
        <h1 class="card-title ${card.title.length > 32 ? 'title-long' : ''}">${escapeHtml(card.title)}</h1>
        ${hasBadge ? `
          <div class="special-badge ${isAnchor ? 'badge-anchor' : 'badge-override'}">
            <span class="badge-icon">${isAnchor ? ICONS.pin : ICONS.shield}</span>
            <span class="badge-text">${escapeHtml(card.special_badge)}</span>
          </div>
        ` : ''}
      </div>

      <!-- INTENT / PURPOSE -->
      <div class="card-intent-box">
        <div class="intent-icon" style="color: ${theme.primary};">${ICONS.compass}</div>
        <div class="intent-content">
          <strong>INTENT:</strong> ${escapeHtml(card.intent)}
        </div>
      </div>

      <!-- PROTOCOLS SECTION -->
      <div class="card-protocols-section">
        ${card.protocols.map((proto) => `
          <div class="protocol-block">
            <div class="role-badge" style="color: ${theme.dark}; background: ${theme.subtle}; border-left-color: ${theme.primary};">
              <span class="role-bullet"></span> ${escapeHtml(proto.role.toUpperCase())}
            </div>
            <ul class="protocol-steps">
              ${proto.steps.map(step => `
                <li>${formatEmphasizedText(step)}</li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <!-- GUARDRAILS (DO NOT) -->
      ${card.guardrails && card.guardrails.length > 0 ? `
        <div class="card-guardrails-box">
          <div class="guardrails-header">
            <span class="guardrails-icon">${ICONS.warning}</span>
            <span class="guardrails-title">GUARDRAILS (DO NOT)</span>
          </div>
          <ul class="guardrails-list">
            ${card.guardrails.map(g => `
              <li><span class="guard-cross">✕</span><span>${escapeHtml(g)}</span></li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- VERBAL FORMULAS (SCRIPTS) -->
      ${hasFormulas ? `
        <div class="card-scripts-section">
          <div class="scripts-header">
            <span class="scripts-icon" style="color: ${theme.primary};">${ICONS.quote}</span>
            <span class="scripts-title">VERBAL FORMULAS (SAY THIS)</span>
          </div>
          <div class="scripts-grid">
            ${card.verbal_formulas.map(f => `
              <div class="script-bubble">
                <span class="script-role" style="color: ${theme.primary};">${escapeHtml(f.role)}:</span>
                <span class="script-text">"${escapeHtml(f.script)}"</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- ALLOWED NEXT MOVES (HIGH-VISIBILITY CATEGORY COLORS) -->
      ${hasNext ? `
        <div class="card-next-section">
          <div class="next-header-row">
            <span class="next-label">ALLOWED NEXT CATEGORIES:</span>
            <span class="next-sublabel">(Play any card in category)</span>
          </div>
          <div class="next-chips">
            ${card.allowed_next.map(item => {
              const nextTheme = getNextCategoryTheme(item.category);
              return `
                <div class="next-cat-chip" style="background: ${nextTheme.light}; border: 1.5px solid ${nextTheme.border};">
                  <span class="next-cat-badge" style="background: ${nextTheme.badgeBg}; color: ${nextTheme.badgeText};">
                    ${nextTheme.categoryName.toUpperCase()}
                  </span>
                  <span class="next-action-text">
                    <span class="next-suggested-label">Suggested:</span> ${escapeHtml(item.action)}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- CARD FOOTER -->
      <div class="card-footer">
        <div class="footer-brand">
          <span class="footer-ccc">CCC</span>
          <span class="footer-divider">•</span>
          <span class="footer-deck">Couples Conversation Cards</span>
        </div>
        <div class="footer-count">
          Card ${String(index + 1).padStart(2, '0')} of ${total}
        </div>
      </div>

      </div>
    </div>
  </section>
  `;
}

/**
 * Generate Card HTML for Landscape Orientation (6" x 4")
 */
function renderCardLandscape(card, index, total) {
  const theme = getTheme(card.category);
  const hasBadge = !!card.special_badge;
  const hasFormulas = card.verbal_formulas && card.verbal_formulas.length > 0;
  const hasNext = card.allowed_next && card.allowed_next.length > 0;
  const isAnchor = card.category.includes('Anchor') || card.category.includes('Meta');

  return `
  <section class="card-page landscape-page" data-card-id="${card.id}">
    <div class="card-outer-frame landscape-frame" style="--cat-primary: ${theme.primary}; --cat-secondary: ${theme.secondary}; --cat-light: ${theme.light}; --cat-subtle: ${theme.subtle}; --cat-border: ${theme.border};">
      <div class="card-inner-frame landscape-inner">
      
      <!-- TOP HEADER ROW -->
      <div class="land-header">
        <div class="land-header-left">
          <span class="cat-pill" style="background: ${theme.badgeBg}; color: ${theme.badgeText};">
            ${card.category.toUpperCase()}
          </span>
          <span class="card-id-badge" style="background: ${theme.badgeBg};">
            ${card.id}
          </span>
          <span class="position-tag">${card.position || 'CONVERSATION TRAIL'}</span>
        </div>
        ${hasBadge ? `
          <div class="special-badge ${isAnchor ? 'badge-anchor' : 'badge-override'}">
            <span class="badge-icon">${isAnchor ? ICONS.pin : ICONS.shield}</span>
            <span class="badge-text">${escapeHtml(card.special_badge)}</span>
          </div>
        ` : ''}
      </div>

      <!-- TITLE & INTENT ROW -->
      <div class="land-title-intent-row">
        <h1 class="land-title">${escapeHtml(card.title)}</h1>
        <div class="land-intent-box">
          <span class="intent-label" style="color: ${theme.primary};">INTENT:</span> ${escapeHtml(card.intent)}
        </div>
      </div>

      <!-- TWO-COLUMN MAIN BODY -->
      <div class="land-columns-container">
        
        <!-- LEFT COLUMN: PROTOCOLS -->
        <div class="land-col land-col-left">
          <div class="col-section-header" style="color: ${theme.dark};">
            <span class="section-bullet" style="background: ${theme.primary};"></span>
            PROTOCOL & STEPS
          </div>
          <div class="land-protocols">
            ${card.protocols.map((proto) => `
              <div class="protocol-block">
                <div class="role-badge" style="color: ${theme.dark}; background: ${theme.subtle}; border-left-color: ${theme.primary};">
                  ${escapeHtml(proto.role.toUpperCase())}
                </div>
                <ul class="protocol-steps">
                  ${proto.steps.map(step => `
                    <li>${formatEmphasizedText(step)}</li>
                  `).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- RIGHT COLUMN: VERBAL SCRIPTS & GUARDRAILS -->
        <div class="land-col land-col-right">
          
          ${hasFormulas ? `
            <div class="land-scripts-block">
              <div class="col-section-header" style="color: ${theme.dark};">
                <span class="scripts-icon" style="color: ${theme.primary};">${ICONS.quote}</span>
                VERBAL FORMULAS (WHAT TO SAY)
              </div>
              <div class="land-scripts-list">
                ${card.verbal_formulas.map(f => `
                  <div class="script-bubble">
                    <span class="script-role" style="color: ${theme.primary};">${escapeHtml(f.role)}:</span>
                    <span class="script-text">"${escapeHtml(f.script)}"</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- GUARDRAILS (DO NOT) -->
          ${card.guardrails && card.guardrails.length > 0 ? `
            <div class="card-guardrails-box land-guardrails">
              <div class="guardrails-header">
                <span class="guardrails-icon">${ICONS.warning}</span>
                <span class="guardrails-title">GUARDRAILS (DO NOT)</span>
              </div>
              <ul class="guardrails-list">
                ${card.guardrails.map(g => `
                  <li><span class="guard-cross">✕</span><span>${escapeHtml(g)}</span></li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

        </div>

      </div>

      <!-- BOTTOM ROW: ALLOWED NEXT & FOOTER -->
      <div class="land-bottom-bar">
        <div class="land-next-area">
          ${hasNext ? `
            <div class="land-next-header">
              <span class="next-label">ALLOWED NEXT:</span>
              <span class="next-sublabel">(Any card in category)</span>
            </div>
            <div class="next-chips land-next-chips">
              ${card.allowed_next.map(item => {
                const nextTheme = getNextCategoryTheme(item.category);
                return `
                  <div class="next-cat-chip" style="background: ${nextTheme.light}; border: 1.5px solid ${nextTheme.border};">
                    <span class="next-cat-badge" style="background: ${nextTheme.badgeBg}; color: ${nextTheme.badgeText};">
                      ${nextTheme.categoryName.toUpperCase()}
                    </span>
                    <span class="next-action-text">
                      <span class="next-suggested-label">Suggested:</span> ${escapeHtml(item.action)}
                    </span>
                  </div>
                `;
              }).join('')}
            </div>
          ` : '<div class="next-cat-chip" style="background: #FFFDF5; border: 1.5px solid #FDE68A;"><span class="next-cat-badge" style="background: #F59E0B; color: #fff;">ANCHOR</span><span class="next-action-text">Permanent centerpiece throughout conversation</span></div>'}
        </div>
        <div class="footer-meta">
          <span class="footer-ccc">CCC</span>
          <span>Card ${String(index + 1).padStart(2, '0')}/${total}</span>
        </div>
      </div>

      </div>
    </div>
  </section>
  `;
}

/**
 * Generate Card Back HTML
 */
function renderCardBack(card, orientation = 'portrait') {
  const theme = getTheme(card.category);
  const isLandscape = orientation === 'landscape';

  return `
  <section class="card-page ${isLandscape ? 'landscape-page' : 'portrait-page'} card-back-page" data-back-for="${card.id}">
    <div class="card-outer-frame card-back-frame ${isLandscape ? 'landscape-back' : ''}" style="--cat-primary: ${theme.primary}; --cat-secondary: ${theme.secondary};">
      <div class="back-inner-pattern">
        
        <!-- CORNER ACCENTS -->
        <div class="corner-ornament top-left"></div>
        <div class="corner-ornament top-right"></div>
        <div class="corner-ornament bottom-left"></div>
        <div class="corner-ornament bottom-right"></div>

        <div class="back-center-content">
          <div class="back-emblem" style="color: ${theme.secondary};">
            <!-- Interlocking relational rings SVG -->
            <svg viewBox="0 0 100 100" width="68" height="68" fill="none" stroke="currentColor" stroke-width="3">
              <circle cx="40" cy="50" r="28" stroke="currentColor" opacity="0.85"/>
              <circle cx="60" cy="50" r="28" stroke="currentColor" opacity="0.85"/>
              <path d="M50 30 C54 36 54 64 50 70 C46 64 46 36 50 30 Z" fill="currentColor" opacity="0.25"/>
              <circle cx="50" cy="50" r="4" fill="currentColor"/>
            </svg>
          </div>

          <h2 class="back-title">COUPLES CONVERSATION CARDS</h2>
          <div class="back-subtitle">A Structured Relational Toolkit</div>
          
          <div class="back-divider" style="background: ${theme.secondary};"></div>

          <div class="back-category-pill" style="border-color: ${theme.secondary}; color: ${theme.secondary};">
            ${card.category.toUpperCase()}
          </div>
          
          <div class="back-card-id">${card.id}</div>
          <div class="back-card-name">${escapeHtml(card.title)}</div>
        </div>

        <div class="back-footer">
          <span>CONNECTION OVER COMPLIANCE</span>
          <span>•</span>
          <span>US AGAINST THE PROBLEM</span>
        </div>

      </div>
    </div>
  </section>
  `;
}

/**
 * Generate Cover Card Back HTML (For duplex printing)
 */
function renderCoverCardBack(deckData, orientation = 'portrait') {
  const isLandscape = orientation === 'landscape';

  return `
  <section class="card-page ${isLandscape ? 'landscape-page' : 'portrait-page'} card-back-page cover-back-page" data-back-for="COVER">
    <div class="card-outer-frame card-back-frame cover-back-frame ${isLandscape ? 'landscape-back' : ''}" style="--cat-primary: #B45309; --cat-secondary: #D4AF37;">
      <div class="back-inner-pattern">
        
        <!-- CORNER ACCENTS -->
        <div class="corner-ornament top-left"></div>
        <div class="corner-ornament top-right"></div>
        <div class="corner-ornament bottom-left"></div>
        <div class="corner-ornament bottom-right"></div>

        <div class="back-center-content">
          <div class="back-emblem" style="color: #D4AF37;">
            <!-- Interlocking relational rings SVG -->
            <svg viewBox="0 0 100 100" width="70" height="70" fill="none" stroke="currentColor" stroke-width="3">
              <circle cx="40" cy="50" r="28" stroke="currentColor" opacity="0.85"/>
              <circle cx="60" cy="50" r="28" stroke="currentColor" opacity="0.85"/>
              <path d="M50 30 C54 36 54 64 50 70 C46 64 46 36 50 30 Z" fill="currentColor" opacity="0.3"/>
              <circle cx="50" cy="50" r="4.5" fill="currentColor"/>
            </svg>
          </div>

          <h2 class="back-title">COUPLES CONVERSATION CARDS</h2>
          <div class="back-subtitle">A Structured Relational Toolkit</div>
          
          <div class="back-divider" style="background: #D4AF37;"></div>

          <div class="cover-back-badge">
            COMPLETE 24-CARD DECK
          </div>

          <div class="cover-back-flow-guide">
            <div class="flow-guide-title">CONVERSATION FLOW COMPASS</div>
            <div class="flow-guide-text">
              Blue (Stage) &rarr; Teal (Inner World) &rarr; Purple (Attunement) &rarr; Amber (Context) &rarr; Green (Bridge)<br>
              <span class="circuit-note">Coral (Circuit Breakers) available anytime to pause and regulate</span>
            </div>
          </div>
        </div>

        <div class="back-footer">
          <span>CONNECTION OVER COMPLIANCE</span>
          <span>•</span>
          <span>US AGAINST THE PROBLEM</span>
        </div>

      </div>
    </div>
  </section>
  `;
}

/**
 * Generate Deck Cover / Reference Card
 */
function renderCoverCard(deckData, orientation = 'portrait') {
  const isLandscape = orientation === 'landscape';

  return `
  <section class="card-page ${isLandscape ? 'landscape-page' : 'portrait-page'} deck-cover-page">
    <div class="card-outer-frame cover-frame ${isLandscape ? 'landscape-cover' : ''}" style="--cat-primary: #B45309; --cat-border: #FDE68A;">
      <div class="cover-inner">
        
        <div class="cover-header">
          <div class="cover-eyebrow">RELATIONAL RESOLUTION TOOLKIT</div>
          <h1 class="cover-title">Couples Conversation Cards</h1>
          <div class="cover-subtitle">Complete 24-Card Tabletop Dialogue System</div>
        </div>

        <div class="cover-principles">
          <div class="principle-item">
            <span class="p-num">1</span>
            <div><strong>The Shared Commons:</strong> Neither partner owns these cards; both draw from one palette.</div>
          </div>
          <div class="principle-item">
            <span class="p-num">2</span>
            <div><strong>Connection Over Compliance:</strong> Never weaponize cards as accusations or process-policing.</div>
          </div>
          <div class="principle-item">
            <span class="p-num">3</span>
            <div><strong>Two Realities Stand Together:</strong> Validating emotional pain never erases your experience.</div>
          </div>
        </div>

        <div class="cover-palette-legend">
          <div class="legend-title">DECK COLOR SYSTEM</div>
          <div class="legend-grid">
            ${deckData.categories.map(c => `
              <div class="legend-item">
                <span class="legend-dot" style="background: ${c.hex};"></span>
                <span class="legend-name"><strong>${c.name}:</strong> ${c.description}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="cover-footer">
          <span>24 Cards</span>
        </div>

      </div>
    </div>
  </section>
  `;
}

/**
 * Helpers
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatEmphasizedText(text) {
  const escaped = escapeHtml(text);
  // Highlight "THE SHARED COMMONS:", "CONNECTION OVER COMPLIANCE:", etc.
  return escaped.replace(/^([A-Z\s]{4,}):/g, '<strong>$1:</strong>');
}

/**
 * Global CSS styles for 4x6 print and screen preview
 */
function getGlobalStyles(orientation = 'portrait') {
  const isLandscape = orientation === 'landscape';
  const width = isLandscape ? '6in' : '4in';
  const height = isLandscape ? '4in' : '6in';

  return `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  @page {
    size: ${width} ${height};
    margin: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #0F172A;
    background: #F1F5F9;
    line-height: 1.35;
    -webkit-font-smoothing: antialiased;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* PREVIEW / SCREEN CONTAINER */
  .deck-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 24px 12px;
  }

  @media print {
    body {
      background: none;
    }
    .deck-container {
      display: block;
      padding: 0;
      gap: 0;
    }
    .no-print {
      display: none !important;
    }
  }

  /* INDIVIDUAL 4x6 CARD PAGE */
  .card-page {
    width: ${width};
    height: ${height};
    page-break-after: always;
    page-break-inside: avoid;
    break-after: page;
    position: relative;
    background: #FFFFFF;
    overflow: hidden;
    display: flex;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  @media print {
    .card-page {
      box-shadow: none;
      width: ${width};
      height: ${height};
    }
  }

  /* OUTER CARD FRAME (SOLID CATEGORY COLOR EXTENDING OUTWARD TO CARD EDGES) */
  .card-outer-frame {
    width: 100%;
    height: 100%;
    background: var(--cat-primary);
    padding: 0.11in;
    position: relative;
    box-sizing: border-box;
    display: flex;
  }

  /* INNER CARD FRAME (CONTENT CONTAINER) */
  .card-inner-frame {
    width: 100%;
    height: 100%;
    background: #FFFFFF;
    border-radius: 8px;
    padding: 0.05in 0.07in;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    box-sizing: border-box;
  }

  /* THIN LIGHT LINE (BROUGHT WAY IN TO NEARLY TOUCH CONTENT; 2PX MINOR GAP TO SOLID COLOR) */
  .card-inner-frame::before {
    content: "";
    position: absolute;
    inset: 2px;
    border: 1px solid var(--cat-border);
    border-radius: 6px;
    pointer-events: none;
  }

  /* TOP HEADER */
  .card-header, .land-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    margin-bottom: 4px;
  }

  .header-left, .land-header-left {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .cat-pill {
    font-size: 7pt;
    font-weight: 800;
    letter-spacing: 0.6px;
    padding: 2px 7px;
    border-radius: 999px;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .position-tag {
    font-size: 6.5pt;
    font-weight: 700;
    color: #64748B;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }

  .card-id-badge {
    font-size: 8pt;
    font-weight: 800;
    color: #FFFFFF;
    padding: 2px 8px;
    border-radius: 6px;
    letter-spacing: 0.5px;
  }

  /* TITLE & SPECIAL BADGE */
  .card-title-section {
    margin-bottom: 5px;
  }

  .card-title {
    font-size: 12.5pt;
    font-weight: 800;
    line-height: 1.15;
    color: #0F172A;
    letter-spacing: -0.2px;
  }

  .card-title.title-long {
    font-size: 11pt;
  }

  .special-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 6.5pt;
    font-weight: 800;
    letter-spacing: 0.5px;
    padding: 2px 7px;
    border-radius: 4px;
    margin-top: 3px;
    text-transform: uppercase;
  }

  .badge-anchor {
    background: #FEF3C7;
    color: #92400E;
    border: 1px solid #FDE68A;
  }

  .badge-override {
    background: #FFE4E6;
    color: #9F1239;
    border: 1px solid #FECDD3;
  }

  .badge-icon {
    display: flex;
    align-items: center;
  }

  /* INTENT BOX */
  .card-intent-box {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    background: var(--cat-light);
    border-left: 3px solid var(--cat-primary);
    border-radius: 0 5px 5px 0;
    padding: 4px 6px;
    margin-bottom: 5px;
  }

  .intent-icon {
    display: flex;
    align-items: center;
    margin-top: 1px;
    flex-shrink: 0;
  }

  .intent-content {
    font-size: 7.2pt;
    line-height: 1.25;
    color: #334155;
  }

  .intent-content strong {
    color: var(--cat-primary);
    font-weight: 800;
  }

  /* PROTOCOLS SECTION */
  .card-protocols-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 4px;
  }

  .protocol-block {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 5px;
    padding: 4px 6px;
  }

  .role-badge {
    display: inline-flex;
    align-items: center;
    font-size: 6.5pt;
    font-weight: 800;
    letter-spacing: 0.5px;
    padding: 1.5px 5px;
    border-radius: 3px;
    border-left: 2.5px solid var(--cat-primary);
    margin-bottom: 2px;
  }

  .role-bullet {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: currentColor;
    margin-right: 4px;
  }

  .protocol-steps {
    list-style: none;
    padding-left: 0;
  }

  .protocol-steps li {
    font-size: 7pt;
    line-height: 1.22;
    color: #1E293B;
    position: relative;
    padding-left: 8px;
    margin-bottom: 1.5px;
  }

  .protocol-steps li:last-child {
    margin-bottom: 0;
  }

  .protocol-steps li::before {
    content: "•";
    position: absolute;
    left: 1px;
    color: var(--cat-primary);
    font-weight: bold;
  }

  /* GUARDRAILS (DO NOT) */
  .card-guardrails-box {
    background: #FFF1F2;
    border: 1px solid #FECDD3;
    border-radius: 5px;
    padding: 3.5px 6px;
    margin-bottom: 4px;
  }

  .guardrails-header {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 6.5pt;
    font-weight: 800;
    color: #BE123C;
    letter-spacing: 0.4px;
    margin-bottom: 1.5px;
  }

  .guardrails-icon {
    display: flex;
    align-items: center;
    color: #E11D48;
  }

  .guardrails-list {
    list-style: none;
    padding: 0;
  }

  .guardrails-list li {
    font-size: 6.8pt;
    line-height: 1.2;
    color: #4C0519;
    display: flex;
    align-items: flex-start;
    gap: 4px;
    margin-bottom: 1px;
  }

  .guardrails-list li:last-child {
    margin-bottom: 0;
  }

  .guard-cross {
    color: #E11D48;
    font-weight: 800;
    font-size: 6.5pt;
    line-height: 1.2;
    flex-shrink: 0;
  }

  /* SCRIPTS / VERBAL FORMULAS */
  .card-scripts-section {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 5px;
    padding: 3.5px 6px;
    margin-bottom: 4px;
  }

  .scripts-header {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 6.5pt;
    font-weight: 800;
    color: #334155;
    letter-spacing: 0.4px;
    margin-bottom: 2px;
  }

  .scripts-icon {
    display: flex;
    align-items: center;
  }

  .scripts-grid {
    display: flex;
    flex-direction: column;
    gap: 2.5px;
  }

  .script-bubble {
    font-size: 6.7pt;
    line-height: 1.2;
    color: #1E293B;
  }

  .script-role {
    font-weight: 800;
    margin-right: 2px;
  }

  .script-text {
    font-style: italic;
    color: #0F172A;
  }

  /* ALLOWED NEXT MOVES (HIGH PRIORITY CATEGORY CHIPS) */
  .card-next-section {
    display: flex;
    flex-direction: column;
    gap: 2.5px;
    margin-bottom: 3px;
  }

  .next-header-row {
    display: flex;
    align-items: baseline;
    gap: 5px;
    flex-wrap: wrap;
  }

  .next-label {
    font-size: 6pt;
    font-weight: 800;
    color: #475569;
    letter-spacing: 0.4px;
  }

  .next-sublabel {
    font-size: 5.4pt;
    font-weight: 600;
    color: #64748B;
    font-style: italic;
  }

  .next-chips {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .next-cat-chip {
    display: flex;
    align-items: center;
    gap: 5px;
    border-radius: 4px;
    padding: 1.5px 5px 1.5px 2px;
  }

  .next-cat-badge {
    font-size: 5.8pt;
    font-weight: 800;
    letter-spacing: 0.5px;
    padding: 1px 5px;
    border-radius: 3px;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .next-action-text {
    font-size: 6.2pt;
    line-height: 1.15;
    color: #1E293B;
  }

  .next-suggested-label {
    font-weight: 700;
    color: #475569;
  }

  /* FOOTER */
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #E2E8F0;
    padding-top: 3px;
    margin-top: auto;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 6pt;
    color: #64748B;
  }

  .footer-ccc {
    font-weight: 800;
    color: var(--cat-primary);
  }

  .footer-count {
    font-size: 6pt;
    font-weight: 700;
    color: #64748B;
  }

  /* ========================================================= */
  /* LANDSCAPE SPECIFIC STYLES (6" wide x 4" tall)             */
  /* ========================================================= */
  .landscape-frame {
    padding: 0.11in;
  }

  .landscape-inner {
    padding: 0.05in 0.11in;
  }

  .land-title-intent-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 4px;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 3px;
  }

  .land-title {
    font-size: 11pt;
    font-weight: 800;
    color: #0F172A;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 55%;
  }

  .land-intent-box {
    font-size: 6.7pt;
    line-height: 1.2;
    color: #475569;
    max-width: 45%;
    text-align: right;
  }

  .intent-label {
    font-weight: 800;
  }

  .land-columns-container {
    display: flex;
    gap: 10px;
    flex: 1;
    min-height: 0;
    margin-bottom: 4px;
  }

  .land-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .col-section-header {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 6.5pt;
    font-weight: 800;
    letter-spacing: 0.4px;
    margin-bottom: 2px;
  }

  .section-bullet {
    width: 4px;
    height: 4px;
    border-radius: 50%;
  }

  .land-protocols {
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow: hidden;
  }

  .land-scripts-block {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 5px;
    padding: 3px 5px;
    margin-bottom: 3px;
  }

  .land-scripts-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .land-guardrails {
    margin-bottom: 0;
  }

  .land-bottom-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #E2E8F0;
    padding-top: 2px;
    margin-top: auto;
  }

  .land-next-area {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  .land-next-header {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    line-height: 1.1;
  }

  .land-next-chips {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }

  .land-next-chips .next-cat-chip {
    padding: 1px 4px 1px 2px;
  }

  .land-next-chips .next-cat-badge {
    font-size: 5.2pt;
    padding: 1px 4px;
  }

  .land-next-chips .next-action-text {
    font-size: 5.6pt;
    white-space: nowrap;
  }

  .footer-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 6.2pt;
    font-weight: 700;
    color: #64748B;
    flex-shrink: 0;
  }

  /* ========================================================= */
  /* CARD BACK STYLES                                          */
  /* ========================================================= */
  .card-back-frame {
    background: var(--cat-primary);
    color: #FFFFFF;
    padding: 0.11in;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }

  .card-back-frame::before {
    display: none;
  }

  .back-inner-pattern {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 0.18in 0.15in;
    position: relative;
    background: radial-gradient(circle at center, #1E293B 0%, #0F172A 100%);
    box-shadow: 0 0 0 2px #0F172A;
  }

  .back-inner-pattern::before {
    content: "";
    position: absolute;
    inset: 2px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 6px;
    pointer-events: none;
  }

  .corner-ornament {
    position: absolute;
    width: 10px;
    height: 10px;
    border-color: var(--cat-secondary);
  }
  .top-left { top: 6px; left: 6px; border-top: 2px solid; border-left: 2px solid; }
  .top-right { top: 6px; right: 6px; border-top: 2px solid; border-right: 2px solid; }
  .bottom-left { bottom: 6px; left: 6px; border-bottom: 2px solid; border-left: 2px solid; }
  .bottom-right { bottom: 6px; right: 6px; border-bottom: 2px solid; border-right: 2px solid; }

  .back-center-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .back-emblem {
    margin-bottom: 10px;
  }

  .back-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 11pt;
    letter-spacing: 1.5px;
    color: #FFFFFF;
    margin-bottom: 3px;
  }

  .back-subtitle {
    font-size: 6.8pt;
    letter-spacing: 0.8px;
    color: #94A3B8;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .back-divider {
    width: 36px;
    height: 2px;
    margin-bottom: 10px;
  }

  .back-category-pill {
    font-size: 7pt;
    font-weight: 800;
    letter-spacing: 1px;
    border: 1px solid;
    padding: 3px 10px;
    border-radius: 999px;
    margin-bottom: 8px;
  }

  .back-card-id {
    font-size: 16pt;
    font-weight: 800;
    color: #F8FAFC;
    letter-spacing: 1px;
    margin-bottom: 2px;
  }

  .back-card-name {
    font-size: 8pt;
    font-weight: 600;
    color: #CBD5E1;
    max-width: 80%;
  }

  .back-footer {
    display: flex;
    gap: 8px;
    font-size: 5.5pt;
    letter-spacing: 0.8px;
    color: #64748B;
    font-weight: 700;
  }

  /* COVER BACK SPECIFICS */
  .cover-back-badge {
    font-size: 6.5pt;
    font-weight: 800;
    letter-spacing: 1.5px;
    color: #D4AF37;
    border: 1px solid rgba(212, 175, 55, 0.4);
    background: rgba(212, 175, 55, 0.08);
    padding: 3px 12px;
    border-radius: 999px;
    margin-bottom: 10px;
  }

  .cover-back-flow-guide {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 8px 12px;
    max-width: 90%;
    text-align: center;
  }

  .flow-guide-title {
    font-size: 6pt;
    font-weight: 800;
    letter-spacing: 0.8px;
    color: #E2E8F0;
    margin-bottom: 4px;
  }

  .flow-guide-text {
    font-size: 5.8pt;
    line-height: 1.35;
    color: #94A3B8;
  }

  .circuit-note {
    display: inline-block;
    margin-top: 3px;
    color: #FECDD3;
    font-style: italic;
  }

  /* ========================================================= */
  /* COVER / REFERENCE CARD STYLES                             */
  /* ========================================================= */
  .cover-frame {
    background: #B45309;
    padding: 0.11in;
    display: flex;
  }

  .cover-inner {
    width: 100%;
    height: 100%;
    background: #FFFDF5;
    border-radius: 8px;
    padding: 0.08in 0.10in;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    box-sizing: border-box;
  }

  .cover-inner::before {
    content: "";
    position: absolute;
    inset: 2px;
    border: 1px solid #FDE68A;
    border-radius: 6px;
    pointer-events: none;
  }

  .landscape-cover .cover-inner {
    padding: 0.08in 0.15in;
  }

  .cover-header {
    text-align: center;
    border-bottom: 1.5px solid #FDE68A;
    padding-bottom: 6px;
  }

  .cover-eyebrow {
    font-size: 6.5pt;
    font-weight: 800;
    letter-spacing: 1px;
    color: #B45309;
  }

  .cover-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 13.5pt;
    font-weight: 700;
    color: #78350F;
    line-height: 1.2;
    margin: 2px 0;
  }

  .cover-subtitle {
    font-size: 7pt;
    color: #92400E;
    font-weight: 600;
  }

  .cover-principles {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: #FFFFFF;
    border: 1px solid #FEF3C7;
    border-radius: 6px;
    padding: 6px;
  }

  .principle-item {
    display: flex;
    gap: 6px;
    font-size: 6.6pt;
    line-height: 1.2;
    color: #334155;
  }

  .p-num {
    width: 14px;
    height: 14px;
    background: #F59E0B;
    color: #FFFFFF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 6pt;
    font-weight: 800;
    flex-shrink: 0;
  }

  .cover-palette-legend {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 5px;
  }

  .legend-title {
    font-size: 6.2pt;
    font-weight: 800;
    color: #475569;
    letter-spacing: 0.6px;
    margin-bottom: 3px;
    text-align: center;
  }

  .legend-grid {
    display: flex;
    flex-direction: column;
    gap: 2.5px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 6pt;
    line-height: 1.15;
    color: #1E293B;
  }

  .legend-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .cover-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 6.5pt;
    color: #94A3B8;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }
  `;
}

/**
 * Generate Complete HTML Document
 */
function generateHtmlDocument(deckData, options = {}) {
  const {
    orientation = 'portrait', // 'portrait' | 'landscape'
    includeBacks = false,
    includeCover = true,
  } = options;

  const total = deckData.cards.length;
  const isLandscape = orientation === 'landscape';

  const pagesHtml = [];

  // 1. Cover Card (and its back if duplex requested)
  if (includeCover) {
    pagesHtml.push(renderCoverCard(deckData, orientation));
    if (includeBacks) {
      pagesHtml.push(renderCoverCardBack(deckData, orientation));
    }
  }

  // 2. Cards
  deckData.cards.forEach((card, idx) => {
    if (isLandscape) {
      pagesHtml.push(renderCardLandscape(card, idx, total));
    } else {
      pagesHtml.push(renderCardPortrait(card, idx, total));
    }

    if (includeBacks) {
      pagesHtml.push(renderCardBack(card, orientation));
    }
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(deckData.deck_name)} - 4x6 Cards (${orientation})</title>
  <style>
    ${getGlobalStyles(orientation)}
  </style>
</head>
<body>
  <div class="deck-container">
    ${pagesHtml.join('\n')}
  </div>
</body>
</html>`;
}

module.exports = {
  generateHtmlDocument,
  renderCardPortrait,
  renderCardLandscape,
  renderCardBack,
  renderCoverCard,
  renderCoverCardBack,
  getGlobalStyles,
  getNextCategoryTheme,
  CATEGORY_THEMES
};
