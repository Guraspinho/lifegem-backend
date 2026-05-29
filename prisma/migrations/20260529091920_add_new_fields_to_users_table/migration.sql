-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "average_score" INTEGER,
ADD COLUMN     "completed_simulations" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "correct_diagnosis_rate" INTEGER,
ADD COLUMN     "survival_rate" INTEGER;
