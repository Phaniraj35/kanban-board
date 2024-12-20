import { useState } from "react";
import PlusIcon from "../icons/plus";
import { Column, Id, Task } from "../types";
import { generateId } from "../utils";
import ColumnContainer from "./column-container";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./task-card";

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const columnIds = columns.map((column) => column.id);
  const activeColumnTasks = tasks.filter(
    (task) => task.columnId === activeColumn?.id
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // drag starts after dragged for distance of 3px
      },
    })
  );

  return (
    <div className="m-auto flex h-full items-center overflow-x-auto overflow-y-hidden px-10">
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        sensors={sensors}
      >
        <div className="m-auto flex gap-4 items-center">
          <SortableContext items={columnIds}>
            <div className="flex gap-4">
              {columns.map((column) => (
                <ColumnContainer
                  column={column}
                  key={column.id}
                  deleteColumnCb={handleDeleteColumn}
                  updateColumnCb={handleColumnUpdate}
                  addTaskCb={handleAddTask}
                  deleteTaskCb={handleDeleteTask}
                  updateTaskCb={handleTaskUpdate}
                  tasks={tasks.filter((task) => task.columnId === column.id)}
                />
              ))}
            </div>
          </SortableContext>

          <button
            className="px-4 py-2 rounded-lg bg-main flex gap-2 border-column border-2 min-w-fit ring-rose-500 hover:ring-1"
            onClick={createNewColumn}
          >
            <PlusIcon /> Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                tasks={activeColumnTasks}
              />
            )}

            {activeTask && (
              <TaskCard
                task={activeTask}
                updateTaskCb={handleTaskUpdate}
                deleteTaskCb={handleDeleteTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );

  function createNewColumn() {
    const column: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, column]);
  }

  function handleDeleteColumn(columnId: Id) {
    const filteredCols = columns.filter((column) => column.id !== columnId);
    setColumns(filteredCols);
    deleteColumnTasks(columnId);
  }

  function handleColumnUpdate(id: Id, value: string) {
    const updatedCol: Column = {
      id,
      title: value,
    };

    const idxToUpdate = columns.findIndex((column) => column.id === id);

    if (idxToUpdate < 0) {
      return;
    }

    columns.splice(idxToUpdate, 1, updatedCol);

    setColumns([...columns]);
  }

  function handleTaskUpdate(id: Id, value: string) {
    const updatedTasks = tasks.map((task) => {
      if (task.id !== id) {
        return task;
      }

      return { ...task, content: value };
    });

    setTasks(updatedTasks);
  }

  function handleAddTask(columnId: Id) {
    const task: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };

    setTasks((tasks) => [...tasks, task]);
  }

  function handleDeleteTask(taskId: Id) {
    const filteredTasks = tasks.filter((task) => task.id !== taskId);

    setTasks(filteredTasks);
  }

  function deleteColumnTasks(columnId: Id) {
    const filteredTasks = tasks.filter(task => task.columnId !== columnId);

    setTasks(filteredTasks);
  }

  function handleDragStart(e: DragStartEvent) {
    const current = e?.active?.data?.current;

    if (current?.type === "Column") {
      setActiveColumn(current.column);
      return;
    }

    if (current?.type === "Task") {
      setActiveTask(current.task);
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveTask(null);
    setActiveColumn(null);
    const { active, over } = e;

    if (!over) {
      return;
    }

    const activeColId = active.id;
    const overColId = over.id;

    if (activeColId === overColId) {
      return;
    }

    setColumns((columns) => {
      const activeColIdx = columns.findIndex(
        (column) => column.id === activeColId
      );
      const overColIdx = columns.findIndex((column) => column.id === overColId);

      return arrayMove(columns, activeColIdx, overColIdx);
    });
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e;

    if (!over) {
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) {
      return;
    }

    const overData = over.data.current;

    // drop on task
    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = overData?.type === "Task";
    const isOverAColumn = overData?.type === "Column";

    if (!isActiveATask) {
      return;
    }

    if (isOverATask) {
      setTasks((tasks) => {
        const activeIdx = tasks.findIndex((task) => task.id === activeId);
        const overIdx = tasks.findIndex((task) => task.id === overId);

        tasks[activeIdx].columnId = tasks[overIdx].columnId;

        return arrayMove(tasks, activeIdx, overIdx);
      });

      return;
    }

    if (isOverAColumn) {
      setTasks((tasks) => {
        const activeIdx = tasks.findIndex((task) => task.id === activeId);

        tasks[activeIdx].columnId = overId;

        return [...tasks];
      });
    }
  }
};

export default KanbanBoard;
