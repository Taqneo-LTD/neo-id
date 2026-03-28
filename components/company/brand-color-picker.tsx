"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BrandColors = {
  primary: string;
  secondary: string;
  accent: string;
};

const COLOR_FIELDS: { key: keyof BrandColors; label: string; description: string }[] = [
  { key: "primary", label: "Primary", description: "Main brand color" },
  { key: "secondary", label: "Secondary", description: "Supporting color" },
  { key: "accent", label: "Accent", description: "Highlight & CTA color" },
];

export function BrandColorPicker({
  colors,
  onChange,
}: {
  colors: BrandColors;
  onChange: (colors: BrandColors) => void;
}) {
  function updateColor(key: keyof BrandColors, value: string) {
    onChange({ ...colors, [key]: value });
  }

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {COLOR_FIELDS.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label>{field.label}</Label>
          <div className="flex items-center gap-3">
            <label className="relative shrink-0">
              <div
                className="size-10 cursor-pointer rounded-lg border border-border shadow-sm transition-shadow hover:shadow-md"
                style={{ backgroundColor: colors[field.key] }}
              />
              <input
                type="color"
                value={colors[field.key]}
                onChange={(e) => updateColor(field.key, e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
            <Input
              value={colors[field.key]}
              onChange={(e) => {
                let val = e.target.value;
                if (!val.startsWith("#")) val = `#${val}`;
                if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                  updateColor(field.key, val);
                }
              }}
              placeholder="#000000"
              className="font-mono text-sm uppercase"
            />
          </div>
          <p className="text-xs text-muted-foreground">{field.description}</p>
        </div>
      ))}

    </div>
  );
}
