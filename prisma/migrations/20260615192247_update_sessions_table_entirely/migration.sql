/*
  Warnings:

  - You are about to drop the column `patient_problem` on the `Sessions` table. All the data in the column will be lost.
  - You are about to drop the `Messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_session_id_fkey";

-- AlterTable
ALTER TABLE "Sessions" DROP COLUMN "patient_problem",
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "history" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "known_allergies" TEXT,
ADD COLUMN     "patient_age" INTEGER,
ADD COLUMN     "patient_gender" TEXT,
ADD COLUMN     "patient_name" TEXT,
ADD COLUMN     "patient_weight" INTEGER;

-- DropTable
DROP TABLE "Messages";

-- DropEnum
DROP TYPE "AuthorType";

-- DropEnum
DROP TYPE "MessageType";
