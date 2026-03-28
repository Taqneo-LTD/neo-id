"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, Link2, Loader2, X } from "lucide-react";

/* ------------------------------------------------------------------
 * FormField — Label + children + optional error/description wrapper
 * ----------------------------------------------------------------*/

export function FormField({
  label,
  htmlFor,
  error,
  description,
  children,
  className,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  error?: string | null;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {!error && description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
 * PrefixInput — Input with a left-side text/element addon
 * ----------------------------------------------------------------*/

export function PrefixInput({
  addon,
  addonClassName,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "prefix"> & {
  addon: React.ReactNode;
  addonClassName?: string;
}) {
  return (
    <div className="flex items-center gap-0">
      <div
        className={cn(
          "flex h-9 shrink-0 items-center rounded-l-md border border-r-0 border-input bg-muted px-2 text-xs text-muted-foreground",
          addonClassName,
        )}
      >
        {addon}
      </div>
      <Input className={cn("rounded-l-none", className)} {...props} />
    </div>
  );
}

/* ------------------------------------------------------------------
 * SlugInput — Slug field with prefix text, status icon & suggestions
 * ----------------------------------------------------------------*/

export type SlugStatus = "idle" | "checking" | "available" | "taken";

export function SlugInput({
  prefix = "neo-id.com/p/",
  value,
  onChange,
  status,
  suggestions,
  onSuggestionClick,
  name,
  placeholder,
  id,
}: {
  prefix?: string;
  value: string;
  onChange: (value: string) => void;
  status: SlugStatus;
  suggestions?: string[];
  onSuggestionClick?: (slug: string) => void;
  name?: string;
  placeholder?: string;
  id?: string;
}) {
  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border px-3 py-2 transition-colors focus-within:ring-1",
          status === "available"
            ? "border-green-500 focus-within:ring-green-500/25"
            : status === "taken"
              ? "border-destructive focus-within:ring-destructive/25"
              : "border-input focus-within:border-ring focus-within:ring-ring/50",
        )}
      >
        <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="shrink-0 text-sm text-muted-foreground">
          {prefix}
        </span>
        <input
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground/50"
        />
        {status === "checking" && (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
        )}
        {status === "available" && (
          <Check className="size-3.5 shrink-0 text-green-500" />
        )}
        {status === "taken" && (
          <X className="size-3.5 shrink-0 text-destructive" />
        )}
      </div>
      {status === "taken" && suggestions && suggestions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-destructive">
            This URL is already taken. Try one of these instead:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSuggestionClick?.(s)}
                className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium transition-colors hover:bg-neo-teal/10 hover:text-neo-teal"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
