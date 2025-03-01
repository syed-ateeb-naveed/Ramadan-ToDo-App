"use client"

import { useEffect, useState } from "react"
import Layout from "@/components/layout"
import { Moon, Sun, Cloud, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { isToday, format } from "date-fns"
import cn from "classnames"

interface PrayerTimes {
  Fajr: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

interface Task {
  id: string
  title: string
  type: "regular" | "everyday"
  startDate?: string
  duration?: number
  completedDates: { [date: string]: boolean }
}

export default function Home() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [progress, setProgress] = useState(0)
  const [islamicDate, setIslamicDate] = useState("")

  useEffect(() => {
    // Fetch prayer times from API
    fetch(`https://api.aladhan.com/v1/timingsByCity?city=Karachi&country=Pakistan`)
      .then((res) => res.json())
      .then((data) => {
        setPrayerTimes(data.data.timings)
        setIslamicDate(`${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`)
      })

    // Load tasks from localStorage
    const savedTasks = localStorage.getItem("ramzan-tasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Calculate progress
    const todayString = format(new Date(), "yyyy-MM-dd")
    const todayTasks = tasks.filter(
      (task) => task.type === "everyday" || (task.startDate && isToday(new Date(task.startDate))),
    )
    const completedTasks = todayTasks.filter((task) => task.completedDates[todayString])
    const newProgress = todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0
    setProgress(newProgress)
  }, [tasks])

  const getUpcomingPrayer = () => {
    if (!prayerTimes) return null

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const prayers = [
      { name: "Fajr", time: prayerTimes.Fajr },
      { name: "Dhuhr", time: prayerTimes.Dhuhr },
      { name: "Asr", time: prayerTimes.Asr },
      { name: "Maghrib", time: prayerTimes.Maghrib },
      { name: "Isha", time: prayerTimes.Isha },
    ]

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(":").map(Number)
      const prayerTime = hours * 60 + minutes
      if (prayerTime > currentTime) {
        return {
          name: prayer.name,
          time: format(new Date(`2000-01-01 ${prayer.time}`), "h:mm a"),
        }
      }
    }

    return {
      name: "Fajr",
      time: format(new Date(`2000-01-01 ${prayerTimes.Fajr}`), "h:mm a"),
    }
  }

  const todayTasks = tasks.filter(
    (task) => task.type === "everyday" || (task.startDate && isToday(new Date(task.startDate))),
  )

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-medium">
            {currentDate.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
          </h1>
          <p className="text-sm text-gray-500">
            {currentDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <p className="text-sm text-gray-600 font-medium">{islamicDate}</p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 gap-6 mb-6"
      >
        {[
          { title: "Sehri Time", icon: Moon, color: "indigo", time: prayerTimes?.Fajr },
          { title: "Dhuhr", icon: Sun, color: "yellow", time: prayerTimes?.Dhuhr },
          { title: "Asr", icon: Cloud, color: "sky", time: prayerTimes?.Asr },
          { title: "Iftar Time", icon: Sun, color: "orange", time: prayerTimes?.Maghrib },
        ].map((item, index) => (
          <motion.div
            key={item.title}
            className={cn(
              "bg-gradient-to-br p-6 rounded-2xl shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer border group transform-style-3d",
              item.color === "indigo" && "from-indigo-100/90 to-white/90 border-indigo-200/50",
              item.color === "yellow" && "from-yellow-100/90 to-white/90 border-yellow-200/50",
              item.color === "sky" && "from-sky-100/90 to-white/90 border-sky-200/50",
              item.color === "orange" && "from-orange-100/90 to-white/90 border-orange-200/50",
            )}
            whileHover={{ translateZ: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={cn(
                  "p-2 rounded-full transition-colors",
                  item.color === "indigo" && "bg-indigo-200/80 group-hover:bg-indigo-300/80",
                  item.color === "yellow" && "bg-yellow-200/80 group-hover:bg-yellow-300/80",
                  item.color === "sky" && "bg-sky-200/80 group-hover:bg-sky-300/80",
                  item.color === "orange" && "bg-orange-200/80 group-hover:bg-orange-300/80",
                )}
              >
                <item.icon
                  className={cn(
                    item.color === "indigo" && "text-indigo-600",
                    item.color === "yellow" && "text-yellow-600",
                    item.color === "sky" && "text-sky-600",
                    item.color === "orange" && "text-orange-600",
                  )}
                  size={24}
                />
              </div>
              <span className="text-sm font-medium">{item.title}</span>
            </div>
            <div className="text-2xl font-bold text-center">
              {item.time ? format(new Date(`2000-01-01 ${item.time}`), "h:mm aaa").toLowerCase() : "--:--"}
            </div>
          </motion.div>
        ))}

        <motion.div
          className="col-span-2 bg-gradient-to-br from-violet-100/95 via-purple-50/95 to-white/95 p-6 rounded-2xl shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer border border-violet-200/50 group transform-style-3d"
          whileHover={{ translateZ: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="flex text-center items-center gap-3 mb-3 justify-center">
            <div className="bg-violet-200/80 p-2 rounded-full group-hover:bg-violet-300/80 transition-colors">
              <Clock className="text-violet-600" size={18} />
            </div>
            <span className="text-sm font-medium">Upcoming</span>
          </div>
          {prayerTimes && getUpcomingPrayer() && (
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-900">
                {getUpcomingPrayer()?.time
                  ? format(new Date(`2000-01-01 ${getUpcomingPrayer()?.time}`), "h:mm aaa").toLowerCase()
                  : "--:--"}
              </div>
              <div className="text-sm text-violet-600 mt-1 font-medium">{getUpcomingPrayer()?.name}</div>
            </div>
          )}
        </motion.div>

        <motion.div
          className="col-span-2 bg-gradient-to-br from-purple-100/95 via-purple-50/95 to-white/95 p-6 rounded-2xl shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer border border-purple-200/50 group transform-style-3d"
          whileHover={{ translateZ: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <h3 className="text-lg font-semibold text-purple-800 mb-2">Today's Progress</h3>
          {todayTasks.length > 0 ? (
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                    Task Completion
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-purple-600">{progress.toFixed(0)}%</span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                <motion.div
                  style={{ width: `${progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          ) : (
            <p className="text-purple-600 text-center">No tasks for today :)</p>
          )}
        </motion.div>
      </motion.div>
    </Layout>
  )
}

