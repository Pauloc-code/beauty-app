import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeLabel?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "info" | "warning";
  loading?: boolean;
}

export default function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  variant = "default",
  loading = false
}: StatsCardProps) {
  const getIconColor = () => {
    switch (variant) {
      case "success":
        return "text-green-600 bg-green-100";
      case "info":
        return "text-blue-600 bg-blue-100";
      case "warning":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-primary bg-primary bg-opacity-10";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && changeLabel && (
              <div className="mt-4 flex items-center">
                <span className="text-green-600 text-sm font-medium">{change}</span>
                <span className="text-gray-600 text-sm ml-2">{changeLabel}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${getIconColor()}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
