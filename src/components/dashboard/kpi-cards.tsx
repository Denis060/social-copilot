"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Heart, MessageCircle, Share2, Eye, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPIs {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalReach: number;
  postsChange: number;
  likesChange: number;
  commentsChange: number;
  sharesChange: number;
  reachChange: number;
}

interface KpiCardsProps {
  kpis: KPIs;
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const cards = [
    {
      title: "Total Posts",
      value: kpis.totalPosts,
      change: kpis.postsChange,
      icon: FileText,
    },
    {
      title: "Total Likes",
      value: kpis.totalLikes,
      change: kpis.likesChange,
      icon: Heart,
    },
    {
      title: "Comments",
      value: kpis.totalComments,
      change: kpis.commentsChange,
      icon: MessageCircle,
    },
    {
      title: "Shares",
      value: kpis.totalShares,
      change: kpis.sharesChange,
      icon: Share2,
    },
    {
      title: "Reach",
      value: kpis.totalReach,
      change: kpis.reachChange,
      icon: Eye,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.change >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.value.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon
                  className={cn(
                    "size-3",
                    isPositive ? "text-green-500" : "text-red-500"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    isPositive ? "text-green-500" : "text-red-500"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {card.change}%
                </span>
                <span className="text-xs text-muted-foreground">
                  vs prev period
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
