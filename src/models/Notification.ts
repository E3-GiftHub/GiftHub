export enum NotificationCategory {
    CONTRIBUTION = 'contribution',
    INVITATION = 'invitation',
}

export enum ContributionType {
    GIFT_PURCHASED = 'gift_purchased',
    TARGET_REACHED = 'target_reached',
    GIFT_CONTRIBUTION = 'gift_contribution',
}


export interface NotificationData {
    reciver: string | undefined;
    id: string;
    title?: string;
    message: string;
    createdAt: Date;
    category: NotificationCategory;
    contributionType?: ContributionType;
    sender?: string;
    link?: string;
}

export class Notification {
    id: string;
    title?: string;
    message: string;
    createdAt: Date;
    category: NotificationCategory;
    contributionType?: ContributionType;
    sender?: string;
    reciver?: string;


    constructor(data: NotificationData) {
        this.id = data.id;
        this.title = data.title;
        this.message = data.message;
        this.createdAt = data.createdAt || new Date();
        this.category = data.category;
        this.contributionType = data.contributionType;
        this.sender = data.sender;
        this.reciver = data.reciver;
    }



    getTimeAgo(): string {
        const now = new Date();
        const diffMs = now.getTime() - this.createdAt.getTime();
        const diffSec = Math.floor(diffMs / 1000);

        if (diffSec < 60) return `${diffSec} seconds ago`;

        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `${diffMin} minutes ago`;

        const diffHours = Math.floor(diffMin / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} days ago`;
    }

    isContributionType(type: ContributionType): boolean {
        return this.category === NotificationCategory.CONTRIBUTION && this.contributionType === type;
    }

    isInvitation(): boolean {
        return this.category === NotificationCategory.INVITATION;
    }

    isGiftPurchased(): boolean {
        return this.isContributionType(ContributionType.GIFT_PURCHASED);
    }

    isTargetReached(): boolean {
        return this.isContributionType(ContributionType.TARGET_REACHED);
    }

    isGiftContribution(): boolean {
        return this.isContributionType(ContributionType.GIFT_CONTRIBUTION);
    }

    isSender(senderId: string): boolean {
        return this.sender === senderId;
    }

    isReceiver(receiverId: string): boolean {
        return this.reciver === receiverId;
    }

    getReceiver(): string | undefined {
        return this.reciver;
    }

    getId(): string {
        return this.id;
    }



    getSender(): string | undefined {
        return this.sender;
    }

    getCategory(): NotificationCategory {
        return this.category;
    }

    getContributionType(): ContributionType | undefined {
        return this.contributionType;
    }

    getMessage(): string {
        return this.message;
    }

    getTitle(): string | undefined {
        return this.title;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }


    toJSON(): NotificationData {
        return {
            id: this.id,
            title: this.title,
            message: this.message,
            createdAt: this.createdAt,
            category: this.category,
            contributionType: this.contributionType,
            sender: this.sender,
            reciver: this.reciver,
        };
    }
}
