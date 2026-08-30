package com.guseoh.csforge;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class CsforgeApplicationTest {

    @Test
    void applicationUsesExpectedPackageRoot() {
        assertEquals("com.guseoh.csforge", CsforgeApplication.class.getPackageName());
    }
}
