"use client";

import { useState, useActionState, useCallback, useRef } from "react";
import { createProfile, checkSlugAvailability } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HelpCircle, User } from "lucide-react";
import { getInitials } from "@/lib/string-utils";
import { SlugInput, type SlugStatus } from "@/components/ui/form-fields";

type EmployeeOption = { id: string; name: string; email: string; avatarUrl: string | null };

export function CreateProfileForm({
  employeesWithoutProfile,
}: {
  employeesWithoutProfile?: EmployeeOption[];
}) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("self");
  const [error, action, pending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await createProfile(formData);
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : "Something went wrong";
      }
    },
    null,
  );

  // Slug availability checker
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
  const slugTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const checkSlug = useCallback((value: string) => {
    if (slugTimerRef.current) clearTimeout(slugTimerRef.current);

    if (!value) {
      setSlugStatus("idle");
      setSlugSuggestions([]);
      return;
    }

    setSlugStatus("checking");
    slugTimerRef.current = setTimeout(async () => {
      try {
        const result = await checkSlugAvailability(value);
        setSlugStatus(result.available ? "available" : "taken");
        setSlugSuggestions(result.suggestions);
      } catch {
        setSlugStatus("idle");
      }
    }, 500);
  }, []);

  function handleSlugChange(value: string) {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(sanitized);
    checkSlug(sanitized);
  }

  return (
    <form action={action} className="space-y-4">
      {/* Owner: pick employee to create for */}
      {employeesWithoutProfile && employeesWithoutProfile.length > 0 && (
        <div className="space-y-2">
          <Label>Create for</Label>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self" className="py-2">
                <span className="flex items-center gap-2">
                  <Avatar className="size-7 shrink-0">
                    <AvatarFallback className="bg-neo-teal/10 text-neo-teal">
                      <User className="size-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Myself</span>
                </span>
              </SelectItem>
              {employeesWithoutProfile.map((emp) => {
                const initials = getInitials(emp.name);
                return (
                  <SelectItem key={emp.id} value={emp.id} className="py-2">
                    <span className="flex items-center gap-2">
                      <Avatar className="size-7 shrink-0">
                        <AvatarImage src={emp.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-neo-teal/10 text-[10px] text-neo-teal">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm">{emp.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{emp.email}</span>
                      </span>
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {selectedEmployee !== "self" && (
            <input type="hidden" name="forUserId" value={selectedEmployee} />
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="name">Name</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="size-3.5 cursor-help text-neo-teal" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px]">
                <p>
                  <span className="font-semibold">
                    Headline on your public card.
                  </span>{" "}
                  The main name displayed on this NEO ID — can differ per card.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="name"
          name="name"
          placeholder="e.g. John Doe"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="title">Occupation</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="size-3.5 cursor-help text-neo-teal" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px]">
                <p>
                  <span className="font-semibold">
                    Shown below your name on the public card.
                  </span>{" "}
                  Your role or job title — e.g. &quot;Product
                  Manager&quot; or &quot;Founder &amp; CEO&quot;.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Product Manager, Software Engineer"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Profile URL</Label>
        <SlugInput
          id="slug"
          name="slug"
          value={slug}
          onChange={handleSlugChange}
          status={slugStatus}
          placeholder="john-doe"
          suggestions={slugSuggestions}
          onSuggestionClick={(s) => {
            setSlug(s);
            checkSlug(s);
          }}
        />
        <p className="text-[11px] text-muted-foreground">
          Auto-generated from your name if empty. This URL will be permanently locked once you order a card.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="A brief introduction about yourself..."
          rows={3}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating..." : "Create Profile"}
      </Button>
    </form>
  );
}
