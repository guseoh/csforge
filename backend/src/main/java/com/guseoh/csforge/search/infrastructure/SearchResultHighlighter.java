package com.guseoh.csforge.search.infrastructure;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** 검색 결과 제목과 본문 일부에 검색어 표시를 적용한다. */
final class SearchResultHighlighter {

    private static final int SNIPPET_LENGTH = 180;
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    String snippet(String summary, String body, List<String> queryTerms) {
        String source = hasMatch(summary, queryTerms)
                ? summary
                : hasMatch(body, queryTerms) ? body : firstNonBlank(summary, body);
        if (source == null) {
            return "";
        }
        String compact = compactAroundMatch(source, queryTerms, SNIPPET_LENGTH);
        return highlightAll(compact, queryTerms);
    }

    String highlightAll(String value, List<String> queryTerms) {
        if (value == null || value.isBlank() || queryTerms.isEmpty()) {
            return value == null ? "" : value;
        }
        Matcher matcher = pattern(queryTerms).matcher(value);
        StringBuilder highlighted = new StringBuilder();
        int end = 0;
        while (matcher.find()) {
            highlighted.append(value, end, matcher.start())
                    .append("[[H]]")
                    .append(value, matcher.start(), matcher.end())
                    .append("[[/H]]");
            end = matcher.end();
        }
        return end == 0 ? value : highlighted.append(value, end, value.length()).toString();
    }

    private static String compactAroundMatch(String value, List<String> queryTerms, int maxLength) {
        String compact = WHITESPACE.matcher(value).replaceAll(" ").trim();
        Matcher matcher = pattern(queryTerms).matcher(compact);
        if (!matcher.find() || compact.length() <= maxLength) {
            return compact;
        }
        int start = Math.max(0, matcher.start() - 60);
        int end = Math.min(compact.length(), start + maxLength);
        if (end - start < maxLength) {
            start = Math.max(0, end - maxLength);
        }
        return (start > 0 ? "..." : "")
                + compact.substring(start, end)
                + (end < compact.length() ? "..." : "");
    }

    private static boolean hasMatch(String value, List<String> queryTerms) {
        return value != null && !value.isBlank() && pattern(queryTerms).matcher(value).find();
    }

    private static Pattern pattern(List<String> queryTerms) {
        String alternatives = String.join("|", queryTerms.stream()
                .sorted((left, right) -> Integer.compare(right.length(), left.length()))
                .map(Pattern::quote)
                .toList());
        return Pattern.compile(alternatives, Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
    }

    private static String firstNonBlank(String first, String second) {
        return first != null && !first.isBlank() ? first : second;
    }
}
