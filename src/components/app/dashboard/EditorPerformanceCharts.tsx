
"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { isDelayed } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Editor, Project } from "@/lib/types";
import { sub, isAfter } from 'date-fns';

interface ChartData {
  name: string;
  done: number;
  inProgress: number;
  delayed: number;
}

type TimeRange = 'all' | 'week' | 'month' | 'year';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="font-bold">{label}</p>
        <p className="text-sm text-green-500">{`Done: ${payload.find((p:any) => p.dataKey === 'done')?.value}`}</p>
        <p className="text-sm text-yellow-500">{`In Progress: ${payload.find((p:any) => p.dataKey === 'inProgress')?.value}`}</p>
        <p className="text-sm text-red-500">{`Delayed: ${payload.find((p:any) => p.dataKey === 'delayed')?.value}`}</p>
      </div>
    );
  }
  return null;
};

const getPerformanceData = (editors: Editor[], projects: Project[], timeRange: TimeRange): ChartData[] => {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case 'week':
      startDate = sub(now, { weeks: 1 });
      break;
    case 'month':
      startDate = sub(now, { months: 1 });
      break;
    case 'year':
      startDate = sub(now, { years: 1 });
      break;
    case 'all':
    default:
      startDate = new Date(0); // A very old date to include all projects
      break;
  }

  const filteredProjects = projects.filter(p => p.completionDate && isAfter(new Date(p.completionDate), startDate));

  return editors.map(editor => {
    const editorProjects = filteredProjects.filter(p => p.editorId === editor.id);
    const done = editorProjects.filter(p => p.status === 'Done').length;
    
    // For "inProgress" and "delayed", we might want to show current state regardless of time filter
    // So we use the original projects list for these counts.
    const allEditorProjects = projects.filter(p => p.editorId === editor.id);
    const inProgress = allEditorProjects.filter(p => ['In Progress', 'Assigned'].includes(p.status)).length;
    const delayed = allEditorProjects.filter(p => isDelayed(p) && p.status !== 'Done').length;
    
    return {
      name: editor.name.split(' ')[0], // Use first name for brevity
      done,
      inProgress,
      delayed
    };
  });
};

export default function EditorPerformanceCharts() {
  const { editors, projects } = useData();
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const chartData = getPerformanceData(editors, projects, timeRange);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <CardTitle>Editor Workload</CardTitle>
          <CardDescription>Live overview of project distribution.</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "hsl(var(--accent))", opacity: 0.1 }}
              />
              <Bar dataKey="done" stackId="a" fill="hsl(var(--chart-2))" name="Done" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inProgress" stackId="a" fill="hsl(var(--chart-4))" name="In Progress" radius={[0, 0, 0, 0]}/>
              <Bar dataKey="delayed" stackId="a" fill="hsl(var(--chart-1))" name="Delayed" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
