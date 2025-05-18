export interface InboxNotificationResponse {
  id: number;
  text: string;
  type: string;
  link: string;
  firstName: string;
  lastName: string;
  profilePicture: string | undefined;
  notificationDate: string;
}
