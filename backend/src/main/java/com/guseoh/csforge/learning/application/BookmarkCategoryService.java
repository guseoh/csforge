package com.guseoh.csforge.learning.application;

import java.util.List;

import com.guseoh.csforge.learning.domain.BookmarkCategory;
import com.guseoh.csforge.learning.domain.BookmarkCategoryAssignment;
import com.guseoh.csforge.learning.domain.BookmarkCategoryAssignmentRepository;
import com.guseoh.csforge.learning.domain.BookmarkCategoryRepository;
import com.guseoh.csforge.learning.domain.ConceptProgress;
import com.guseoh.csforge.learning.domain.ConceptProgressRepository;
import com.guseoh.csforge.learning.domain.ConceptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 개인 북마크의 단일 분류 선택과 이름 변경을 처리한다. */
@Service
@RequiredArgsConstructor
public class BookmarkCategoryService {

    private final BookmarkCategoryRepository categories;
    private final BookmarkCategoryAssignmentRepository assignments;
    private final ConceptRepository concepts;
    private final ConceptProgressRepository progressRepository;

    @Transactional(readOnly = true)
    public List<BookmarkCategoryView> listCategories() {
        return categories.findAllByOrderByDisplayOrderAscIdAsc().stream().map(this::view).toList();
    }

    @Transactional(readOnly = true)
    public Long getCategoryId(long conceptId) {
        ensurePublished(conceptId);
        return assignments.findById(conceptId)
                .map(assignment -> assignment.getCategory().getId()).orElse(null);
    }

    @Transactional
    public BookmarkCategoryView rename(long categoryId, String newName) {
        BookmarkCategory category = findCategory(categoryId);
        if (newName == null || newName.isBlank() || newName.strip().length() > 60) {
            throw new LearningBadRequestException("Category name must contain 1 to 60 characters");
        }
        String normalized = newName.strip();
        if (categories.existsByNameAndIdNot(normalized, categoryId)) {
            throw new LearningBadRequestException("Category name already exists");
        }
        category.rename(normalized);
        categories.flush();
        return view(category);
    }

    @Transactional
    public Long assign(long conceptId, Long categoryId) {
        ensurePublished(conceptId);
        ConceptProgress progress = progressRepository.findForUpdate(conceptId)
                .orElseThrow(() -> new LearningBadRequestException("Bookmark the concept before classifying it"));
        if (!progress.isBookmarked()) {
            throw new LearningBadRequestException("Bookmark the concept before classifying it");
        }
        if (categoryId == null) {
            assignments.findById(conceptId).ifPresent(assignments::delete);
            assignments.flush();
            return null;
        }
        BookmarkCategory category = findCategory(categoryId);
        BookmarkCategoryAssignment assignment = assignments.findById(conceptId)
                .orElseGet(() -> BookmarkCategoryAssignment.assign(conceptId, category));
        assignment.moveTo(category);
        assignments.saveAndFlush(assignment);
        return category.getId();
    }

    private void ensurePublished(long conceptId) {
        if (conceptId <= 0 || concepts.findPublishedById(conceptId).isEmpty()) {
            throw new LearningNotFoundException("Published concept not found: " + conceptId);
        }
    }

    private BookmarkCategory findCategory(long id) {
        return categories.findById(id)
                .orElseThrow(() -> new LearningNotFoundException("Bookmark category not found: " + id));
    }

    private BookmarkCategoryView view(BookmarkCategory category) {
        return new BookmarkCategoryView(category.getId(), category.getName(), category.getDisplayOrder());
    }
}
