package com.guseoh.csforge.quiz.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionAnswerRepository;
import com.guseoh.csforge.question.domain.QuestionChoice;
import com.guseoh.csforge.question.domain.QuestionChoiceRepository;
import com.guseoh.csforge.question.domain.QuestionConceptRepository;
import com.guseoh.csforge.quiz.domain.AttemptRepository;
import com.guseoh.csforge.quiz.domain.QuizQuestion;
import com.guseoh.csforge.quiz.domain.QuizQuestionRepository;
import com.guseoh.csforge.quiz.domain.QuizSession;
import com.guseoh.csforge.quiz.domain.QuizSessionRepository;

@ExtendWith(MockitoExtension.class)
class QuizSessionDataLoaderTest {

    @Mock
    QuizSessionRepository sessionRepository;

    @Mock
    QuizQuestionRepository quizQuestionRepository;

    @Mock
    AttemptRepository attemptRepository;

    @Mock
    QuestionChoiceRepository choiceRepository;

    @Mock
    QuestionAnswerRepository answerRepository;

    @Mock
    QuestionConceptRepository conceptRepository;

    @InjectMocks
    QuizSessionDataLoader dataLoader;

    @Mock
    QuizSession session;

    @Mock
    QuizQuestion quizQuestion;

    @Mock
    Question question;

    @Mock
    QuestionChoice choice;

    @Test
    void loadForResultLoadsChoicesForResultMapping() {
        long quizId = 10L;
        long questionId = 20L;
        List<Long> questionIds = List.of(questionId);

        when(sessionRepository.findById(quizId)).thenReturn(Optional.of(session));
        when(quizQuestionRepository.findByQuizSession_IdOrderByPositionAsc(quizId))
                .thenReturn(List.of(quizQuestion));
        when(quizQuestion.getQuestion()).thenReturn(question);
        when(question.getId()).thenReturn(questionId);
        when(attemptRepository.findByQuizSession_IdOrderByQuestion_IdAsc(quizId)).thenReturn(List.of());
        when(choiceRepository.findForQuestionIds(questionIds)).thenReturn(List.of(choice));
        when(choice.getQuestion()).thenReturn(question);
        when(answerRepository.findForQuestionIds(questionIds)).thenReturn(List.of());
        when(conceptRepository.findSummariesForQuestionIds(questionIds)).thenReturn(List.of());

        QuizSessionData data = dataLoader.loadForResult(quizId);

        assertEquals(List.of(choice), data.choicesByQuestionId().get(questionId));
        verify(choiceRepository).findForQuestionIds(questionIds);
    }
}
