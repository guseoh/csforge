package com.guseoh.csforge.wrongnote.application;

import java.time.Clock;
import java.time.Instant;

import com.guseoh.csforge.quiz.application.QuizCreatedResult;
import com.guseoh.csforge.quiz.application.QuizSessionCreator;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.search.application.SearchChangeType;
import com.guseoh.csforge.search.application.SearchProjectionChangeRecorder;
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
    private final SearchProjectionChangeRecorder searchChangeRecorder;
    private final Clock clock;

    @Transactional
    public WrongNoteNoteView saveNote(long questionId, String content) {
        WrongNote note = wrongNoteRepository.findByQuestionId(questionId).orElseThrow(WrongNoteNotFoundException::new);
        note.replaceCauseNote(content);
        WrongNote saved = wrongNoteRepository.saveAndFlush(note);
        searchChangeRecorder.record(SearchChangeType.WRONG_NOTE, saved.getId());
        return new WrongNoteNoteView(saved.getCauseNote(), saved.getUpdatedAt());
    }

    @Transactional
    public QuizCreatedResult retry(long questionId) {
        WrongNote note = wrongNoteRepository.findByQuestionId(questionId).orElseThrow(WrongNoteNotFoundException::new);
        return sessionCreator.create(java.util.List.of(note.getQuestion().getId()), Instant.now(clock), null, QuizSessionSource.WRONG_RETRY);
    }
}
