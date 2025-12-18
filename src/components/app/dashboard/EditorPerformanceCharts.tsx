
"use client";

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
import { Editor, Project } from "@/lib/types";

interface ChartData {
  name: string;
  done: number;
  inProgress: number;
  delayed: number;
}

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

const getPerformanceData = (editors: Editor[], projects: Project[]): ChartData[] => {
  return editors.map(editor => {
    const editorProjects = projects.filter(p => p.editorId === editor.id);
    const done = editorProjects.filter(p => p.status === 'Done').length;
    const inProgress = editorProjects.filter(p => p.status === 'In Progress' || p.status === 'Assigned').length;
    const delayed = editorProjects.filter(p => isDelayed(p) && p.status !== 'Done').length;
    
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
  const chartData = getPerformanceData(editors, projects);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor Workload</CardTitle>
        <CardDescription>Live overview of project distribution.</CardDescription>
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
