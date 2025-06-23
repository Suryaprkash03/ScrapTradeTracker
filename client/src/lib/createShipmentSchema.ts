import { z } from "zod"

export const createShipmentSchema = z.object({
  dealId: z.number().min(1, "Deal is required"),
  containerNo: z.string().min(1, "Container number is required"),
  vesselName: z.string().min(1, "Vessel name is required"),
  eta: z.string().min(1, "ETA is required"), // date-time string
  status: z.string().min(1, "Status is required"),
  trackingNotes: z.string().optional(),
})

export type CreateShipmentForm = z.infer<typeof createShipmentSchema>
