"use client"

import * as React from "react"
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Stack,
  Divider,
} from "@mui/material"
import {
  Activity,
  Wifi,
  CheckCircle,
  ListTodo,
} from "lucide-react"
import {
  Gauge,
  BarChart,
} from "@mui/x-charts"

/* ---------- Dashboard ---------- */

export default function Dashboard() {
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        p: 3,
        bgcolor: "background.default",
      }}
    >
      <Stack spacing={4}>

        {/* ---------- Header ---------- */}
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Good evening
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
            <Typography color="text.secondary">
              Soloras Hub · Living Room
            </Typography>
            <Chip
              label="Online"
              size="small"
              color="success"
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* ---------- Health Gauges ---------- */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <GaugeCard
            title="System Health"
            value={92}
            icon={<Activity size={20} />}
          />
          <GaugeCard
            title="Network"
            value={100}
            icon={<Wifi size={20} />}
          />
        </Stack>

        {/* ---------- Activity Chart ---------- */}
        <Card>
          <CardHeader title="Hub activity" />
          <CardContent>
            <BarChart
              height={220}
              xAxis={[
                {
                  scaleType: "band",
                  data: [
                    "Controllers",
                    "Automations",
                    "Sync",
                  ],
                },
              ]}
              series={[
                {
                  data: [2, 7, 98],
                  label: "Usage %",
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* ---------- Setup Progress ---------- */}
        <Card>
          <CardHeader
            avatar={<ListTodo size={20} />}
            title="Setup progress"
          />
          <CardContent>
            <Stack spacing={2}>
              <Checklist label="Name this hub" checked />
              <Checklist label="Pair a controller" checked />
              <Checklist label="Connect to Supabase" />
              <Checklist label="Enable auto updates" />
            </Stack>
          </CardContent>
        </Card>

        {/* ---------- Today Stats ---------- */}
        <Card>
          <CardHeader title="Today" />
          <CardContent>
            <Stack spacing={2} divider={<Divider />}>
              <MiniStat label="Uptime" value="3h 12m" />
              <MiniStat label="Events processed" value="14" />
              <MiniStat label="Last sync" value="Just now" />
            </Stack>
          </CardContent>
        </Card>

      </Stack>
    </Box>
  )
}

/* ---------- Components ---------- */

function GaugeCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <Card sx={{ flex: 1 }}>
      <CardHeader
        avatar={icon}
        title={title}
      />
      <CardContent sx={{ height: 220 }}>
        <Gauge
          value={value}
          startAngle={-110}
          endAngle={110}
          innerRadius="70%"
          outerRadius="100%"
          text={`${value}%`}
        />
      </CardContent>
    </Card>
  )
}

function Checklist({
  label,
  checked = false,
}: {
  label: string
  checked?: boolean
}) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <CheckCircle
        size={18}
        color={checked ? "#22c55e" : "#9ca3af"}
      />
      <Typography
        sx={{
          textDecoration: checked ? "line-through" : "none",
          color: checked ? "text.secondary" : "text.primary",
        }}
      >
        {label}
      </Typography>
    </Stack>
  )
}

function MiniStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={600}>
        {value}
      </Typography>
    </Stack>
  )
}
