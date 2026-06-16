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

        Write a structured review of this session. Use this exact structure and nothing else:

        OVERALL PERFORMANCE
        One short paragraph summarizing how the trainee performed overall. Mention the final diagnosis and whether it was correct.

        WHAT WENT WELL
        List the specific steps or decisions the trainee got right. Be concrete, reference what they actually said or did.

        WHAT COULD BE IMPROVED
        List the mistakes, missed steps, or suboptimal decisions. Explain why each matters clinically.

        KEY LEARNING POINTS
        2-4 concise takeaways the trainee should remember from this case.

        FINAL SCORE
        Give a score out of 100 based on overall accuracy, reasoning, and outcome. One sentence justification.

        DIAGNOSIS RESULT
        {
            "correct_diagnosis": <true|false>,
            "actual_condition": "${session.patient.condition}",
            "trainee_diagnosis": "${session.finalDiagnosis}",
            "diagnosis_notes": "<one sentence on why it is correct or what was wrong>"
        }

        RULES:
        - Write in plain English, easy to read.
        - Be honest but constructive. Do not sugarcoat serious mistakes.
        - Do not use dramatic language. Stay professional and educational.
        - Reference specific steps by number when relevant (e.g. "In step 3...").
        - Keep the total response under 500 words excluding the DIAGNOSIS RESULT block.
        - The DIAGNOSIS RESULT block must always be valid JSON, no extra text around it.
    `;
}