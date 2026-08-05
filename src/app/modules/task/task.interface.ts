export interface ICreateTask {
  title: string;
  description?: string;
  assignedTo?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: Date;
}
