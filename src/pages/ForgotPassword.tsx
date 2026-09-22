import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/brand/Logo';
import { SEO } from '@/components/shared/SEO';
import { Captcha } from '@/components/auth/Captcha';
import { useAuthStore } from '@/stores/authStore';
import { CAPTCHA_ENABLED } from '@/lib/captcha';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const { requestPasswordReset } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const address = email.trim();
    const { error } = await requestPasswordReset(address, captchaToken ?? undefined);
    setIsLoading(false);
    setCaptchaKey((k) => k + 1); // tokens are single-use

    if (error) {
      toast.error(error.message || "Couldn't send the reset email. Please try again.");
      return;
    }
    // Same confirmation whether or not an account exists, so this page can't
    // be used to discover who has signed up.
    setSentTo(address);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <SEO title="Reset your password | ThinkDecor" description="Reset your ThinkDecor password." />

      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="mb-8">
          <Logo size="lg" />
        </div>

        {sentTo ? (
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <MailCheck className="h-6 w-6 text-primary" />
            </span>
            <h1 className="mt-5 font-display text-[32px] font-normal tracking-[-0.01em]">Check your inbox</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              If an account exists for <span className="font-semibold text-foreground">{sentTo}</span>, we've sent a link
              to reset your password. It can take a minute to arrive — check spam too.
            </p>
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="mt-6 text-[14px] font-medium text-primary hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="mb-2 font-display text-[32px] font-normal tracking-[-0.01em]">Forgot your password?</h1>
              <p className="text-muted-foreground">Enter your email and we'll send you a link to set a new one.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Captcha onToken={setCaptchaToken} resetKey={captchaKey} />

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                size="lg"
                disabled={isLoading || (CAPTCHA_ENABLED && !captchaToken)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
