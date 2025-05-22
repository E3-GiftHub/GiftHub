import { Notification, NotificationCategory, type NotificationData } from './Notification';

export class Inbox {
    private notifications: Notification[];

    constructor(notifications: NotificationData[] = []) {
        this.notifications = notifications.map(data => new Notification(data));
    }


    getAllNotifications(): Notification[] {
        return [...this.notifications];
    }

    getContributionNotifications(): Notification[] {
        return this.notifications.filter(
            notification => notification.getCategory() === NotificationCategory.CONTRIBUTION
        );
    }


    getInvitationNotifications(): Notification[] {
        return this.notifications.filter(
            notification => notification.getCategory() === NotificationCategory.INVITATION
        );
    }


    addNotification(notification: Notification | NotificationData): void {
        const notificationObj = notification instanceof Notification
            ? notification
            : new Notification(notification);
        this.notifications.unshift(notificationObj);
    }


    toJSON(): NotificationData[] {
        return this.notifications.map(notification => notification.toJSON());
    }
}
