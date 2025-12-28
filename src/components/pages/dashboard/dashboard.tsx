"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Users,
  Wifi,
  AlertCircle,
  CheckCircle,
  ListTodo,
} from "lucide-react"

/* ---------- Dashboard ---------- */

export const Dashboard = () => {
  return (
    <div className="h-full w-full p-6 space-y-8">

      {/* ---------- Header ---------- */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Good evening
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            Soloras Hub · Living Room
          </p>
          <Badge className="border border-emerald-500/40 text-emerald-400">
            Online
          </Badge>
        </div>
      </div>

      {/* ---------- Rings ---------- */}
      <div className="grid grid-cols-2 gap-6">
        <RingStat
          label="System health"
          value={92}
          icon={<Activity />}
        />
        <RingStat
          label="Network"
          value={100}
          icon={<Wifi />}
        />
      </div>

      {/* ---------- Usage Bars ---------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Hub activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <BarStat label="Controllers paired" value={2} max={5} />
          <BarStat label="Automations active" value={7} max={10} />
          <BarStat label="Sync reliability" value={98} max={100} />
        </CardContent>
      </Card>

      {/* ---------- Checklist ---------- */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            Setup progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ChecklistItem label="Name this hub" checked />
          <ChecklistItem label="Pair a controller" checked />
          <ChecklistItem label="Connect to Supabase" />
          <ChecklistItem label="Enable auto updates" />
        </CardContent>
      </Card>

      {/* ---------- Today ---------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Today
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MiniStat label="Uptime" value="3h 12m" />
          <MiniStat label="Events processed" value="14" />
          <MiniStat label="Last sync" value="Just now" />
        </CardContent>
      </Card>

    </div>
  )
}

/* ---------- Components ---------- */

const RingStat = ({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) => {
  const circumference = 2 * Math.PI * 28
  const offset = circumference - (value / 100) * circumference

  return (
    <Card className="flex flex-col items-center justify-center py-6">
      <div className="relative h-24 w-24">
        <svg className="h-full w-full rotate-[-90deg]">
          <circle
            cx="48"
            cy="48"
            r="28"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="48"
            cy="48"
            r="28"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-primary transition-all"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-primary">{icon}</div>
          <span className="text-lg font-semibold">{value}%</span>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {label}
      </p>
    </Card>
  )
}

const BarStat = ({
  label,
  value,
  max,
}: {
  label: string
  value: number
  max: number
}) => {
  const percent = Math.round((value / max) * 100)

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

const ChecklistItem = ({
  label,
  checked = false,
}: {
  label: string
  checked?: boolean
}) => (
  <div className="flex items-center gap-4">
    <div
      className={`h-6 w-6 rounded-full flex items-center justify-center border ${
        checked
          ? "border-emerald-500/40 text-emerald-400"
          : "border-muted"
      }`}
    >
      {checked && <CheckCircle className="h-4 w-4" />}
    </div>
    <span
      className={`flex-1 ${
        checked ? "line-through text-muted-foreground" : ""
      }`}
    >
      {label}
    </span>
  </div>
)

const MiniStat = ({
  label,
  value,
}: {
  label: string
  value: string
}) => (
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
)
