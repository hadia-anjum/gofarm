import AccountRequestsClient from "@/components/admin/AccountRequestsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Account Requests - Admin Panel",
  description: "Manage vendor account applications and approvals",
};

export default function AccountRequestsPage() {
  return <AccountRequestsClient />;
}
