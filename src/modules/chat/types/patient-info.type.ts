import { PatientDataType } from "./patient-data.type";
import { PatientVitalsType } from "./patient-vitals.type";

export type PatientInitialInfoType = PatientDataType & PatientVitalsType;
