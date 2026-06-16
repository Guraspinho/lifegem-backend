import { PatientDataType } from "./patient-data.type";
import { PatientVitalsType } from "./patient-vitals.type";

export type SessionHistoryEntryType = {
	userMessage: string | null;
	systemMessage: string;
	vitals: PatientVitalsType;
};

export type SessionHistoryType = {
	sessionHistory: SessionHistoryEntryType[];
	patient: PatientDataType;
	finalDiagnosis: string;
};
