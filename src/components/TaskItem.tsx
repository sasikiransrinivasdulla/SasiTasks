import { HTMLAttributes } from "react";
import { Check, Trash2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onToggle'> {
  task: {
    id: string;
    text: string;
    completed: boolean;
  };
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete, className, ...props }: TaskItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-border/80 hover:shadow-md cursor-pointer",
        task.completed && "opacity-75 bg-card/60",
        className
      )}
      onClick={() => onToggle(task.id)}
      {...props}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer hover:scale-110",
            task.completed
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/50 hover:border-primary/50 text-transparent"
          )}
        >
          <Check className="h-4 w-4" />
        </button>
        <span
          className={cn(
            "truncate text-sm font-medium transition-all duration-300",
            task.completed && "text-muted-foreground line-through decoration-muted-foreground/50"
          )}
        >
          {task.text}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
        className="shrink-0 p-2 text-muted-foreground opacity-0 transition-all duration-200 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:scale-110 focus:opacity-100 group-hover:opacity-100 rounded-md"
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
