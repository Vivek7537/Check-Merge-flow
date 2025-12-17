"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import EditorReport from '@/components/app/reports/EditorReport';
import { useRouter } from 'next/navigation';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function ReportsPage() {
  const { user } = useAuth();
  const { editors } = useData();
  const router = useRouter();

  const [selectedEditorId, setSelectedEditorId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  if (user.role !== 'Team Leader') {
    // Or a proper "Unauthorized" component
    if (typeof window !== "undefined") {
        router.push('/dashboard');
    }
    return null;
  }

  return (
    <div className="space-y-6">
       <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Monthly Editor Reports</h1>
        <p className="text-muted-foreground">
          Analyze editor performance month by month.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Filter Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
                <label className="text-sm font-medium">Editor</label>
                <Select onValueChange={setSelectedEditorId} value={selectedEditorId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Editor" />
                    </SelectTrigger>
                    <SelectContent>
                        {editors.map(editor => (
                            <SelectItem key={editor.id} value={editor.id}>{editor.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                 <label className="text-sm font-medium">Month</label>
                <Select onValueChange={(v) => setSelectedMonth(Number(v))} value={String(selectedMonth)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((month, index) => (
                            <SelectItem key={index} value={String(index)}>{month}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select onValueChange={(v) => setSelectedYear(Number(v))} value={String(selectedYear)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map(year => (
                            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedEditorId && (
        <EditorReport 
          editorId={selectedEditorId} 
          month={selectedMonth} 
          year={selectedYear} 
        />
      )}
    </div>
  );
}
