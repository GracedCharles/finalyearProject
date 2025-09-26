import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { FinesManagement } from "@/components/fines-management"
import { PaymentProcessing } from "@/components/payment-processing"
import { ReportingDashboard } from "@/components/reporting-dashboard"
import { UserManagement } from "@/components/user-management"
import { useState } from "react"

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview")

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <DashboardOverview />
      case "users":
        return <UserManagement />
      case "fines":
        return <FinesManagement />
      case "payments":
        return <PaymentProcessing />
      case "reports":
        return <ReportingDashboard />
      case "settings":
        return <div className="p-6">System Settings - Coming Soon</div>
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      </div>
      <div className="flex flex-col flex-1 md:ml-64 w-full overflow-hidden">
        <AdminHeader activeSection={activeSection} />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}