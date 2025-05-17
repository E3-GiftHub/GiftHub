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

    getUnreadNotifications(): Notification[] {
        return this.notifications.filter(notification => !notification.isRead());
    }

    markAllAsRead(): void {
        this.notifications.forEach(notification => notification.markAsRead());
    }

    markAsRead(notificationId: string): boolean {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.markAsRead();
            return true;
        }
        return false;
    }


    deleteNotification(notificationId: string): boolean {
        const initialLength = this.notifications.length;
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        return this.notifications.length < initialLength;
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