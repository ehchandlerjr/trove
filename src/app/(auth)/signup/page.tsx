'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/db/client';
import { signUpSchema } from '@/lib/core/schemas';
import { validateForm, type FieldErrors } from '@/lib/utils/validation';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    // Validate with Zod schema
    const validation = validateForm(signUpSchema, { 
      email, 
      password, 
      displayName: displayName || undefined 
    });
    if (!validation.success) {
      setFieldErrors(validation.errors || {});
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email: validation.data!.email,
        password: validation.data!.password,
        options: {
          data: {
            display_name: validation.data!.displayName || email.split('@')[0],
          },
        },
      });

      if (authError) {
        // Prevent account enumeration - don't reveal if email exists
        // Supabase returns specific errors for existing accounts
        if (authError.message.toLowerCase().includes('already registered') || 
            authError.message.toLowerCase().includes('already exists')) {
          // Show success anyway to prevent enumeration
          setSuccess(true);
          return;
        }
        setError(authError.message);
        return;
      }

      // Check if email confirmation is required
      setSuccess(true);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <div className="w-14 h-14 bg-[var(--color-success-bg)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✉️</span>
          </div>
          <CardTitle className="text-2xl text-center font-display tracking-tight">
            Check your email
          </CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>. 
            Click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/login">
            <Button variant="ghost">Back to sign in</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center font-display tracking-tight">
          Create your account
        </CardTitle>
        <CardDescription className="text-center">
          Start creating and sharing wishlists
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-sm">
              {error}
            </div>
          )}
          
          <Input
            label="Name"
            type="text"
            name="displayName"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
            error={fieldErrors.displayName}
          />
          
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            error={fieldErrors.email}
          />
          
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            error={fieldErrors.password}
          />
          
          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="justify-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
