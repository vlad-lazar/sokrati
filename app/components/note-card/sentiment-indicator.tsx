"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SentimentIndicatorProps {
  score?: number;
  magnitude?: number;
}

const SentimentIndicator = ({ score, magnitude }: SentimentIndicatorProps) => {
  if (typeof score !== "number" || typeof magnitude !== "number") {
    return null;
  }

  const scorePercentage = ((score + 1) / 2) * 100;
  const CAPPED_MAX_MAGNITUDE = 5.0;
  const magnitudePercentage = Math.min(
    (magnitude / CAPPED_MAX_MAGNITUDE) * 100,
    100
  );

  const getSentimentData = (score: number) => {
    if (score > 0.25) {
      return {
        category: "Positive",
        color: "from-green-400 to-emerald-500",
        bgColor: "bg-green-50 dark:bg-green-950/20",
        borderColor: "border-green-200 dark:border-green-800",
        textColor: "text-green-700 dark:text-green-300",
        icon: TrendingUp,
        emoji: "😊",
      };
    } else if (score < -0.25) {
      return {
        category: "Negative",
        color: "from-red-400 to-rose-500",
        bgColor: "bg-red-50 dark:bg-red-950/20",
        borderColor: "border-red-200 dark:border-red-800",
        textColor: "text-red-700 dark:text-red-300",
        icon: TrendingDown,
        emoji: "😟",
      };
    } else {
      return {
        category: "Neutral",
        color: "from-gray-400 to-slate-500",
        bgColor: "bg-gray-50 dark:bg-gray-950/20",
        borderColor: "border-gray-200 dark:border-gray-800",
        textColor: "text-gray-700 dark:text-gray-300",
        icon: Minus,
        emoji: "😐",
      };
    }
  };

  const sentimentData = getSentimentData(score);
  const IconComponent = sentimentData.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${sentimentData.bgColor} ${sentimentData.borderColor} transition-all hover:shadow-sm cursor-help`}
          >
            <div className="flex items-center gap-1.5">
              <IconComponent className={`h-4 w-4 ${sentimentData.textColor}`} />
              <span className="text-sm font-medium">{sentimentData.emoji}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${sentimentData.color}`}
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>
              <div className="w-16 h-0.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-muted-foreground"
                  style={{ width: `${magnitudePercentage}%` }}
                />
              </div>
            </div>
            <span
              className={`text-xs font-medium ${sentimentData.textColor} min-w-[2rem] text-right`}
            >
              {score > 0 ? "+" : ""}
              {score.toFixed(2)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconComponent className={`h-4 w-4 ${sentimentData.textColor}`} />
              <span className="font-medium">
                {sentimentData.category} Sentiment
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="font-mono">{score.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span>Magnitude:</span>
                <span className="font-mono">{magnitude.toFixed(3)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Score indicates emotional leaning (-1 to +1). Magnitude
                indicates emotional strength (0 to ∞).
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SentimentIndicator;
