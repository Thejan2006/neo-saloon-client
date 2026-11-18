CREATE TABLE "WelcomeMessage" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WelcomeMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WelcomeMessage_recipientId_key" ON "WelcomeMessage"("recipientId");
CREATE INDEX "WelcomeMessage_senderId_idx" ON "WelcomeMessage"("senderId");

ALTER TABLE "WelcomeMessage"
ADD CONSTRAINT "WelcomeMessage_recipientId_fkey"
FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WelcomeMessage"
ADD CONSTRAINT "WelcomeMessage_senderId_fkey"
FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
