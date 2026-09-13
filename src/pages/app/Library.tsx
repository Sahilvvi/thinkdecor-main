import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Download, Images, Plus, RefreshCw, Trash2 } from 'lucide-react';

import { SEO } from '@/components/shared/SEO';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BeforeAfterSlider } from '@/components/shared/BeforeAfterSlider';
import {
  type Generation, downloadImage, formatDate, isSetupError, useDeleteGeneration, useGenerations,
} from '@/lib/generation';
import { roomLabel, templateByKey } from '@/lib/templates';

function titleFor(g: Generation) {
  const style = templateByKey(g.template_key)?.label ?? 'Custom';
  const room = roomLabel(g.room_type);
  return room ? `${style} · ${room}` : style;
}

export default function Library() {
  const { data: generations, isLoading, error } = useGenerations();
  const deleteGeneration = useDeleteGeneration();
  const navigate = useNavigate();

  const [viewing, setViewing] = useState<Generation | null>(null);
  const [confirming, setConfirming] = useState<Generation | null>(null);

  const regenerate = (g: Generation) => {
    navigate('/app/create', {
      state: {
        inputUrl: g.input_image_url,
        templateKey: g.template_key,
        roomType: g.room_type,
        prompt: g.prompt,
      },
    });
  };

  const handleDelete = async () => {
    if (!confirming) return;
    try {
      await deleteGeneration.mutateAsync(confirming.id);
      toast.success('Design deleted');
      if (viewing?.id === confirming.id) setViewing(null);
    } catch {
      toast.error("Couldn't delete that design. Please try again.");
    } finally {
      setConfirming(null);
    }
  };

  return (
    <>
      <SEO title="Library | ThinkDecor" description="Every room you've redesigned." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[clamp(1.7rem,3vw,2.3rem)] font-bold tracking-[-0.025em] text-foreground">Library</h1>
          <p className="mt-1 text-[15px] text-foreground/55">
            {generations && generations.length > 0
              ? `${generations.length} ${generations.length === 1 ? 'design' : 'designs'} saved`
              : 'Every design you create is saved here.'}
          </p>
        </div>
        <Link
          to="/app/create"
          className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.03] sm:self-auto"
        >
          <Plus className="h-4 w-4" /> New design
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-[22px]" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] px-5 py-4 text-[14px] text-amber-800">
          {isSetupError(error)
            ? 'Your library switches on once the latest database update is applied.'
            : "We couldn't load your library. Refresh to try again."}
        </div>
      ) : !generations || generations.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-[22px] border border-dashed border-border px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Images className="h-5 w-5 text-primary" />
          </span>
          <p className="mt-4 text-[16px] font-semibold text-foreground">Your library is empty</p>
          <p className="mt-1 max-w-[40ch] text-[14px] text-foreground/55">
            Redesign a room and it will appear here, ready to compare, download or refine.
          </p>
          <Link
            to="/app/create"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Create a design
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {generations.map((g) => (
            <article key={g.id} className="group overflow-hidden rounded-[22px] border border-border/70 bg-card">
              <button
                type="button"
                onClick={() => setViewing(g)}
                className="block aspect-[4/3] w-full overflow-hidden bg-secondary"
                aria-label={`Open ${titleFor(g)}`}
              >
                <img
                  src={g.output_image_url ?? g.input_image_url}
                  alt={titleFor(g)}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-foreground">{titleFor(g)}</p>
                  <p className="text-[12.5px] text-foreground/50">{formatDate(g.created_at)}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <IconButton
                    label="Download"
                    onClick={() => g.output_image_url && downloadImage(g.output_image_url, `thinkdecor-${g.id.slice(0, 8)}.jpg`)}
                  >
                    <Download className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Regenerate" onClick={() => regenerate(g)}>
                    <RefreshCw className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Delete" onClick={() => setConfirming(g)} danger>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Detail view */}
      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-3xl">
          {viewing && (
            <>
              <DialogTitle>{titleFor(viewing)}</DialogTitle>
              <DialogDescription>
                Created {formatDate(viewing.created_at)} — drag to compare your photo with the redesign.
              </DialogDescription>
              <div className="overflow-hidden rounded-2xl border border-border/70">
                <BeforeAfterSlider
                  beforeSrc={viewing.input_image_url}
                  afterSrc={viewing.output_image_url ?? viewing.input_image_url}
                  beforeAlt="Your original photo"
                  afterAlt="The redesigned room"
                  aspectRatio="aspect-[4/3]"
                />
              </div>
              {viewing.prompt && (
                <p className="rounded-xl bg-secondary px-4 py-3 text-[13.5px] text-foreground/70">
                  <span className="font-semibold text-foreground">Your request: </span>
                  {viewing.prompt}
                </p>
              )}
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirming(viewing)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13.5px] font-medium text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
                <button
                  type="button"
                  onClick={() => regenerate(viewing)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13.5px] font-medium text-foreground hover:bg-secondary"
                >
                  <RefreshCw className="h-4 w-4" /> Regenerate
                </button>
                <button
                  type="button"
                  onClick={() =>
                    viewing.output_image_url &&
                    downloadImage(viewing.output_image_url, `thinkdecor-${viewing.id.slice(0, 8)}.jpg`)
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13.5px] font-semibold text-primary-foreground"
                >
                  <Download className="h-4 w-4" /> Download
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!confirming} onOpenChange={(open) => !open && setConfirming(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this design?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be removed from your library. This can't be undone, and the credit isn't refunded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function IconButton({
  label, onClick, children, danger,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 transition-colors ${
        danger ? 'text-foreground/50 hover:bg-destructive/10 hover:text-destructive' : 'text-foreground/50 hover:bg-secondary hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}
