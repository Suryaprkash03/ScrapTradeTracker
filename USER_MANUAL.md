# ScrapFlow - Metal Trading Management System
## Complete User Manual

### Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Dashboard](#dashboard)
5. [Inventory Management](#inventory-management)
6. [Partner Management](#partner-management)
7. [Deal Management](#deal-management)
8. [Shipment Tracking](#shipment-tracking)
9. [Document Management](#document-management)
10. [Finance & Payments](#finance--payments)
11. [Quality Control](#quality-control)
12. [Scrap Lifecycle Management](#scrap-lifecycle-management)
13. [Reports & Analytics](#reports--analytics)
14. [Settings Configuration](#settings-configuration)
15. [User Management](#user-management)
16. [Troubleshooting](#troubleshooting)

---

## System Overview

ScrapFlow is a comprehensive web-based management system designed for metal trading businesses. It manages the complete workflow from scrap collection to export, including inventory tracking, partner relationships, deal negotiations, shipment logistics, financial transactions, and quality control.

### Key Features
- **Multi-user role-based access control** (Admin, Export Manager, Yard Staff)
- **Real-time inventory tracking** with lifecycle management
- **Partner relationship management** for suppliers and buyers
- **Deal negotiation and contract management**
- **Container shipment tracking** with logistics updates
- **Document management** with approval workflows
- **Financial transaction recording** with GST calculations
- **Quality control and inspection reports**
- **Comprehensive reporting and analytics**

---

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- No software installation required

### Login Credentials
The system comes with three pre-configured user accounts:

**Administrator**
- Email: admin@scrapflow.com
- Password: admin123
- Full system access

**Export Manager**
- Email: export@scrapflow.com
- Password: export123
- Business operations access

**Yard Staff**
- Email: yard@scrapflow.com
- Password: yard123
- Inventory and lifecycle access

### First Login
1. Navigate to the ScrapFlow application URL
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the dashboard based on your role

---

## User Roles & Permissions

### Administrator (Admin)
**Full System Access**
- Dashboard with complete analytics
- Inventory management (create, edit, delete)
- Partner management (suppliers and buyers)
- Deal management (create, approve, monitor)
- Shipment tracking (all containers)
- Document management (upload, approve, reject)
- Finance management (all payment types)
- Quality control oversight
- Scrap lifecycle monitoring
- System reports and analytics
- Settings configuration
- User management (create, edit, deactivate)

### Export Manager
**Business Operations Focus**
- Dashboard with export metrics
- Deal creation and management
- Document upload and tracking
- Shipment status updates
- Payment recording (TT, LC, Cash)
- Partner relationship management
- Quality test result recording
- Export-focused reports

**Restrictions:**
- Cannot delete inventory items
- Cannot manage users
- No access to import data
- Limited system settings access

### Yard Staff
**Inventory and Processing Focus**
- Inventory management and tracking
- Scrap lifecycle stage updates
- Quality inspection recording
- Barcode/QR code assignment
- Batch processing tracking
- Read-only shipment access

**Restrictions:**
- No deal management
- No payment access
- No document approval
- No supplier/buyer management
- No system reports access

---

## Dashboard

### Admin Dashboard
The admin dashboard provides comprehensive system overview:

**Key Metrics Cards:**
- Total Inventory: Current stock count
- Active Deals: Ongoing transactions
- Monthly Revenue: Current month earnings
- Pending Shipments: Containers in transit

**Scrap Lifecycle Status:** (Admin Only)
Visual grid showing inventory distribution across stages:
- Collection (Blue): New scrap intake
- Sorting (Yellow): Material categorization
- Cleaning (Purple): Preparation process
- Melting (Orange): Processing stage
- Distribution (Green): Ready for shipping
- Recycled (Emerald): Completed cycle

**Quick Actions:**
- Add New Inventory
- Add Partner
- Create Deal
- Generate Report

**Recent Activities:**
Real-time feed of system activities and updates

### Export Manager Dashboard
Focused on export operations with relevant metrics and quick access to deal management, shipment tracking, and document workflows.

### Yard Staff Dashboard
Concentrated on inventory management with lifecycle tracking, quality control access, and processing stage updates.

---

## Inventory Management

### Adding New Inventory
1. Click "Add Inventory" from dashboard or inventory page
2. Fill required fields:
   - **Item ID**: Unique identifier
   - **Metal Type**: Steel, Copper, Aluminum, Brass, Iron
   - **Grade**: A, B, C classification
   - **Quantity**: Amount in stock
   - **Unit**: KG, Tons, Pieces
   - **Location**: Storage area/warehouse
   - **Lifecycle Stage**: Current processing stage
   - **Inspection Notes**: Quality observations

### Inventory Features
- **Search & Filter**: By metal type, grade, status, location
- **Status Tracking**: Available, Reserved, Sold
- **Lifecycle Management**: Collection → Sorting → Cleaning → Melting → Distribution → Recycled
- **Quality Reports**: Attached inspection documents
- **Edit/Delete**: Modify existing records (Admin only)

### Inventory Workflow
1. **Collection**: Initial scrap intake and registration
2. **Sorting**: Categorization by metal type and grade
3. **Cleaning**: Preparation and contamination removal
4. **Melting**: Processing into refined materials
5. **Distribution**: Packaging for shipment
6. **Recycled**: Completed processing cycle

---

## Partner Management

### Partner Types
- **Supplier**: Provides scrap materials
- **Buyer**: Purchases processed materials
- **Both**: Acts as both supplier and buyer

### Adding Partners
1. Navigate to Partners section
2. Click "Add Partner"
3. Complete partner information:
   - Company Name
   - Contact Person
   - Email Address
   - Phone Number
   - Country
   - Address
   - Partner Type
   - Status (Active/Inactive)

### Partner Management Features
- **Search & Filter**: By type, status, location
- **Document Storage**: Contract attachments
- **Status Management**: Active/Inactive tracking
- **Edit/Delete**: Update partner information
- **Communication History**: Track interactions

---

## Deal Management

### Creating Deals
1. Go to Deals section
2. Click "Create Deal"
3. Select:
   - **Buyer**: From partner list
   - **Inventory Item**: Available stock
   - **Quantity**: Amount to sell
   - **Rate**: Price per unit
   - **Currency**: USD, EUR, etc.
   - **Payment Terms**: Conditions
   - **Special Instructions**: Additional notes

### Deal Statuses
- **Draft**: Initial creation
- **Confirmed**: Approved by buyer
- **In Progress**: Processing/shipping
- **Completed**: Finished transaction
- **Cancelled**: Terminated deal

### Deal Features
- **Document Attachment**: Contracts, invoices
- **Payment Tracking**: Link to financial records
- **Shipment Association**: Container assignments
- **Edit/Delete**: Modify deal terms
- **Status Updates**: Progress tracking

---

## Shipment Tracking

### Creating Shipments
1. Access Shipments section
2. Click "Create Shipment"
3. Enter details:
   - **Deal ID**: Associated transaction
   - **Container Number**: Shipping container
   - **Vessel Name**: Transport ship
   - **ETA**: Estimated arrival
   - **Status**: Current stage
   - **Tracking Notes**: Progress updates

### Shipment Statuses
- **Preparation**: Container loading
- **Pickup**: Collected from yard
- **Gate In**: Arrived at port
- **Sealed**: Ready for shipping
- **Dispatched**: In transit
- **Delivered**: Reached destination

### Tracking Features
- **Real-time Updates**: Status progression
- **ETA Management**: Delivery estimates
- **Notes System**: Progress documentation
- **Deal Integration**: Linked transactions
- **Edit Capability**: Update information

---

## Document Management

### Document Types
- **Invoice**: Commercial billing
- **Bill of Lading**: Shipping documentation
- **Certificate of Origin**: Product certification
- **Packing List**: Content documentation
- **Quality Certificate**: Inspection reports
- **Contract**: Agreement documents

### Document Workflow
1. **Upload**: Attach files to deals
2. **Review**: Admin/manager examination
3. **Approve/Reject**: Decision with comments
4. **Archive**: Completed document storage

### Document Features
- **File Upload**: PDF, images, documents
- **Status Tracking**: Pending, approved, rejected
- **Approval Workflow**: Multi-level authorization
- **Search & Filter**: By type, status, deal
- **Version Control**: Document revisions
- **Download**: File retrieval

---

## Finance & Payments

### Payment Types
- **TT (Telegraphic Transfer)**: Wire transfer
- **LC (Letter of Credit)**: Bank guarantee
- **Cash**: Direct payment

### Recording Payments
1. Navigate to Finance section
2. Click "Add Payment"
3. Enter details:
   - **Deal ID**: Associated transaction
   - **Payment Type**: TT/LC/Cash
   - **Amount**: Payment value
   - **GST**: Tax calculation (18%)
   - **Status**: Pending/Completed/Failed
   - **Reference**: Transaction ID
   - **Notes**: Additional information

### Financial Features
- **GST Calculation**: Automatic 18% tax
- **Payment Tracking**: Status monitoring
- **Deal Integration**: Transaction linking
- **Search & Filter**: By status, type, date
- **Financial Reports**: Payment summaries

---

## Quality Control

### Quality Check Parameters
- **Gross Weight**: Total material weight
- **Net Weight**: Pure material weight
- **Moisture Content**: Water percentage
- **Radiation Level**: Safety measurement
- **Purity Percentage**: Material quality
- **Test Results**: Detailed analysis
- **Weighbridge Data**: Official measurements
- **Inspection Images**: Visual documentation

### Creating Quality Checks
1. Access Quality Check section
2. Click "Add Quality Check"
3. Select deal or inventory item
4. Enter measurement data
5. Upload inspection images
6. Save quality record

### Quality Features
- **Multi-parameter Testing**: Comprehensive analysis
- **Image Documentation**: Visual evidence
- **Data Integration**: Link to deals/inventory
- **Historical Tracking**: Quality trends
- **Report Generation**: Quality certificates

---

## Scrap Lifecycle Management

### Lifecycle Stages
1. **Collection**: Initial scrap gathering
   - Source identification
   - Quality assessment
   - Weight recording
   - Barcode assignment

2. **Sorting**: Material categorization
   - Metal type separation
   - Grade classification
   - Contamination removal
   - Batch organization

3. **Cleaning**: Preparation process
   - Contamination removal
   - Surface preparation
   - Quality improvement
   - Batch verification

4. **Melting**: Processing stage
   - Temperature control
   - Purity refinement
   - Alloy creation
   - Quality testing

5. **Distribution**: Shipping preparation
   - Final packaging
   - Documentation
   - Loading preparation
   - Quality certification

6. **Recycled**: Completion tracking
   - Final disposition
   - Environmental compliance
   - Waste management
   - Cycle completion

### Lifecycle Management Features
- **Stage Tracking**: Progress monitoring
- **Barcode/QR Integration**: Automated identification
- **Batch Management**: Group processing
- **Quality Checkpoints**: Stage verification
- **Reporting**: Lifecycle analytics

---

## Reports & Analytics

### Available Reports
- **Inventory Reports**: Stock levels and trends
- **Financial Reports**: Revenue and payment analysis
- **Deal Reports**: Transaction summaries
- **Shipment Reports**: Logistics performance
- **Quality Reports**: Inspection data
- **Partner Reports**: Relationship analysis

### Report Features
- **Date Range Selection**: Custom periods
- **Export Options**: PDF, Excel formats
- **Visual Charts**: Graphical data representation
- **Filter Options**: Detailed data slicing
- **Scheduled Reports**: Automated generation

---

## Settings Configuration

### System Settings (Admin Only)
- **Company Information**: Business details
- **Default Values**: System defaults
- **Notification Preferences**: Alert settings
- **Integration Settings**: External systems
- **Security Settings**: Access controls

### Configurable Options
- **Currency Settings**: Default currency
- **Unit Preferences**: Measurement units
- **Workflow Settings**: Process configurations
- **Approval Levels**: Authorization hierarchy
- **Email Notifications**: Alert preferences

---

## User Management

### Creating Users (Admin Only)
1. Navigate to Users section
2. Click "Add User"
3. Enter user details:
   - Name
   - Email
   - Username
   - Role (Admin/Export Manager/Yard Staff)
   - Status (Active/Inactive)
4. System generates temporary password
5. User receives email with credentials

### User Management Features
- **Role Assignment**: Permission control
- **Status Management**: Active/inactive users
- **Password Reset**: Credential management
- **Activity Tracking**: Login monitoring
- **Search & Filter**: User organization

---

## Troubleshooting

### Common Issues

**Login Problems**
- Verify email and password
- Check account status (active/inactive)
- Clear browser cache
- Try different browser

**Permission Errors**
- Confirm user role and permissions
- Contact administrator for access
- Verify page availability for role

**Data Loading Issues**
- Check internet connection
- Refresh browser page
- Clear browser cache
- Contact system administrator

**Form Submission Errors**
- Verify required fields completed
- Check data format (numbers, emails)
- Ensure file size limits for uploads
- Refresh page and retry

### Support Contacts
- **System Administrator**: admin@scrapflow.com
- **Technical Support**: Contact your IT department
- **User Training**: Refer to this manual

### Best Practices
- **Regular Backups**: Export important data
- **Password Security**: Use strong passwords
- **Data Accuracy**: Verify information before saving
- **Regular Updates**: Keep browser updated
- **Training**: Review manual periodically

---

## System Specifications

### Technical Requirements
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Connection**: Broadband internet recommended
- **Screen**: Minimum 1024x768 resolution
- **JavaScript**: Must be enabled

### Data Security
- **SSL Encryption**: Secure data transmission
- **User Authentication**: Password-protected access
- **Role-based Permissions**: Controlled data access
- **Regular Backups**: Data protection
- **Audit Trails**: Activity logging

### Performance
- **Response Time**: < 3 seconds for standard operations
- **Uptime**: 99.9% availability target
- **Scalability**: Supports multiple concurrent users
- **Data Integrity**: Validated data entry

---

*This manual covers ScrapFlow version 1.0. For updates and additional features, please refer to system announcements and contact your administrator.*

**Last Updated**: June 22, 2025
**Version**: 1.0
**Support**: admin@scrapflow.com