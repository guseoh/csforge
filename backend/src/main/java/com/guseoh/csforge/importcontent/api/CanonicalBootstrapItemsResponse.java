package com.guseoh.csforge.importcontent.api;

/** canonical source의 종류별 item 수를 반환한다. */
public record CanonicalBootstrapItemsResponse(int topics, int concepts, int questions) {
}
