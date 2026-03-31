import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { requirePlatformAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge, CardStatusBadge } from "@/components/order/order-status-badge";
import { OrderActions } from "@/components/admin/order-actions";
import { formatDate } from "@/lib/date-format";
import {
  ArrowLeft,
  Globe,
  MapPin,
  Phone,
  Mail,
  Building2,
  User,
  Wifi,
  Download,
} from "lucide-react";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePlatformAdmin();
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          accountType: true,
          role: true,
          company: { select: { nameEn: true } },
        },
      },
      cards: {
        include: {
          material: { select: { name: true, slug: true, frontSvg: true } },
          profile: { select: { name: true, slug: true } },
        },
      },
    },
  });

  if (!order) notFound();

  const addr = order.shippingAddr as {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
  };

  const meta = (order.metadata ?? {}) as Record<string, unknown>;
  const statusLog = Array.isArray(meta.statusLog) ? meta.statusLog : [];

  // Intended card data for PENDING_CONTACT orders
  let intendedCard: { materialName: string; materialSvg: string; profileName: string | null; profileSlug: string } | null = null;
  if (order.cards.length === 0 && meta.profileId && meta.materialId) {
    const [mat, prof] = await Promise.all([
      db.cardMaterial.findUnique({
        where: { id: meta.materialId as string },
        select: { name: true, frontSvg: true },
      }),
      db.profile.findUnique({
        where: { id: meta.profileId as string },
        select: { name: true, slug: true },
      }),
    ]);
    if (mat && prof) {
      intendedCard = {
        materialName: mat.name,
        materialSvg: mat.frontSvg,
        profileName: prof.name,
        profileSlug: prof.slug,
      };
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://neo-id.com";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <PageHeader
          title={`Order ${order.id.slice(0, 12)}...`}
          description={`Placed on ${formatDate(order.createdAt.toISOString())}`}
        />
      </div>

      {/* Status + Actions */}
      <Card>
        <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Status:</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <OrderActions orderId={order.id} currentStatus={order.status} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Customer + Shipping */}
        <div className="space-y-6 lg:col-span-1">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="size-3.5 text-muted-foreground" />
                <span className="font-medium">{order.user.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-3.5" />
                <a href={`mailto:${order.user.email}`} className="hover:text-amber-500">
                  {order.user.email}
                </a>
              </div>
              {order.user.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="size-3.5" />
                  <a href={`tel:${order.user.phone}`} className="hover:text-amber-500">
                    {order.user.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {order.user.accountType === "COMPANY" ? (
                  <>
                    <Building2 className="size-3.5" />
                    <span>{order.user.company?.nameEn} ({order.user.role})</span>
                  </>
                ) : (
                  <>
                    <User className="size-3.5" />
                    <span>Individual</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{addr.fullName}</p>
              <p className="text-muted-foreground">{addr.addressLine1}</p>
              {addr.addressLine2 && (
                <p className="text-muted-foreground">{addr.addressLine2}</p>
              )}
              <p className="text-muted-foreground">
                {addr.city}, {addr.state} {addr.zipCode}
              </p>
              <p className="flex items-center gap-1 text-muted-foreground">
                <Phone className="size-3" />
                {addr.phone}
              </p>
            </CardContent>
          </Card>

          {/* Payment + Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Payment & Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold tabular-nums">
                  {Number(order.totalAmount).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">SAR</span>
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">PayPal Payment ID</p>
                <p className="mt-0.5 break-all font-mono text-xs text-muted-foreground">
                  {order.paymentId ?? "No payment recorded"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tracking Number</p>
                <p className="mt-0.5 font-mono text-sm">
                  {order.trackingNo ?? "Not yet assigned"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Cards + Audit */}
        <div className="space-y-6 lg:col-span-2">
          {/* Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {order.cards.length > 0 ? "Cards" : "Intended Order"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Real cards */}
              {order.cards.length > 0 && (
                <div className="space-y-3">
                  {order.cards.map((card) => (
                    <div
                      key={card.id}
                      className="flex gap-4 rounded-lg border p-4"
                    >
                      <div className="w-28 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={card.material?.frontSvg ?? "/neo-cards/materials-base/classic/front.svg"}
                          alt={card.material?.name ?? "Card"}
                          width={1025}
                          height={593}
                          className="block h-auto w-full"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-sm font-medium">
                            {card.profile.name ?? card.profile.slug}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {card.material?.name ?? "Standard"} Edition
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <CardStatusBadge status={card.status} />
                        </div>
                        <Separator />
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Globe className="size-3" />
                            <span className="font-mono">
                              {siteUrl}/p/{card.profile.slug}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Wifi className="size-3" />
                            <span>NFC URL: {siteUrl}/p/{card.profile.slug}</span>
                          </div>
                          <a
                            href={`/api/profiles/${card.profile.slug}/qrcode?format=svg&size=600`}
                            download={`qr-${card.profile.slug}.svg`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-amber-500/10 hover:text-amber-500"
                          >
                            <Download className="size-3" />
                            Download QR Code
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Intended card for PENDING_CONTACT */}
              {order.cards.length === 0 && intendedCard && (
                <div className="flex gap-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.02] p-4">
                  <div className="w-28 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={intendedCard.materialSvg}
                      alt={intendedCard.materialName}
                      width={1025}
                      height={593}
                      className="block h-auto w-full"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-sm font-medium">
                        {intendedCard.profileName ?? intendedCard.profileSlug}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {intendedCard.materialName} Edition
                      </p>
                    </div>
                    <Badge variant="outline" className="border-amber-500/40 text-xs text-amber-500">
                      Awaiting payment
                    </Badge>
                    <Separator />
                    <div className="text-xs text-muted-foreground">
                      <Globe className="mr-1 inline size-3" />
                      <span className="font-mono">{siteUrl}/p/{intendedCard.profileSlug}</span>
                    </div>
                  </div>
                </div>
              )}

              {order.cards.length === 0 && !intendedCard && (
                <p className="text-sm text-muted-foreground">No card data available.</p>
              )}
            </CardContent>
          </Card>

          {/* Audit log */}
          {statusLog.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(statusLog as { from: string; to: string; by: string; at: string; vendorNotes?: string }[]).map(
                    (entry, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg border border-border/50 px-3 py-2 text-xs"
                      >
                        <div className="flex-1">
                          <span className="text-muted-foreground">{entry.from}</span>
                          <span className="mx-1.5 text-muted-foreground/50">&rarr;</span>
                          <span className="font-medium">{entry.to}</span>
                          {entry.vendorNotes && (
                            <p className="mt-1 text-muted-foreground">
                              Note: {entry.vendorNotes}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-muted-foreground">
                          {formatDate(entry.at)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
