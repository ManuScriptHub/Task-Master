
"use client";

import React from "react";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import { ArrowUp, ArrowRight, ArrowDown } from "lucide-react";

export function PriorityBadge({ priority, className }) {
  const priorityConfig = {
    high: { label: "High", color: "bg-red-100 text-red-700 border-red-300", icon: <ArrowUp className="h-3 w-3" /> },
    medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: <ArrowRight className="h-3 w-3" /> },
    low: { label: "Low", color: "bg-green-100 text-green-700 border-green-300", icon: <ArrowDown className="h-3 w-3" /> },
  };

  const config = priorityConfig[priority];

  if (!config) return null;

  return (
    <Badge variant="outline" className={cn("text-xs font-medium px-2 py-0.5 flex items-center gap-1", config.color, className)}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
