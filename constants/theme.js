// Dark theme (default)
export const C = {
  bg:       '#0F0F0F',
  bgCard:   '#1A1A1A',
  bgLight:  '#242424',
  accent:   '#C8FF00',
  accentDim:'#9ABF00',
  white:    '#FFFFFF',
  gray:     '#888888',
  grayLight:'#BBBBBB',
  border:   '#2A2A2A',
  danger:   '#FF4444',
  success:  '#00CC66',
};

// Light theme
export const CLight = {
  bg:       '#F5F5F5',
  bgCard:   '#FFFFFF',
  bgLight:  '#EBEBEB',
  accent:   '#7AB800',
  accentDim:'#5A8A00',
  white:    '#111111',
  gray:     '#777777',
  grayLight:'#555555',
  border:   '#DDDDDD',
  danger:   '#DD3333',
  success:  '#00AA55',
};

export function getTheme(isDark) {
  return isDark ? C : CLight;
}
