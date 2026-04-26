export const tokens = {
  pageBackground: 'linear-gradient(180deg, #F5F7FB 0%, #EEF2F8 48%, #E8EEF7 100%)',
  heroBackground: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(236,244,255,0.88) 58%, rgba(219,232,250,0.95) 100%)',
  cardBackground: 'rgba(255, 255, 255, 0.8)',
  cardBorder: '1px solid rgba(255, 255, 255, 0.72)',
  cardShadow: '0 18px 42px rgba(124, 140, 171, 0.14)',
  cardRadius: '30px',
  fieldBackground: 'rgba(255, 255, 255, 0.94)',
  fieldBorder: '1px solid rgba(205, 217, 234, 0.84)',
  fieldRadius: '20px',
  primaryGradient: 'linear-gradient(135deg, #157AFF 0%, #55A3FF 100%)',
  successGradient: 'linear-gradient(135deg, #20A46A 0%, #67D597 100%)',
  softButtonBackground: 'rgba(240, 244, 252, 0.96)',
  softButtonBorder: '1px solid rgba(203, 214, 230, 0.82)',
  primaryShadow: '0 12px 26px rgba(21, 122, 255, 0.22)',
  successShadow: '0 12px 26px rgba(32, 164, 106, 0.2)',
  textStrong: '#101828',
  textPrimary: '#162033',
  textSecondary: '#607086',
  textTertiary: '#8A94A6',
  divider: '1px solid rgba(218, 226, 239, 0.82)',
  spacingPageBottom: '120px',
};

export function createPageContentStyle() {
  return {
    padding: `28px 24px ${tokens.spacingPageBottom}`,
  };
}

export function createGlassCardStyle() {
  return {
    background: tokens.cardBackground,
    borderRadius: tokens.cardRadius,
    padding: '24px',
    marginBottom: '20px',
    border: tokens.cardBorder,
    boxShadow: tokens.cardShadow,
  };
}

export function createInputStyle() {
  return {
    background: tokens.fieldBackground,
    borderRadius: tokens.fieldRadius,
    padding: '18px 20px',
    marginTop: '10px',
    border: tokens.fieldBorder,
  };
}

export function createPrimaryButtonStyle() {
  return {
    background: tokens.primaryGradient,
    color: '#FFFFFF',
    borderRadius: '999px',
    boxShadow: tokens.primaryShadow,
    transform: 'scale(1)',
    transition: 'transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 180ms ease, box-shadow 220ms ease, filter 220ms ease',
    filter: 'saturate(1)',
  };
}

export function createSecondaryButtonStyle() {
  return {
    background: tokens.softButtonBackground,
    color: '#536173',
    borderRadius: '999px',
    border: tokens.softButtonBorder,
    transform: 'scale(1)',
    transition: 'transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 180ms ease, background 220ms ease, border 220ms ease',
  };
}

export function createPressableCardStyle() {
  return {
    transform: 'scale(1)',
    transition: 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 240ms ease, opacity 220ms ease, border 220ms ease',
  };
}

export function createEnterStyle(entered: boolean, offset = 24, duration = 420) {
  return {
    transform: entered ? 'translateY(0)' : `translateY(${offset}px)`,
    opacity: entered ? '1' : '0.01',
    transition: `all ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
  };
}

export const sectionTitleStyle = {
  fontSize: '28px',
  fontWeight: '700',
  color: tokens.textPrimary,
  letterSpacing: '-0.02em',
};

export const pageHeroTitleStyle = {
  display: 'block',
  fontSize: '38px',
  fontWeight: '700',
  color: tokens.textStrong,
  letterSpacing: '-0.04em',
};

export const pageHeroSubtitleStyle = {
  display: 'block',
  marginTop: '8px',
  color: tokens.textSecondary,
  lineHeight: '1.8',
};

export const metricValueLargeStyle = {
  display: 'block',
  marginTop: '8px',
  fontSize: '36px',
  fontWeight: '700',
  letterSpacing: '-0.03em',
};

export const metricValueXLStyle = {
  display: 'block',
  marginTop: '10px',
  fontSize: '42px',
  fontWeight: '700',
  letterSpacing: '-0.04em',
};

export const helperTextStyle = {
  display: 'block',
  marginTop: '8px',
  color: tokens.textSecondary,
  lineHeight: '1.7',
};
