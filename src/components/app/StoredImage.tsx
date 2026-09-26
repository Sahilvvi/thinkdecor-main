import type { ImgHTMLAttributes } from 'react';
import { BeforeAfterSlider } from '@/components/shared/BeforeAfterSlider';
import { useStoredImageUrl } from '@/lib/generation';
import { useGenerationProducts } from '@/lib/products';
import { cn } from '@/lib/utils';

type StoredImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  /** A bucket path from the private `generations` bucket, or any displayable URL. */
  src?: string | null;
};

/** <img> for room photos: signs private bucket paths on demand, with a placeholder while it does. */
export function StoredImage({ src, className, alt = '', ...rest }: StoredImageProps) {
  const url = useStoredImageUrl(src);
  if (!url) return <div className={cn('animate-pulse bg-secondary', className)} aria-hidden />;
  return <img src={url} alt={alt} className={className} {...rest} />;
}

/** Before/after slider for a stored photo and its redesign. */
export function StoredCompare({
  before,
  after,
  aspectRatio = 'aspect-[4/3]',
  generationId,
}: {
  before: string;
  after?: string | null;
  aspectRatio?: string;
  /** When given, shows a clickable "shop this" dot for any real product that
   *  was composited into this result and could be located in the image. */
  generationId?: string | null;
}) {
  const beforeUrl = useStoredImageUrl(before);
  const afterUrl = useStoredImageUrl(after ?? before);
  const { data: hotspots } = useGenerationProducts(generationId);

  if (!beforeUrl || !afterUrl) {
    return <div className={cn('w-full animate-pulse bg-secondary', aspectRatio)} aria-hidden />;
  }

  return (
    <BeforeAfterSlider
      beforeSrc={beforeUrl}
      afterSrc={afterUrl}
      beforeAlt="Your original photo"
      afterAlt="The redesigned room"
      aspectRatio={aspectRatio}
      hotspots={hotspots}
    />
  );
}
