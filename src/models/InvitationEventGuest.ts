export interface InvitationProps {
  title?: string;
  subtitle?: string;
  date?: string;
  location?: string;
  details?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  eventId?: number;
  guestUsername?: string;
}