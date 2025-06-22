-- ScrapFlow Database Seed Data
-- Run this script after npm run db:push to populate the database with sample data

-- Insert Users (Admin, Export Manager, Yard Staff)
INSERT INTO users (username, email, password, role, name, is_active) VALUES
('admin', 'admin@scrapflow.com', 'admin123', 'admin', 'System Administrator', true),
('export_manager', 'export@scrapflow.com', 'export123', 'export_manager', 'Export Manager', true),
('yard_staff', 'yard@scrapflow.com', 'yard123', 'yard_staff', 'Yard Staff', true);

-- Insert Partners (International suppliers and buyers)
INSERT INTO partners (company_name, contact_person, email, phone, country, address, type, status) VALUES
('Steel Solutions Ltd', 'John Smith', 'john@steelsolutions.com', '+44-20-7123-4567', 'United Kingdom', '123 Industrial Ave, London SW1A 1AA', 'buyer', 'active'),
('Global Metal Trading', 'Sarah Johnson', 'sarah@globalmet.com', '+1-212-555-0123', 'United States', '456 Commerce St, New York, NY 10001', 'both', 'active'),
('Asian Metal Recyclers', 'Raj Kumar', 'raj@asianmetal.in', '+91-98765-43210', 'India', 'Mumbai Industrial Estate, Maharashtra 400001', 'supplier', 'active'),
('European Steel Corp', 'Hans Mueller', 'hans@europeansteel.de', '+49-30-12345678', 'Germany', 'Berlin Industrial Zone, 10115 Berlin', 'buyer', 'active'),
('Middle East Metals', 'Omar Al-Rashid', 'omar@memetal.ae', '+971-4-567-8901', 'UAE', 'Jebel Ali Free Zone, Dubai', 'both', 'active'),
('American Scrap Co', 'John Davis', 'john@americanscrap.com', '+1-555-789-0123', 'USA', '456 Industrial Blvd, Houston, TX 77001', 'supplier', 'active'),
('China Metal Trading', 'Li Wei', 'li.wei@chinametaltrading.cn', '+86-21-8765-4321', 'China', 'Shanghai Free Trade Zone, Shanghai 200131', 'buyer', 'active'),
('Turkish Metal Works', 'Mehmet Ozkan', 'mehmet@turkishmetal.tr', '+90-212-456-7890', 'Turkey', 'Istanbul Industrial District, 34000 Istanbul', 'both', 'active'),
('Nordic Recycling', 'Erik Nordstrom', 'erik@nordicrecycling.se', '+46-8-123-4567', 'Sweden', 'Stockholm Industrial Park, 11122 Stockholm', 'buyer', 'active');

-- Insert Inventory Items with lifecycle stages
INSERT INTO inventory (item_id, metal_type, grade, quantity, unit, ferrous_type, location, status, inspection_notes) VALUES
('INV-001', 'Aluminum', 'Grade A', '500', 'KG', 'non_ferrous', 'Warehouse A, Section 1', 'available',  'High-grade aluminum cans and sheets'),
('INV-002', 'Copper', 'Grade A', '750', 'KG', 'non_ferrous', 'Warehouse A, Section 2', 'available',  'High purity copper wire from electronics'),
('INV-003', 'Steel', 'Grade B', '1500', 'KG', 'ferrous', 'Warehouse B, Section 1', 'reserved',  'Mixed steel scrap from construction'),
('INV-004', 'Brass', 'Grade A', '400', 'KG', 'non_ferrous', 'Warehouse C, Section 1', 'available',  'Clean brass fittings and pipes'),
('INV-005', 'Iron', 'Grade C', '800', 'KG', 'ferrous', 'Warehouse D, Section 2', 'available',  'Iron scraps from automotive parts'),
('INV-006', 'Aluminum', 'Grade A', '600', 'KG', 'non_ferrous', 'Warehouse E, Section 1', 'sold', 'Processed aluminum sheets and cans'),
('INV-007', 'Copper', 'Grade B', '950', 'KG', 'non_ferrous', 'Warehouse A, Section 3', 'available',  'Mixed copper cables and wires'),
('INV-008', 'Steel', 'Grade A', '2200', 'KG', 'ferrous', 'Warehouse B, Section 2', 'reserved',  'High-grade steel from industrial machinery'),
('INV-009', 'Brass', 'Grade B', '320', 'KG', 'non_ferrous', 'Warehouse C, Section 2', 'available',  'Mixed brass components'),
('INV-010', 'Iron', 'Grade B', '1100', 'KG', 'ferrous', 'Warehouse D, Section 1', 'available',  'Clean iron sheets and rods');

