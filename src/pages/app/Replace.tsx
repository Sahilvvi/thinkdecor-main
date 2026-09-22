import { SEO } from '@/components/shared/SEO';
import { MaskEditFlow } from '@/components/app/MaskEditFlow';

export default function Replace() {
  return (
    <>
      <SEO title="Replace | ThinkDecor" description="Paint over an object in a room photo and tell Mantha AI what to put there instead." />
      <MaskEditFlow
        mode="replace"
        kicker="Replace"
        title="Replace"
        description="Paint over one thing in the room and describe what should take its place — a different sofa, a new rug, anything."
        promptLabel="What should go there instead? (optional)"
        promptPlaceholder="e.g. a round wooden coffee table"
        generatingLabel="Replacing…"
      />
    </>
  );
}
