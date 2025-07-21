"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';

interface ImageCacheContextType {
    // Check if an image is cached
    isImageCached: (src: string) => boolean;
    // Get the cached image status
    getImageStatus: (src: string) => 'loading' | 'loaded' | 'error' | null;
    // Start loading an image and track its status
    preloadImage: (src: string) => void;
    // Mark an image as loaded in the cache
    setImageLoaded: (src: string) => void;
    // Mark an image as errored in the cache
    setImageError: (src: string) => void;
    // Get a list of all cached images with their statuses
    getCachedImages: () => Array<{ url: string; status: ImageStatus }>;
    // Subscribe to cache updates
    subscribe: (callback: () => void) => () => void;
    // Force a cache update notification
    forceUpdate: () => void;
}

// Create the context with a default value
const ImageCacheContext = createContext<ImageCacheContextType | undefined>(undefined);

// Cache for image statuses
type ImageStatus = 'loading' | 'loaded' | 'error';
type ImageCache = Map<string, ImageStatus>;

interface ImageCacheProviderProps {
    children: ReactNode;
    // Maximum cache size, default to 100 entries
    maxCacheSize?: number;
}

export const ImageCacheProvider: React.FC<ImageCacheProviderProps> = ({
    children,
    maxCacheSize = 100
}) => {
    // Use state to track the image cache
    const [imageCache, setImageCache] = useState<ImageCache>(() => {
        // Initialize with a new Map
        return new Map();
    });

    // Keep track of subscribers - use useRef to avoid unnecessary re-renders
    const subscribersRef = useRef<Array<() => void>>([]);

    // Memory cache for DOM images to prevent garbage collection
    const [preloadedImages, setPreloadedImages] = useState<Record<string, HTMLImageElement>>({});

    // Check if the image is in the cache and loaded
    const isImageCached = useCallback((src: string): boolean => {
        return imageCache.has(src) && imageCache.get(src) === 'loaded';
    }, [imageCache]);

    // Get the status of an image from the cache
    const getImageStatus = useCallback((src: string): ImageStatus | null => {
        return imageCache.has(src) ? imageCache.get(src)! : null;
    }, [imageCache]);

    // Preload an image and track its loading status
    const preloadImage = useCallback((src: string): void => {
        // Skip if already in cache with a status of 'loaded'
        if (imageCache.has(src) && imageCache.get(src) === 'loaded') {
            return;
        }

        // Skip if already loading
        if (imageCache.has(src) && imageCache.get(src) === 'loading') {
            return;
        }

        // Add to cache with 'loading' status
        setImageCache(prevCache => {
            const newCache = new Map(prevCache);
            newCache.set(src, 'loading');
            return newCache;
        });

        // Create an image element to preload
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setImageLoaded(src);

            // Store the image in memory to prevent garbage collection
            setPreloadedImages(prev => ({
                ...prev,
                [src]: img
            }));
        };

        img.onerror = () => {
            setImageError(src);
        };
    }, [imageCache]);

    // Mark image as loaded in the cache
    const setImageLoaded = useCallback((src: string): void => {
        setImageCache(prevCache => {
            const newCache = new Map(prevCache);
            newCache.set(src, 'loaded');
            return newCache;
        });

        // Notify subscribers
        subscribersRef.current.forEach(callback => callback());
    }, []);

    // Mark image as errored in the cache
    const setImageError = useCallback((src: string): void => {
        setImageCache(prevCache => {
            const newCache = new Map(prevCache);
            newCache.set(src, 'error');
            return newCache;
        });

        // Notify subscribers
        subscribersRef.current.forEach(callback => callback());
    }, []);

    // Subscribe to cache updates
    const subscribe = useCallback((callback: () => void) => {
        subscribersRef.current.push(callback);

        // Return unsubscribe function
        return () => {
            subscribersRef.current = subscribersRef.current.filter(cb => cb !== callback);
        };
    }, []);

    // Force update to all subscribers
    const forceUpdate = useCallback(() => {
        subscribersRef.current.forEach(callback => callback());
    }, []);

    // Get all cached images with their statuses
    const getCachedImages = useCallback((): Array<{ url: string; status: ImageStatus }> => {
        return Array.from(imageCache.entries()).map(([url, status]) => ({
            url,
            status
        }));
    }, [imageCache]);

    // Manage cache size - if it exceeds maxCacheSize, remove oldest entries
    useEffect(() => {
        if (imageCache.size > maxCacheSize) {
            setImageCache(prevCache => {
                const newCache = new Map(prevCache);
                // Remove oldest entries (first ones added)
                const entriesToRemove = imageCache.size - maxCacheSize;
                const keysToRemove = Array.from(newCache.keys()).slice(0, entriesToRemove);

                keysToRemove.forEach(key => {
                    newCache.delete(key);

                    // Also remove from preloaded images
                    setPreloadedImages(prev => {
                        const newPreloaded = { ...prev };
                        delete newPreloaded[key];
                        return newPreloaded;
                    });
                });

                return newCache;
            });
        }
    }, [imageCache.size, maxCacheSize]);

    // The value provided to consumers of this context
    const contextValue: ImageCacheContextType = {
        isImageCached,
        getImageStatus,
        preloadImage,
        setImageLoaded,
        setImageError,
        getCachedImages,
        subscribe,
        forceUpdate
    };

    return (
        <ImageCacheContext.Provider value={contextValue}>
            {children}
        </ImageCacheContext.Provider>
    );
};

// Custom hook to use the image cache context
export const useImageCache = (): ImageCacheContextType => {
    const context = useContext(ImageCacheContext);

    if (context === undefined) {
        throw new Error('useImageCache must be used within an ImageCacheProvider');
    }

    return context;
};