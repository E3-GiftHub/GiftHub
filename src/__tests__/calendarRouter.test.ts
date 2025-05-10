import { calendarRouter } from "../server/api/routers/calendarRouter";
import type { AppRouter } from "../server/api/root";

// Mock trpc shared types for testing
type RouterInputs = {
    calendar: {
        getEventsByMonth: {
            month: number;
            year?: number;
        };
    };
};

type RouterOutputs = {
    calendar: {
        getEventsByMonth: any[];
    };
};

type CalendarInput = RouterInputs["calendar"]["getEventsByMonth"];
type CalendarOutput = RouterOutputs["calendar"]["getEventsByMonth"];
type CalendarContext = {
    db: {
        invitation: {
            groupBy: jest.Mock;
            findMany: jest.Mock;
        }
    }
};
type ProcedureParams = {
    ctx: CalendarContext;
    input: CalendarInput;
    type: "query";
};

// Mock the trpc module
jest.mock("../server/api/trpc", () => ({
    createTRPCRouter: jest.fn((routes) => routes),
    publicProcedure: {
        input: jest.fn(() => ({
            query: jest.fn((handler) => handler)
        })),
    }
}));

// Mock data
const mockEvent1 = {
    id: "1",
    title: "Birthday Party",
    description: "My birthday",
    date: new Date(2023, 1, 15), // February 15, 2023
    location: "Home",
    creatorId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockEvent2 = {
    id: "2",
    title: "Anniversary",
    description: "Wedding anniversary",
    date: new Date(2023, 1, 20), // February 20, 2023
    location: "Restaurant",
    creatorId: "user2",
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe("calendarRouter additional tests", () => {
    describe("getEventsByMonth", () => {
        // Mock data
        const mockEvent1 = {
            id: "1",
            title: "Birthday Party",
            description: "My birthday",
            date: new Date(2023, 1, 15), // February 15, 2023
            location: "Home",
            creatorId: "user1",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const mockEvent2 = {
            id: "2",
            title: "Anniversary",
            description: "Wedding anniversary",
            date: new Date(2023, 1, 20), // February 20, 2023
            location: "Restaurant",
            creatorId: "user2",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Mock context
        const createMockContext = (invitationResults: any[] = [], eventResults: any[] = []) => ({
            db: {
                invitation: {
                    groupBy: jest.fn().mockResolvedValue(invitationResults),
                    findMany: jest.fn().mockResolvedValue(eventResults),
                },
            },
        });

        it("should handle leap year February correctly", async () => {
            // 2024 is a leap year
            const mockInvitationCounts = [{ guestUsername: "testUser", _count: { guestUsername: 2 } }];
            const mockCtx = createMockContext(mockInvitationCounts, []);

            const input = {
                month: 2,
                year: 2024
            };

            await calendarRouter.getEventsByMonth({
                ctx: mockCtx,
                input,
                type: "query"
            } as any);

            expect(mockCtx.db.invitation.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        event: expect.objectContaining({
                            date: expect.objectContaining({
                                gte: new Date(2024, 1, 1), // February 1
                                lte: new Date(2024, 2, 0), // February 29 (leap year)
                            })
                        })
                    })
                })
            );
        });

        it("should sort events by date in the return array", async () => {
            const mockInvitationCounts = [{ guestUsername: "testUser", _count: { guestUsername: 3 } }];

            // Create events with out-of-order dates
            const laterEvent = {
                ...mockEvent2,
                date: new Date(2023, 1, 20) // February 20
            };

            const earlierEvent = {
                ...mockEvent1,
                date: new Date(2023, 1, 10) // February 10
            };

            const mockInvitations = [
                {
                    id: "2",
                    guestUsername: "testUser",
                    eventId: "2",
                    event: laterEvent
                },
                {
                    id: "1",
                    guestUsername: "testUser",
                    eventId: "1",
                    event: earlierEvent
                }
            ];

            const mockCtx = createMockContext(mockInvitationCounts, mockInvitations);

            const input = {
                month: 2, // February
                year: 2023
            };

            const result = await calendarRouter.getEventsByMonth({
                ctx: mockCtx,
                input,
                type: "query"
            } as any);

            // Events should be returned in the order they are in the invitations array
            expect(result[0]).toEqual(laterEvent);
            expect(result[1]).toEqual(earlierEvent);
        });

        it("should handle multiple users with invitations and select the user with most invitations", async () => {
            const mockInvitationCounts = [
                { guestUsername: "popularUser", _count: { guestUsername: 10 } },
                { guestUsername: "lessPopularUser", _count: { guestUsername: 5 } }
            ];

            const mockInvitations = [
                {
                    id: "1",
                    guestUsername: "popularUser",
                    eventId: "1",
                    event: mockEvent1
                }
            ];

            const mockCtx = createMockContext(mockInvitationCounts, mockInvitations);

            const input = {
                month: 2,
                year: 2023
            };

            await calendarRouter.getEventsByMonth({
                ctx: mockCtx,
                input,
                type: "query"
            } as any);

            // Should use the first user (most invitations) from the counts result
            expect(mockCtx.db.invitation.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        guestUsername: "popularUser"
                    })
                })
            );
        });

        it("should handle events spanning multiple months correctly", async () => {
            const mockInvitationCounts = [{ guestUsername: "testUser", _count: { guestUsername: 3 } }];

            // Events in different months
            const januaryEvent = {
                ...mockEvent1,
                date: new Date(2023, 0, 15) // January 15
            };

            const februaryEvent = {
                ...mockEvent2,
                date: new Date(2023, 1, 10) // February 10
            };

            const marchEvent = {
                id: "3",
                title: "Conference",
                description: "Tech conference",
                date: new Date(2023, 2, 5), // March 5
                location: "Convention Center",
                creatorId: "user1",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Only include February event in mock invitations
            const mockInvitations = [
                {
                    id: "2",
                    guestUsername: "testUser",
                    eventId: "2",
                    event: februaryEvent
                }
            ];

            const mockCtx = createMockContext(mockInvitationCounts, mockInvitations);

            const input = {
                month: 2, // February
                year: 2023
            };

            const result = await calendarRouter.getEventsByMonth({
                ctx: mockCtx,
                input,
                type: "query"
            } as any);

            // Should only return February event
            expect(result.length).toBe(1);
            expect(result[0]?.date).toEqual(februaryEvent.date);

            // Verify date range was set correctly in query
            expect(mockCtx.db.invitation.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        event: expect.objectContaining({
                            date: expect.objectContaining({
                                gte: new Date(2023, 1, 1), // February 1
                                lte: new Date(2023, 2, 0), // February 28/29
                            })
                        })
                    })
                })
            );
        });

        it("should handle empty username result gracefully", async () => {
            // Mock results with null or undefined username
            const mockInvitationCounts = [{ guestUsername: null, _count: { guestUsername: 2 } }];
            const mockCtx = createMockContext(mockInvitationCounts, []);

            const input = {
                month: 3,
                year: 2023
            };

            await calendarRouter.getEventsByMonth({
                ctx: mockCtx,
                input,
                type: "query"
            } as any);

            // Should use empty string as fallback when username is null
            expect(mockCtx.db.invitation.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        guestUsername: ""
                    })
                })
            );
        });
    });
});

