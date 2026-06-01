-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('CHAT', 'ACTION', 'DIAGNOSIS');

-- CreateEnum
CREATE TYPE "AuthorType" AS ENUM ('USER', 'PATIENT');

-- CreateTable
CREATE TABLE "Messages" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "message_type" "MessageType" NOT NULL,
    "author_type" "AuthorType" NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Messages_session_id_idx" ON "Messages"("session_id");

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
