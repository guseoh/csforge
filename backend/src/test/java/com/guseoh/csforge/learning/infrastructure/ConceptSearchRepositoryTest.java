package com.guseoh.csforge.learning.infrastructure;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.guseoh.csforge.learning.application.ConceptSearchCriteria;
import com.guseoh.csforge.learning.application.ConceptSearchItem;
import com.guseoh.csforge.learning.application.ConceptSort;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

/** ConceptSearchRepository가 LIKE 와일드카드 특수문자를 이스케이프하는지 검증한다. */
class ConceptSearchRepositoryTest {

    @Test
    @SuppressWarnings("unchecked")
    void escapesLikeWildcardsAndBackslashInSearchQuery() {
        EntityManager entityManager = mock(EntityManager.class);
        TypedQuery<ConceptSearchItem> dataQuery = mock(TypedQuery.class);
        TypedQuery<Long> countQuery = mock(TypedQuery.class);

        when(entityManager.createQuery(anyString(), eq(ConceptSearchItem.class))).thenReturn(dataQuery);
        when(entityManager.createQuery(anyString(), eq(Long.class))).thenReturn(countQuery);
        when(dataQuery.setParameter(anyString(), any())).thenReturn(dataQuery);
        when(dataQuery.setFirstResult(anyInt())).thenReturn(dataQuery);
        when(dataQuery.setMaxResults(anyInt())).thenReturn(dataQuery);
        when(dataQuery.getResultList()).thenReturn(List.of());
        when(countQuery.setParameter(anyString(), any())).thenReturn(countQuery);
        when(countQuery.getSingleResult()).thenReturn(0L);

        var repository = new ConceptSearchRepository(entityManager);
        repository.search(new ConceptSearchCriteria(
                null, null, null, null, null, "100%_a\\b", 0, 20, ConceptSort.CURRICULUM));

        ArgumentCaptor<String> jpqlCaptor = ArgumentCaptor.forClass(String.class);
        verify(entityManager).createQuery(jpqlCaptor.capture(), eq(ConceptSearchItem.class));
        assertTrue(jpqlCaptor.getValue().contains("escape '\\'"), jpqlCaptor.getValue());

        ArgumentCaptor<Object> paramCaptor = ArgumentCaptor.forClass(Object.class);
        verify(dataQuery).setParameter(eq("query"), paramCaptor.capture());
        assertEquals("%100\\%\\_a\\\\b%", paramCaptor.getValue());
    }
}
