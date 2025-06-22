"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/auth"
import { apiRequest } from "@/lib/queryClient"
import { zodResolver } from "@hookform/resolvers/zod"
import { insertPartnerSchema, type Partner } from "@shared/schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Building2, Mail, MapPin, Phone, User } from "lucide-react"
import React from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  partner: Partner | null
}

type FormData = z.infer<typeof insertPartnerSchema>

export default function EditPartnerModal({ open, onOpenChange, partner }: Props) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(insertPartnerSchema),
    defaultValues: {
      companyName: partner?.companyName || "",
      contactPerson: partner?.contactPerson || "",
      email: partner?.email || "",
      phone: partner?.phone || "",
      country: partner?.country || "",
      address: partner?.address || "",
      type: partner?.type || "supplier",
      status: partner?.status || "active",
      documents: partner?.documents || [],
    },
  })

  React.useEffect(() => {
    if (partner) {
      form.reset({
        companyName: partner.companyName,
        contactPerson: partner.contactPerson,
        email: partner.email,
        phone: partner.phone || "",
        country: partner.country,
        address: partner.address || "",
        type: partner.type,
        status: partner.status,
        documents: partner.documents,
      })
    }
  }, [partner, form])

  const mutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("PUT", `/api/partners/${partner?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] })
      toast({
        title: "Success",
        description: "Partner updated successfully",
      })
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update partner",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-medium text-sm">{getInitials(partner?.companyName || "")}</span>
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">Edit Partner</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">Update partner information</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          {/* Company Information */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Enter company name"
                    {...form.register("companyName")}
                    className={form.formState.errors.companyName ? "border-red-300" : ""}
                  />
                  {form.formState.errors.companyName && (
                    <p className="text-sm text-red-600">{form.formState.errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                    Country *
                  </Label>
                  <Select value={form.watch("country")} onValueChange={(value) => form.setValue("country", value)}>
                    <SelectTrigger className={form.formState.errors.country ? "border-red-300" : ""}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="China">China</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="Japan">Japan</SelectItem>
                      <SelectItem value="South Korea">South Korea</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Brazil">Brazil</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.country && (
                    <p className="text-sm text-red-600">{form.formState.errors.country.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                    Partner Type *
                  </Label>
                  <Select value={form.watch("type")} onValueChange={(value) => form.setValue("type", value as any)}>
                    <SelectTrigger className={form.formState.errors.type ? "border-red-300" : ""}>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.type && (
                    <p className="text-sm text-red-600">{form.formState.errors.type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && (
                    <p className="text-sm text-red-600">{form.formState.errors.status.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="text-sm font-medium text-gray-700">
                    Contact Person *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="contactPerson"
                      placeholder="Enter contact person name"
                      {...form.register("contactPerson")}
                      className={`pl-10 ${form.formState.errors.contactPerson ? "border-red-300" : ""}`}
                    />
                  </div>
                  {form.formState.errors.contactPerson && (
                    <p className="text-sm text-red-600">{form.formState.errors.contactPerson.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      {...form.register("email")}
                      className={`pl-10 ${form.formState.errors.email ? "border-red-300" : ""}`}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="phone" placeholder="Enter phone number" {...form.register("phone")} className="pl-10" />
                  </div>
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Full Address
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter company address"
                  {...form.register("address")}
                  rows={3}
                  className="resize-none"
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]"
            >
              {mutation.isPending ? "Updating..." : "Update Partner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
