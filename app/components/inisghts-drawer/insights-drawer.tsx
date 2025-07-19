"use client";

import * as React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChartIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type Range = "day" | "week" | "month" | "year";

// This chartConfig now correctly uses your theme's CSS variables
const chartConfig = {
  value: {
    label: "Sentiment",
    color: "hsl(var(--chart-1))",
  },
};

export default function InsightsDrawer() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [range, setRange] = React.useState<Range>("month");
  const { user } = useAuth();

  const fetchInsights = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `/api/insights/sentiment-over-time?range=${range}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (!response.ok) throw new Error("Failed to load insights data.");

      const chartData = await response.json();

      const adaptedData = chartData.map((item: any) => ({
        name: item.name,
        date: item.date,
        value: item["Sentiment Score"] ?? item["Average Sentiment"] ?? 0,
      }));
      setData(adaptedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, range]);

  React.useEffect(() => {
    if (isOpen) {
      fetchInsights();
    }
  }, [isOpen, fetchInsights]);

  const ChartComponent = () => {
    return (
      // The container now has a flexible height with a max height
      <ChartContainer config={chartConfig} className="h-full max-h-80 w-full">
        {range === "day" ? (
          <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              domain={[-1, 1]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="lightBlue" radius={4} />
          </BarChart>
        ) : (
          <AreaChart accessibilityLayer data={data} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              domain={[-1, 1]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="value"
              type="monotone"
              fill="lightBlue"
              stroke="var(--color-value)"
              strokeWidth={2}
            />
          </AreaChart>
        )}
      </ChartContainer>
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer">
          <BarChartIcon className="h-5 w-5" />
          <span className="sr-only">View Insights</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        {/* LAYOUT FIX: Flex column and height constraints on the main wrapper */}
        <div className="mx-auto w-full max-w-4xl flex flex-col h-full max-h-[90vh]">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>Your Sentiment Trends</DrawerTitle>
            <p className="text-sm text-muted-foreground">
              Track your emotional patterns over time
            </p>
          </DrawerHeader>

          {/* LAYOUT FIX: The main content area is now flexible */}
          <div className="p-4 pb-0 flex-1 min-h-0">
            <Card className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div>
                  <h3 className="font-semibold text-lg text-card-foreground">
                    {range === "day"
                      ? "Today's Note Sentiments"
                      : "Average Sentiment Over Time"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scores range from -1 (negative) to +1 (positive)
                  </p>
                </div>
                <Tabs
                  value={range}
                  onValueChange={(value) => setRange(value as Range)}
                  className="w-fit"
                >
                  <TabsList>
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="year">Year</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* LAYOUT FIX: Chart area is now flexible and centered */}
              <div className="flex-1 flex items-center justify-center min-h-0">
                {loading && (
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Loading sentiment data...
                    </p>
                  </div>
                )}

                {error && (
                  <div className="text-center">
                    <p className="text-destructive mb-2">⚠️ {error}</p>
                    <Button variant="outline" size="sm" onClick={fetchInsights}>
                      Try Again
                    </Button>
                  </div>
                )}

                {!loading && !error && data.length > 0 && <ChartComponent />}

                {!loading && !error && data.length === 0 && (
                  <div className="text-center">
                    <BarChartIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-2">
                      No sentiment data for this period
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Create more notes to see your patterns
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <DrawerFooter className="flex-shrink-0 mb-10">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
