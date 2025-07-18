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
  lifecycleStage: text("lifecycle_stage").default("collection"), // collection, sorting, cleaning, melting, distribution
  barcode: text("barcode"),
  qrCode: text("qr_code"),
  batchNumber: text("batch_number"),
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

// Documents table for commercial documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  dealId: integer("deal_id").notNull(),
  documentType: text("document_type").notNull(), // invoice, packing_list, bol, coo, lc, inspection_certificate
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  uploadedBy: integer("uploaded_by").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectedBy: integer("rejected_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
});

// Settings table for system configuration
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedBy: integer("updated_by").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertQualityCheckSchema = createInsertSchema(qualityChecks).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
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

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Lifecycle Updates table for tracking inventory stage changes
export const lifecycleUpdates = pgTable("lifecycle_updates", {
  id: serial("id").primaryKey(),
  inventoryId: integer("inventory_id").notNull(),
  previousStage: text("previous_stage"),
  newStage: text("new_stage").notNull(),
  status: text("status").notNull(),
  barcode: text("barcode"),
  qrCode: text("qr_code"),
  batchNumber: text("batch_number"),
  inspectionNotes: text("inspection_notes"),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLifecycleUpdateSchema = createInsertSchema(lifecycleUpdates).omit({
  id: true,
  updatedAt: true,
});

export type LifecycleUpdate = typeof lifecycleUpdates.$inferSelect;
export type InsertLifecycleUpdate = z.infer<typeof insertLifecycleUpdateSchema>;
