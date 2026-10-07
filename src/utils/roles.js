/**
 * How each account type is named in the interface. The backend stores
 * candidates as role 'user'; people never see that word.
 */
export const ROLE_LABELS = {
  user: 'Candidate',
  employer: 'Employer',
  institute: 'Institute',
  admin: 'Admin',
};

/** Badge colours per account type (tones from components/ui/Badge.jsx). */
export const ROLE_TONES = {
  user: 'azure',
  employer: 'amber',
  institute: 'success',
  admin: 'ink',
};

export function roleLabel(role) {
  return ROLE_LABELS[role] || 'Member';
}

export function roleTone(role) {
  return ROLE_TONES[role] || 'neutral';
}