-- Insert Deals (converted to INR, 1 USD = 83 INR)
INSERT INTO deals (deal_id, buyer_id, inventory_id, quantity, rate, currency, total_value, status, payment_terms, special_instructions) VALUES
('DEAL-2025-001', 2, 1, '300', '726.25', 'INR', '217875', 'confirmed', '30% advance, 70% on delivery', 'Handle with care, high-grade copper'),
('DEAL-2025-002', 3, 3, '600', '174.30', 'INR', '104580', 'in_progress', '50% advance, 50% on shipment', 'Export shipment to Dubai'),
('DEAL-2025-003', 3, 2, '500', '726.25', 'INR', '363125', 'completed', '50% advance, 50% on delivery', 'Premium copper export to Dubai'),
('DEAL-2025-004', 5, 3, '1200', '265.60', 'INR', '318720', 'completed', '30% advance, 70% on shipment', 'Steel export to China'),
('DEAL-2025-005', 2, 4, '300', '622.50', 'INR', '186750', 'in_progress', 'Letter of Credit', 'Brass components for manufacturing'),
('DEAL-2025-006', 6, 5, '600', '232.40', 'INR', '139440', 'completed', 'TT payment', 'Iron scrap for Turkish steel mills'),
('DEAL-2025-007', 3, 7, '800', '684.75', 'INR', '547800', 'confirmed', '40% advance, 60% on delivery', 'High-grade copper to UAE'),
('DEAL-2025-008', 5, 8, '1800', '286.35', 'INR', '515430', 'in_progress', '25% advance, 75% on shipment', 'Premium steel to China'),
('DEAL-2025-009', 2, 9, '250', '597.60', 'INR', '149400', 'confirmed', 'Cash on delivery', 'Brass export to Europe'),
('DEAL-2025-010', 4, 10, '900', '244.85', 'INR', '220365', 'completed', 'TT payment within 30 days', 'Iron export to USA');

-- Insert Shipments
INSERT INTO shipments (deal_id, container_no, vessel_name, eta, status, tracking_notes) VALUES
(1, 'MSKU-1234567', 'MV Ocean Trader', '2025-07-15 14:30:00', 'preparation', 'Container being loaded at Mumbai port'),
(2, 'CSLU-2345678', 'MV Global Express', '2025-07-20 09:15:00', 'gate_in', 'Waiting for customs clearance'),
(3, 'MAEU-7654321', 'MV Dubai Express', '2025-07-10 16:00:00', 'delivered', 'Successfully delivered to Dubai port'),
(4, 'COSCO-8765432', 'MV Shanghai Star', '2025-07-08 12:00:00', 'delivered', 'Completed delivery to Shanghai'),
(5, 'MSC-9876543', 'MV European Trader', '2025-07-25 10:30:00', 'dispatched', 'En route to Rotterdam port'),
(6, 'OOCL-1357924', 'MV Bosphorus', '2025-07-18 14:15:00', 'delivered', 'Delivered to Istanbul port'),
(7, 'HAPAG-2468135', 'MV Gulf Pioneer', '2025-07-30 09:45:00', 'preparation', 'Container being loaded'),
(8, 'EVERGREEN-3579246', 'MV Pacific Dragon', '2025-08-05 11:20:00', 'gate_in', 'Container at port ready for loading'),
(9, 'CMA-4681357', 'MV Atlantic Breeze', '2025-08-12 15:30:00', 'sealed', 'Container sealed and ready for dispatch'),
(10, 'YANG-5792468', 'MV Liberty Star', '2025-07-20 13:45:00', 'delivered', 'Successfully delivered to Houston port');

-- Insert Payments (INR amounts with 18% GST)
INSERT INTO payments (deal_id, payment_type, amount, currency, status, proof_document, gst_amount, total_amount) VALUES
(1, 'TT', '65362.50', 'INR', 'completed', NULL, '11765.25', '77127.75'),
(2, 'LC', '52290.00', 'INR', 'pending', NULL, '9412.20', '61702.20'),
(3, 'TT', '363125.00', 'INR', 'completed', NULL, '65362.50', '428487.50'),
(4, 'LC', '318720.00', 'INR', 'completed', NULL, '57409.60', '376129.60'),
(5, 'LC', '186750.00', 'INR', 'pending', NULL, '33615.00', '220365.00'),
(6, 'TT', '139440.00', 'INR', 'completed', NULL, '25099.20', '164539.20'),
(7, 'TT', '219120.00', 'INR', 'completed', NULL, '39441.60', '258561.60'),
(8, 'LC', '128857.50', 'INR', 'pending', NULL, '23194.35', '152051.85'),
(9, 'cash', '149400.00', 'INR', 'completed', NULL, '26892.00', '176292.00'),
(10, 'TT', '220365.00', 'INR', 'completed', NULL, '39665.70', '260030.70');

