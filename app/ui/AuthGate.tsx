

'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../../lib/supabase';

type Props = {
  children: React.ReactNode;
};

export default function AuthGate({ children }: Props) {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (mounted) setUserId(user?.id ?? null);

      supabase.auth.onAuthStateChange((_event, session) => {
        setUserId(session?.user?.id ?? null);
      });
    }
    init();

    return () => { mounted = false; };
  }, [supabase]);

  async function sendMagicLink() {
    if (!email) return;
    setStatus('sending');
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    if (error) {
      setStatus('error');
      setError(error.message);
    } else {
      setStatus('sent');
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUserId(null);
  }

  if (!userId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Log ind for at bruge appen</h2>
          <p className="text-sm text-zinc-600 mb-4">Vi sender et login-link til din e-mail.</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="din@email.dk"
              className="flex-1 rounded-md border px-3 py-2"
            />
            <button
              onClick={sendMagicLink}
              disabled={status === 'sending' || !email}
              className="rounded-md border px-4 py-2 hover:bg-zinc-50 disabled:opacity-60"
            >
              {status === 'sending' ? 'Sender…' : 'Send link'}
            </button>
          </div>
          {status === 'sent' && <p className="text-sm text-green-600 mt-3">Tjek din mail for login-linket.</p>}
          {status === 'error' && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute right-4 top-0">
        <button onClick={signOut} className="text-xs rounded-md border px-2 py-1 hover:bg-zinc-50">
          Log ud
        </button>
      </div>
      {children}
    </div>
  );
}