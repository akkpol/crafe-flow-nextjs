import {
  ClipboardList,
  Factory,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Receipt,
  Package,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getDashboardStats, getRecentJobs, getLowStockMaterials } from '@/actions/dashboard'
import { getProfile } from '@/lib/auth'

const statusMap: Record<string, { label: string; colorClass: string; bgClass: string }> = {
  new: { label: 'รับงาน', colorClass: 'text-blue-400', bgClass: 'bg-blue-400/10 border-blue-400/20' },
  designing: { label: 'ออกแบบ', colorClass: 'text-purple-400', bgClass: 'bg-purple-400/10 border-purple-400/20' },
  approved: { label: 'ยืนยัน', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-400/10 border-emerald-400/20' },
  production: { label: 'ผลิต', colorClass: 'text-cyan-400', bgClass: 'bg-cyan-400/10 border-cyan-400/20' },
  qc: { label: 'QC', colorClass: 'text-yellow-400', bgClass: 'bg-yellow-400/10 border-yellow-400/20' },
  installing: { label: 'ติดตั้ง', colorClass: 'text-orange-400', bgClass: 'bg-orange-400/10 border-orange-400/20' },
  done: { label: 'เสร็จ', colorClass: 'text-muted-foreground', bgClass: 'bg-muted/10 border-border/50' },
}

const priorityMap: Record<string, { label: string; bgClass: string }> = {
  low: { label: 'ต่ำ', bgClass: 'bg-muted text-muted-foreground' },
  medium: { label: 'ปกติ', bgClass: 'bg-blue-500/20 text-blue-400' },
  high: { label: 'สูง', bgClass: 'bg-yellow-500/20 text-yellow-500' },
  urgent: { label: 'ด่วน!', bgClass: 'bg-red-500/20 text-red-500 animate-pulse' },
}

export default async function DashboardPage() {
  const statsData = await getDashboardStats()
  const recentJobs = await getRecentJobs()
  const lowStockItems = await getLowStockMaterials()
  const profile = await getProfile()

  const activeJobsCount = statsData.production + statsData.installing + statsData.totalJobs // just an example composite for visual

  const stats = [
    { label: 'Active Jobs', value: activeJobsCount, icon: ClipboardList, glowClass: 'shadow-[0_0_20px_rgba(34,211,238,0.15)] ring-cyan-500/30', textClass: 'text-cyan-400', iconBg: 'bg-cyan-500/20' },
    { label: 'Total Orders', value: statsData.totalJobs, icon: Factory, glowClass: 'shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-blue-500/30', textClass: 'text-blue-400', iconBg: 'bg-blue-500/20' },
    { label: 'Low Stock Alerts', value: lowStockItems.length, icon: AlertTriangle, glowClass: 'shadow-[0_0_20px_rgba(249,115,22,0.15)] ring-orange-500/30', textClass: 'text-orange-400', iconBg: 'bg-orange-500/20' },
    { label: 'Done Month', value: statsData.doneMonth, icon: CheckCircle2, glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-emerald-500/30', textClass: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
  ]

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-1">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{profile?.full_name || 'User'}</span>
          </h1>
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            Signage ERP Command Center • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={cn(
              "relative overflow-hidden rounded-2xl bg-card/40 backdrop-blur-xl border border-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-card/60 ring-1",
              stat.glowClass
            )}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-3xl md:text-4xl font-black tracking-tighter">{stat.value}</p>
                </div>
                <div className={cn("p-3 rounded-xl", stat.iconBg)}>
                  <Icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.textClass)} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/jobs/new" className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/50 transition-all">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-cyan-50">New Job Ticket</h3>
            <p className="text-xs text-muted-foreground">Start a new project</p>
          </div>
        </Link>
        <Link href="/billing/new" className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/50 transition-all">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-purple-50">Create Quote</h3>
            <p className="text-xs text-muted-foreground">Send estimation</p>
          </div>
        </Link>
        <Link href="/stock" className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:border-orange-500/50 transition-all">
          <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400 group-hover:scale-110 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-orange-50">Manage Stock</h3>
            <p className="text-xs text-muted-foreground">Update inventory</p>
          </div>
        </Link>
      </div>

      {/* Data Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* Recent Active Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Recent Active Jobs
            </h2>
            <Link href="/kanban" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
              View All
            </Link>
          </div>
          <div className="rounded-2xl bg-card/30 backdrop-blur-md border border-white/5 divide-y divide-border/50 overflow-hidden">
            {recentJobs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-semibold">No active jobs found.</p>
              </div>
            ) : (
              recentJobs.map((job) => (
                <div key={job.id} className="p-4 md:p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                  <div className="min-w-0 pr-4">
                    <h3 className="font-bold text-sm md:text-base tracking-tight truncate text-foreground group-hover:text-cyan-400 transition-colors">{job.title}</h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{job.customer}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg", priorityMap[job.priority]?.bgClass)}>
                      {priorityMap[job.priority]?.label}
                    </span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border", statusMap[job.status]?.bgClass, statusMap[job.status]?.colorClass)}>
                      {statusMap[job.status]?.label || job.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Low Stock Alerts
            </h2>
          </div>
          <div className="rounded-2xl bg-card/30 backdrop-blur-md border border-white/5 overflow-hidden">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-emerald-500/70">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">Inventory is healthy</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {lowStockItems.map((item) => (
                  <div key={item.name} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <span className="text-sm font-semibold tracking-tight">{item.name}</span>
                    <div className="text-right">
                      <p className="text-sm font-black text-red-400">{item.current} <span className="text-[10px] font-medium text-muted-foreground">{item.unit}</span></p>
                      <p className="text-[10px] text-muted-foreground">Min: {item.min}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {lowStockItems.length > 0 && (
              <div className="p-3 bg-red-400/5 border-t border-border/50 text-center">
                <Link href="/stock" className="text-xs font-bold text-red-400 hover:text-red-300">
                  Restock Needed
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
