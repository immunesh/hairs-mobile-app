'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import { RotateCcw, ZoomIn, ZoomOut, Play, Pause, Expand } from 'lucide-react';
import { ProductImage } from '@/types';
import { cn } from '@/lib/utils';

interface Product360ViewProps {
  images: ProductImage[];
  productName: string;
}

export default function Product360View({ images, productName }: Product360ViewProps) {
  const sortedImages = [...images].sort((a, b) => a.angle - b.angle);
  const length = sortedImages.length;

  // currentIndex is the frame index shown. We update it via RAF from a ref for smoothness.
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAutoPlayingRef = useRef(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const positionRef = useRef(0); // fractional frame position
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const lastPointerXRef = useRef<number | null>(null);
  const preloadedRef = useRef<Record<string, HTMLImageElement>>({});

  const goToIndex = useCallback((index: number) => {
    if (length === 0) return;
    const wrapped = ((Math.floor(index) % length) + length) % length;
    setCurrentIndex(wrapped);
    positionRef.current = index; // keep fractional position in sync
  }, [length]);

  // Auto-play uses RAF to advance smoothly
  const startAutoPlay = useCallback(() => {
    isAutoPlayingRef.current = true;
    setIsAutoPlaying(true);
  }, []);

  const stopAutoPlay = useCallback(() => {
    isAutoPlayingRef.current = false;
    setIsAutoPlaying(false);
  }, []);

  const toggleAutoPlay = () => {
    if (isAutoPlayingRef.current) stopAutoPlay();
    else startAutoPlay();
  };

  // Pointer-based dragging (mouse & touch unified)
  const onPointerDown = (e: React.PointerEvent) => {
    if (length === 0) return;
    const el = e.currentTarget as Element;
    (el as HTMLElement).setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    lastPointerXRef.current = e.clientX;
    isDraggingRef.current = true;
    setIsDragging(true);
    velocityRef.current = 0;
    stopAutoPlay();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || lastPointerXRef.current === null) return;
    const dx = e.clientX - lastPointerXRef.current;
    lastPointerXRef.current = e.clientX;
    // sensitivity: pixels per full rotation (8 frames) -> tune
    const pixelsPerRevolution = 240; // swipe 240px for one full cycle
    const framesPerRevolution = Math.max(1, length);
    const deltaFrames = (dx / pixelsPerRevolution) * framesPerRevolution;
    positionRef.current = positionRef.current - deltaFrames; // dragging right should go previous frame
    // small damping
    velocityRef.current = deltaFrames;
  };

  const endPointer = (e?: React.PointerEvent) => {
    if (pointerIdRef.current !== null && containerRef.current) {
      try { containerRef.current.releasePointerCapture(pointerIdRef.current); } catch {}
    }
    pointerIdRef.current = null;
    lastPointerXRef.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    // gentle inertia based on velocity
    // velocityRef.current retains last deltaFrames value
  };

  const currentImage = sortedImages[currentIndex];

  // Preload images once
  useEffect(() => {
    sortedImages.forEach((img) => {
      if (preloadedRef.current[img.url]) return;
      const i = new (globalThis as any).Image();
      i.src = img.url;
      i.onload = () => { preloadedRef.current[img.url] = i; };
    });
  }, [sortedImages]);

  // RAF loop to update frame based on positionRef, autoplay, and inertia
  useEffect(() => {
    const tick = () => {
      // autoplay advances position continuously
      if (isAutoPlayingRef.current && length > 0) {
        // rotate at ~6 frames per second
        positionRef.current = positionRef.current + 6 / 60; // 6 fps
      }

      // inertia damping when not dragging
      if (!isDraggingRef.current) {
        velocityRef.current *= 0.92;
        positionRef.current -= velocityRef.current * 0.5;
        if (Math.abs(velocityRef.current) < 0.001) velocityRef.current = 0;
      }

      // normalize position to keep it within range (avoid huge numbers)
      if (Math.abs(positionRef.current) > 1e6) positionRef.current = positionRef.current % length;

      // determine new index
      const newIndex = ((Math.floor(positionRef.current) % length) + length) % length;
      setCurrentIndex((prev) => (prev === newIndex ? prev : newIndex));

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [length]);

  if (!currentImage) return null;

  return (
    <div className={cn('relative', isFullscreen && 'fixed inset-0 z-50 bg-black')}>
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-hidden rounded-2xl bg-gray-50',
          // fixed height when not fullscreen to avoid layout shifts during frame swaps
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full h-[560px]',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onPointerLeave={endPointer}
        style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {/* Main image */}
        <div
          className="w-full h-full transition-transform duration-100 flex items-center justify-center bg-transparent"
          style={{ transform: `scale(${zoom})` }}
        >
          <NextImage
            src={currentImage.url}
            alt={productName}
            fill
            className="object-fill pointer-events-none"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
        {/* Note: angle labels and frame counters intentionally removed for professional UX */}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-3 px-1">
        <div className="flex-1" />

        {/* Zoom out */}
        <button
          onClick={() => setZoom(Math.max(1, zoom - 0.25))}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40"
          disabled={zoom <= 1}
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Zoom in */}
        <button
          onClick={() => setZoom(Math.min(3, zoom + 0.25))}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40"
          disabled={zoom >= 3}
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Auto-rotate */}
        <button
          onClick={toggleAutoPlay}
          className={cn(
            'p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium px-3',
            isAutoPlaying ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          )}
        >
          {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isAutoPlaying ? 'Stop' : 'Auto-rotate'}
        </button>

        {/* Reset */}
        {zoom !== 1 && (
          <button onClick={() => setZoom(1)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Fullscreen */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Expand className="w-4 h-4" />
        </button>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
        {sortedImages.map((img, i) => (
          <button
            key={img.id}
            onClick={() => goToIndex(i)}
            className={cn(
              'relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all',
              i === currentIndex ? 'border-brand-500 scale-105' : 'border-gray-200 hover:border-brand-300'
            )}
          >
            <NextImage src={img.url} alt={productName} fill className="object-cover" sizes="56px" draggable={false} onDragStart={(e) => e.preventDefault()} />
          </button>
        ))}
      </div>

      {/* Fullscreen close */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10"
        >
          ✕
        </button>
      )}
    </div>
  );
}
