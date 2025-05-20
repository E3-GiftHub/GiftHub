import { PrismaClient, PriorityType, StatusType, MarkType } from '@prisma/client';
import type { Retailer, User, Event, Item } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database seeding...');

    await clearDatabase();

    const users = await createUsers();
    console.log(`Created ${users.length} users`);

    const retailers = await createRetailers();
    console.log(`Created ${retailers.length} retailers`);

    const items = await createItems(retailers);
    console.log(`Created ${items.length} catalogue items`);

    const events = await createEvents(users);
    console.log(`Created ${events.length} events`);

    const invitations = await createInvitations(users, events);
    console.log(`Created ${invitations.length} invitations`);

    const eventArticles = await createEventArticles(events, items);
    console.log(`Created ${eventArticles.length} event articles`);

    const marks = await createMarks(users, events, items);
    console.log(`Created ${marks.length} marks`);

    const contributions = await createContributions(users, events, items);
    console.log(`Created ${contributions.length} contributions`);

    const media = await createMedia(users, events);
    console.log(`Created ${media.length} media posts`);

    const userReports = await createUserReports(users);
    console.log(`Created ${userReports.length} user reports`);

    const eventReports = await createEventReports(users, events);
    console.log(`Created ${eventReports.length} event reports`);

    console.log('Database seeding completed!');
}

async function clearDatabase() {
    const tablesToClear = [
        'EventReport',
        'UserReport',
        'Contribution',
        'Mark',
        'EventArticle',
        'Media',
        'Invitation',
        'Item',
        'Retailer',
        'Event',
        'User',
    ];

    for (const table of tablesToClear) {
        await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
    }

    console.log('Database cleared');
}

async function createUsers() {
    const users = [];

    for (let i = 1; i <= 20; i++) {
        const user = await prisma.user.create({
            data: {
                username: `user${i}`,
                email: `user${i}@example.com`,
                fname: `FirstName${i}`,
                lname: `LastName${i}`,
                password: `hashedPassword${i}`,
                iban: `RO${Math.floor(Math.random() * 10000000000000000)}`,
                pictureUrl: `picture${i}.jpg`,
                emailVerified: new Date(),
            },
        });

        users.push(user);
    }

    return users;
}

async function createRetailers() {
    const retailerNames = [
        'Emag',
        'Amazon',
        'Ebay',
        'Altex',
        'Aliexpress',
        'Bestbuy',
        'Ikea',
        'Elefant',
        'Flanco',
        'Digi',
        'Sephora'
    ];
    const retailers = [];

    for (const element of retailerNames) {
        const name = element;
        const retailer = await prisma.retailer.create({
            data: {
                name,
                apiUrl: `https://api.${name}.com`,
            },
        });

        retailers.push(retailer);
    }

    return retailers;
}

async function createItems(retailers: Retailer[]) {
    const items = [];
    const itemsData = [
        { name: 'Smart TV', description: '55" 4K Smart TV', price: 699.99, retailerId: 1 },
        { name: 'Kindle Paperwhite', description: 'E-reader with adjustable light', price: 129.99, retailerId: 2 },
        { name: 'Vintage Record Player', description: 'Bluetooth compatible turntable', price: 249.99, retailerId: 3 },
        { name: 'Gaming Laptop', description: 'High-performance gaming laptop', price: 1299.99, retailerId: 4 },
        { name: 'Smartphone Accessories', description: 'Bundle of phone cases and screen protectors', price: 39.99, retailerId: 5 },
        { name: 'Wireless Headphones', description: 'Noise-cancelling over-ear headphones', price: 199.99, retailerId: 6 },
        { name: 'Modern Coffee Table', description: 'Scandinavian design living room furniture', price: 149.99, retailerId: 7 },
        { name: 'Bestseller Book Collection', description: 'Set of 5 bestselling novels', price: 89.99, retailerId: 8 },
        { name: 'Ultra HD Monitor', description: '32" curved gaming monitor', price: 349.99, retailerId: 9 },
        { name: 'Electronics Kit', description: 'DIY electronics starter set with components', price: 79.99, retailerId: 10 },
        { name: 'Luxury Skincare Set', description: 'Premium facial care collection', price: 159.99, retailerId: 11 },
        { name: 'Custom Gift Card', description: 'Personalized gift card', price: 50.00, isCustom: true },
        { name: 'Handmade Gift', description: 'Custom handmade gift', price: 0, isCustom: true },
    ];

    for (const itemData of itemsData) {
        const item = await prisma.item.create({
            data: {
                name: itemData.name,
                description: itemData.description,
                price: itemData.price,
                imagesUrl: `${itemData.name}.jpg`,
                retailerId: itemData.retailerId
            },
        });

        items.push(item);
    }

    return items;
}

