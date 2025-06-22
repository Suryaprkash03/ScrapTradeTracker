import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Settings as SettingsIcon, Save, Trash2 } from "lucide-react";
import type { Setting } from "@shared/schema";

interface SettingValue {
  [key: string]: any;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, SettingValue>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: systemSettings = [], isLoading } = useQuery({
    queryKey: ['/api/settings'],
  });

  const updateSettingMutation = useMutation({
    mutationFn: (data: { key: string; value: any; description?: string }) =>
      apiRequest("PUT", `/api/settings/${data.key}`, { 
        value: data.value, 
        description: data.description,
        updatedBy: user?.id 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    }
  });

  const deleteSettingMutation = useMutation({
    mutationFn: (key: string) =>
      apiRequest("DELETE", `/api/settings/${key}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Success",
        description: "Setting deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete setting",
        variant: "destructive",
      });
    }
  });

  const handleSettingUpdate = (key: string, value: any, description?: string) => {
    updateSettingMutation.mutate({ key, value, description });
  };

  const getSettingValue = (key: string, defaultValue: any = '') => {
    const setting = systemSettings.find((s: Setting) => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic application configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  defaultValue={getSettingValue('company_name', '')}
                  onBlur={(e) => handleSettingUpdate('company_name', e.target.value, 'Company name displayed in the application')}
                  placeholder="Enter company name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  defaultValue={getSettingValue('company_address', '')}
                  onBlur={(e) => handleSettingUpdate('company_address', e.target.value, 'Company address for documents and reports')}
                  placeholder="Enter company address"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Input
                  id="timezone"
                  defaultValue={getSettingValue('default_timezone', 'UTC')}
                  onBlur={(e) => handleSettingUpdate('default_timezone', e.target.value, 'Default timezone for the application')}
                  placeholder="UTC"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Input
                  id="currency"
                  defaultValue={getSettingValue('default_currency', 'USD')}
                  onBlur={(e) => handleSettingUpdate('default_currency', e.target.value, 'Default currency for transactions')}
                  placeholder="USD"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Configuration</CardTitle>
              <CardDescription>
                Business-specific settings and rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="gstRate">GST Rate (%)</Label>
                <Input
                  id="gstRate"
                  type="number"
                  step="0.01"
                  defaultValue={getSettingValue('gst_rate', 18)}
                  onBlur={(e) => handleSettingUpdate('gst_rate', parseFloat(e.target.value), 'GST rate for calculations')}
                  placeholder="18.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="minOrderValue">Minimum Order Value</Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  step="0.01"
                  defaultValue={getSettingValue('min_order_value', 0)}
                  onBlur={(e) => handleSettingUpdate('min_order_value', parseFloat(e.target.value), 'Minimum order value for deals')}
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxOrderValue">Maximum Order Value</Label>
                <Input
                  id="maxOrderValue"
                  type="number"
                  step="0.01"
                  defaultValue={getSettingValue('max_order_value', 1000000)}
                  onBlur={(e) => handleSettingUpdate('max_order_value', parseFloat(e.target.value), 'Maximum order value for deals')}
                  placeholder="1000000.00"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoApproval"
                  checked={getSettingValue('auto_approval_enabled', false)}
                  onCheckedChange={(checked) => handleSettingUpdate('auto_approval_enabled', checked, 'Enable automatic approval for small orders')}
                />
                <Label htmlFor="autoApproval">Enable Auto-approval for Small Orders</Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="autoApprovalLimit">Auto-approval Limit</Label>
                <Input
                  id="autoApprovalLimit"
                  type="number"
                  step="0.01"
                  defaultValue={getSettingValue('auto_approval_limit', 10000)}
                  onBlur={(e) => handleSettingUpdate('auto_approval_limit', parseFloat(e.target.value), 'Maximum value for auto-approval')}
                  placeholder="10000.00"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailNotifications"
                  checked={getSettingValue('email_notifications_enabled', true)}
                  onCheckedChange={(checked) => handleSettingUpdate('email_notifications_enabled', checked, 'Enable email notifications')}
                />
                <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smsNotifications"
                  checked={getSettingValue('sms_notifications_enabled', false)}
                  onCheckedChange={(checked) => handleSettingUpdate('sms_notifications_enabled', checked, 'Enable SMS notifications')}
                />
                <Label htmlFor="smsNotifications">Enable SMS Notifications</Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  defaultValue={getSettingValue('notification_email', '')}
                  onBlur={(e) => handleSettingUpdate('notification_email', e.target.value, 'Email address for system notifications')}
                  placeholder="admin@company.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="dealApprovalNotifications"
                  checked={getSettingValue('deal_approval_notifications', true)}
                  onCheckedChange={(checked) => handleSettingUpdate('deal_approval_notifications', checked, 'Notify on deal approval requests')}
                />
                <Label htmlFor="dealApprovalNotifications">Deal Approval Notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="inventoryAlerts"
                  checked={getSettingValue('inventory_alerts_enabled', true)}
                  onCheckedChange={(checked) => handleSettingUpdate('inventory_alerts_enabled', checked, 'Alert on low inventory levels')}
                />
                <Label htmlFor="inventoryAlerts">Low Inventory Alerts</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Security and access control configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  defaultValue={getSettingValue('session_timeout_minutes', 480)}
                  onBlur={(e) => handleSettingUpdate('session_timeout_minutes', parseInt(e.target.value), 'Session timeout in minutes')}
                  placeholder="480"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  defaultValue={getSettingValue('max_login_attempts', 5)}
                  onBlur={(e) => handleSettingUpdate('max_login_attempts', parseInt(e.target.value), 'Maximum login attempts before lockout')}
                  placeholder="5"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enforcePasswordPolicy"
                  checked={getSettingValue('enforce_password_policy', true)}
                  onCheckedChange={(checked) => handleSettingUpdate('enforce_password_policy', checked, 'Enforce strong password policy')}
                />
                <Label htmlFor="enforcePasswordPolicy">Enforce Strong Password Policy</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="twoFactorAuth"
                  checked={getSettingValue('two_factor_auth_enabled', false)}
                  onCheckedChange={(checked) => handleSettingUpdate('two_factor_auth_enabled', checked, 'Enable two-factor authentication')}
                />
                <Label htmlFor="twoFactorAuth">Enable Two-Factor Authentication</Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="passwordExpiryDays">Password Expiry (days)</Label>
                <Input
                  id="passwordExpiryDays"
                  type="number"
                  defaultValue={getSettingValue('password_expiry_days', 90)}
                  onBlur={(e) => handleSettingUpdate('password_expiry_days', parseInt(e.target.value), 'Password expiry period in days')}
                  placeholder="90"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* All Settings Overview */}
      <Card>
        <CardHeader>
          <CardTitle>All Settings</CardTitle>
          <CardDescription>
            View and manage all system settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemSettings.map((setting: Setting) => (
              <div key={setting.key} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h4 className="font-semibold">{setting.key}</h4>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated: {new Date(setting.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="px-2 py-1 bg-muted rounded text-sm">
                    {typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value)}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSettingMutation.mutate(setting.key)}
                    disabled={deleteSettingMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}