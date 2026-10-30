package com.guseoh.csforge.importcontent.infrastructure;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.List;

import com.guseoh.csforge.importcontent.application.CanonicalContentFile;
import com.guseoh.csforge.importcontent.application.CanonicalContentSource;
import com.guseoh.csforge.importcontent.application.CanonicalContentSourceException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/** jar와 bootRun classpath에 공통으로 들어간 canonical manifest를 읽는다. */
@Component
public class ClasspathCanonicalContentSource implements CanonicalContentSource {
    private static final String ROOT = "canonical-content/";
    private static final String MANIFEST = ROOT + "manifest.txt";

    @Override
    public List<CanonicalContentFile> load() {
        List<String> paths = readManifest();
        validateManifest(paths);
        return paths.stream().map(this::readFile).toList();
    }

    private List<String> readManifest() {
        try (InputStream input = new ClassPathResource(MANIFEST).getInputStream()) {
            return new String(input.readAllBytes(), StandardCharsets.UTF_8).lines()
                    .map(String::trim)
                    .filter(path -> !path.isBlank())
                    .toList();
        } catch (IOException exception) {
            throw new CanonicalContentSourceException("Canonical content manifest is not packaged", exception);
        }
    }

    private void validateManifest(List<String> paths) {
        if (paths.isEmpty()) throw new CanonicalContentSourceException("Canonical content manifest is empty");
        if (!paths.equals(paths.stream().sorted().toList())) {
            throw new CanonicalContentSourceException("Canonical content manifest is not sorted");
        }
        if (paths.size() != new HashSet<>(paths).size()) {
            throw new CanonicalContentSourceException("Canonical content manifest contains duplicate paths");
        }
    }

    private CanonicalContentFile readFile(String path) {
        ClassPathResource resource = new ClassPathResource(ROOT + path);
        try (InputStream input = resource.getInputStream()) {
            return new CanonicalContentFile(path, input.readAllBytes());
        } catch (IOException exception) {
            throw new CanonicalContentSourceException("Canonical content file is missing: " + path, exception);
        }
    }
}
