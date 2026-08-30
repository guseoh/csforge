package com.guseoh.csforge.wrongnote.application;

import java.time.Clock;
import java.time.Instant;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.quiz.application.QuizCreatedResult;
import com.guseoh.csforge.quiz.application.QuizSessionCreator;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import com.guseoh.csforge.wrongnote.domain.WrongNoteRepository;

/**
 * 오답 원인 메모 저장과 한 문제 재시작 유스케이스를 처리한다.
 */
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
        wrongNoteRepository.save(note);
        return new WrongNoteNoteView(note.getCauseNote(), note.getUpdatedAt());
    }

    @Transactional
    public QuizCreatedResult retry(long questionId) {
        WrongNote note = wrongNoteRepository.findByQuestionId(questionId).orElseThrow(WrongNoteNotFoundException::new);
        return sessionCreator.create(java.util.List.of(note.getQuestion().getId()), Instant.now(clock), null, QuizSessionSource.WRONG_RETRY);
    }
}
