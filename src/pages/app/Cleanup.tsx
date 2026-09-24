import { SEO } from '@/components/shared/SEO';
import { MaskEditFlow } from '@/components/app/MaskEditFlow';

export default function Cleanup() {
  return (
    <>
      <SEO title="Cleanup | Think Decor" description="Paint over anything in a room photo and Mantha AI erases it cleanly." />
      <MaskEditFlow
        mode="cleanup"
        kicker="Cleanup"
        title="Cleanup"
        description="Paint over anything you want gone — a cable, a stray box, an old poster — and Mantha erases it, filling the space back in naturally."
        generatingLabel="Cleaning up…"
      />
    </>
  );
}
