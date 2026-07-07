"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, Save } from "lucide-react";

export default function VendorSettingsPage() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vendor Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure vendor system settings and policies
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Basic configuration for vendor system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-approve vendors</Label>
                <p className="text-sm text-gray-500">
                  Automatically approve new vendor registrations
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-approve products</Label>
                <p className="text-sm text-gray-500">
                  Automatically approve vendor product submissions
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable vendor applications</Label>
                <p className="text-sm text-gray-500">
                  Allow users to apply for vendor status
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Commission Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Settings</CardTitle>
            <CardDescription>
              Set default commission rates for vendors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Commission Rate (%)</Label>
              <Input type="number" placeholder="10" defaultValue="10" />
              <p className="text-xs text-gray-500">
                Platform commission percentage on vendor sales
              </p>
            </div>

            <div className="space-y-2">
              <Label>Minimum Profit Margin (%)</Label>
              <Input type="number" placeholder="5" defaultValue="5" />
              <p className="text-xs text-gray-500">
                Minimum profit margin required for vendor products
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Product Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Product Requirements</CardTitle>
            <CardDescription>
              Set requirements for vendor product listings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Minimum Images Required</Label>
              <Input type="number" placeholder="3" defaultValue="3" />
            </div>

            <div className="space-y-2">
              <Label>Minimum Description Length</Label>
              <Input type="number" placeholder="100" defaultValue="100" />
              <p className="text-xs text-gray-500">Characters</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require product categories</Label>
                <p className="text-sm text-gray-500">
                  Force vendors to select at least one category
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure notifications for vendor activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New vendor application</Label>
                <p className="text-sm text-gray-500">
                  Notify admins of new vendor applications
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New product submission</Label>
                <p className="text-sm text-gray-500">
                  Notify admins when vendors submit products
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Product approval confirmation</Label>
                <p className="text-sm text-gray-500">
                  Send email to vendors when products are approved
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
