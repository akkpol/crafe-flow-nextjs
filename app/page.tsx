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

// Demo data (จะเปลี่ยนเป็น Supabase query เมื่อเชื่อมจริง)
const stats = [
  { label: 'งานทั้งหมด', value: 24, icon: ClipboardList, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { label: 'กำลังผลิต', value: 8, icon: Factory, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
  { label: 'รอติดตั้ง', value: 3, icon: Truck, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { label: 'เสร็จเดือนนี้', value: 12, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
]

const recentJobs = [
  { id: '1', title: 'ป้ายหน้าร้าน ABC Cafe', customer: 'คุณสมชาย', status: 'production', priority: 'high', deadline: '2026-02-20' },
  { id: '2', title: 'ป้ายไวนิลงานเปิดตัว', customer: 'บ.XYZ', status: 'designing', priority: 'urgent', deadline: '2026-02-18' },
  { id: '3', title: 'ตัวอักษรโลหะ LED', customer: 'คุณมาลี', status: 'new', priority: 'medium', deadline: '2026-02-25' },
  { id: '4', title: 'สติกเกอร์กระจกร้าน', customer: 'คุณวิชัย', status: 'qc', priority: 'low', deadline: '2026-02-22' },
  { id: '5', title: 'ป้ายอะคริลิค A3', customer: 'คุณจิรา', status: 'approved', priority: 'medium', deadline: '2026-02-28' },
]

const lowStockItems = [
  { name: 'ไวนิลขาวเงา', current: 5, unit: 'ม้วน', min: 10 },
  { name: 'หมึก Cyan', current: 2, unit: 'ลิตร', min: 5 },
]

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

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <p className="text-sm text-muted-foreground">TD ALL CO.,LTD.</p>
        <h1 className="text-2xl font-bold">
          <span className="text-gradient-cmyk">CraftFlow</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">ภาพรวมงานวันนี้</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold leading-none">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Access */}
      <div className="flex gap-3 px-4">
        <Link href="/files" className="flex-1">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]">
            <CardContent className="p-3 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10">
                <FolderOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">📁 ไฟล์งาน</p>
                <p className="text-[10px] text-muted-foreground">จัดระเบียบ NAS</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/billing" className="flex-1">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]">
            <CardContent className="p-3 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-fuchsia-500/10">
                <Receipt className="w-4 h-4 text-fuchsia-500" />
              </div>
              <div>
                <p className="text-sm font-medium">💰 ออกบิล</p>
                <p className="text-[10px] text-muted-foreground">ใบเสนอราคา/แจ้งหนี้</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="px-4">
          <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-semibold text-destructive">วัสดุใกล้หมด</span>
              </div>
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div key={item.name} className="flex justify-between items-center text-sm">
                    <span>{item.name}</span>
                    <span className="text-destructive font-semibold">
                      {item.current}/{item.min} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Jobs */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">งานล่าสุด</h2>
          </div>
          <Link href="/kanban" className="text-xs text-primary flex items-center gap-1">
            ดูทั้งหมด <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-2">
          {recentJobs.map((job) => (
            <Card key={job.id} className="border-0 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{job.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{job.customer}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={statusMap[job.status]?.variant || 'outline'} className="text-[10px] px-2 py-0.5">
                        {statusMap[job.status]?.label || job.status}
                      </Badge>
                      <span className={`text-[10px] ${priorityMap[job.priority]?.color || ''}`}>
                        {priorityMap[job.priority]?.label || job.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">กำหนดส่ง</p>
                    <p className="text-xs font-medium">{new Date(job.deadline).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
