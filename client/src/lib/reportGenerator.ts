import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  title: string;
  generatedAt: string;
  data: any;
}

export class ReportGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  private addHeader(title: string) {
    // Add company logo area (placeholder)
    this.doc.setFillColor(41, 128, 185);
    this.doc.rect(15, 15, 180, 25, 'F');
    
    // Company name
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ScrapFlow Export System', 20, 32);
    
    // Report title
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, 15, 55);
    
    // Generation date
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const date = new Date().toLocaleString();
    this.doc.text(`Generated on: ${date}`, 15, 65);
    
    return 75; // Return next Y position
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(128, 128, 128);
      this.doc.text(
        `Page ${i} of ${pageCount} | ScrapFlow Export System | Confidential`,
        15,
        285
      );
    }
  }

  generateInventoryReport(data: ReportData): void {
    let yPos = this.addHeader(data.title);
    
    // Summary statistics
    yPos += 10;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Summary', 15, yPos);
    
    yPos += 10;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Total Items: ${data.data.totalItems}`, 15, yPos);
    yPos += 6;
    this.doc.text(`Total Quantity: ${data.data.totalQuantity.toFixed(2)} KG`, 15, yPos);
    
    // Metal type breakdown
    yPos += 15;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Inventory by Metal Type', 15, yPos);
    
    const metalTypeData = Object.entries(data.data.byMetalType).map(([type, quantity]) => [
      type,
      `${(quantity as number).toFixed(2)} KG`
    ]);
    
    autoTable(this.doc, {
      startY: yPos + 5,
      head: [['Metal Type', 'Quantity']],
      body: metalTypeData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Detailed inventory table
    yPos = (this.doc as any).lastAutoTable.finalY + 15;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Detailed Inventory', 15, yPos);
    
    const inventoryData = data.data.items.map((item: any) => [
      item.itemId,
      item.metalType,
      item.grade,
      `${parseFloat(item.quantity).toFixed(2)} ${item.unit}`,
      item.status,
      item.location || 'N/A'
    ]);
    
    autoTable(this.doc, {
      startY: yPos + 5,
      head: [['Item ID', 'Metal Type', 'Grade', 'Quantity', 'Status', 'Location']],
      body: inventoryData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 }
    });
    
    this.addFooter();
  }

  generateFinancialReport(data: ReportData): void {
    let yPos = this.addHeader(data.title);
    
    // Financial summary
    yPos += 10;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Financial Summary', 15, yPos);
    
    yPos += 15;
    const summaryData = [
      ['Total Revenue', `₹${data.data.totalRevenue.toLocaleString()}`],
      ['Completed Revenue', `₹${data.data.completedRevenue.toLocaleString()}`],
      ['Pending Revenue', `₹${data.data.pendingRevenue.toLocaleString()}`],
      ['Total Deals', data.data.totalDeals.toString()],
      ['Completed Deals', data.data.completedDeals.toString()],
      ['Average Deal Value', `₹${data.data.avgDealValue.toLocaleString()}`]
    ];
    
    autoTable(this.doc, {
      startY: yPos,
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10 }
    });
    
    // Deals breakdown
    yPos = (this.doc as any).lastAutoTable.finalY + 15;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Deal Breakdown', 15, yPos);
    
    const dealsData = data.data.deals.map((deal: any) => [
      deal.dealId,
      `₹${parseFloat(deal.totalValue).toLocaleString()}`,
      deal.status,
      deal.currency,
      new Date(deal.createdAt).toLocaleDateString()
    ]);
    
    autoTable(this.doc, {
      startY: yPos + 5,
      head: [['Deal ID', 'Value', 'Status', 'Currency', 'Date']],
      body: dealsData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 }
    });
    
    this.addFooter();
  }

  generatePartnerReport(data: ReportData): void {
    let yPos = this.addHeader(data.title);
    
    // Partner summary
    yPos += 10;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Partner Summary', 15, yPos);
    
    yPos += 15;
    const summaryData = [
      ['Total Partners', data.data.totalPartners.toString()],
      ['Active Partners', data.data.activePartners.toString()],
      ['Suppliers', data.data.suppliers.toString()],
      ['Buyers', data.data.buyers.toString()]
    ];
    
    autoTable(this.doc, {
      startY: yPos,
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10 }
    });
    
    // Geographic distribution
    yPos = (this.doc as any).lastAutoTable.finalY + 15;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Geographic Distribution', 15, yPos);
    
    const countryData = Object.entries(data.data.byCountry).map(([country, count]) => [
      country,
      count.toString()
    ]);
    
    autoTable(this.doc, {
      startY: yPos + 5,
      head: [['Country', 'Partners']],
      body: countryData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Detailed partner list
    yPos = (this.doc as any).lastAutoTable.finalY + 15;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Partner Details', 15, yPos);
    
    const partnerData = data.data.partners.map((partner: any) => [
      partner.companyName,
      partner.type,
      partner.country,
      partner.contactPerson,
      partner.status
    ]);
    
    autoTable(this.doc, {
      startY: yPos + 5,
      head: [['Company', 'Type', 'Country', 'Contact', 'Status']],
      body: partnerData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 }
    });
    
    this.addFooter();
  }

  generateOperationsReport(data: ReportData): void {
    let yPos = this.addHeader(data.title);
    
    // Operations summary
    yPos += 10;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Operations Summary', 15, yPos);
    
    yPos += 15;
    const summaryData = [
      ['Total Shipments', data.data.totalShipments.toString()],
      ['Active Shipments', data.data.activeShipments.toString()],
      ['Completed Shipments', data.data.completedShipments.toString()],
      ['On-time Deliveries', `${data.data.onTimeDeliveries}/${data.data.totalShipments}`]
    ];
    
    autoTable(this.doc, {
      startY: yPos,
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 10 }
    });
    
    this.addFooter();
  }

  download(filename: string): void {
    this.doc.save(filename);
  }
}

export async function generateReport(type: string): Promise<void> {
  try {
    // Fetch report data from API
    const response = await fetch(`/api/reports/${type}`);
    if (!response.ok) {
      throw new Error('Failed to fetch report data');
    }
    
    const reportData = await response.json();
    const generator = new ReportGenerator();
    
    switch (type) {
      case 'inventory':
        generator.generateInventoryReport(reportData);
        generator.download(`inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
        break;
      case 'financial':
        generator.generateFinancialReport(reportData);
        generator.download(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
        break;
      case 'partners':
        generator.generatePartnerReport(reportData);
        generator.download(`partner-report-${new Date().toISOString().split('T')[0]}.pdf`);
        break;
      case 'operations':
        generator.generateOperationsReport(reportData);
        generator.download(`operations-report-${new Date().toISOString().split('T')[0]}.pdf`);
        break;
      default:
        throw new Error('Invalid report type');
    }
  } catch (error) {
    console.error('Report generation failed:', error);
    alert('Failed to generate report. Please try again.');
  }
}