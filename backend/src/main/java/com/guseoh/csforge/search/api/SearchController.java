package com.guseoh.csforge.search.api;

import java.util.List;

import com.guseoh.csforge.search.application.SearchCriteria;
import com.guseoh.csforge.search.application.SearchDocumentType;
import com.guseoh.csforge.search.application.SearchQueryService;
import com.guseoh.csforge.search.application.SearchSort;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Search 조회/status/filter/suggestion HTTP 계약을 application use case에 연결한다. */
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchQueryService searchQueryService;

    @GetMapping
    public SearchPageResponse search(
            @RequestParam("q") String query,
            @RequestParam(name = "type", required = false) List<SearchDocumentType> types,
            @RequestParam(name = "area", required = false) List<String> areas,
            @RequestParam(name = "topic", required = false) List<String> topics,
            @RequestParam(name = "level", required = false) List<Integer> levels,
            @RequestParam(defaultValue = "RELEVANCE") SearchSort sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return SearchPageResponse.from(searchQueryService.search(new SearchCriteria(
                query, types, areas, topics, levels, sort, page, size)));
    }

    @GetMapping("/suggestions")
    public List<SearchSuggestionResponse> suggestions(
            @RequestParam("q") String query,
            @RequestParam(defaultValue = "8") int size) {
        return searchQueryService.suggest(query, size).stream().map(SearchSuggestionResponse::from).toList();
    }

    @GetMapping("/filter-options")
    public List<SearchAreaFilterResponse> filterOptions() {
        return searchQueryService.filterOptions().stream().map(SearchAreaFilterResponse::from).toList();
    }

    @GetMapping("/status")
    public SearchStatusResponse status() {
        return SearchStatusResponse.from(searchQueryService.status());
    }
}
