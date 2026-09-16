package com.guseoh.csforge.quiz.infrastructure;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import java.util.Random;

import org.junit.jupiter.api.Test;

class QuestionSelectionRepositoryTest {

    @Test
    void randomSubsetShufflesCandidatesBeforeApplyingLimit() {
        Random alwaysZero = new Random() {
            @Override
            public int nextInt(int bound) {
                return 0;
            }
        };

        List<Long> selected = QuestionSelectionRepository.randomSubset(
                List.of(1L, 2L, 3L, 4L),
                2,
                alwaysZero);

        assertEquals(List.of(2L, 3L), selected);
    }

    @Test
    void randomSubsetKeepsStableOrderWhenEveryCandidateIsRequested() {
        List<Long> selected = QuestionSelectionRepository.randomSubset(
                List.of(1L, 2L, 3L),
                3,
                new Random(0L));

        assertEquals(List.of(1L, 2L, 3L), selected);
    }
}
