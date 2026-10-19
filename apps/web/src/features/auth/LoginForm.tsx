'use client';

import { loginInputSchema } from '@repo/contracts';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = loginInputSchema.safeParse({ email, password });
    if (!parsed.success) {
      const next: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === 'email' || key === 'password') {
          next[key] = issue.message;
        }
      }
      setFieldErrors(next);
      // Errores de campo junto al input; el alert general queda para fallos de API.
      return;
    }

    try {
      await login.mutateAsync(parsed.data);
      const next = safeNextPath(searchParams.get('next'));
      router.replace(next);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError('No se pudo iniciar sesión');
      }
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
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        required
      />
      <div className="relative">
        <Input
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
          className="absolute bottom-0 right-1 flex size-11 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--text)]"
          onClick={() => setShowPassword((v) => !v)}
          aria-pressed={showPassword}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
      {formError ? (
        <p id={formErrorId} role="alert" className="text-sm text-[var(--danger)]">
          {formError}
        </p>
      ) : null}
      <Button type="submit" disabled={login.isPending} className="w-full">
        {login.isPending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  );
}
