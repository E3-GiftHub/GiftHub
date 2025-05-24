export interface InvitationDTO {
  invitationId: string;
  eventIdentifier: string;
  guestIdentifier: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}
