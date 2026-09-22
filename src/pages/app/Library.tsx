import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Download, Images, Plus, RefreshCw, Trash2 } from 'lucide-react';

import { SEO } from '@/components/shared/SEO';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { StoredCompare, StoredImage } from '@/components/app/StoredImage';
import { Reveal, Stagger, staggerItem } from '@/components/premium/Motion';
import { Tilt } from '@/components/motion/primitives';
import {
  type Generation, downloadStoredImage, formatDate, isSetupError, useDeleteGeneration, useGenerations,
} from '@/lib/generation';
import { roomLabel, templateByKey } from '@/lib/templates';

function titleFor(g: Generation) {
  const style = templateByKey(g.template_key)?.label ?? 'Custom';
  const room = roomLabel(g.room_type);
  return room ? `${style} · ${room}` : style;
}

function download(g: Generation) {
  if (g.output_image_url) downloadStoredImage(g.output_image_url, `thinkdecor-${g.id.slice(0, 8)}.jpg`);
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
        inputPath: g.input_image_url,
        templateKey: g.template_key,
        roomType: g.room_type,
        prompt: g.prompt,
      },
    });
  };

  const handleDelete = async () => {
    if (!confirming) return;
    try {
      await deleteGeneration.mutateAsync(confirming);
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
      <SEO title="Projects | ThinkDecor" description="Every room you've redesigned." />

      <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Projects
          </p>
          <h1 className="mt-2 text-[clamp(1.7rem,3vw,2.3rem)] font-bold tracking-[-0.025em] text-foreground">Projects</h1>
          <p className="mt-1 text-[15px] text-foreground/55">
            {generations && generations.length > 0
              ? `${generations.length} ${generations.length === 1 ? 'design' : 'designs'} saved`
              : 'Every design you create is saved here.'}
          </p>
        </div>
        <Link
          to="/app/create"
          className="group relative inline-flex items-center gap-2 self-start overflow-hidden rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.03] sm:self-auto"
        >
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.25),transparent)] transition-transform duration-700 group-hover:translate-x-full"
          />
          <Plus className="relative h-4 w-4" /> <span className="relative">New design</span>
        </Link>
      </Reveal>

      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-[22px]" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] px-5 py-4 text-[14px] text-amber-800">
          {isSetupError(error)
            ? 'Your projects switch on once the latest database update is applied.'
            : "We couldn't load your projects. Refresh to try again."}
        </div>
      ) : !generations || generations.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-[22px] border border-dashed border-border px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Images className="h-5 w-5 text-primary" />
          </span>
          <p className="mt-4 text-[16px] font-semibold text-foreground">No projects yet</p>
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
        <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" gap={0.05}>
          {generations.map((g) => (
            <motion.div key={g.id} variants={staggerItem}>
              <Tilt max={4} innerClassName="rounded-[22px]">
                <article className="group overflow-hidden rounded-[22px] border border-border/70 bg-card transition-all duration-300 hover:border-primary/25 hover:shadow-[0_20px_48px_-28px_hsl(168_30%_15%/0.4)]">
                  <button
                    type="button"
                    onClick={() => setViewing(g)}
                    className="relative block aspect-[4/3] w-full overflow-hidden bg-secondary"
                    aria-label={`Open ${titleFor(g)}`}
                  >
                    <StoredImage
                      src={g.output_image_url ?? g.input_image_url}
                      alt={titleFor(g)}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </button>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-foreground">{titleFor(g)}</p>
                      <p className="text-[12.5px] text-foreground/50">{formatDate(g.created_at)}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <IconButton label="Download" onClick={() => download(g)}>
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
              </Tilt>
            </motion.div>
          ))}
        </Stagger>
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
                <StoredCompare before={viewing.input_image_url} after={viewing.output_image_url} />
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
                  onClick={() => download(viewing)}
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
              It will be removed from your projects, along with its stored image. This can't be undone, and the
              credit isn't refunded.
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
