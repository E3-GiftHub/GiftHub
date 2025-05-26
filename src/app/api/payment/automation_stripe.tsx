
/*const userRecord = await prisma.user.findUnique({
    where: { username: data.createdBy },
    select: { email: true, id: true },
  });
  if (!userRecord) {
    throw new EventManagementException("Planner user not found");
  } // add verificare daca are deja cont stripe

  const account = await stripe.accounts.create({
    type: "express",
    country: "RO"                
    email: userRecord.email,
    metadata: { userId: userRecord.id },
    capabilities: {
      card_payments: { requested: true },
      transfers:     { requested: true },
    },
  });

  await prisma.user.update({
    where: { id: userRecord.id },
    data:  { stripeAccountId: account.id },
  });

//in this code:
async createEvent(data: {
  title: string;
  description: string;
  date: Date;
  time: Date;
  location: string;
  createdBy: string;
}): Promise<EventEntity> {
  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      date: data.date,
      time: data.time,
      createdBy: data.createdBy,
    },
  });

  return new EventEntity(event);
}
  */