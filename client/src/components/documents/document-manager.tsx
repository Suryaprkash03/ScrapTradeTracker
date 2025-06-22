import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { hasPermission, DOCUMENT_TYPES } from "@/lib/permissions";
import { FileText, Upload, CheckCircle, XCircle, Clock, Eye, Download } from "lucide-react";
import type { Document, Deal } from "@shared/schema";

interface DocumentUploadData {
  dealId: number;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize: number;
}

export default function DocumentManager() {
  const [selectedDeal, setSelectedDeal] = useState<number | null>(null);
  const [uploadData, setUploadData] = useState<Partial<DocumentUploadData>>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [viewDocumentDialogOpen, setViewDocumentDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['/api/deals'],
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['/api/documents'],
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: (data: DocumentUploadData) =>
      apiRequest("POST", "/api/documents", { ...data, uploadedBy: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      setUploadDialogOpen(false);
      setUploadData({});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    }
  });

  const approveDocumentMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("PATCH", `/api/documents/${id}/approve`, { approvedBy: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Success",
        description: "Document approved successfully",
      });
      setApprovalDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve document",
        variant: "destructive",
      });
    }
  });

  const rejectDocumentMutation = useMutation({
    mutationFn: (data: { id: number; reason: string }) =>
      apiRequest("PATCH", `/api/documents/${data.id}/reject`, { 
        rejectedBy: user?.id, 
        rejectionReason: data.reason 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Success",
        description: "Document rejected",
      });
      setApprovalDialogOpen(false);
      setRejectionReason("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject document",
        variant: "destructive",
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real application, you would upload the file to a storage service
      // For this demo, we'll simulate the file path
      const filePath = `/uploads/documents/${Date.now()}_${file.name}`;
      setUploadData(prev => ({
        ...prev,
        fileName: file.name,
        filePath,
        fileSize: file.size
      }));
    }
  };

  const handleUpload = () => {
    if (!uploadData.dealId || !uploadData.documentType || !uploadData.fileName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    uploadDocumentMutation.mutate(uploadData as DocumentUploadData);
  };

  const handleApprove = () => {
    if (selectedDocument) {
      approveDocumentMutation.mutate(selectedDocument.id);
    }
  };

  const handleReject = () => {
    if (selectedDocument && rejectionReason.trim()) {
      rejectDocumentMutation.mutate({
        id: selectedDocument.id,
        reason: rejectionReason
      });
    }
  };

  const openDocumentViewer = (doc: Document) => {
    setSelectedDocument(doc);
    setViewDocumentDialogOpen(true);
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const renderDocumentPreview = (doc: Document) => {
    const fileName = doc.file_name || doc.fileName;
    const filePath = doc.file_path || doc.filePath;
    const extension = getFileExtension(fileName);
    
    // For demo purposes, show document information instead of trying to load non-existent files
    return (
      <div className="text-center p-8 bg-gray-50">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <div className="space-y-2">
          <p className="font-medium text-gray-800">Document Preview</p>
          <p className="text-sm text-gray-600">File: {fileName}</p>
          <p className="text-xs text-gray-500">Type: {extension.toUpperCase()}</p>
          <p className="text-xs text-gray-500">Path: {filePath}</p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              This is a sample document entry. In a production environment, this would display the actual uploaded document content.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const canUploadDocuments = hasPermission(user?.role || '', 'upload_documents');
  const canApproveDocuments = hasPermission(user?.role || '', 'approve_deals');

  if (dealsLoading || documentsLoading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground">
            Manage commercial documents for export/import deals
          </p>
        </div>
        {canUploadDocuments && (
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a commercial document for a specific deal
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="deal">Deal</Label>
                  <Select
                    value={uploadData.dealId?.toString() || ''}
                    onValueChange={(value) => setUploadData(prev => ({ ...prev, dealId: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select deal" />
                    </SelectTrigger>
                    <SelectContent>
                      {deals.map((deal: Deal) => (
                        <SelectItem key={deal.id} value={deal.id.toString()}>
                          {deal.dealId} - {deal.totalValue} {deal.currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select
                    value={uploadData.documentType || ''}
                    onValueChange={(value) => setUploadData(prev => ({ ...prev, documentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {uploadData.fileName && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {uploadData.fileName}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleUpload}
                  disabled={uploadDocumentMutation.isPending}
                >
                  {uploadDocumentMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {documents.map((doc: Document) => (
          <Card key={doc.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{doc.file_name || doc.fileName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {DOCUMENT_TYPES.find(t => t.value === (doc.document_type || doc.documentType))?.label || (doc.document_type || doc.documentType)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Deal ID: {deals.find((d: Deal) => d.id === (doc.deal_id || doc.dealId))?.dealId || (doc.deal_id || doc.dealId)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(doc.status)}
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDocumentViewer(doc)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {canApproveDocuments && doc.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setApprovalDialogOpen(true);
                        }}
                      >
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {doc.status === 'rejected' && doc.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Rejection Reason:</strong> {doc.rejectionReason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Document Viewer Dialog */}
      <Dialog open={viewDocumentDialogOpen} onOpenChange={setViewDocumentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                <span>Document Viewer - {selectedDocument?.file_name || selectedDocument?.fileName}</span>
                <p className="text-sm text-muted-foreground font-normal">
                  {DOCUMENT_TYPES.find(t => t.value === (selectedDocument?.document_type || selectedDocument?.documentType))?.label}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const filePath = selectedDocument?.file_path || selectedDocument?.filePath;
                    if (filePath) {
                      window.open(filePath, '_blank');
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                {canApproveDocuments && selectedDocument?.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setViewDocumentDialogOpen(false);
                      setApprovalDialogOpen(true);
                    }}
                  >
                    Review & Approve
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">Deal ID</p>
                  <p className="text-sm text-gray-600">
                    {deals.find((d: Deal) => d.id === (selectedDocument.deal_id || selectedDocument.dealId))?.dealId || (selectedDocument.deal_id || selectedDocument.dealId)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Document Type</p>
                  <p className="text-sm text-gray-600">
                    {DOCUMENT_TYPES.find(t => t.value === (selectedDocument.document_type || selectedDocument.documentType))?.label || (selectedDocument.document_type || selectedDocument.documentType)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">File Size</p>
                  <p className="text-sm text-gray-600">
                    {(selectedDocument.file_size || selectedDocument.fileSize) ? `${((selectedDocument.file_size || selectedDocument.fileSize) / 1024).toFixed(1)} KB` : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedDocument.status)}
                    <Badge className={getStatusColor(selectedDocument.status)}>
                      {selectedDocument.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg">
                {renderDocumentPreview(selectedDocument)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
            <DialogDescription>
              Make a decision on: {selectedDocument?.fileName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Document:</strong> {selectedDocument?.file_name || selectedDocument?.fileName}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Type:</strong> {DOCUMENT_TYPES.find(t => t.value === (selectedDocument?.document_type || selectedDocument?.documentType))?.label}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Deal:</strong> {deals.find((d: Deal) => d.id === (selectedDocument?.deal_id || selectedDocument?.dealId))?.dealId}
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="rejectionReason">Rejection Reason (required if rejecting)</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter detailed reason for rejection..."
                rows={3}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setApprovalDialogOpen(false);
                  setViewDocumentDialogOpen(true);
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                View Document Again
              </Button>
            </div>
          </div>
          <DialogFooter className="space-x-2">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectDocumentMutation.isPending || !rejectionReason.trim()}
            >
              {rejectDocumentMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveDocumentMutation.isPending}
            >
              {approveDocumentMutation.isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}