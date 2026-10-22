package com.guseoh.csforge.learning.api;

import java.util.List;

import com.guseoh.csforge.learning.application.BookmarkCategoryService;
import com.guseoh.csforge.learning.application.BookmarkCategoryView;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 개인 북마크 분류와 Concept 연결을 HTTP 계약으로 제공한다. */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookmarkCategoryController {

    private final BookmarkCategoryService service;

    @GetMapping("/bookmark-categories")
    public List<CategoryResponse> list() {
        return service.listCategories().stream().map(CategoryResponse::from).toList();
    }

    @PatchMapping("/bookmark-categories/{id}")
    public CategoryResponse rename(@PathVariable long id, @Valid @RequestBody RenameRequest request) {
        return CategoryResponse.from(service.rename(id, request.name()));
    }

    @GetMapping("/concepts/{conceptId}/bookmark-category")
    public AssignmentResponse getAssignment(@PathVariable long conceptId) {
        return new AssignmentResponse(service.getCategoryId(conceptId));
    }

    @PutMapping("/concepts/{conceptId}/bookmark-category")
    public AssignmentResponse assign(@PathVariable long conceptId, @RequestBody AssignRequest request) {
        return new AssignmentResponse(service.assign(conceptId, request.categoryId()));
    }

    public record CategoryResponse(long id, String name, int displayOrder) {
        static CategoryResponse from(BookmarkCategoryView view) {
            return new CategoryResponse(view.id(), view.name(), view.displayOrder());
        }
    }

    public record RenameRequest(@NotBlank @Size(max = 60) String name) {
    }

    public record AssignRequest(Long categoryId) {
    }

    public record AssignmentResponse(Long categoryId) {
    }
}
