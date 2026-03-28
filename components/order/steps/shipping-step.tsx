"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { FormField, PrefixInput } from "@/components/ui/form-fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Truck } from "lucide-react";
import { DEFAULT_COUNTRY } from "@/constants/profile";
import { SHIPPING } from "@/lib/pricing";
import type { ShippingAddress } from "../card-order-wizard";

type ShippingStepProps = {
  address: ShippingAddress;
  onChange: (address: ShippingAddress) => void;
  orderSubtotal: number;
};

/** Format digits as 5XX-XXX-XXXX for display */
function formatPhoneDisplay(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function ShippingStep({ address, onChange, orderSubtotal }: ShippingStepProps) {
  const isFreeShipping = orderSubtotal >= SHIPPING.FREE_THRESHOLD;
  function update(field: keyof ShippingAddress, value: string) {
    onChange({ ...address, [field]: value });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Shipping Address</h2>
        <p className="text-sm text-muted-foreground">
          Where should we deliver your NFC card?
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="size-5 text-neo-teal" />
              Delivery Details
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full Name" htmlFor="fullName">
                <Input
                  id="fullName"
                  value={address.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Ahmed Al-Rashid"
                />
              </FormField>
              <FormField label="Phone Number" htmlFor="shippingPhone">
                <PrefixInput
                  addon={
                    <span className="flex items-center gap-1.5 text-sm">
                      <Image
                        src={DEFAULT_COUNTRY.flagSrc}
                        alt={DEFAULT_COUNTRY.name}
                        width={20}
                        height={14}
                        className="h-3.5 w-5 rounded-[2px] object-cover"
                      />
                      <span>{DEFAULT_COUNTRY.dialCode}</span>
                    </span>
                  }
                  addonClassName="px-2.5"
                  id="shippingPhone"
                  value={formatPhoneDisplay(address.phone)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                    update("phone", digits);
                  }}
                  placeholder="5XX-XXX-XXXX"
                />
              </FormField>
            </div>

            <FormField label="Address Line 1" htmlFor="addressLine1">
              <Input
                id="addressLine1"
                value={address.addressLine1}
                onChange={(e) => update("addressLine1", e.target.value)}
                placeholder="Street address, building number"
              />
            </FormField>

            <FormField label="Address Line 2 (Optional)" htmlFor="addressLine2">
              <Input
                id="addressLine2"
                value={address.addressLine2}
                onChange={(e) => update("addressLine2", e.target.value)}
                placeholder="Apartment, suite, floor"
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="City" htmlFor="city">
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Riyadh"
                />
              </FormField>
              <FormField label="State / Region" htmlFor="state">
                <Input
                  id="state"
                  value={address.state}
                  onChange={(e) => update("state", e.target.value)}
                  placeholder="Riyadh Region"
                />
              </FormField>
              <FormField label="ZIP Code" htmlFor="zipCode">
                <Input
                  id="zipCode"
                  value={address.zipCode}
                  onChange={(e) => update("zipCode", e.target.value)}
                  placeholder="12345"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Shipping info sidebar */}
        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="size-4 text-neo-teal" />
                Shipping
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Standard Delivery</p>
                  <p className="text-xs text-muted-foreground">3–5 business days</p>
                </div>
                <div className="text-right">
                  {isFreeShipping ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs tabular-nums text-muted-foreground line-through">
                        {SHIPPING.STANDARD} SAR
                      </span>
                      <span className="text-sm font-bold text-neo-teal">Free</span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold tabular-nums">
                      {SHIPPING.STANDARD} SAR
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
