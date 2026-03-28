import { z } from "zod";

export const updateCardStatusSchema = z.object({
  status: z.enum(["PENDING", "PRINTING", "SHIPPED", "DELIVERED", "ACTIVE"]),
  nfcId: z.string().optional(),
  trackingNo: z.string().optional(),
});
