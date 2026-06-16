export type FinalReviewType = {
	overallPerformance: string;
	whatWentWell: string[];
	whatCouldBeImproved: string[];
	keyLearningPoints: string[];
	finalScore: number;
	scoreJustification: string;
	diagnosis: {
		correct: boolean;
		actualCondition: string;
		traineeDiagnosis: string;
		notes: string;
	};
};
