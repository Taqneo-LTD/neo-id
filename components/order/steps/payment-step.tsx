"use client";

import { useRef, useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CreditCard, Lock, AlertCircle, PhoneCall, Loader2 } from "lucide-react";
import type { OrderInput } from "@/lib/order-helpers";

type PaymentStepProps = {
  orderInput: OrderInput;
  onSuccess: () => void;
  onPayLaterSuccess: () => void;
  onError: (msg: string) => void;
};

export function PaymentStep({ orderInput, onSuccess, onPayLaterSuccess, onError }: PaymentStepProps) {
  const dbOrderIdRef = useRef<string>("");
  const [error, setError] = useState<string | null>(null);
  const [payLaterLoading, setPayLaterLoading] = useState(false);

  function handleError(msg: string) {
    setError(msg);
    onError(msg);
  }

  async function handlePayLater() {
    setError(null);
    setPayLaterLoading(true);

    try {
      const res = await fetch("/api/paypal/create-order-pay-later", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderInput),
      });

      const data = await res.json();

      if (!res.ok) {
        handleError(data.error || "Failed to submit order");
        setPayLaterLoading(false);
        return;
      }

      onPayLaterSuccess();
    } catch {
      handleError("Something went wrong. Please try again.");
      setPayLaterLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Payment</h2>
        <p className="text-sm text-muted-foreground">
          Complete your purchase to order the NFC card
        </p>
      </div>

      <div className="mx-auto max-w-lg space-y-4">
        {/* PayPal Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="size-5 text-neo-teal" />
              Pay Now
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-6 pt-6">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <PayPalButtons
              style={{
                layout: "vertical",
                color: "gold",
                shape: "rect",
                label: "pay",
                tagline: false,
              }}
              createOrder={async () => {
                setError(null);
                const res = await fetch("/api/paypal/create-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(orderInput),
                });

                const data = await res.json();

                if (!res.ok) {
                  throw new Error(data.error || "Failed to create order");
                }

                // Free order
                if (data.free) {
                  dbOrderIdRef.current = data.dbOrderId;
                  onSuccess();
                  return data.dbOrderId;
                }

                dbOrderIdRef.current = data.dbOrderId;
                return data.paypalOrderId;
              }}
              onApprove={async (data) => {
                setError(null);
                const res = await fetch("/api/paypal/capture-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    paypalOrderId: data.orderID,
                    dbOrderId: dbOrderIdRef.current,
                  }),
                });

                const result = await res.json();

                if (!res.ok) {
                  handleError(result.error || "Failed to capture payment");
                  return;
                }

                onSuccess();
              }}
              onCancel={() => {}}
              onError={() => {
                handleError("Payment failed. Please try again.");
              }}
            />

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3" />
              Payments are secured by PayPal
            </div>
          </CardContent>
        </Card>

        {/* Pay Later Option */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">
              or
            </span>
          </div>
        </div>

        <Card className="border-dashed border-amber-500/20 bg-amber-500/[0.02]">
          <CardContent className="flex flex-col items-center gap-3 py-6">
            <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
              <PhoneCall className="size-5 text-amber-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Not ready to pay online?</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Submit your order and our team will reach out to finalize it. No payment required now.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-1 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
              onClick={handlePayLater}
              disabled={payLaterLoading}
            >
              {payLaterLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Order Now, Pay Later"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
