import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ClipboardList,
  Factory,
  Truck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  FolderOpen,
  Receipt,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getDashboardStats, getRecentJobs, getLowStockMaterials } from '@/actions/dashboard'

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new: { label: 'รับงาน', variant: 'outline' },
  designing: { label: 'ออกแบบ', variant: 'secondary' },
  approved: { label: 'ยืนยัน', variant: 'default' },
  production: { label: 'ผลิต', variant: 'default' },
  qc: { label: 'QC', variant: 'secondary' },
  installing: { label: 'ติดตั้ง', variant: 'default' },
  done: { label: 'เสร็จ', variant: 'outline' },
}

const priorityMap: Record<string, { label: string; color: string }> = {
  low: { label: 'ต่ำ', color: 'text-muted-foreground' },
  medium: { label: 'ปกติ', color: 'text-cyan-600' },
  high: { label: 'สูง', color: 'text-yellow-600 font-semibold' },
  urgent: { label: 'ด่วน!', color: 'text-red-500 font-bold' },
}

export default async function DashboardPage() {
  const statsData = await getDashboardStats()
  const recentJobs = await getRecentJobs()
  const lowStockItems = await getLowStockMaterials()

  const stats = [
    { label: 'งานทั้งหมด', value: statsData.totalJobs, icon: ClipboardList, color: 'text-cyan', bg: 'bg-cyan/10' },
    { label: 'กำลังผลิต/QC', value: statsData.production, icon: Factory, color: 'text-magenta', bg: 'bg-magenta/10' },
    { label: 'กำลังติดตั้ง', value: statsData.installing, icon: Truck, color: 'text-cmyk-yellow', bg: 'bg-cmyk-yellow/10' },
    { label: 'เสร็จเดือนนี้', value: statsData.doneMonth, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ]

  return (
    <div className="space-y-6 pb-24">
      {/* Premium Glass Header */}
      <div className="px-5 pt-8 pb-4 flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">TD ALL CO.,LTD.</p>
          <h1 className="text-3xl font-black tracking-tighter">
            <span className="text-gradient-cmyk">CraftFlow</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-70">Real-time Operations</p>
          </div>
        </div>
        <Link href="/settings/organization" className="p-2 rounded-full bg-muted/20 hover:bg-muted/40 transition-colors">
          <Factory className="w-5 h-5 text-muted-foreground" />
        </Link>
      </div>

      {/* Stat Grid - Premium Cards */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card-premium p-5 group relative overflow-hidden">
              <div className={`absolute top-0 right-0 p-3 opacity-[0.05] group-hover:opacity-20 transition-opacity ${stat.color}`}>
                <Icon className="w-10 h-10" />
              </div>
              <div className="relative z-10">
                <p className="text-3xl font-black tracking-tighter mb-1">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-80">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions - Glass Cards */}
      <div className="flex gap-3 px-4">
        <Link href="/files" className="flex-1">
          <div className="card-premium p-4 flex items-center gap-3 bg-muted/20 border-transparent hover:bg-background">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">Cloud Files</p>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">NAS STORAGE</p>
            </div>
          </div>
        </Link>
        <Link href="/billing" className="flex-1">
          <div className="card-premium p-4 flex items-center gap-3 bg-muted/20 border-transparent hover:bg-background">
            <div className="p-2.5 rounded-2xl bg-magenta/10 text-magenta">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">Billing</p>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">FINANCE</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Logic for Low Stock and Recent Jobs remains the same but with Premium Cards */}
      {lowStockItems.length > 0 && (
        <div className="px-4">
          <div className="card-premium p-5 border-destructive/20 bg-destructive/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertTriangle className="w-12 h-12 text-destructive" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-destructive">Urgent Inventory Alerts</span>
            </div>
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-sm font-bold tracking-tight">
                  <span className="opacity-80">{item.name}</span>
                  <Badge variant="destructive" className="rounded-lg px-2 py-0 h-5 text-[10px] font-black">
                    {item.current}/{item.min}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Jobs - Premium List */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Live Job Track</h2>
          </div>
          <Link href="/kanban" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
            Dashboard <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentJobs.length === 0 ? (
            <div className="card-premium p-10 text-center text-muted-foreground border-dashed">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-10" />
              <p className="text-xs font-bold uppercase tracking-widest">No active jobs</p>
            </div>
          ) : (
            recentJobs.map((job) => (
              <div key={job.id} className="card-premium p-5 hover:translate-x-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-base tracking-tight truncate mb-1">{job.title}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70 mb-3">{job.customer}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusMap[job.status]?.variant || 'outline'} className="text-[9px] font-black uppercase tracking-tighter px-2 h-5 rounded-full">
                        {statusMap[job.status]?.label || job.status}
                      </Badge>
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", priorityMap[job.priority]?.color)}>
                        {priorityMap[job.priority]?.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Deadline</p>
                    <p className="text-sm font-black tracking-tighter text-primary">
                      {new Date(job.deadline).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
