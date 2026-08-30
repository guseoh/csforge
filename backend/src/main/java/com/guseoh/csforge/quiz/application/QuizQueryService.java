package com.guseoh.csforge.quiz.application;

import java.util.Optional;

import com.guseoh.csforge.quiz.api.QuizActiveResponse;
import com.guseoh.csforge.quiz.api.QuizResultResponse;
import com.guseoh.csforge.quiz.api.QuizSessionResponse;
import com.guseoh.csforge.quiz.domain.QuizSessionRepository;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuizQueryService {

    private final QuizSessionRepository sessionRepository;
    private final QuizSessionDataLoader dataLoader;
    private final QuizResponseAssembler responseAssembler;
    public QuizQueryService(
            QuizSessionRepository sessionRepository,
            QuizSessionDataLoader dataLoader,
            QuizResponseAssembler responseAssembler) {
        this.sessionRepository = sessionRepository;
        this.dataLoader = dataLoader;
        this.responseAssembler = responseAssembler;
    }

    @Transactional(readOnly = true)
    public Optional<QuizActiveResponse> active() {
        return sessionRepository.findFirstByStatusOrderByStartedAtDescIdDesc(QuizSessionStatus.IN_PROGRESS)
                .map(session -> responseAssembler.toActiveResponse(dataLoader.load(session.getId())));
    }

    @Transactional(readOnly = true)
    public QuizSessionResponse session(long quizId) {
        return responseAssembler.toSessionResponse(dataLoader.load(quizId));
    }

    @Transactional(readOnly = true)
    public QuizResultResponse result(long quizId) {
        return responseAssembler.toResultResponse(dataLoader.load(quizId));
    }
}
