"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Calendar } from "@/components/ui/calendar"
import { format, isWithinInterval, addDays, isBefore, isToday, isAfter, startOfDay } from "date-fns"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"

interface Task {
  id: string
  title: string
  type: "regular" | "everyday"
  startDate?: string
  duration?: number
  completedDates: { [date: string]: boolean }
}

const TaskItem = ({ task, selectedDate, toggleTaskCompletion, isDatePastOrToday }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className={cn(
      "flex items-center gap-3 p-3 rounded-lg transition-all",
      task.completedDates[format(selectedDate, "yyyy-MM-dd")]
        ? "bg-green-100 text-green-800"
        : "bg-white/80 hover:bg-white",
      isBefore(startOfDay(selectedDate), startOfDay(new Date())) && "opacity-50",
    )}
  >
    {isDatePastOrToday(selectedDate) ? (
      <Checkbox
        id={task.id}
        checked={task.completedDates[format(selectedDate, "yyyy-MM-dd")]}
        onCheckedChange={() => toggleTaskCompletion(task.id, selectedDate)}
        disabled={isBefore(startOfDay(selectedDate), startOfDay(new Date()))}
        className="border-purple-600 text-purple-600 focus:ring-purple-600"
      />
    ) : (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6" fill="#9333EA" />
      </svg>
    )}
    <motion.span
      animate={
        task.completedDates[format(selectedDate, "yyyy-MM-dd")]
          ? { textDecoration: "line-through" }
          : { textDecoration: "none" }
      }
      transition={{ duration: 0.3 }}
      className="flex-1 font-medium"
    >
      {task.title}
    </motion.span>
  </motion.div>
)

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const savedTasks = localStorage.getItem("ramzan-tasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("ramzan-tasks", JSON.stringify(tasks))
  }, [tasks])

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (task.type === "everyday") return true
      if (task.type === "regular" && task.startDate) {
        const startDate = new Date(task.startDate)
        const endDate = addDays(startDate, (task.duration || 1) - 1)
        return isWithinInterval(date, { start: startDate, end: endDate })
      }
      return false
    })
  }

  const getRegularTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (task.type === "regular" && task.startDate) {
        const startDate = new Date(task.startDate)
        const endDate = addDays(startDate, (task.duration || 1) - 1)
        return isWithinInterval(date, { start: startDate, end: endDate })
      }
      return false
    })
  }

  const selectedTasks = getTasksForDate(selectedDate)

  const toggleTaskCompletion = (taskId: string, date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const newCompletedDates = { ...task.completedDates }
          newCompletedDates[dateString] = !newCompletedDates[dateString]
          return { ...task, completedDates: newCompletedDates }
        }
        return task
      }),
    )
  }

  const isDatePastOrToday = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(new Date())) || isToday(date)
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-purple-100/95 via-purple-50/95 to-white/95 rounded-xl p-6 shadow-lg space-y-4"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-xl border bg-white p-6 w-full max-w-lg shadow-lg"
            classNames={{
              months: "space-y-4",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-xl font-semibold text-gray-900",
              nav: "space-x-1 flex items-center",
              nav_button: cn("h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-600"),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-gray-500 rounded-md w-10 font-medium text-[0.9rem] mb-2",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-[0.9rem] focus-within:relative focus-within:z-20",
              day: cn(
                "h-10 w-10 p-0 font-normal",
                "rounded-lg",
                "aria-selected:opacity-100",
                "hover:bg-gray-100",
                "focus:bg-gray-100",
                "flex items-center justify-center relative",
                "transition-all duration-200 ease-in-out",
                "text-gray-900 text-sm",
              ),
              day_selected: cn(
                "!bg-purple-600 !text-white hover:!bg-purple-600 hover:!text-white",
                "focus:!bg-purple-600 focus:!text-white",
                "rounded-lg font-medium pb-3",
                "[&_.task-dot]:bg-white [&_.task-dot]:shadow-none",
              ),
              day_today: cn("bg-gray-50 text-gray-900 font-semibold"),
              day_outside: "text-gray-400 opacity-50",
              day_disabled: "text-gray-300",
              day_hidden: "invisible",
            }}
            components={{
              DayContent: ({ date }) => {
                const regularTasks = getRegularTasksForDate(date)
                const isInFuture = isAfter(date, new Date()) || isToday(date)
                return (
                  <div className="w-full h-full flex flex-col items-center justify-center pb-1">
                    <span>{date.getDate()}</span>
                    {regularTasks.length > 0 && isInFuture && (
                      <div className="absolute bottom-1">
                        <div className="task-dot h-1.5 w-1.5 rounded-full bg-purple-600 transition-colors duration-200" />
                      </div>
                    )}
                  </div>
                )
              },
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-purple-100/95 via-purple-50/95 to-white/95 rounded-xl p-6 shadow-lg space-y-4"
        >
          <h2 className="font-medium text-lg text-black">
            Tasks for{" "}
            <motion.span
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="text-purple-600 font-semibold font-poppins"
            >
              {format(selectedDate, "MMMM d")}
            </motion.span>
          </h2>

          {selectedTasks.filter((task) => task.type === "regular").length === 0 ? (
            <p className="text-gray-500 text-center italic">No regular tasks for this day</p>
          ) : (
            <div className="space-y-3">
              {selectedTasks
                .filter((task) => task.type === "regular")
                .map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    selectedDate={selectedDate}
                    toggleTaskCompletion={toggleTaskCompletion}
                    isDatePastOrToday={isDatePastOrToday}
                  />
                ))}
            </div>
          )}
        </motion.div>

        {/* Daily Tasks Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-purple-100/95 via-purple-50/95 to-white/95 rounded-xl p-6 shadow-lg space-y-4"
        >
          <h2 className="font-medium text-lg text-black">Daily Tasks</h2>
          {selectedTasks.filter((task) => task.type === "everyday").length === 0 ? (
            <p className="text-gray-500 text-center italic">No daily tasks set</p>
          ) : (
            <div className="space-y-3">
              {selectedTasks
                .filter((task) => task.type === "everyday")
                .map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    selectedDate={selectedDate}
                    toggleTaskCompletion={toggleTaskCompletion}
                    isDatePastOrToday={isDatePastOrToday}
                  />
                ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </Layout>
  )
}

