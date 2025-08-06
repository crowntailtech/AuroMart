import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentOrders from "@/components/dashboard/recent-orders";
import QuickActions from "@/components/dashboard/quick-actions";
import WhatsAppNotifications from "@/components/whatsapp/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, TrendingUp, Users, Package } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized", 
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["api", "analytics", "stats"],
    enabled: !!user,
  });

  const { data: notifications } = useQuery({
    queryKey: ["api", "notifications"],
    enabled: !!user,
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen auromart-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 auromart-gradient-primary rounded-2xl flex items-center justify-center mr-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-welcome">
                Welcome back, {(user as User)?.firstName || (user as User)?.businessName}!
              </h1>
              <p className="text-gray-600" data-testid="text-role">
                {(user as User)?.role?.charAt(0).toUpperCase() + (user as User)?.role?.slice(1)} Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} isLoading={statsLoading} userRole={(user as User)?.role || 'retailer'} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <RecentOrders />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions userRole={(user as User)?.role || 'retailer'} />

            {/* WhatsApp Notifications */}
            <WhatsAppNotifications />

            {/* Performance Insights */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 auromart-gradient-accent rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Order Success Rate</span>
                    <span className="text-lg font-semibold text-green-600">98.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="text-lg font-semibold text-blue-600">2.3h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Customer Satisfaction</span>
                    <span className="text-lg font-semibold text-purple-600">4.8/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}
