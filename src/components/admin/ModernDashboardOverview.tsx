import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Coins,
  Eye,
  MessageSquare,
  Upload,
  Settings,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  LayoutGrid
} from "lucide-react";
import { Link } from "react-router-dom";

const statsCards = [
  {
    title: "Total Users",
    value: "2,847",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    description: "Active users this month",
    color: "text-blue-400"
  },
  {
    title: "Manga Series",
    value: "156",
    change: "+5",
    changeType: "positive" as const,
    icon: BookOpen,
    description: "Published series",
    color: "text-green-400"
  },
  {
    title: "Total Chapters",
    value: "3,924",
    change: "+247",
    changeType: "positive" as const,
    icon: FileText,
    description: "Chapters uploaded",
    color: "text-purple-400"
  },
  {
    title: "Revenue",
    value: "$12,847",
    change: "+23%",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "This month's earnings",
    color: "text-yellow-400"
  },
  {
    title: "Page Views",
    value: "89.4K",
    change: "+15%",
    changeType: "positive" as const,
    icon: Eye,
    description: "Monthly page views",
    color: "text-cyan-400"
  },
  {
    title: "Comments",
    value: "1,247",
    change: "-3%",
    changeType: "negative" as const,
    icon: MessageSquare,
    description: "User comments",
    color: "text-red-400"
  }
];

const quickActions = [
  { title: "Upload Chapter", path: "/admin/upload", icon: Upload, color: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" },
  { title: "Manage Series", path: "/admin/series", icon: BookOpen, color: "bg-green-500/10 text-green-400 hover:bg-green-500/20" },
  { title: "Customize Series Pages", path: "/admin/series-design", icon: LayoutGrid, color: "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20" },
  { title: "User Analytics", path: "/admin/user-analytics", icon: Users, color: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20" },
  { title: "Site Settings", path: "/admin/settings", icon: Settings, color: "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" },
];

const recentActivity = [
  { action: "New chapter uploaded", series: "Dragon Slayer Chronicles", time: "2 minutes ago", type: "upload" },
  { action: "User registered", user: "MangaLover123", time: "5 minutes ago", type: "user" },
  { action: "Comment posted", series: "Mystic Academy", time: "12 minutes ago", type: "comment" },
  { action: "Series published", series: "Space Pirates", time: "1 hour ago", type: "series" },
  { action: "Payment received", amount: "$9.99", time: "2 hours ago", type: "payment" },
];

const alerts = [
  { message: "Storage space is running low", type: "warning", action: "Manage Storage" },
  { message: "3 comments pending moderation", type: "info", action: "Review Comments" },
  { message: "Weekly backup completed successfully", type: "success", action: "View Logs" },
];

export const ModernDashboardOverview = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-slate-400">Welcome back! Here's what's happening with your manga platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">{stat.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="flex items-center gap-2 text-xs">
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  )}
                  <span className={stat.changeType === "positive" ? "text-green-400" : "text-red-400"}>
                    {stat.change}
                  </span>
                  <span className="text-slate-400">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-slate-400">
              Common admin tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.title}
                  asChild
                  variant="ghost"
                  className={`h-auto p-4 flex-col gap-2 ${action.color} transition-colors`}
                >
                  <Link to={action.path}>
                    <IconComponent className="h-6 w-6" />
                    <span className="text-sm font-medium">{action.title}</span>
                  </Link>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-slate-400">
              Latest system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{activity.action}</p>
                    <p className="text-xs text-slate-400">
                      {activity.series || activity.user || activity.amount} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <div className="flex items-center gap-3">
                  {alert.type === "warning" && <AlertCircle className="h-4 w-4 text-yellow-400" />}
                  {alert.type === "info" && <AlertCircle className="h-4 w-4 text-blue-400" />}
                  {alert.type === "success" && <CheckCircle className="h-4 w-4 text-green-400" />}
                  <span className="text-sm text-white">{alert.message}</span>
                </div>
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                  {alert.action}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};