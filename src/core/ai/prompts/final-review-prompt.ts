import { SessionHistoryType } from "../../../modules/chat/types/session-history.type";

export function generateFinalReviewPrompt(session: SessionHistoryType): string {
	const steps = session.sessionHistory
		.filter((entry) => entry.userMessage !== null)
		.map((entry, index) =>
			`
            Step ${index + 1}:
            Doctor said: "${entry.userMessage}"
            System response: "${entry.systemMessage}"
            Vitals at this point: HR ${entry.vitals.heartRate}, BP ${entry.vitals.bloodPressure}, SpO2 ${entry.vitals.spO2}, Pain ${entry.vitals.painLevel}/10, Status: ${entry.vitals.patientStatus}
            Accuracy score: ${entry.vitals.answerAccuracy}/100
            Feedback: ${entry.vitals.shortFeedback}
            `.trim(),
		)
		.join("\n\n");

	return `
        You are a senior medical educator reviewing a doctor trainee's performance in an emergency simulation.

        Patient: ${session.patient.patientName}, ${session.patient.patientAge} years old, ${session.patient.patientGender}, ${session.patient.weight}kg
        Known allergies: ${session.patient.knownAllergies}
        Condition: ${session.patient.condition}
        Trainee's final diagnosis: ${session.finalDiagnosis}

        Here is the full session step by step:

        ${steps}

        Review the session and respond with a SINGLE JSON object and nothing else.
        Use exactly this shape:

        {
            "overallPerformance": "<one short paragraph summarizing how the trainee performed overall, mentioning the final diagnosis and whether it was correct>",
            "whatWentWell": ["<specific decision the trainee got right>", "..."],
            "whatCouldBeImproved": ["<a mistake, missed step, or suboptimal decision and why it matters clinically>", "..."],
            "keyLearningPoints": ["<concise takeaway>", "..."],
            "finalScore": <number 0-100 based on accuracy, reasoning, and outcome>,
            "scoreJustification": "<one sentence justifying the score>",
            "diagnosis": {
                "correct": <true|false>,
                "actualCondition": "${session.patient.condition}",
                "traineeDiagnosis": "${session.finalDiagnosis}",
                "notes": "<one sentence on why the diagnosis is correct or what was wrong>"
            }
        }

        RULES:
        - Respond with valid JSON only. No markdown, no code fences, no text before or after the object.
        - Write the text fields in plain English, easy to read.
        - Be honest but constructive. Do not sugarcoat serious mistakes, but stay professional and educational.
        - "whatWentWell", "whatCouldBeImproved" and "keyLearningPoints" must be arrays of short strings. Use 2-4 items each. If nothing fits a category, use an empty array.
        - Reference specific steps by number when relevant (e.g. "In step 3...").
        - Do not use the less-than or greater-than characters; write "below"/"above" instead (e.g. "SpO2 below 90").
    `;
}
