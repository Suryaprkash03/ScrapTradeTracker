import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChart3, Users, TrendingUp, Package, Download } from "lucide-react";
import { generateReport } from "@/lib/reportGenerator";
import { useToast } from "@/hooks/use-toast";

interface ReportGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReportGenerationModal({ open, onOpenChange }: ReportGenerationModalProps) {
  const [generating, setGenerating] = useState<string | null>(null);
  const { toast } = useToast();

  const reportTypes = [
    {
      id: 'inventory',
      title: 'Inventory Summary',
      description: 'Complete inventory breakdown by metal type, grade, and location',
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'financial',
      title: 'Financial Report', 
      description: 'Revenue analysis, deal values, and payment tracking',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'partners',
      title: 'Partner Analysis',
      description: 'Supplier and buyer relationships, geographic distribution',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'operations',
      title: 'Operations Report',
      description: 'Shipment tracking, delivery performance, and logistics',
      icon: BarChart3,
      color: 'bg-orange-100 text-orange-600',
    }
  ];

  const handleGenerateReport = async (reportType: string) => {
    setGenerating(reportType);
    try {
      await generateReport(reportType);
      toast({
        title: "Report Generated",
        description: `${reportTypes.find(r => r.id === reportType)?.title} has been downloaded successfully.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generate Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {reportTypes.map((report) => (
            <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${report.color}`}>
                    <report.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={generating === report.id}
                  className="w-full"
                  variant="outline"
                >
                  {generating === report.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Generate PDF
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Reports are generated in PDF format with detailed analytics and professional formatting. 
            Each report includes current data from your system and can be used for business analysis, 
            compliance, or sharing with stakeholders.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}