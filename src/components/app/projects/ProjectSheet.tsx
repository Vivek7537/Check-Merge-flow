
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
import { CalendarIcon, Trash2, Upload } from "lucide-react";
import { format } from "date-fns";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Project, ProjectStatuses, ProjectCategories } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRef } from "react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Project name must be at least 2 characters." }),
  telecallerName: z.string().min(1, { message: "Telecaller Name is required." }),
  deadline: z.date({ required_error: "A deadline is required." }),
  notes: z.string().optional(),
  imageUrl: z.string().min(1, { message: "An image is required." }),
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
  const { addProject, updateProject, deleteProject, editors } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!project;
  const canEdit = user.role === 'Team Leader' || (isEditMode && project.editorId === user.name) || !isEditMode;


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      telecallerName: project?.telecallerName || "",
      deadline: project ? new Date(project.deadline) : new Date(),
      notes: project?.notes || "",
      imageUrl: project?.imageUrl || "",
      imageHint: project?.imageHint || "random",
      editorId: project?.editorId || null,
      status: project?.status || "New",
      category: project?.category || "Personal",
      picturesEdited: project?.picturesEdited || 0,
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const projectData = {
          ...values,
          editorId: values.editorId === "unassigned" ? null : values.editorId,
          creationDate: project?.creationDate || new Date(),
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

  const handleDelete = () => {
    if (!project) return;
    try {
      deleteProject(project.id);
      toast({ title: "Project Deleted", description: `"${project.name}" has been deleted.` });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the project. Please try again.",
      });
    }
  };

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
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Image</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={!canEdit}
                      />
                      {field.value ? (
                         <div className="relative h-48 w-full rounded-md overflow-hidden group">
                           <Image src={field.value} alt="Project image preview" layout="fill" objectFit="cover" />
                           {canEdit && (
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                 <Upload className="mr-2 h-4 w-4" /> Change Image
                               </Button>
                             </div>
                           )}
                         </div>
                      ) : (
                        <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={!canEdit}>
                          <Upload className="mr-2 h-4 w-4" /> Upload Image
                        </Button>
                      )}
                    </div>
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
              name="telecallerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telecaller Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} disabled={!canEdit} />
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
            
            <FormField
              control={form.control}
              name="editorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Editor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "unassigned"} disabled={user.role !== 'Team Leader'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign an editor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {editors.map(editor => (
                        <SelectItem key={editor.id} value={editor.id}>{editor.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <Input type="number" placeholder="e.g., 250" {...field} onChange={e => field.onChange(+e.target.value)} disabled={!canEdit} />
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
            
            <SheetFooter className="sm:justify-between">
                <div>
                {isEditMode && user.role === 'Team Leader' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive" className="mr-auto">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Project
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the project "{project.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                )}
                </div>
                <div className="flex gap-2">
                    <SheetClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </SheetClose>
                    {canEdit && <Button type="submit">{isEditMode ? "Save Changes" : "Create Project"}</Button>}
                </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
