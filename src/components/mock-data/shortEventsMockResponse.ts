import type { ShortEventResponse } from "~/models/ShortEventResponse";

const shortEventsMockResponse: ShortEventResponse[] = [
  {
    id: 1,
    title: "Birthday party",
    location: "Iasi",
    date: "2025-05-12T14:30:00Z",
    description: "Birthday party for John Doe",
    photo:
      "https://www.vinmag.ro/media/catalog/product/cache/1/thumbnail/600x/17f82f742ffe127f42dca9de82fb58b1/c/h/champagne_moet_chardon_nectar_imperial_fata.jpg",
  },
  {
    id: 2,
    title: "Wedding",
    location: "Satu Mare",
    date: "2025-07-30T16:30:00Z",
    description: "Birthday party for John Doe",
    photo:
      "https://www.marthastewart.com/thmb/hAg8q5In1mESyV7u2lE8f0HJDE4=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/rochelle-nathan-wedding-confetti-0820-9e79ef88bced4d76b18d7822b7e77677.jpg",
  },
  {
    id: 3,
    title: "Graduation",
    location: "Galati",
    date: "2025-08-02T18:30:00Z",
    description: "Birthday party for John Doe",
    photo:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLcJzCI5rRlttWNZsvlkRNj6DI7po5BxANxA&s",
  },
];

export default shortEventsMockResponse;