-- Insert Documents
INSERT INTO documents (deal_id, document_type, file_name, file_path, file_size, status, uploaded_by, approved_by) VALUES
(1, 'Invoice', 'INV-DEAL-2025-001.pdf', '/uploads/documents/inv-deal-2025-001.pdf', 245680, 'approved', 2, 1),
(1, 'Bill of Lading', 'BOL-DEAL-2025-001.pdf', '/uploads/documents/bol-deal-2025-001.pdf', 178920, 'approved', 2, 1),
(2, 'Certificate of Origin', 'COO-DEAL-2025-002.pdf', '/uploads/documents/coo-deal-2025-002.pdf', 156780, 'pending', 2, NULL),
(3, 'Invoice', 'INV-DEAL-2025-003.pdf', '/uploads/documents/inv-deal-2025-003.pdf', 287340, 'approved', 2, 1),
(3, 'Bill of Lading', 'BOL-DEAL-2025-003.pdf', '/uploads/documents/bol-deal-2025-003.pdf', 195680, 'approved', 2, 1),
(4, 'Certificate of Origin', 'COO-DEAL-2025-004.pdf', '/uploads/documents/coo-deal-2025-004.pdf', 167890, 'approved', 2, 1),
(4, 'Packing List', 'PL-DEAL-2025-004.pdf', '/uploads/documents/pl-deal-2025-004.pdf', 112450, 'approved', 2, 1),
(5, 'Invoice', 'INV-DEAL-2025-005.pdf', '/uploads/documents/inv-deal-2025-005.pdf', 234560, 'pending', 2, NULL),
(5, 'Quality Certificate', 'QC-DEAL-2025-005.pdf', '/uploads/documents/qc-deal-2025-005.pdf', 145670, 'pending', 2, NULL),
(6, 'Bill of Lading', 'BOL-DEAL-2025-006.pdf', '/uploads/documents/bol-deal-2025-006.pdf', 178920, 'approved', 2, 1),
(7, 'Contract', 'CONTRACT-DEAL-2025-007.pdf', '/uploads/documents/contract-deal-2025-007.pdf', 456780, 'pending', 2, NULL),
(8, 'Invoice', 'INV-DEAL-2025-008.pdf', '/uploads/documents/inv-deal-2025-008.pdf', 298760, 'pending', 2, NULL);

-- Insert Quality Checks
INSERT INTO quality_checks (deal_id, gross_weight, net_weight, moisture, radiation, purity_percent, test_results) VALUES
(1, '320', '300', '2.5', '0.05', '98.5', '{"density": "2.70", "conductivity": "97%", "impurities": "1.5%"}'),
(3, '520', '500', '1.8', '0.08', '99.3', '{"density": "8.95", "conductivity": "99%", "impurities": "0.7%"}'),
(4, '1220', '1200', '0.9', '0.04', '96.2', '{"carbon_content": "0.6%", "tensile_strength": "420MPa", "hardness": "HRC 25"}'),
(5, '310', '300', '2.1', '0.06', '98.5', '{"zinc_content": "35%", "lead_content": "0.02%", "surface_quality": "excellent"}'),
(6, '620', '600', '1.2', '0.03', '94.8', '{"carbon_content": "0.9%", "sulfur_content": "0.01%", "phosphorus": "0.02%"}');

-- Insert System Settings
INSERT INTO settings (key, value, description, updated_by) VALUES
('company_name', '"ScrapFlow Technologies Pvt Ltd"', 'Company name for reports and documents', 1),
('gst_rate', '18', 'GST percentage rate for Indian transactions', 1),
('default_currency', '"INR"', 'Default currency for all transactions', 1),
('monthly_revenue_target', '5000000', 'Monthly revenue target in INR', 1),
('quality_check_mandatory', 'true', 'Require quality checks for all shipments', 1),
('auto_invoice_generation', 'true', 'Automatically generate invoices for completed deals', 1),
('minimum_purity_copper', '98', 'Minimum purity percentage for copper exports', 1),
('minimum_purity_steel', '95', 'Minimum purity percentage for steel exports', 1),
('container_loading_time', '48', 'Standard container loading time in hours', 1),
('document_approval_required', 'true', 'Require admin approval for all documents', 1);

-- Update sequences to ensure proper auto-increment values
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('partners_id_seq', (SELECT MAX(id) FROM partners));
SELECT setval('inventory_id_seq', (SELECT MAX(id) FROM inventory));
SELECT setval('deals_id_seq', (SELECT MAX(id) FROM deals));
SELECT setval('shipments_id_seq', (SELECT MAX(id) FROM shipments));
SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));
SELECT setval('quality_checks_id_seq', (SELECT MAX(id) FROM quality_checks));
SELECT setval('documents_id_seq', (SELECT MAX(id) FROM documents));
SELECT setval('settings_id_seq', (SELECT MAX(id) FROM settings));