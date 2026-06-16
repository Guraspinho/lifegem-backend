import { PatientDataType } from "./patient-data.type";
import { PatientVitalsType } from "./patient-vitals.type";

// Used to parse the first AI response, which returns static data and vitals together.
export type PatientInitialInfoType = PatientDataType & PatientVitalsType;
