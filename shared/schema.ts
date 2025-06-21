import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("yard_staff"), // admin, export_manager, yard_staff
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  country: text("country").notNull(),
  address: text("address"),
  type: text("type").notNull(), // supplier, buyer, both
  status: text("status").notNull().default("active"), // active, inactive
  documents: jsonb("documents").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  itemId: text("item_id").notNull().unique(),
  metalType: text("metal_type").notNull(),
  grade: text("grade").notNull(),
  quantity: decimal("quantity").notNull(),
  unit: text("unit").notNull(), // tons, kg, lbs
  ferrousType: text("ferrous_type").notNull(), // ferrous, non_ferrous
  location: text("location"),
  status: text("status").notNull().default("available"), // available, reserved, sold
  inspectionNotes: text("inspection_notes"),
  qualityReports: jsonb("quality_reports").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  dealId: text("deal_id").notNull().unique(),
  buyerId: integer("buyer_id").notNull(),
  inventoryId: integer("inventory_id").notNull(),
  quantity: decimal("quantity").notNull(),
  rate: decimal("rate").notNull(),
  currency: text("currency").notNull().default("USD"),
  totalValue: decimal("total_value").notNull(),
  status: text("status").notNull().default("draft"), // draft, confirmed, in_progress, completed, cancelled
  paymentTerms: text("payment_terms"),
  specialInstructions: text("special_instructions"),
  documents: jsonb("documents").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull(),
  containerNo: text("container_no"),
  vesselName: text("vessel_name"),
  eta: timestamp("eta"),
  status: text("status").notNull().default("preparation"), // preparation, pickup, gate_in, sealed, dispatched, delivered
  trackingNotes: text("tracking_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull(),
  paymentType: text("payment_type").notNull(), // TT, LC, cash
  amount: decimal("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  proofDocument: text("proof_document"),
  gstAmount: decimal("gst_amount"),
  totalAmount: decimal("total_amount").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const qualityChecks = pgTable("quality_checks", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull(),
  grossWeight: decimal("gross_weight"),
  netWeight: decimal("net_weight"),
  moisture: decimal("moisture"),
  radiation: decimal("radiation"),
  purityPercent: decimal("purity_percent"),
  testResults: jsonb("test_results").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertQualityCheckSchema = createInsertSchema(qualityChecks).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type QualityCheck = typeof qualityChecks.$inferSelect;
export type InsertQualityCheck = z.infer<typeof insertQualityCheckSchema>;
