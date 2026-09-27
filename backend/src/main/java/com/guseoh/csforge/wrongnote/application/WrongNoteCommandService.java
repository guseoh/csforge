package com.guseoh.csforge.wrongnote.application;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.guseoh.csforge.quiz.application.QuizCreatedResult;
import com.guseoh.csforge.quiz.application.QuizCreationIdentity;
import com.guseoh.csforge.quiz.application.QuizSessionCreator;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import com.guseoh.csforge.wrongnote.domain.WrongNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 오답 원인 메모 저장과 한 문제 재시작 유스케이스를 처리한다. */
@Service
@RequiredArgsConstructor
public class WrongNoteCommandService {

    private final WrongNoteRepository wrongNoteRepository;
    private final QuizSessionCreator sessionCreator;
    private final Clock clock;

    @Transactional
    public WrongNoteNoteView saveNote(long questionId, String content) {
        WrongNote note = wrongNoteRepository.findByQuestionId(questionId).orElseThrow(WrongNoteNotFoundException::new);
        note.replaceCauseNote(content);
        WrongNote saved = wrongNoteRepository.saveAndFlush(note);
        return new WrongNoteNoteView(saved.getCauseNote(), saved.getUpdatedAt());
    }

    @Transactional
    public QuizCreatedResult retry(long questionId) {
        return retry(questionId, null);
    }

    @Transactional
    public QuizCreatedResult retry(long questionId, UUID requestId) {
        QuizCreationIdentity creationIdentity = QuizCreationIdentity.forRequest(
                requestId,
                "wrong-note-retry",
                Long.toString(questionId));
        var existing = sessionCreator.findExisting(creationIdentity);
        if (existing.isPresent()) return existing.orElseThrow();

        WrongNote note = wrongNoteRepository.findByQuestionId(questionId).orElseThrow(WrongNoteNotFoundException::new);
        return sessionCreator.create(
                List.of(note.getQuestion().getId()),
                Instant.now(clock),
                null,
                QuizSessionSource.WRONG_RETRY,
                creationIdentity);
    }
}
