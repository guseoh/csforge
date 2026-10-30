package com.guseoh.csforge.importcontent.application;

/** bootstrap batch 실행 결과를 변경 분류별로 집계한다. */
public record CanonicalBootstrapTotals(int created, int updated, int unchanged, int skipped, int errors, int failed) {
    public CanonicalBootstrapTotals add(ImportApplyResult result) {
        return new CanonicalBootstrapTotals(created + result.created(), updated + result.updated(), unchanged + result.unchanged(),
                skipped + result.skipped(), errors, failed);
    }

    public CanonicalBootstrapTotals withErrors(int additionalErrors) {
        return new CanonicalBootstrapTotals(created, updated, unchanged, skipped, errors + additionalErrors, failed);
    }

    public CanonicalBootstrapTotals withFailed() {
        return new CanonicalBootstrapTotals(created, updated, unchanged, skipped, errors, failed + 1);
    }
}
