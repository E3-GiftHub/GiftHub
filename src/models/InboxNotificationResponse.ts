export interface InboxNotificationResponse {
  id: number;
  text: string;
  type: string;
  read: boolean;
  link: string;
  firstName: string;
  lastName: string;
  profilePicture: string | undefined;
  notificationDate: string;
}
