"use client";

import { useRef, useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Lock, AlertCircle } from "lucide-react";
import type { OrderInput } from "@/lib/order-helpers";

type PaymentStepProps = {
  orderInput: OrderInput;
  onSuccess: () => void;
  onError: (msg: string) => void;
};

export function PaymentStep({ orderInput, onSuccess, onError }: PaymentStepProps) {
  const dbOrderIdRef = useRef<string>("");
  const [error, setError] = useState<string | null>(null);

  function handleError(msg: string) {
    setError(msg);
    onError(msg);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Payment</h2>
        <p className="text-sm text-muted-foreground">
          Complete your purchase to order the NFC card
        </p>
      </div>

      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="size-5 text-neo-teal" />
              Payment Method
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

                // Free order — auto-complete
                if (data.free) {
                  dbOrderIdRef.current = data.dbOrderId;
                  onSuccess();
                  return data.dbOrderId; // Won't be used by PayPal
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
              onCancel={() => {
                // User closed PayPal popup — they can retry
              }}
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
      </div>
    </div>
  );
}
