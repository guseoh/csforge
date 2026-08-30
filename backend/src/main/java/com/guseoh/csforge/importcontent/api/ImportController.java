package com.guseoh.csforge.importcontent.api;

import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.guseoh.csforge.importcontent.application.ContentImportApplyService;
import com.guseoh.csforge.importcontent.application.ContentImportPreviewService;
import com.guseoh.csforge.importcontent.application.ImportFilesCommand;
import com.guseoh.csforge.importcontent.application.ImportSourceFile;

/** 콘텐츠 import preview와 atomic apply HTTP endpoint를 제공한다. */
@RestController
@RequestMapping("/api/imports")
@RequiredArgsConstructor
public class ImportController {
    private final ContentImportPreviewService previewService;
    private final ContentImportApplyService applyService;
    private final ImportApiMapper mapper;

    @PostMapping(value = "/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImportPreviewResponse preview(@RequestPart("files") List<MultipartFile> files) {
        return mapper.toPreview(previewService.preview(command(files)));
    }

    @PostMapping(value = "/apply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImportApplyResponse apply(@RequestPart("files") List<MultipartFile> files, @RequestPart("previewDigest") String digest) {
        return mapper.toApply(applyService.apply(command(files), digest));
    }

    private static ImportFilesCommand command(List<MultipartFile> files) {
        try {
            java.util.ArrayList<ImportSourceFile> sources = new java.util.ArrayList<>();
            for (MultipartFile file : files) sources.add(new ImportSourceFile(file.getOriginalFilename(), file.getBytes()));
            return new ImportFilesCommand(sources);
        } catch (IOException exception) { throw new IllegalArgumentException("Import file could not be read", exception); }
    }
}