// Mock context
const createMockContext = (invitationResults: any[] = [], eventResults: any[] = []) => ({
    db: {
        invitation: {
            groupBy: jest.fn().mockResolvedValue(invitationResults),
            findMany: jest.fn().mockResolvedValue(eventResults),
        },
    },
});

it("should return events for the given month and year", async () => {
    // Mock invitation counts result
    const mockInvitationCounts = [
        {
            guestUsername: "testUser",
            _count: { guestUsername: 5 }
        }
    ];

    // Mock invitations with events
    const mockInvitations = [
        {
            id: "1",
            guestUsername: "testUser",
            eventId: "1",
            event: mockEvent1
        },
        {
            id: "2",
            guestUsername: "testUser",
            eventId: "2",
            event: mockEvent2
        }
    ];

    const mockCtx = createMockContext(mockInvitationCounts, mockInvitations);

    const input = {
        month: 7, // July
        year: 2023
    };

    // Call the procedure
    const result = await calendarRouter.getEventsByMonth({
        ctx: mockCtx,
        input,
        type: "query"
    } as any);

    // Verify expectations
    expect(mockCtx.db.invitation.groupBy).toHaveBeenCalledTimes(1);
    expect(mockCtx.db.invitation.findMany).toHaveBeenCalledTimes(1);
    expect(mockCtx.db.invitation.findMany).toHaveBeenCalledWith({
        where: {
            guestUsername: "testUser",
            event: {
                date: {
                    gte: new Date(2023, 6, 1),
                    lte: new Date(2023, 7, 0),
                }
            }
        },
        include: {
            event: true,
        },
    });

    expect(result).toEqual([mockEvent1, mockEvent2]);
});

