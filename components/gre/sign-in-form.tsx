"use client";

import { useActionState } from "react";
import { signIn } from "@/app/gre/actions";

export function SignInForm() {
  const [error, action, pending] = useActionState(signIn, null);

  return (
    <form
      action={action}
      className="gre-card flex w-full max-w-sm flex-col gap-4 p-6"
    >
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        Passphrase
        <input
          name="passphrase"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "sign-in-error" : undefined}
          className="h-10 border border-input bg-background px-3 text-foreground outline-none focus-visible:border-foreground"
        />
      </label>
      {error && (
        <p id="sign-in-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="gre-press h-10 bg-foreground font-medium text-background disabled:opacity-60"
      >
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
