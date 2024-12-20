import { ChangeEvent, useState } from "react";
import TrashIcon from "../icons/trash";
import { Id, Task } from "../types";
import { handleSaveOnTextAreaEnter } from "../utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type TaskCardProps = {
  task: Task;
  deleteTaskCb: (id: Id) => void;
  updateTaskCb: (id: Id, value: string) => void;
};

const TaskCard = ({ task, deleteTaskCb, updateTaskCb }: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: isEditing,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        className="bg-main p-2.5 flex items-center rounded-xl hover:ring-2 hover:ring-inset h-10 ring-2 ring-rose-500"
        ref={setNodeRef}
        style={style}
      ></div>
    );
  }

  return (
    <div
      className="bg-main p-2.5 flex items-center rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab group"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="flex-grow overflow-auto max-h-24 task-content-area">
        {isEditing ? (
          <textarea
            autoFocus
            className="bg-black focus-visible:border-rose-500 border rounded outline-none px-2 w-full"
            value={task.content}
            onChange={handleUpdate}
            onKeyDown={(e) =>
              handleSaveOnTextAreaEnter(e, () => setIsEditing(false))
            }
            onBlur={() => setIsEditing(false)}
          />
        ) : (
          <p
            className="text-sm whitespace-pre-wrap w-full h-full cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {task.content}
          </p>
        )}
      </div>

      <button
        className="hidden group-hover:block hover:text-red-500 text-xs"
        onClick={handleTrashClick}
      >
        <TrashIcon />
      </button>
    </div>
  );

  function handleTrashClick() {
    deleteTaskCb(task.id);
  }

  function handleUpdate(e: ChangeEvent<HTMLTextAreaElement>) {
    updateTaskCb(task.id, e.target.value);
  }
};

export default TaskCard;
