package com.guseoh.csforge.importcontent;

/** Canonical source inventory baseline shared by import and reference-regression tests. */
final class CanonicalInventory {
    static final int SOURCE_FILES = 875;
    static final int CONCEPTS = 726;
    static final int QUESTIONS = 2_540;
    static final int TOTAL_ITEMS = 134 + CONCEPTS + QUESTIONS;

    private CanonicalInventory() {}
}