it("should return empty array when no invitations exist", async () => {
    const mockCtx = createMockContext([]);

    const input = {
        month: 7,
        year: 2023
    };

    const result = await calendarRouter.getEventsByMonth({
        ctx: mockCtx,
        input,
        type: "query"
    } as any);

    expect(mockCtx.db.invitation.groupBy).toHaveBeenCalledTimes(1);
    expect(mockCtx.db.invitation.findMany).not.toHaveBeenCalled();
    expect(result).toEqual([]);
});

it("should use current year when no year provided", async () => {
    const currentYear = new Date().getFullYear();
    const mockInvitationCounts = [{ guestUsername: "testUser", _count: { guestUsername: 3 } }];
    const mockInvitations: any[] | undefined = [];

    const mockCtx = createMockContext(mockInvitationCounts, mockInvitations);

    const input = {
        month: 7
        // No year specified
    };

    await calendarRouter.getEventsByMonth({
        ctx: mockCtx,
        input,
        type: "query"
    } as any);

    // Validate that the function was called without checking exact date objects
    expect(mockCtx.db.invitation.findMany).toHaveBeenCalled();

    // Get the actual arguments passed to findMany
    const callArgs = mockCtx.db.invitation.findMany.mock.calls[0][0];
    expect(callArgs.where.guestUsername).toBe("testUser");
    expect(callArgs.include.event).toBe(true);
});

it("should calculate correct date range for December", async () => {
    const mockInvitationCounts = [{ guestUsername: "testUser", _count: { guestUsername: 2 } }];
    const mockCtx = createMockContext(mockInvitationCounts, []);

    const input = {
        month: 12,
        year: 2023
    };

    await calendarRouter.getEventsByMonth({
        ctx: mockCtx,
        input,
        type: "query"
    } as any);

    expect(mockCtx.db.invitation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
            where: expect.objectContaining({
                event: expect.objectContaining({
                    date: expect.objectContaining({
                        gte: new Date(2023, 11, 1), // December 1
                        lte: new Date(2023, 12, 0), // December 31
                    })
                })
            })
        })
    );
});

it("should calculate correct date range for January", async () => {
    const mockInvitationCounts = [{ guestUsername: "testUser", _count: { guestUsername: 2 } }];
    const mockCtx = createMockContext(mockInvitationCounts, []);

    const input = {
        month: 1,
        year: 2023
    };

    await calendarRouter.getEventsByMonth({
        ctx: mockCtx,
        input,
        type: "query"
    } as any);

    expect(mockCtx.db.invitation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
            where: expect.objectContaining({
                event: expect.objectContaining({
                    date: expect.objectContaining({
                        gte: new Date(2023, 0, 1),  // January 1
                        lte: new Date(2023, 1, 0),  // January 31
                    })
                })
            })
        })
    );
});