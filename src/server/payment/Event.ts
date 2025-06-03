import type { Event } from "@prisma/client";

export class EventEntity implements Event {
  id!: number;
  title!: string | null;
  description!: string | null;
  date!: Date | null;
  time!: Date | null;
  location!: string | null;
  pictureUrl!: string | null;
  token!: string | null;
  createdByUsername!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Event) {
    Object.assign(this, data);
  }
}
