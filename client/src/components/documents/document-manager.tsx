"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { DOCUMENT_TYPES, hasPermission } from "@/lib/permissions"
import { apiRequest } from "@/lib/queryClient"
import type { Deal, Document } from "@shared/schema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  FileX,
  Filter,
  Paperclip,
  Plus,
  Search,
  Shield,
  TrendingUp,
  Upload,
  XCircle,
} from "lucide-react"
import { useState } from "react"

interface DocumentUploadData {
  dealId: number
  documentType: string
  fileName: string
  filePath: string
  fileSize: number
}

export default function DocumentManager() {
  const [selectedDeal, setSelectedDeal] = useState<number | null>(null)
  const [uploadData, setUploadData] = useState<Partial<DocumentUploadData>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [viewDocumentDialogOpen, setViewDocumentDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [filters, setFilters] = useState({
    status: "",
    documentType: "",
    search: "",
  })

  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ["/api/deals"],
  })

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents"],
  })

  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      })
      if (!response.ok) throw new Error("Failed to upload document")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] })
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })
      setUploadDialogOpen(false)
      setUploadData({})
      setSelectedFile(null)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      })
    },
  })

  const approveDocumentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/documents/${id}/approve`, { approvedBy: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] })
      toast({
        title: "Success",
        description: "Document approved successfully",
      })
      setApprovalDialogOpen(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve document",
        variant: "destructive",
      })
    },
  })

  const rejectDocumentMutation = useMutation({
    mutationFn: (data: { id: number; reason: string }) =>
      apiRequest("PATCH", `/api/documents/${data.id}/reject`, {
        rejectedBy: user?.id,
        rejectionReason: data.reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] })
      toast({
        title: "Success",
        description: "Document rejected",
      })
      setApprovalDialogOpen(false)
      setRejectionReason("")
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject document",
        variant: "destructive",
      })
    },
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-amber-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: {
        gradient: "from-emerald-500 to-teal-600",
        bg: "from-emerald-50 to-teal-50",
        icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        gradient: "from-red-500 to-pink-600",
        bg: "from-red-50 to-pink-50",
        icon: XCircle,
        label: "Rejected",
      },
      pending: {
        gradient: "from-amber-500 to-orange-600",
        bg: "from-amber-50 to-orange-50",
        icon: Clock,
        label: "Pending",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const StatusIcon = config.icon

    return (
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r ${config.bg} border border-white/50`}
      >
        <StatusIcon className="w-3 h-3 mr-1.5 text-gray-600" />
        <span className={`text-xs font-semibold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
          {config.label}
        </span>
      </div>
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadData((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: file.size,
      }))
    }
  }

  const handleUpload = () => {
    if (!uploadData.dealId || !uploadData.documentType || !selectedFile) {
      toast({
        title: "Error",
        description: "Please select a deal, document type, and file",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("dealId", uploadData.dealId.toString())
    formData.append("documentType", uploadData.documentType)
    formData.append("uploadedBy", user?.id?.toString() || "")

    uploadDocumentMutation.mutate(formData)
  }

  const handleApprove = () => {
    if (selectedDocument) {
      approveDocumentMutation.mutate(selectedDocument.id)
    }
  }

  const handleReject = () => {
    if (selectedDocument && rejectionReason.trim()) {
      rejectDocumentMutation.mutate({
        id: selectedDocument.id,
        reason: rejectionReason,
      })
    }
  }

  const openDocumentViewer = (doc: Document) => {
    setSelectedDocument(doc)
    setViewDocumentDialogOpen(true)
  }

  const getFileExtension = (fileName: string) => {
    return fileName.split(".").pop()?.toLowerCase() || ""
  }

  const renderDocumentPreview = (doc: Document) => {
    const fileName = doc.file_name || doc.fileName
    const filePath = doc.file_path || doc.filePath
    const extension = getFileExtension(fileName)

    if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      return (
        <div className="flex justify-center p-4">
          <img
            src={filePath || "/placeholder.svg"}
            alt={fileName}
            className="max-w-full max-h-96 object-contain border rounded"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = "none"
              target.nextElementSibling!.classList.remove("hidden")
            }}
          />
          <div className="hidden text-center p-8 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <p>Image preview not available</p>
            <p className="text-sm">File: {fileName}</p>
          </div>
        </div>
      )
    } else if (extension === "pdf") {
      return (
        <div className="flex justify-center p-4">
          <iframe
            src={filePath}
            className="w-full h-96 border rounded"
            title={fileName}
            onError={(e) => {
              console.log("PDF preview error:", e)
            }}
          />
        </div>
      )
    } else {
      return (
        <div className="text-center p-8 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4" />
          <p>Preview not available for this file type</p>
          <p className="text-sm">File: {fileName}</p>
          <p className="text-xs">Type: {extension.toUpperCase()}</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => window.open(filePath, "_blank")}>
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          </div>
        </div>
      )
    }
  }

  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesStatus = !filters.status || filters.status === "all" || doc.status === filters.status
    const matchesType =
      !filters.documentType ||
      filters.documentType === "all" ||
      (doc.document_type || doc.documentType) === filters.documentType
    const matchesSearch =
      !filters.search ||
      (doc.file_name || doc.fileName).toLowerCase().includes(filters.search.toLowerCase()) ||
      (doc.document_type || doc.documentType).toLowerCase().includes(filters.search.toLowerCase())

    return matchesStatus && matchesType && matchesSearch
  })

  const canUploadDocuments = hasPermission(user?.role || "", "upload_documents")
  const canApproveDocuments = hasPermission(user?.role || "", "approve_deals")

  const totalDocuments = documents.length
  const pendingDocuments = documents.filter((d: Document) => d.status === "pending").length
  const approvedDocuments = documents.filter((d: Document) => d.status === "approved").length
  const rejectedDocuments = documents.filter((d: Document) => d.status === "rejected").length

  if (dealsLoading || documentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/10 to-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Document Management
                </h1>
                <p className="text-gray-600">Manage commercial documents for export/import deals</p>
              </div>
            </div>
            {canUploadDocuments && (
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-white/20">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Upload Document
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Upload a commercial document for a specific deal
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deal" className="text-sm font-semibold text-gray-700">
                        Deal
                      </Label>
                      <Select
                        value={uploadData.dealId?.toString() || ""}
                        onValueChange={(value) =>
                          setUploadData((prev) => ({ ...prev, dealId: Number.parseInt(value) }))
                        }
                      >
                        <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                          <SelectValue placeholder="Select deal" />
                        </SelectTrigger>
                        <SelectContent>
                          {deals.map((deal: Deal) => (
                            <SelectItem key={deal.id} value={deal.id.toString()}>
                              {deal.dealId} - ₹{deal.totalValue}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documentType" className="text-sm font-semibold text-gray-700">
                        Document Type
                      </Label>
                      <Select
                        value={uploadData.documentType || ""}
                        onValueChange={(value) => setUploadData((prev) => ({ ...prev, documentType: value }))}
                      >
                        <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
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

                    <div className="space-y-2">
                      <Label htmlFor="file" className="text-sm font-semibold text-gray-700">
                        File
                      </Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="bg-white/60 backdrop-blur-sm border-white/20"
                      />
                      {uploadData.fileName && (
                        <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200/50">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-medium text-indigo-700">{uploadData.fileName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleUpload}
                      disabled={uploadDocumentMutation.isPending}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      {uploadDocumentMutation.isPending ? "Uploading..." : "Upload"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{totalDocuments}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500 mr-1" />
                    <span className="text-sm text-indigo-600 font-medium">All files</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{pendingDocuments}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2" />
                    <span className="text-sm text-amber-600 font-medium">Awaiting approval</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{approvedDocuments}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                    <span className="text-sm text-emerald-600 font-medium">Verified</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{rejectedDocuments}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    <span className="text-sm text-red-600 font-medium">Needs revision</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-gray-100/50">
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Document Type</label>
                <Select
                  value={filters.documentType}
                  onValueChange={(value) => setFilters({ ...filters, documentType: value })}
                >
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 bg-white/60 backdrop-blur-sm border-white/20"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc: Document) => (
              <Card
                key={doc.id}
                className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{doc.file_name || doc.fileName}</h3>
                        <p className="text-sm font-medium text-gray-600">
                          {DOCUMENT_TYPES.find((t) => t.value === (doc.document_type || doc.documentType))?.label ||
                            doc.document_type ||
                            doc.documentType}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          Deal ID:{" "}
                          {deals.find((d: Deal) => d.id === (doc.deal_id || doc.dealId))?.dealId ||
                            doc.deal_id ||
                            doc.dealId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(doc.status)}
                        {getStatusBadge(doc.status)}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDocumentViewer(doc)}
                          className="hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-200 transition-all duration-300"
                        >
                          <Eye className="w-4 h-4 mr-1 text-indigo-600" />
                          View
                        </Button>
                        {canApproveDocuments && doc.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDocument(doc)
                              setApprovalDialogOpen(true)
                            }}
                            className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 hover:border-amber-200 transition-all duration-300"
                          >
                            <Shield className="w-4 h-4 mr-1 text-amber-600" />
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {doc.status === "rejected" && doc.rejectionReason && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-red-800">Rejection Reason:</p>
                          <p className="text-sm text-red-700 mt-1">{doc.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">No documents found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or upload a new document</p>
                {canUploadDocuments && (
                  <Button
                    onClick={() => setUploadDialogOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Document Viewer Dialog */}
        <Dialog open={viewDocumentDialogOpen} onOpenChange={setViewDocumentDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-white/20">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Document Viewer - {selectedDocument?.file_name || selectedDocument?.fileName}
                  </span>
                  <p className="text-sm text-gray-600 font-normal">
                    {
                      DOCUMENT_TYPES.find(
                        (t) => t.value === (selectedDocument?.document_type || selectedDocument?.documentType),
                      )?.label
                    }
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const filePath = selectedDocument?.file_path || selectedDocument?.filePath
                      if (filePath) {
                        window.open(filePath, "_blank")
                      }
                    }}
                    className="bg-white/60 backdrop-blur-sm border-white/20"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  {canApproveDocuments && selectedDocument?.status === "pending" && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                      onClick={() => {
                        setViewDocumentDialogOpen(false)
                        setApprovalDialogOpen(true)
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
                <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Deal ID</p>
                    <p className="text-sm font-medium text-gray-900">
                      {deals.find((d: Deal) => d.id === (selectedDocument.deal_id || selectedDocument.dealId))
                        ?.dealId ||
                        selectedDocument.deal_id ||
                        selectedDocument.dealId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Document Type</p>
                    <p className="text-sm font-medium text-gray-900">
                      {DOCUMENT_TYPES.find(
                        (t) => t.value === (selectedDocument.document_type || selectedDocument.documentType),
                      )?.label ||
                        selectedDocument.document_type ||
                        selectedDocument.documentType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">File Size</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedDocument.file_size || selectedDocument.fileSize
                        ? `${(((selectedDocument.file_size || selectedDocument.fileSize) as number) / 1024).toFixed(1)} KB`
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Status</p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedDocument.status)}
                      {getStatusBadge(selectedDocument.status)}
                    </div>
                  </div>
                </div>

                <div className="border rounded-xl bg-white shadow-lg">{renderDocumentPreview(selectedDocument)}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Document Approval Dialog */}
        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-white/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Review Document
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Make a decision on: {selectedDocument?.fileName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 rounded-xl">
                <p className="text-sm font-medium text-indigo-800">
                  <strong>Document:</strong> {selectedDocument?.file_name || selectedDocument?.fileName}
                </p>
                <p className="text-sm font-medium text-indigo-800">
                  <strong>Type:</strong>{" "}
                  {
                    DOCUMENT_TYPES.find(
                      (t) => t.value === (selectedDocument?.document_type || selectedDocument?.documentType),
                    )?.label
                  }
                </p>
                <p className="text-sm font-medium text-indigo-800">
                  <strong>Deal:</strong>{" "}
                  {deals.find((d: Deal) => d.id === (selectedDocument?.deal_id || selectedDocument?.dealId))?.dealId}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejectionReason" className="text-sm font-semibold text-gray-700">
                  Rejection Reason (required if rejecting)
                </Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter detailed reason for rejection..."
                  rows={3}
                  className="bg-white/60 backdrop-blur-sm border-white/20"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setApprovalDialogOpen(false)
                    setViewDocumentDialogOpen(true)
                  }}
                  className="bg-white/60 backdrop-blur-sm border-white/20"
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
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                <FileX className="w-4 h-4 mr-1" />
                {rejectDocumentMutation.isPending ? "Rejecting..." : "Reject"}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={approveDocumentMutation.isPending}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <FileCheck className="w-4 h-4 mr-1" />
                {approveDocumentMutation.isPending ? "Approving..." : "Approve"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
