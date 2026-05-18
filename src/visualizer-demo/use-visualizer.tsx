"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { TextureRenderer } from "@viz2d/core";

// ----------------------
// Types
// ----------------------

export type TextureInfo = {
  id: number;
  name: number;
  rotation: number;
  scale: number;
  offset_x: number;
  offset_y: number;
};

export type SegmentWithTexture = {
  segment_id: number;
  class_name: string;
  mask: Uint32Array;
  area: number;
  masked_image: string;
  texture?: TextureInfo;
};

type ImageSize = { width: number; height: number };

function createMaskedImage(
  mask: Uint32Array,
  pixels: Uint8Array,
  width: number,
  height: number,
  maxWidth: number = 250,
  maxHeight: number = 250,
  borderWidth = 4
): string {
  const size = width * height;
  const data = new Uint8ClampedArray(pixels);
  const maskMap = new Uint8Array(size);
  for (let i = 0; i < mask.length; i++) {
    maskMap[mask[i]] = 1;
  }

  for (let i = 0; i < size; i++) {
    if (!maskMap[i]) {
      const idx = i * 4;
      data[idx] = data[idx] * 0.35;
      data[idx + 1] = data[idx + 1] * 0.35;
      data[idx + 2] = data[idx + 2] * 0.35;
    }
  }

  const bw = borderWidth;
  for (let k = 0; k < mask.length; k++) {
    const i = mask[k];
    const x = i % width;
    const y = (i / width) | 0;
    const isEdge =
      (x > 0 && !maskMap[i - 1]) ||
      (x < width - 1 && !maskMap[i + 1]) ||
      (y > 0 && !maskMap[i - width]) ||
      (y < height - 1 && !maskMap[i + width]);
    if (!isEdge) continue;
    for (let dy = -bw; dy <= bw; dy++) {
      const ny = y + dy;
      if (ny < 0 || ny >= height) continue;
      const row = ny * width;
      for (let dx = -bw; dx <= bw; dx++) {
        const nx = x + dx;
        if (nx < 0 || nx >= width) continue;
        const bi = row + nx;
        const idx = bi * 4;
        data[idx] = 0;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      }
    }
  }

  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext("2d");
  if (!srcCtx) throw new Error("Failed to get canvas context");
  srcCtx.putImageData(new ImageData(data, width, height), 0, 0);

  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  const outW = Math.round(width * scale);
  const outH = Math.round(height * scale);

  const outCanvas = document.createElement("canvas");
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) throw new Error("Failed to get canvas context");
  outCtx.imageSmoothingEnabled = true;
  outCtx.drawImage(srcCanvas, 0, 0, outW, outH);

  return outCanvas.toDataURL("image/png");
}

function mapTexture(t: any): TextureInfo {
  return {
    id: t.id,
    name: t.name,
    rotation: t.rotation,
    scale: t.scale,
    offset_x: t.offset_x,
    offset_y: t.offset_y,
  };
}

