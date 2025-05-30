export interface InboxNotificationResponse {
  id: string | number;
  text: string;
  type: "event" | "invitation";
  link: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  notificationDate: string;
}