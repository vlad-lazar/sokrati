"use client";

import { Brain, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SentimentDisplayProps {
  score?: number;
  magnitude?: number;
  compact?: boolean;
}

const SentimentDisplay = ({
  score,
  magnitude,
  compact = false,
}: SentimentDisplayProps) => {
  if (typeof score !== "number" || typeof magnitude !== "number") {
    return null;
  }

  const getSentimentData = (score: number) => {
    if (score > 0.25) {
      return {
        label: "Positive",
        color: "from-green-400 to-emerald-500",
        bgColor: "bg-green-50 dark:bg-green-950/20",
        textColor: "text-green-700 dark:text-green-300",
        icon: TrendingUp,
        emoji: "😊",
      };
    }
    if (score < -0.25) {
      return {
        label: "Negative",
        color: "from-red-400 to-rose-500",
        bgColor: "bg-red-50 dark:bg-red-950/20",
        textColor: "text-red-700 dark:text-red-300",
        icon: TrendingDown,
        emoji: "😟",
      };
    }
    return {
      label: "Neutral",
      color: "from-gray-400 to-slate-500",
      bgColor: "bg-gray-50 dark:bg-gray-950/20",
      textColor: "text-gray-700 dark:text-gray-300",
      icon: Minus,
      emoji: "😐",
    };
  };

  const sentimentData = getSentimentData(score);
  const Icon = sentimentData.icon;

  // Calculate percentage for the progress bar (normalize score from -1 to 1 to 0 to 100)
  const scorePercentage = ((score + 1) / 2) * 100;

  // Calculate magnitude intensity (0 to 1 becomes 0 to 100)
  const magnitudePercentage = Math.min(magnitude * 100, 100);

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-help ${sentimentData.bgColor} ${sentimentData.textColor}`}
            >
              <Icon className="h-3 w-3" />
              <span>{sentimentData.emoji}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">{sentimentData.label}</p>
              <p className="text-xs">Score: {score.toFixed(2)}</p>
              <p className="text-xs">Magnitude: {magnitude.toFixed(2)}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`p-3 cursor-help ${sentimentData.bgColor} border-l-4 border-l-current ${sentimentData.textColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="text-sm font-medium">AI Sentiment</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon className="h-4 w-4" />
                <span className="text-lg">{sentimentData.emoji}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Sentiment: {sentimentData.label}</span>
                  <span>{score.toFixed(2)}</span>
                </div>
                <div className="w-full bg-white/50 dark:bg-black/20 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${sentimentData.color} transition-all duration-300`}
                    style={{ width: `${scorePercentage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Intensity</span>
                  <span>{magnitude.toFixed(2)}</span>
                </div>
                <div className="w-full bg-white/50 dark:bg-black/20 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${sentimentData.color} transition-all duration-300`}
                    style={{ width: `${magnitudePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${sentimentData.textColor}`} />
              <span className="font-medium">
                {sentimentData.label} Sentiment
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="font-mono">{score.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span className="font-mono">{magnitude.toFixed(3)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Score ranges from -1 (very negative) to +1 (very positive).
                Confidence indicates how certain the AI is about the sentiment.
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SentimentDisplay;
