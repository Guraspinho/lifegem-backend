import { SessionSpecialtyEnum } from "../../../modules/chat/enums/session-specialty.enum";

const NAMES = {
	male: [
		"James",
		"Carlos",
		"Luka",
		"Omar",
		"Finn",
		"Arjun",
		"Tom",
		"Reza",
		"Kwame",
		"Dmitri",
		"Noah",
		"Mateo",
		"Yusuf",
		"Henrik",
		"Tariq",
		"Soren",
		"Ivan",
		"Kenji",
		"Bashir",
		"Felix",
		"Adrian",
		"Tobias",
		"Mikael",
		"Dani",
		"Cyrus",
		"Emre",
		"Samir",
		"Leandro",
		"Cian",
		"Axel",
	],
	female: [
		"Maria",
		"Sofia",
		"Aisha",
		"Lin",
		"Nora",
		"Priya",
		"Elena",
		"Fatima",
		"Yuki",
		"Ingrid",
		"Amara",
		"Layla",
		"Hana",
		"Ines",
		"Zara",
		"Elif",
		"Mira",
		"Chiara",
		"Selin",
		"Rania",
		"Astrid",
		"Leila",
		"Mia",
		"Cleo",
		"Vera",
		"Niamh",
		"Soraya",
		"Giulia",
		"Maeve",
		"Dina",
	],
};

const CONDITIONS = {
	[SessionSpecialtyEnum.CARDIOLOGY]: [
		"Mild Atrial Fibrillation",
		"Hypertensive Episode",
		"Stable Angina",
		"Palpitations with Anxiety",
		"Early Heart Failure",
		"Sinus Tachycardia",
		"Mild Mitral Valve Regurgitation",
		"Orthostatic Hypotension",
		"Vasovagal Syncope",
		"Premature Ventricular Contractions",
	],
	[SessionSpecialtyEnum.TRAUMATOLOGY]: [
		"Closed Radius Fracture",
		"Ankle Sprain Grade II",
		"Minor Shoulder Dislocation",
		"Soft Tissue Knee Injury",
		"Closed Tibia Fracture",
		"Clavicle Fracture",
		"Finger Dislocation",
		"Rib Contusion",
		"Hamstring Tear Grade I",
		"Wrist Sprain",
		"Metatarsal Stress Fracture",
		"Hip Contusion",
	],
	[SessionSpecialtyEnum.EMERGENCY_MEDICINE]: [
		"Mild Allergic Reaction",
		"Controlled Diabetic Hypoglycemia",
		"Early Appendicitis",
		"Mild Asthma Exacerbation",
		"Urinary Tract Infection with Fever",
		"Acute Gastroenteritis",
		"Migraine with Aura",
		"Minor Head Contusion",
		"Hyperventilation Syndrome",
		"Mild Food Poisoning",
		"Kidney Stone Episode",
		"Panic Attack",
		"Cellulitis of the Lower Leg",
		"Viral Pharyngitis with High Fever",
	],
};

const BACKSTORIES = [
	"was at work when symptoms started",
	"was cooking at home",
	"was on a morning walk",
	"was at the gym",
	"was shopping at a market",
	"was sitting at a desk",
	"was playing with their children",
	"was at a restaurant",
	"was on public transport",
	"was at school",
	"was watching TV at home",
	"was cycling outdoors",
	"was attending a social event",
	"was swimming at a local pool",
	"was doing household chores",
	"was driving when they had to pull over",
	"was at a friend's house",
	"was hiking when symptoms appeared",
	"was waiting in a queue",
	"was waking up from sleep",
];

const ALLERGIES = [
	"none",
	"none",
	"none", // weighted so most patients have no allergies
	"Penicillin",
	"Aspirin",
	"Ibuprofen",
	"Sulfonamides",
	"Latex",
	"Codeine",
	"Contrast dye",
];

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function createPatientPrompt(sessionSpecialty: SessionSpecialtyEnum) {
	const gender = pick(["male", "female"] as const);
	const name = pick(NAMES[gender]);
	const age = Math.floor(Math.random() * 55) + 18; // 18-72
	const weight = Math.floor(Math.random() * 50) + 55; // 55-105kg
	const condition = pick(CONDITIONS[sessionSpecialty]);
	const backstory = pick(BACKSTORIES);
	const allergies = pick(ALLERGIES);

	return `
        You are a medical simulation engine for doctor training.

        Generate a realistic emergency patient with EXACTLY these details:
        - Name: ${name}
        - Age: ${age}
        - Gender: ${gender}
        - Weight: ${weight}kg
        - Condition: ${condition}
        - Backstory: patient ${backstory}
        - Known allergies: ${allergies}

        Do NOT change any of the above. Build the clinical picture around them.

        RULES:
        - heartRate must vary: anywhere between 60-115 depending on condition and pain level.
        - bloodPressure must vary: systolic 110-155, diastolic 65-95.
        - spO2 must vary: between 93-99, do not always use the same number.
        - painLevel must vary: between 4 and 7, do not always use the same number.
        - patientStatus must be "stable" or "deteriorating" only.
        - Vitals must match the condition realistically but stay mildly abnormal, not life-threatening.
        - Do not repeat the same vital values across patients.
        - Message tone: calm and clinical, like a nurse briefing a doctor. No drama.

        Respond in this exact format and nothing else:

        <message>
        [2-4 sentences describing the patient, how they arrived, and their main complaint.]
        </message>
        <vitals>
        {
            "patientName": "${name}",
            "patientAge": ${age},
            "patientGender": "${gender}",
            "weight": ${weight},
            "knownAllergies": "${allergies}",
            "condition": "${condition}",
            "heartRate": <number>,
            "bloodPressure": "<systolic/diastolic>",
            "spO2": <number between 92-99>,
            "painLevel": <4-7>,
            "patientStatus": "<stable|deteriorating>",
            "answerAccuracy": 0,
            "shortFeedback": "Patient just arrived. Awaiting doctor's first action."
        }
        </vitals>
    `;
}