export function useVisualizer() {
  const rendererRef = useRef<TextureRenderer>(new TextureRenderer());
  const renderer = rendererRef.current;

  const [bundleLoaded, setBundleLoaded] = useState(false);
  const [isBundleLoading, setIsBundleLoading] = useState(false);
  const [isTextureLoading, setIsTextureLoading] = useState(false);

  const [segments, setSegments] = useState<SegmentWithTexture[]>([]);

  const sortedSegments = useMemo(() => {
    return [...segments].sort((a, b) => {
      if (a.texture && !b.texture) return -1;
      if (!a.texture && b.texture) return 1;
      return b.area - a.area;
    });
  }, [segments]);

  const [segMap, setSegMap] = useState<Int32Array | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);

  const [hoverSeg, setHoverSeg] = useState<number | null>(null);
  const [imageVersion, setImageVersion] = useState(0);

  const loadFile = useCallback(async (file: File) => {
    setIsBundleLoading(true);
    try {
      await renderer.load(new Uint8Array(await file.arrayBuffer()));
      const rawSegs = renderer.get_segments() as any[];
      const out = renderer.get_output();
      const segs: SegmentWithTexture[] = rawSegs.map((s) => ({
        segment_id: s.segment_id,
        class_name: s.class_name,
        mask: s.mask,
        area: s.mask.length,
        masked_image: createMaskedImage(s.mask, out.pixels, out.width, out.height),
        texture: undefined,
      }));
      setSegments(segs);
      const map = new Int32Array(out.width * out.height).fill(-1);
      for (const s of segs) {
        for (const idx of s.mask) map[idx] = s.segment_id;
      }
      setSegMap(map);
      setImageSize({ width: out.width, height: out.height });
      setBundleLoaded(true);
      setImageVersion((v) => v + 1);
    } finally {
      setIsBundleLoading(false);
    }
  }, [renderer]);

  const applyTextureToSegment = useCallback(
    async (segmentId: number, file: File, scale = 1) => {
      const seg = segments.find((s) => s.segment_id === segmentId);
      if (!seg) return;
      setIsTextureLoading(true);
      try {
        const t_id = await renderer.apply_texture(
          seg.mask,
          new Uint8Array(await file.arrayBuffer()),
          { name: 1, rotation: 0, scale, offset_x: 0, offset_y: 0 }
        );
        setSegments((prev) =>
          prev.map((s) =>
            s.segment_id === segmentId
              ? { ...s, texture: { id: t_id, name: 1, rotation: 0, scale, offset_x: 0, offset_y: 0 } }
              : s
          )
        );
        setImageVersion((v) => v + 1);
      } finally {
        setIsTextureLoading(false);
        setHoverSeg(null);
      }
    },
    [segments, renderer]
  );

  const updateSegmentTexture = useCallback(
    async (segmentId: number, patch: Partial<TextureInfo>) => {
      const seg = segments.find((s) => s.segment_id === segmentId);
      if (!seg?.texture) return;
      setIsTextureLoading(true);
      try {
        await renderer.update_texture(seg.texture.id, patch as any);
        const raw = (renderer.get_textures() as any[]).find((t) => t.id === seg.texture!.id);
        if (!raw) return;
        const updated = mapTexture(raw);
        setSegments((prev) =>
          prev.map((s) => (s.segment_id === segmentId ? { ...s, texture: updated } : s))
        );
        setImageVersion((v) => v + 1);
      } finally {
        setIsTextureLoading(false);
      }
    },
    [segments, renderer]
  );

  const removeSegmentTexture = useCallback(
    async (segmentId: number) => {
      const seg = segments.find((s) => s.segment_id === segmentId);
      if (!seg?.texture) return;
      setIsTextureLoading(true);
      try {
        await renderer.remove_texture(seg.texture.id);
        setSegments((prev) =>
          prev.map((s) => (s.segment_id === segmentId ? { ...s, texture: undefined } : s))
        );
        setImageVersion((v) => v + 1);
      } finally {
        setIsTextureLoading(false);
      }
    },
    [segments, renderer]
  );

  const drawToCanvas = useCallback(
    (canvas: HTMLCanvasElement, highlightSeg?: number | null) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const out = renderer.get_output();
      const { width, height, pixels } = out;
      const img = new ImageData(new Uint8ClampedArray(pixels), width, height);
      if (highlightSeg != null) {
        const seg = segments.find((s) => s.segment_id === highlightSeg);
        if (seg) {
          for (const i of seg.mask) {
            const idx = i * 4;
            img.data[idx] *= 0.6;
            img.data[idx + 1] = Math.min(255, img.data[idx + 1] * 0.5 + 120);
            img.data[idx + 2] *= 0.6;
          }
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.putImageData(img, 0, 0);
    },
    [renderer, segments]
  );

  const downloadRenderedImage = useCallback((canvas: HTMLCanvasElement) => {
    const url = canvas.toDataURL();
    const a = document.createElement("a");
    a.href = url;
    a.download = "download.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return {
    bundleLoaded,
    isBundleLoading,
    isTextureLoading,
    segments: sortedSegments,
    imageSize,
    segMap,
    hoverSeg,
    setHoverSeg,
    loadFile,
    applyTextureToSegment,
    updateSegmentTexture,
    removeSegmentTexture,
    drawToCanvas,
    downloadRenderedImage,
    imageVersion,
  };
}
