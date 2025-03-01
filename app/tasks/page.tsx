"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarIcon, Clock, Trash2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface Task {
  id: string
  title: string
  type: "regular" | "everyday"
  startDate?: string
  duration?: number
  completedDates: { [date: string]: boolean }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [taskType, setTaskType] = useState<"regular" | "everyday">("everyday")
  const [setDate, setSetDate] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [showDuration, setShowDuration] = useState(false)
  const [duration, setDuration] = useState<string>("")
  const [durationError, setDurationError] = useState(false)
  const [dateError, setDateError] = useState(false)

  useEffect(() => {
    const savedTasks = localStorage.getItem("ramzan-tasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("ramzan-tasks", JSON.stringify(tasks))
  }, [tasks])

  const handleDurationChange = (value: string) => {
    setDuration(value)
    const numValue = Number.parseInt(value)
    setDurationError(isNaN(numValue) || numValue <= 0)
  }

  const addTask = () => {
    if (!newTask.trim()) return
    if (setDate && !startDate) {
      setDateError(true)
      return
    }
    if (showDuration && (durationError || !duration)) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      type: taskType,
      completedDates: {},
      ...(setDate &&
        startDate && {
          startDate: startDate.toISOString(),
          ...(showDuration && { duration: Number.parseInt(duration) }),
        }),
    }

    setTasks([...tasks, task])
    setNewTask("")
    setSetDate(false)
    setStartDate(undefined)
    setDuration("")
    setShowDuration(false)
    setDurationError(false)
    setDateError(false)
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="bg-gradient-to-br from-purple-100/95 via-purple-50/95 to-white/95 rounded-xl p-6 shadow-lg space-y-4">
          <h2 className="font-medium text-lg text-black">Add New Task</h2>

          <div className="space-y-4">
            <Input
              placeholder="Enter task title"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="bg-white/50 border-gray-300 focus:border-purple-600 focus:ring-purple-600 focus:ring-offset-0"
            />

            <div className="flex gap-2">
              <Button
                variant={taskType === "everyday" ? "default" : "outline"}
                onClick={() => setTaskType("everyday")}
                className={cn(
                  "bg-purple-700 text-white hover:bg-purple-800",
                  taskType !== "everyday" && "bg-white text-purple-700 hover:bg-purple-100",
                )}
              >
                Daily
              </Button>
              <Button
                variant={taskType === "regular" ? "default" : "outline"}
                onClick={() => setTaskType("regular")}
                className={cn(
                  "bg-purple-700 text-white hover:bg-purple-800",
                  taskType !== "regular" && "bg-white text-purple-700 hover:bg-purple-100",
                )}
              >
                One-time
              </Button>
            </div>

            {taskType === "regular" && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="setDate"
                    checked={setDate}
                    onCheckedChange={(checked) => {
                      setSetDate(checked as boolean)
                      if (!checked) {
                        setStartDate(undefined)
                        setShowDuration(false)
                        setDuration("")
                        setDurationError(false)
                        setDateError(false)
                      }
                    }}
                    className="border-gray-300 text-purple-700 focus:ring-purple-700"
                  />
                  <label
                    htmlFor="setDate"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
                  >
                    Set Date
                  </label>
                </div>

                {setDate && (
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            "bg-white/50 border-gray-300 hover:bg-purple-100",
                            dateError && "border-red-500 text-red-500 focus:ring-red-500",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            setStartDate(date)
                            setDateError(false)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {dateError && <p className="text-sm text-red-500">Please select a start date</p>}
                  </div>
                )}

                {startDate && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="setDays"
                      checked={showDuration}
                      onCheckedChange={(checked) => {
                        setShowDuration(checked as boolean)
                        if (!checked) {
                          setDuration("")
                          setDurationError(false)
                        }
                      }}
                      className="border-gray-300 text-purple-700 focus:ring-purple-700"
                    />
                    <label
                      htmlFor="setDays"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
                    >
                      Set days
                    </label>
                  </div>
                )}

                {showDuration && (
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <Clock className="h-4 w-4 text-purple-700" />
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={duration}
                        onChange={(e) => handleDurationChange(e.target.value)}
                        placeholder="Duration (days)"
                        className={cn(
                          "bg-white/50 border-gray-300 focus:border-purple-600 focus:ring-purple-600",
                          durationError && "border-red-500 focus:ring-red-500",
                        )}
                      />
                    </div>
                    {durationError && <p className="text-sm text-red-500">Please enter a valid number of days</p>}
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={addTask}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white"
              disabled={!newTask.trim() || (showDuration && (durationError || !duration))}
            >
              Add Task
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-medium text-lg text-black">Your Tasks</h2>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-4 rounded-xl flex justify-between items-center shadow-md border border-gray-200"
            >
              <div>
                <h3 className="font-medium text-black">{task.title}</h3>
                <p className="text-sm text-gray-600">
                  {task.type === "everyday"
                    ? "Everyday Task"
                    : task.startDate
                      ? `${format(new Date(task.startDate), "PPP")}${task.duration ? ` - ${task.duration} days` : ""}`
                      : "Regular Task"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTask(task.id)}
                className="text-purple-700 hover:text-purple-800 hover:bg-purple-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </motion.div>
    </Layout>
  )
}

