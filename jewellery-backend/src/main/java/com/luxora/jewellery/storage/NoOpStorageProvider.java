package com.luxora.jewellery.storage;

import org.springframework.stereotype.Component;

import java.io.InputStream;

/**
 * Default {@link StorageProvider} used until a real media-storage integration
 * (e.g. Cloudinary/MinIO) is wired up in a future phase. Phase 1 has no file
 * upload endpoints, so this component only exists as a seam; every method
 * throws if actually invoked.
 */
@Component
public class NoOpStorageProvider implements StorageProvider {

    @Override
    public String uploadFile(String fileName, InputStream content, String contentType) {
        throw new UnsupportedOperationException(
                "File storage is not implemented in Phase 1. Configure a real StorageProvider (e.g. Cloudinary/MinIO) in a future phase.");
    }

    @Override
    public void deleteFile(String storageKey) {
        throw new UnsupportedOperationException(
                "File storage is not implemented in Phase 1. Configure a real StorageProvider (e.g. Cloudinary/MinIO) in a future phase.");
    }

    @Override
    public String getUrl(String storageKey) {
        throw new UnsupportedOperationException(
                "File storage is not implemented in Phase 1. Configure a real StorageProvider (e.g. Cloudinary/MinIO) in a future phase.");
    }
}