async function createEvents(users: User[]) {
    const events = [];
    const eventTypes = ['Birthday Party', 'Wedding', 'Baby Shower', 'Graduation', 'Housewarming'];

    for (let i = 0; i < 5; i++) {
        const creatorIndex = i % users.length;
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + i * 10);

        const eventTime = new Date();
        eventTime.setHours(18 + i, 0, 0, 0);

        const event = await prisma.event.create({
            data: {
                title: `${users[creatorIndex]!.fname}'s ${eventTypes[i]}`,
                description: `Join us for ${users[creatorIndex]!.fname}'s ${eventTypes[i]}!`,
                location: `${users[creatorIndex]!.fname}'s place`,
                date: eventDate,
                time: eventTime,
                createdByUsername: users[creatorIndex]!.username,
            },
        });

        events.push(event);
    }

    return events;
}

async function createInvitations(users: User[], events: Event[]) {

    const invitations = [];
    for (const event of events) {
        const creator = users.find(user => user.username === event.createdByUsername);

        for (const user of users) {
            if (user.username !== creator!.username) {
                let status: StatusType;
                if (Math.random() > 0.3) {
                    status = StatusType.ACCEPTED;
                } else {
                    const isPending = Math.random() > 0.5;
                    status = isPending ? StatusType.PENDING : StatusType.ACCEPTED;
                }

                const repliedAt = status !== StatusType.PENDING ? new Date() : null;

                const invitation = await prisma.invitation.create({
                    data: {
                        guestUsername: user.username,
                        eventId: event.id,
                        status,
                        repliedAt,
                    },
                });

                invitations.push(invitation);
            }
        }
    }

    return invitations;
}

async function createEventArticles(events: Event[], items: Item[]) {

    const eventArticles = [];

    for (const event of events) {
        const numItems = 3 + Math.floor(Math.random() * 3);
        const selectedItems = getRandomItems(items, numItems);

        for (const item of selectedItems) {
            const priorities = [PriorityType.LOW, PriorityType.MEDIUM, PriorityType.HIGH];

            const eventArticle = await prisma.eventArticle.create({
                data: {
                    eventId: event.id,
                    itemId: item.id,
                    userNote: "text",
                    priority: priorities[Math.floor(Math.random() * priorities.length)],
                },
            });

            eventArticles.push(eventArticle);
        }
    }

    return eventArticles;
}

async function createMarks(users: User[], events: Event[], items: Item[]) {
    const marks = [];
    const markTypes = [MarkType.PURCHASED];

    for (const event of events) {
        const eventArticles = await prisma.eventArticle.findMany({

            where: { eventId: event.id },
        });

        const invitations = await prisma.invitation.findMany({
            where: { eventId: event.id, status: StatusType.ACCEPTED },
        });

        const invitedUsernames = invitations.map(inv => inv.guestUsername);
        const invitedUsers = users.filter(user => invitedUsernames.includes(user.username));

        for (const user of invitedUsers) {
            if (Math.random() > 0.5) {
                const randomItem = eventArticles[Math.floor(Math.random() * eventArticles.length)];
                const markType = markTypes[Math.floor(Math.random() * markTypes.length)] as MarkType;

                const mark = await prisma.mark.create({
                    data: {
                        markerUsername: user.username,
                        eventId: event.id,
                        articleId: randomItem!.itemId,
                        type: markType,
                    },
                });

                marks.push(mark);
            }
        }
    }

    return marks;
}

