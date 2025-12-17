"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Project, ProjectStatuses, ProjectCategories } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(2, { message: "Project name must be at least 2 characters." }),
  idCaller: z.string().min(1, { message: "ID Caller is required." }),
  deadline: z.date({ required_error: "A deadline is required." }),
  notes: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }),
  imageHint: z.string().optional(),
  editorId: z.string().nullable(),
  status: z.enum(ProjectStatuses),
  category: z.enum(ProjectCategories),
  picturesEdited: z.coerce.number().int().min(0).optional(),
});

type ProjectSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
};

export function ProjectSheet({ open, onOpenChange, project }: ProjectSheetProps) {
  const { addProject, updateProject, editors } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  const isEditMode = !!project;
  const canEdit = user.role === 'Team Leader' || (user.role === 'Editor' && (project?.editorId === user.name || !project));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      idCaller: project?.idCaller || "",
      deadline: project ? new Date(project.deadline) : new Date(),
      notes: project?.notes || "",
      imageUrl: project?.imageUrl || "https://picsum.photos/seed/11/600/400",
      imageHint: project?.imageHint || "random",
      editorId: project?.editorId || null,
      status: project?.status || "New",
      category: project?.category || "Personal",
      picturesEdited: project?.picturesEdited || 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const projectData = {
          ...values,
          assignDate: values.editorId ? (project?.assignDate || new Date()) : null,
          completionDate: values.status === 'Done' ? (project?.completionDate || new Date()) : null,
        }

        if (isEditMode) {
            updateProject(project.id, projectData);
            toast({ title: "Project Updated", description: `"${values.name}" has been successfully updated.` });
        } else {
            addProject(projectData);
            toast({ title: "Project Created", description: `"${values.name}" has been successfully created.` });
        }
        form.reset();
        onOpenChange(false);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Something went wrong",
            description: "Could not save the project. Please try again.",
        });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? "Edit Project" : "Add New Project"}</SheetTitle>
          <SheetDescription>
            {isEditMode ? `Editing project ID: ${project.id}` : "Fill in the details for the new project."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            <div className="relative h-48 w-full rounded-md overflow-hidden">
                <Image src={form.watch('imageUrl')} alt="Project image preview" layout="fill" objectFit="cover" data-ai-hint={form.watch('imageHint')} />
            </div>
             <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://picsum.photos/seed/1/600/400" {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Summer Wedding Photoshoot" {...field} disabled={!canEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="idCaller"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Caller</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CLIENT-XYZ" {...field} disabled={!canEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!canEdit}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ProjectStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!canEdit}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ProjectCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {user.role === 'Team Leader' && (
              <FormField
                control={form.control}
                name="editorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Editor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""} disabled={!canEdit}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign an editor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {editors.map(editor => (
                          <SelectItem key={editor.id} value={editor.id}>{editor.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={!canEdit}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01") || !canEdit}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="picturesEdited"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pictures Edited</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 250" {...field} disabled={!canEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any relevant notes for the project..." {...field} disabled={!canEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                {canEdit && <Button type="submit">{isEditMode ? "Save Changes" : "Create Project"}</Button>}
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
