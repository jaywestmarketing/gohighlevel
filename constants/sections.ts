export type GHLSection =
  | 'dashboard'
  | 'contacts'
  | 'conversations'
  | 'calendar'
  | 'opportunities'
  | 'funnels'
  | 'workflows'
  | 'websites'
  | 'email-builder'
  | 'other';

export const BUILDER_SECTIONS: GHLSection[] = [
  'funnels',
  'workflows',
  'websites',
  'email-builder',
];

export function detectSection(url: string): GHLSection {
  if (!url) return 'other';
  const lower = url.toLowerCase();
  if (lower.includes('/funnels')) return 'funnels';
  if (lower.includes('/automation/workflows') || lower.includes('/workflows')) return 'workflows';
  if (lower.includes('/sites') || lower.includes('/websites')) return 'websites';
  if (lower.includes('/email-marketing/builder') || lower.includes('/email-campaigns/builder')) return 'email-builder';
  if (lower.includes('/contacts')) return 'contacts';
  if (lower.includes('/conversations') || lower.includes('/messaging')) return 'conversations';
  if (lower.includes('/calendar') || lower.includes('/appointments')) return 'calendar';
  if (lower.includes('/opportunities') || lower.includes('/pipeline')) return 'opportunities';
  if (lower.includes('/dashboard') || lower === 'https://app.gohighlevel.com/') return 'dashboard';
  return 'other';
}

export const SECTION_PATHS: Record<
  Exclude<GHLSection, 'funnels' | 'workflows' | 'websites' | 'email-builder' | 'other'>,
  string
> = {
  dashboard: 'dashboard',
  contacts: 'contacts',
  conversations: 'conversations',
  calendar: 'calendar',
  opportunities: 'opportunities',
};

export const BUILDER_LABELS: Partial<Record<GHLSection, string>> = {
  funnels: 'Funnel Builder',
  workflows: 'Workflow Builder',
  websites: 'Website Builder',
  'email-builder': 'Email Builder',
};
