export type UserRole = "Team Leader" | "Editor";

export type User = {
  isAuthenticated: boolean;
  role: UserRole | null;
  name: string | null;
};

export const ProjectStatuses = [
  "New",
  "Assigned",
  "In Progress",
  "Done",
  "Pending by Customer",
] as const;
export type ProjectStatus = (typeof ProjectStatuses)[number];

export const ProjectCategories = [
  "Wedding",
  "Corporate",
  "Real Estate",
  "Product",
  "Event",
  "Personal",
] as const;
export type ProjectCategory = (typeof ProjectCategories)[number];

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  editorId: string | null;
  assignDate: Date | null;
  deadline: Date;
  completionDate: Date | null;
  notes: string;
  idCaller: string;
  imageUrl: string;
  imageHint: string;
  category: ProjectCategory;
  picturesEdited?: number;
}

export interface Editor {
  id: string;
  name: string;
  rating: number;
}
