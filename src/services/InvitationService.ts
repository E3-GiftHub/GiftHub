import { db as prisma } from "~/server/db";
import { Status } from "@prisma/client";
import { InvitationEntity } from "./Invitation";
import { TRPCError } from "@trpc/server";

export class InvitationService {
  static async createInvitation(eventId: bigint, email: string) {
    const existingInvite = await prisma.invitation.findFirst({
      where: {
        eventId: Number(eventId),
        email,
      },
    });

    if (existingInvite) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invitation already exists for this email",
      });
    }

    const invitation = await prisma.invitation.create({
      data: {
        eventId: Number(eventId),
        email,
        status: "PENDING",
      },
    });

    return new InvitationEntity(invitation);
  }

  static async updateInvitationStatus(
    invitationId: bigint,
    status: Status
  ) {
    const invitation = await prisma.invitation.update({
      where: { id: Number(invitationId) },
      data: { status },
    });

    return new InvitationEntity(invitation);
  }

  static async getInvitation(invitationId: bigint) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: Number(invitationId) },
    });

    if (!invitation) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Invitation not found",
      });
    }

    return new InvitationEntity(invitation);
  }

  static async deleteInvitation(invitationId: bigint) {
    await prisma.invitation.delete({
      where: { id: Number(invitationId) },
    });
  }
}