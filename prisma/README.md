## documentation

- [first-design](https://dbdiagram.io/d/GiftHub-Schema-67f6f20b4f7afba184035ff9)
- [second-design](https://dbdiagram.io/d/Copy-of-GiftHub-Schema-68038bc91ca52373f5920a71)
- [edge-cases](https://docs.google.com/document/d/1BU4pX5BMg0XJOH3EJ8KfPbHHZ8MEFk5l5Ld9XdoG9gc/edit?tab=t.0)

## functionalities

- everyone can track:
  - the money invested for all items
  - the marks left for all items
  - the people involved in the event
- `direct contribution`:
  - these are treated as a unique item for every wishlist
  - received by Planner at `instant`
  - these transactions have a default message (e.g. Mircea transferred 50 bani for your event "x")
- `item contribution`:
  - each such contribution is stored in a buffer and then received by Planner at `fulfill`
  - the fulfilled item transactions must have a unique description (e.g. our contribution to the "red car" you wished for)
  - any money transmitted that has not been used for purchase will be sent as a `direct contribution` to the Planner at the event date
- money withdrawal recomputes the `EventItem::quantityFulfilled`
