package com.guseoh.csforge.learning.api;

import java.time.Instant;

public record PersonalNoteResponse(String content, Instant updatedAt) {
}
