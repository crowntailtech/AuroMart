import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentOrders from "@/components/dashboard/recent-orders";
import QuickActions from "@/components/dashboard/quick-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-welcome">
            Welcome back, {(user as User)?.firstName || (user as User)?.businessName}!
          </h1>
          <p className="text-gray-600 mt-1" data-testid="text-role">
            {(user as User)?.role?.charAt(0).toUpperCase() + (user as User)?.role?.slice(1)} Dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} isLoading={statsLoading} userRole={(user as User)?.role || 'retailer'} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <RecentOrders userRole={(user as User)?.role || 'retailer'} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions userRole={(user as User)?.role || 'retailer'} />

            {/* WhatsApp Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 text-secondary mr-2" />
                  WhatsApp Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications && Array.isArray(notifications) && notifications.length > 0 ? (
                    notifications.slice(0, 3).map((notification: any, index: number) => (
                      <div key={notification.id} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-900" data-testid={`text-notification-${index}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No recent notifications</p>
                  )}
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
