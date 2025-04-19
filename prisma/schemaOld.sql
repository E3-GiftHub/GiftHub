/* fsp = fractional seconds precision
 * TEXT data type - holds up to 255 characters
 * MEMO data type - holds up to 65.536 characters
 */

CREATE TABLE Users (
   email          VARCHAR(128) PRIMARY KEY,
   username       VARCHAR(128),
   fname          VARCHAR(128),
   lname          VARCHAR(128),
   password       VARCHAR(128), /* with hash obviously */
   iban           VARCHAR(128),
   profilePicture VARCHAR(128),
   createdAt      DATETIME,
   updatedAt      DATETIME
);

CREATE TABLE Events (
   id          BIGINT PRIMARY KEY,
   title       VARCHAR(128),
   description MEMO,
   date        DATE,
   time        TIME,
   location    VARCHAR(128),
   wishlist    BOOLEAN,
   gallery     BOOLEAN,
   createdBy   VARCHAR(128),
   createdAt   DATETIME,
   updatedAt   DATETIME
);

CREATE TABLE Invitations (
   id         BIGINT PRIMARY KEY,
   event      BIGINT,
   guestEmail VARCHAR(128),
   status     status,
   invitedAt  DATETIME,
   replyedAt  DATETIME
);

CREATE TABLE Retailers (
   id     BIGINT PRIMARY KEY,
   name   VARCHAR(128),
   apiUrl VARCHAR(128)
);

CREATE TABLE ItemCatalogue (
   id          BIGINT PRIMARY KEY,
   name        VARCHAR(128),
   description MEMO,
   imagesUrl   VARCHAR(128),
   price       DECIMAL,
   retailerUrl VARCHAR(128),
   retailerId  BIGINT,
   isCustom    BOOLEAN,
   createdAt   DATETIME,
   updatedAt   DATETIME
);

CREATE TABLE EventItems (
   eventId           BIGINT,
   itemId            BIGINT,
   quantityRequested INT,
   quantityFulfilled INT,
   priority          status,
   createdAt         DATETIME,
   updatedAt         DATETIME,
   PRIMARY KEY ( eventId,
                 itemId )
);

CREATE TABLE Contributions (
   id            BIGINT PRIMARY KEY,
   eventId       BIGINT,
   itemId        BIGINT,
   contributor   VARCHAR(128),
   contributedAt DATETIME,
   amount        DECIMAL,
   isFulfilled   BOOLEAN
);

CREATE TABLE Purchases (
   id               BIGINT PRIMARY KEY,
   eventId          BIGINT,
   itemId           BIGINT,
   purchaser        VARCHAR(128),
   quantity         INT,
   timestamp        DATETIME,
   paymentReference VARCHAR(128)
);

CREATE TABLE MediaItems (
   id         BIGINT PRIMARY KEY,
   eventId    BIGINT,
   uploader   VARCHAR(128),
   mediaType  VARCHAR(128),
   url        VARCHAR(128),
   caption    MEMO,
   status     status,
   fileType   VARCHAR(128),
   fileSize   INT,
   uploadedAt DATETIME
);

CREATE TABLE EventReports (
   id            BIGINT PRIMARY KEY,
   reportedEvent BIGINT,
   reportedBy    VARCHAR(128),
   reason        VARCHAR(128),
   description   MEMO,
   reportedAt    DATETIME
);

CREATE TABLE UserReports (
   id           BIGINT PRIMARY KEY,
   reportedUser VARCHAR(128),
   reportedBy   VARCHAR(128),
   reason       VARCHAR(128),
   description  MEMO,
   reportedAt   DATETIME
);

CREATE TABLE MarkedItems (
   id       BIGINT PRIMARY KEY,
   marker   VARCHAR(128),
   eventId  BIGINT,
   itemId   BIGINT,
   markType VARCHAR(128),
   markedAt DATETIME
);

ALTER TABLE Events
   ADD FOREIGN KEY ( createdBy )
      REFERENCES Users ( email );

ALTER TABLE Invitations
   ADD FOREIGN KEY ( event )
      REFERENCES Events ( id );

ALTER TABLE Invitations
   ADD FOREIGN KEY ( guestEmail )
      REFERENCES Users ( email );

ALTER TABLE ItemCatalogue
   ADD FOREIGN KEY ( retailerId )
      REFERENCES Retailers ( id );

ALTER TABLE EventItems
   ADD FOREIGN KEY ( eventId )
      REFERENCES Events ( id );

ALTER TABLE EventItems
   ADD FOREIGN KEY ( itemId )
      REFERENCES ItemCatalogue ( id );

ALTER TABLE Contributions
   ADD FOREIGN KEY ( eventId )
      REFERENCES Events ( id );

ALTER TABLE Contributions
   ADD FOREIGN KEY ( itemId )
      REFERENCES ItemCatalogue ( id );

ALTER TABLE Contributions
   ADD FOREIGN KEY ( contributor )
      REFERENCES Users ( email );

ALTER TABLE Purchases
   ADD FOREIGN KEY ( eventId )
      REFERENCES Events ( id );

ALTER TABLE Purchases
   ADD FOREIGN KEY ( itemId )
      REFERENCES ItemCatalogue ( id );

ALTER TABLE Purchases
   ADD FOREIGN KEY ( purchaser )
      REFERENCES Users ( email );

ALTER TABLE MediaItems
   ADD FOREIGN KEY ( eventId )
      REFERENCES Events ( id );

ALTER TABLE MediaItems
   ADD FOREIGN KEY ( uploader )
      REFERENCES Users ( email );

ALTER TABLE EventReports
   ADD FOREIGN KEY ( reportedEvent )
      REFERENCES Events ( id );

ALTER TABLE EventReports
   ADD FOREIGN KEY ( reportedBy )
      REFERENCES Users ( email );

ALTER TABLE UserReports
   ADD FOREIGN KEY ( reportedUser )
      REFERENCES Users ( email );

ALTER TABLE UserReports
   ADD FOREIGN KEY ( reportedBy )
      REFERENCES Users ( email );

ALTER TABLE MarkedItems
   ADD FOREIGN KEY ( marker )
      REFERENCES Users ( email );

ALTER TABLE MarkedItems
   ADD FOREIGN KEY ( eventId )
      REFERENCES Events ( id );

ALTER TABLE MarkedItems
   ADD FOREIGN KEY ( itemId )
      REFERENCES ItemCatalogue ( id );

ALTER TABLE Contributions
   ADD FOREIGN KEY ( itemId )
      REFERENCES Contributions ( id );