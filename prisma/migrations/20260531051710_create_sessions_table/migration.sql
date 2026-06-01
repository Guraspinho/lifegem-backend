-- CreateEnum
CREATE TYPE "Specialty" AS ENUM ('TRAUMATOLOGY', 'CARDIOLOGY', 'EMERGENCY_MEDICINE');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateTable
CREATE TABLE "Sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "specialty" "Specialty" NOT NULL,
    "patient_problem" TEXT NOT NULL,
    "score" INTEGER,
    "patient_survived" BOOLEAN,
    "correct_diagnosis" BOOLEAN,
    "duration_seconds" INTEGER,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "final_diagnosis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sessions_user_id_idx" ON "Sessions"("user_id");

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
