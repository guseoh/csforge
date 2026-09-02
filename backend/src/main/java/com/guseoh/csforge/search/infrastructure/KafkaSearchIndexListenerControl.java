package com.guseoh.csforge.search.infrastructure;

import java.time.Duration;

import com.guseoh.csforge.search.application.SearchIndexListenerControl;
import com.guseoh.csforge.search.application.SearchUnavailableException;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.kafka.config.KafkaListenerEndpointRegistry;
import org.springframework.kafka.listener.MessageListenerContainer;
import org.springframework.stereotype.Component;

/** alias cutover 직전에 Search Kafka listener가 실제 pause될 때까지 기다리고 이후 재개한다. */
@Component
public class KafkaSearchIndexListenerControl implements SearchIndexListenerControl {

    private static final Duration PAUSE_TIMEOUT = Duration.ofSeconds(5);
    private static final long POLL_INTERVAL_MILLIS = 25;

    private final ObjectProvider<KafkaListenerEndpointRegistry> registryProvider;

    public KafkaSearchIndexListenerControl(ObjectProvider<KafkaListenerEndpointRegistry> registryProvider) {
        this.registryProvider = registryProvider;
    }

    @Override
    public boolean pauseAndAwait() {
        MessageListenerContainer container = listenerContainer();
        if (container == null || !container.isRunning()) return false;
        boolean ownedPause = !container.isPauseRequested();
        if (ownedPause) container.pause();
        long deadline = System.nanoTime() + PAUSE_TIMEOUT.toNanos();
        while (!container.isContainerPaused()) {
            if (!container.isRunning()) return ownedPause;
            if (System.nanoTime() >= deadline) {
                throw new SearchUnavailableException("Timed out while pausing Search Kafka listener");
            }
            sleepBriefly();
        }
        return ownedPause;
    }

    @Override
    public void resume() {
        MessageListenerContainer container = listenerContainer();
        if (container != null && container.isPauseRequested()) container.resume();
    }

    private MessageListenerContainer listenerContainer() {
        KafkaListenerEndpointRegistry registry = registryProvider.getIfAvailable();
        return registry == null ? null : registry.getListenerContainer(SearchIndexEventListener.LISTENER_ID);
    }

    private static void sleepBriefly() {
        try {
            Thread.sleep(POLL_INTERVAL_MILLIS);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new SearchUnavailableException("Interrupted while pausing Search Kafka listener", exception);
        }
    }
}
