package com.guseoh.csforge.learning;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.guseoh.csforge.learning.application.ConceptAssessmentStatus;
import com.guseoh.csforge.learning.application.ConceptUnderstandingPolicy;
import org.junit.jupiter.api.Test;

class ConceptUnderstandingPolicyTest {

    @Test
    void insufficientSampleCannotBeConsideredConsistent() {
        assertEquals(ConceptAssessmentStatus.NOT_ENOUGH_EVIDENCE, ConceptUnderstandingPolicy.classify(0, 0));
        assertEquals(ConceptAssessmentStatus.NOT_ENOUGH_EVIDENCE, ConceptUnderstandingPolicy.classify(2, 2));
    }

    @Test
    void classifiesConfidenceWithoutClaimingMastery() {
        assertEquals(ConceptAssessmentStatus.NEEDS_PRACTICE, ConceptUnderstandingPolicy.classify(10, 4));
        assertEquals(ConceptAssessmentStatus.DEVELOPING, ConceptUnderstandingPolicy.classify(10, 7));
        assertEquals(ConceptAssessmentStatus.CONSISTENT, ConceptUnderstandingPolicy.classify(10, 8));
    }
}
