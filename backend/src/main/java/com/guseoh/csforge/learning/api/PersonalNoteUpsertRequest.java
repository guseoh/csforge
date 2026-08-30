package com.guseoh.csforge.learning.api;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PersonalNoteUpsertRequest(
        @NotNull
        @Size(max = 100_000)
        String content) {
}
