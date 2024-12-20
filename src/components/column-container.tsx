import { SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../icons/trash";
import { Column, Id, Task } from "../types";
import { CSS } from "@dnd-kit/utilities";
import { ChangeEvent, useState } from "react";
import PlusIcon from "../icons/plus";
import TaskCard from "./task-card";
import { handleSaveOnInputEnter } from "../utils";

type ColumnProps = {
  column: Column;
  deleteColumnCb?: (id: Id) => void;
  updateColumnCb?: (id: Id, value: string) => void;
  addTaskCb?: (id: Id) => void;
  deleteTaskCb?: (id: Id) => void;
  updateTaskCb?: (id: Id, value: string) => void;
  tasks: Task[];
};

const ColumnContainer = ({
  column,
  deleteColumnCb = () => null,
  updateColumnCb = () => null,
  addTaskCb = () => null,
  deleteTaskCb = () => null,
  updateTaskCb = () => null,
  tasks,
}: ColumnProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const taskIds = tasks.map((task) => task.id);

  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
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
        className="bg-column w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col border-2 border-rose-500 opacity-40"
        ref={setNodeRef}
        style={style}
      ></div>
    );
  }

  return (
    <div
      className="bg-column w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
      ref={setNodeRef}
      style={style}
    >
      <div
        className="bg-main flex justify-between items-center p-2 text-sm cursor-grab rounded-md rounded-b-none border border-zinc-700"
        {...attributes}
        {...listeners}
      >
        <div className="flex gap-2 items-center">
          <div className="bg-neutral-700 rounded-full flex justify-center items-center h-6 w-6 hover:bg-neutral-600">
            {tasks.length}
          </div>
          {isEditing ? (
            <input
              autoFocus
              value={column.title}
              onChange={handleInputChange}
              onBlur={() => setIsEditing(false)}
              className="bg-black focus-visible:border-rose-500 border rounded outline-none px-2"
              onKeyDown={(e) =>
                handleSaveOnInputEnter(e, () => setIsEditing(false))
              }
            />
          ) : (
            <span className="cursor-pointer" onClick={() => setIsEditing(true)}>
              {column.title}
            </span>
          )}
        </div>

        <button
          className="text-neutral-300 hover:text-red-500"
          onClick={() => deleteColumnCb(column.id)}
        >
          <TrashIcon />
        </button>
      </div>

      <div className="flex-grow flex flex-col gap-y-4 p-2 overflow-y-auto overflow-x-hidden">
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTaskCb={deleteTaskCb}
              updateTaskCb={updateTaskCb}
            />
          ))}
        </SortableContext>
      </div>

      <div>
        <button
          className="flex items-center gap-2 rounded-md p-4 hover:bg-zinc-900 hover:text-rose-500 active:bg-black w-full"
          onClick={addTaskHandler}
        >
          <PlusIcon />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    updateColumnCb(column.id, e.target.value);
  }

  function addTaskHandler() {
    addTaskCb(column.id);
  }
};

export default ColumnContainer;
