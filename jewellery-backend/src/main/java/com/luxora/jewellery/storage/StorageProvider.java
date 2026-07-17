package com.luxora.jewellery.storage;

import java.io.InputStream;

/**
 * Seam for a future media-storage integration (Cloudinary, MinIO, S3, ...).
 *
 * <p>Phase 1 does not need file uploads (products are seeded with placeholder
 * image URLs), so this is intentionally just an interface plus a no-op default
 * implementation. A later phase can add a real {@code @Component} (e.g.
 * {@code CloudinaryStorageProvider}) and mark it {@code @Primary} without
 * touching any calling code.
 */
public interface StorageProvider {

    /**
     * Uploads a file and returns a provider-specific storage key/path.
     */
    String uploadFile(String fileName, InputStream content, String contentType);

    /**
     * Deletes a previously uploaded file by its storage key/path.
     */
    void deleteFile(String storageKey);

    /**
     * Resolves a public, browsable URL for a previously uploaded file.
     */
    String getUrl(String storageKey);
}
