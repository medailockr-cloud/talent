/** Readiness is a declaration, not identity verification or permission to sell tickets. */
export const SHOW_HOST_POLICY = {
  requiresIdentityReview: true,
  requiresVenuePermission: true,
  requiresTerms: true,
};

export function showEligibility(metrics: {
  organizerDeclared?: boolean;
  venueConfirmed?: boolean;
  termsAccepted?: boolean;
  backers?: number;
  score?: number | null;
  ratings?: number;
}) {
  const checks = [
    {
      label: 'Organizer identity ready for review',
      current: metrics.organizerDeclared ? 'Declared · not verified' : 'Not declared',
      met: metrics.organizerDeclared === true,
    },
    {
      label: 'Venue permission / online format confirmed',
      current: metrics.venueConfirmed ? 'Declared · not verified' : 'Not confirmed',
      met: metrics.venueConfirmed === true,
    },
    {
      label: 'Clear participant and cancellation terms',
      current: metrics.termsAccepted ? 'Declared · review required' : 'Not accepted',
      met: metrics.termsAccepted === true,
    },
  ];
  return { checks, eligible: checks.every((c) => c.met) };
}