async function createContributions(users: User[], events: Event[], items: Item[]) {
    const contributions = [];

    for (const event of events) {
        const invitations = await prisma.invitation.findMany({
            where: { eventId: event.id, status: StatusType.ACCEPTED },
        });

        const invitedUsernames = invitations.map(inv => inv.guestUsername);
        const invitedUsers = users.filter(user => invitedUsernames.includes(user.username));

        const eventArticles = await prisma.eventArticle.findMany({
            where: { eventId: event.id },
            include: { item: true },
        });

        if (eventArticles.length === 0 || invitedUsers.length === 0) continue;

        const itemContributions: { [key: string]: { total: number; price: number } } = {};

        for (const eventArticle of eventArticles) {
            if (eventArticle.itemId) {
                itemContributions[eventArticle.itemId.toString()] = {
                    total: 0,
                    price: Number(
                        eventArticle.item ? 
                            eventArticle.item.price : 5 ) || 0
                };
            }
        }

        const existingContributions = await prisma.contribution.findMany({
            where: { eventId: event.id }
        });

        for (const contrib of existingContributions) {
            const itemIdStr = contrib.articleId?.toString();
            if (itemIdStr && itemIdStr in itemContributions) {
                itemContributions[itemIdStr]!.total += Number(contrib.cashAmount);
            }
        }

        for (const user of invitedUsers) {
            if (Math.random() > 0.6) {
                const randomEventArticle = eventArticles[Math.floor(Math.random() * eventArticles.length)];
                const itemId = randomEventArticle!.itemId;
                const itemPrice = Number(
                    randomEventArticle ?
                        (randomEventArticle.item ? 
                            randomEventArticle.item.price : 5) : 0);

                if (itemPrice > 0 && itemId) {
                    const percentContribution = 0.15 + (Math.random() * 0.35);
                    let amount = Math.round(itemPrice * percentContribution);

                    const currentTotal = itemContributions[itemId.toString()]?.total ?? 0;
                    if (currentTotal + amount > itemPrice) {
                        amount = itemPrice - currentTotal;
                    }

                    if (amount > 0) {
                        const contribution = await prisma.contribution.create({
                            data: {
                                contributorUsername: user.username,
                                eventId: event.id,
                                articleId: itemId,
                                cashAmount: amount,
                            },
                        });

                        if (itemContributions[itemId.toString()]) {
                            itemContributions[itemId.toString()]!.total += amount;
                        }

                        await prisma.mark.create({
                            data: {
                                markerUsername: user.username,
                                eventId: event.id,
                                articleId: itemId,
                                type: MarkType.PURCHASED,
                            },
                        });

                        contributions.push(contribution);
                    }
                }
            }
        }
    }

    return contributions;
}

async function createMedia(users: User[], events: Event[]) {
    const media = [];
    const mediaTypes = ['photo', 'video'];
    const fileTypes = ['image.jpeg', 'image.png', 'video.mp4'];

    for (const event of events) {
        const mediaCount = Math.floor(Math.random() * 10);

        for (let i = 0; i < mediaCount; i++) {
            const uploader = users[Math.floor(Math.random() * users.length)];
            const mediaType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)];
            const fileType = mediaType === 'photo'
                ? fileTypes[Math.floor(Math.random() * 2)]
                : fileTypes[2];
            const mediaItem = await prisma.media.create({
                data: {
                    uploaderUsername: uploader!.username,
                    eventId: event.id,
                    url: `media/${event.id}/${mediaType}-${i + 1}.${fileType}`,
                    caption: `${mediaType} from the event #${i + 1}`,
                    mediaType,
                    fileType,
                    fileSize: 1000000 + Math.floor(Math.random() * 5000000),
                },
            });

            media.push(mediaItem);
        }
    }

    return media;
}

async function createUserReports(users: User[]) {
    const reports = [];
    const reasons = ['Inappropriate behavior', 'Spam', 'Harassment', 'Other'];

    for (let i = 0; i < 3; i++) {
        const reportedUser = users[Math.floor(Math.random() * users.length)]!;
        let reportingUser: User;

        do {
            reportingUser = users[Math.floor(Math.random() * users.length)]!;
        } while (reportingUser.username === reportedUser.username);

        const reason = reasons[Math.floor(Math.random() * reasons.length)];

        const report = await prisma.userReport.create({
            data: {
                reportedUsername: reportedUser.username,
                reportedByUsername: reportingUser.username,
                reason,
                description: `User report for ${reason}`,
            },
        });

        reports.push(report);
    }

    return reports;
}

async function createEventReports(users: User[], events: Event[]) {
    const reports = [];
    const reasons = ['Inappropriate content', 'Spam event', 'Scam', 'Other'];

    for (let i = 0; i < 2; i++) {
        const reportedEvent = events[Math.floor(Math.random() * events.length)];
        const reportingUser = users[Math.floor(Math.random() * users.length)];
        const reason = reasons[Math.floor(Math.random() * reasons.length)];

        const report = await prisma.eventReport.create({
            data: {
                reportedByUsername: reportingUser!.username,
                reportedId: reportedEvent!.id,
                reason,
                description: `Event report for ${reason}`,
            },
        });

        reports.push(report);
    }

    return reports;
}

function getRandomItems<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
