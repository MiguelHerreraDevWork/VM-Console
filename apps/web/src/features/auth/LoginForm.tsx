'use client';

import { loginInputSchema } from '@repo/contracts';
import { CircleAlert, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useId, useRef, useState, type FormEvent } from 'react';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ApiClientError } from '../../lib/api-client';
import { safeNextPath } from '../../lib/safe-next';
import { useLogin } from './hooks';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const formErrorId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  // Tras un login correcto se mantiene el estado de carga hasta que llega el panel.
  const [redirecting, setRedirecting] = useState(false);
  const busy = login.isPending || redirecting;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = loginInputSchema.safeParse({ email, password });
    if (!parsed.success) {
      const next: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if ((key === 'email' || key === 'password') && !next[key]) {
          next[key] = issue.message;
        }
      }
      setFieldErrors(next);
      (next.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    try {
      await login.mutateAsync(parsed.data);
      setRedirecting(true);
      router.replace(safeNextPath(searchParams.get('next')));
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(
          err.code === 'RATE_LIMITED'
            ? 'Demasiados intentos. Espera un minuto antes de volver a probar.'
            : err.message,
        );
      } else {
        setFormError('No hay conexión con el servidor. Inténtalo de nuevo.');
      }
      passwordRef.current?.focus();
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5"
      aria-describedby={formError ? formErrorId : undefined}
      noValidate
    >
      <Input
        ref={emailRef}
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        spellCheck={false}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        required
      />
      <div className="relative">
        <Input
          ref={passwordRef}
          label="Contraseña"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          required
          className="pr-12"
        />
        <button
          type="button"
          className="absolute right-0.5 top-7 flex size-10 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted)] transition-colors hover:text-[var(--text)]"
          onClick={() => setShowPassword((v) => !v)}
          aria-pressed={showPassword}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPassword ? (
            <EyeOff aria-hidden className="size-5" />
          ) : (
            <Eye aria-hidden className="size-5" />
          )}
        </button>
      </div>
      {formError ? (
        <p
          id={formErrorId}
          role="alert"
          className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--danger)_40%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_8%,var(--surface))] px-3 py-2.5 text-sm font-medium text-[var(--danger)]"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {formError}
        </p>
      ) : null}
      <Button type="submit" loading={busy} className="mt-1 w-full">
        {busy ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  );
}
