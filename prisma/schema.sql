CREATE TABLE "Users" (
   "email"          string PRIMARY KEY,
   "username"       string,
   "fname"          string,
   "lname"          string,
   "password"       string,
   "iban"           iban,
   "profilePicture" string,
   "createdAt"      datetime,
   "updatedAt"      datetime
);

CREATE TABLE "Events" (
   "id"          uuid PRIMARY KEY,
   "title"       string,
   "description" text,
   "date"        DATE,
   "time"        TIME,
   "location"    string,
   "wishlist"    boolean,
   "gallery"     boolean,
   "createdBy"   string,
   "createdAt"   datetime,
   "updatedAt"   datetime
);

CREATE TABLE "Invitations" (
   "id"         uuid PRIMARY KEY,
   "event"      uuid,
   "guestEmail" string,
   "status"     status,
   "invitedAt"  datetime,
   "replyedAt"  datetime
);

CREATE TABLE "Retailers" (
   "id"     uuid PRIMARY KEY,
   "name"   string,
   "apiUrl" string
);

CREATE TABLE "ItemCatalogue" (
   "id"          uuid PRIMARY KEY,
   "name"        string,
   "description" text,
   "imagesUrl"   string,
   "price"       DECIMAL,
   "retailerUrl" string,
   "retailerId"  uuid,
   "isCustom"    boolean,
   "createdAt"   datetime,
   "updatedAt"   datetime
);

CREATE TABLE "EventItems" (
   "eventId"           uuid,
   "itemId"            uuid,
   "quantityRequested" INT,
   "quantityFulfilled" INT,
   "priority"          status,
   "createdAt"         datetime,
   "updatedAt"         datetime,
   PRIMARY KEY ( "eventId",
                 "itemId" )
);

CREATE TABLE "Contributions" (
   "id"            uuid PRIMARY KEY,
   "eventId"       uuid,
   "itemId"        uuid,
   "contributor"   string,
   "contributedAt" datetime,
   "amount"        DECIMAL,
   "isFulfilled"   boolean
);

CREATE TABLE "Purchases" (
   "id"               uuid PRIMARY KEY,
   "eventId"          uuid,
   "itemId"           uuid,
   "purchaser"        string,
   "quantity"         INT,
   "timestamp"        datetime,
   "paymentReference" string
);

CREATE TABLE "MediaItems" (
   "id"         uuid PRIMARY KEY,
   "eventId"    uuid,
   "uploader"   string,
   "mediaType"  string,
   "url"        string,
   "caption"    text,
   "status"     status,
   "fileType"   string,
   "fileSize"   INT,
   "uploadedAt" datetime
);

CREATE TABLE "EventReports" (
   "id"            uuid PRIMARY KEY,
   "reportedEvent" uuid,
   "reportedBy"    string,
   "reason"        string,
   "description"   text,
   "reportedAt"    datetime
);

CREATE TABLE "UserReports" (
   "id"           uuid PRIMARY KEY,
   "reportedUser" string,
   "reportedBy"   string,
   "reason"       string,
   "description"  text,
   "reportedAt"   datetime
);

CREATE TABLE "MarkedItems" (
   "id"       uuid PRIMARY KEY,
   "marker"   string,
   "eventId"  uuid,
   "itemId"   uuid,
   "markType" string,
   "markedAt" datetime
);

COMMENT ON TABLE "EventItems" IS
   'Composite primary key on (eventId, itemId)';

COMMENT ON TABLE "Contributions" IS
   'References EventItems via (eventId, itemId)';

COMMENT ON TABLE "Purchases" IS
   'References EventItems via (eventId, itemId)';

COMMENT ON TABLE "MarkedItems" IS
   'Indicates a user has marked an item in the context of an event';

ALTER TABLE "Events"
   ADD FOREIGN KEY ( "createdBy" )
      REFERENCES "Users" ( "email" );

ALTER TABLE "Invitations"
   ADD FOREIGN KEY ( "event" )
      REFERENCES "Events" ( "id" );

ALTER TABLE "Invitations"
   ADD FOREIGN KEY ( "guestEmail" )
      REFERENCES "Users" ( "email" );

ALTER TABLE "ItemCatalogue"
   ADD FOREIGN KEY ( "retailerId" )
      REFERENCES "Retailers" ( "id" );

ALTER TABLE "EventItems"
   ADD FOREIGN KEY ( "eventId" )
      REFERENCES "Events" ( "id" );

ALTER TABLE "EventItems"
   ADD FOREIGN KEY ( "itemId" )
      REFERENCES "ItemCatalogue" ( "id" );

ALTER TABLE "Contributions"
   ADD FOREIGN KEY ( "eventId" )
      REFERENCES "Events" ( "id" );

ALTER TABLE "Contributions"
   ADD FOREIGN KEY ( "itemId" )
      REFERENCES "ItemCatalogue" ( "id" );

ALTER TABLE "Contributions"
   ADD FOREIGN KEY ( "contributor" )
      REFERENCES "Users" ( "email" );

ALTER TABLE "Purchases"
   ADD FOREIGN KEY ( "eventId" )
      REFERENCES "Events" ( "id" );

ALTER TABLE "Purchases"
   ADD FOREIGN KEY ( "itemId" )
      REFERENCES "ItemCatalogue" ( "id" );

ALTER TABLE "Purchases"
   ADD FOREIGN KEY ( "purchaser" )
      REFERENCES "Users" ( "email" );

ALTER TABLE "MediaItems"
   ADD FOREIGN KEY ( "eventId" )
      REFERENCES "Events" ( "id" );

ALTER TABLE "MediaItems"
   ADD FOREIGN KEY ( "uploader" )
      REFERENCES "Users" ( "email" );

ALTER TABLE "EventReports"
   ADD FOREIGN KEY ( "reportedEvent" )
      REFERENCES "Events" ( "id" );

ALTER TABLE "EventReports"
   ADD FOREIGN KEY ( "reportedBy" )
      REFERENCES "Users" ( "email" );

ALTER TABLE "UserReports"
   ADD FOREIGN KEY ( "reportedUser" )
      REFERENCES "Users" ( "email" );

ALTER TABLE "UserReports"
   ADD FOREIGN KEY ( "reportedBy" )
      REFERENCES "Users" ( "email" );

ALTER TABLE "MarkedItems"
   ADD FOREIGN KEY ( "marker" )
      REFERENCES "Users" ( "email" );

ALTER TABLE "MarkedItems"
   ADD FOREIGN KEY ( "eventId" )
      REFERENCES "Events" ( "id" );

ALTER TABLE "MarkedItems"
   ADD FOREIGN KEY ( "itemId" )
      REFERENCES "ItemCatalogue" ( "id" );

ALTER TABLE "Contributions"
   ADD FOREIGN KEY ( "itemId" )
      REFERENCES "Contributions" ( "id" );