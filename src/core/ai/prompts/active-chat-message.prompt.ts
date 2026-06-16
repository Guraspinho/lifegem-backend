import { SessionHistoryType } from "../../../modules/chat/types/session-history.type";

export function generateActiveChatPrompt(
	session: SessionHistoryType,
	doctorMessage: string,
): string {
	const patient = session.patient;
	const { vitals } =
		session.sessionHistory[session.sessionHistory.length - 1];

	const recentHistory = session.sessionHistory
		.slice(-4) // 1 initial + last 3 exchanges
		.map((entry) =>
			entry.userMessage === null
				? `Simulation (initial): ${entry.systemMessage}`
				: `Doctor: ${entry.userMessage}\nSimulation: ${entry.systemMessage}`,
		)
		.join("\n");

	const historyText =
		recentHistory.length === 0
			? "No previous actions. This is the doctor's first response."
			: recentHistory;

	return `
        You are a medical simulation engine for doctor training.

        PATIENT SNAPSHOT:
        - Name: ${patient.patientName}, Age: ${patient.patientAge}, Gender: ${patient.patientGender}, Weight: ${patient.weight}kg
        - Condition: ${patient.condition}
        - Allergies: ${patient.knownAllergies}
        - Current vitals: HR ${vitals.heartRate}, BP ${vitals.bloodPressure}, SpO2 ${vitals.spO2}%, Pain ${vitals.painLevel}/10
        - Current status: ${vitals.patientStatus}

        RECENT HISTORY (last 3 exchanges):
        ${historyText}

        DOCTOR'S LATEST ACTION:
        "${doctorMessage}"

        YOUR JOB:
        Evaluate the doctor's action against the patient's current condition, vitals, and allergies.
        Update vitals realistically to reflect the outcome of the action.
        Write a short clinical narrator message describing what happened.

        ACCURACY SCORING:
        - 90-100: Correct, complete, no risks
        - 70-89: Correct but missing something minor
        - 40-69: Partially correct, some risk
        - 10-39: Mostly wrong, patient worsens
        - 0-9: Dangerous, harmful, or contraindicated

        VITAL CHANGE RULES:
        - Good action: HR trends toward 70-80, BP stabilizes, SpO2 improves, pain drops
        - Bad action: HR spikes, BP becomes unstable, SpO2 drops, pain increases
        - Change vitals gradually, not dramatically in one step
        - SpO2 must stay between 85 and 99
        - Pain can only drop by max 2 per turn unless a strong analgesic was explicitly given
        - BP systolic must stay between 70 and 190

        STATUS PROGRESSION RULES:
        - Status can only move one step per turn: stable -> deteriorating, deteriorating -> critical, critical -> deceased
        - Status can improve multiple steps if action was excellent: critical -> stable is allowed if score >= 90
        - Only set "deceased" if current status is already "critical" AND doctor's action scored below 20
        - If status is "deceased", set all vitals to 0 and shortFeedback must be cause of death in one sentence

        Respond in this exact format and nothing else:

        <message>
        [2-3 sentences. Clinical tone, like a nurse narrating what is happening in the room. Describe the patient's reaction and how the situation is evolving. If the action was wrong, describe mild to moderate deterioration. If deceased, describe the moment of death calmly (plus the patient's answer itself if the user asks him/her something).]
        </message>
        <vitals>
        {
            "heartRate": <number>,
            "bloodPressure": "<systolic/diastolic>",
            "spO2": <number>,
            "painLevel": <0-10>,
            "patientStatus": "<stable|improving|deteriorating|critical|deceased>",
            "answerAccuracy": <0-100>,
            "shortFeedback": "<one sentence explaining the score or cause of death>"
        }
        </vitals>
    `;
}
