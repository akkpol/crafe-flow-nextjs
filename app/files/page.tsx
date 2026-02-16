'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    Search,
    FolderOpen,
    FolderClosed,
    FileImage,
    FileText,
    Printer,
    Camera,
    CheckCircle2,
    Circle,
    Copy,
    ChevronDown,
    ChevronRight,
    HardDrive,
} from 'lucide-react'

// โครงสร้างโฟลเดอร์มาตรฐานต่อ 1 งาน
const FOLDER_TEMPLATE = [
    { key: 'customer_files', label: '01-ไฟล์ลูกค้า', icon: FileText, desc: 'ไฟล์ที่ลูกค้าส่งมา (โลโก้, ข้อความ, รูปภาพ)' },
    { key: 'design', label: '02-ออกแบบ', icon: FileImage, desc: 'ไฟล์ออกแบบ (AI, PSD, CDR)' },
    { key: 'proof', label: '03-พรูฟ', icon: FileImage, desc: 'ไฟล์ proof ส่งให้ลูกค้าอนุมัติ (PDF, JPG)' },
    { key: 'print_ready', label: '04-ไฟล์พิมพ์', icon: Printer, desc: 'ไฟล์พร้อมพิมพ์ (TIFF, PDF/X)' },
    { key: 'photos', label: '05-ภาพงานจริง', icon: Camera, desc: 'ภาพถ่ายก่อน-ระหว่าง-หลังติดตั้ง' },
]

interface JobFolder {
    id: string
    orderNumber: string
    jobTitle: string
    customer: string
    nasPath: string
    status: string
    files: Record<string, 'empty' | 'has_files' | 'complete'>
    createdAt: string
}

// Demo data
const demoJobs: JobFolder[] = [
    {
        id: '1', orderNumber: 'QT-2026-001', jobTitle: 'ป้ายหน้าร้าน ABC Cafe',
        customer: 'คุณสมชาย', nasPath: '\\\\NAS\\งาน\\2026\\02\\QT-001-ป้ายหน้าร้านABC',
        status: 'production', createdAt: '2026-02-10',
        files: { customer_files: 'complete', design: 'complete', proof: 'complete', print_ready: 'has_files', photos: 'empty' },
    },
    {
        id: '2', orderNumber: 'QT-2026-002', jobTitle: 'ป้ายไวนิลงานเปิดตัว',
        customer: 'บ.XYZ', nasPath: '\\\\NAS\\งาน\\2026\\02\\QT-002-ป้ายไวนิลเปิดตัว',
        status: 'designing', createdAt: '2026-02-12',
        files: { customer_files: 'has_files', design: 'has_files', proof: 'empty', print_ready: 'empty', photos: 'empty' },
    },
    {
        id: '3', orderNumber: 'QT-2026-003', jobTitle: 'ตัวอักษรโลหะ LED',
        customer: 'คุณมาลี', nasPath: '\\\\NAS\\งาน\\2026\\02\\QT-003-ตัวอักษรLED',
        status: 'new', createdAt: '2026-02-15',
        files: { customer_files: 'has_files', design: 'empty', proof: 'empty', print_ready: 'empty', photos: 'empty' },
    },
    {
        id: '4', orderNumber: 'QT-2026-004', jobTitle: 'สติกเกอร์กระจกร้าน',
        customer: 'คุณวิชัย', nasPath: '\\\\NAS\\งาน\\2026\\02\\QT-004-สติกเกอร์กระจก',
        status: 'done', createdAt: '2026-02-08',
        files: { customer_files: 'complete', design: 'complete', proof: 'complete', print_ready: 'complete', photos: 'complete' },
    },
]

const fileStatusIcon = {
    empty: <Circle className="w-4 h-4 text-muted-foreground/40" />,
    has_files: <Circle className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />,
    complete: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
}

const fileStatusLabel = {
    empty: 'ยังไม่มีไฟล์',
    has_files: 'มีไฟล์บางส่วน',
    complete: 'ครบแล้ว',
}

function getCompletionPercent(files: Record<string, string>): number {
    const values = Object.values(files)
    const complete = values.filter(v => v === 'complete').length
    return Math.round((complete / values.length) * 100)
}

export default function FilesPage() {
    const [search, setSearch] = useState('')
    const [expandedJob, setExpandedJob] = useState<string | null>(null)
    const [copiedPath, setCopiedPath] = useState<string | null>(null)

    const filtered = demoJobs.filter(job =>
        job.jobTitle.includes(search) || job.customer.includes(search) || job.orderNumber.includes(search)
    )

    const copyPath = (path: string) => {
        navigator.clipboard.writeText(path)
        setCopiedPath(path)
        setTimeout(() => setCopiedPath(null), 2000)
    }

    return (
        <div className="space-y-4">
            <PageHeader title="📁 ไฟล์งาน" subtitle="จัดระเบียบไฟล์บน NAS">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                    <HardDrive className="w-3 h-3" />
                    NAS
                </div>
            </PageHeader>

            {/* NAS Path Convention Info */}
            <div className="px-4">
                <Card className="border-primary/20 bg-primary/5 shadow-sm">
                    <CardContent className="p-3">
                        <p className="text-xs font-semibold text-primary mb-1">📂 โครงสร้างโฟลเดอร์มาตรฐาน</p>
                        <code className="text-[11px] text-muted-foreground block font-mono leading-relaxed">
                            \\NAS\งาน\[ปี]\[เดือน]\[เลขบิล]-[ชื่องาน]\
                            <br />├── 01-ไฟล์ลูกค้า\
                            <br />├── 02-ออกแบบ\
                            <br />├── 03-พรูฟ\
                            <br />├── 04-ไฟล์พิมพ์\
                            <br />└── 05-ภาพงานจริง\
                        </code>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="px-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหางาน..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-12 text-base"
                    />
                </div>
            </div>

            {/* Job File List */}
            <div className="px-4 pb-8 space-y-2">
                {filtered.map((job) => {
                    const isExpanded = expandedJob === job.id
                    const completion = getCompletionPercent(job.files)

                    return (
                        <Card key={job.id} className="border-0 shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                {/* Completion bar */}
                                <div className="h-1 bg-muted">
                                    <div
                                        className={cn(
                                            'h-full transition-all',
                                            completion === 100 ? 'bg-emerald-500' : completion > 50 ? 'bg-cyan-500' : 'bg-yellow-500'
                                        )}
                                        style={{ width: `${completion}%` }}
                                    />
                                </div>

                                {/* Job header */}
                                <button
                                    onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                                    className="w-full p-3 text-left active:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2.5">
                                            {isExpanded
                                                ? <FolderOpen className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                                : <FolderClosed className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                                            }
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm truncate">{job.jobTitle}</p>
                                                <p className="text-xs text-muted-foreground">{job.orderNumber} • {job.customer}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge variant="outline" className="text-[10px]">
                                                {completion}%
                                            </Badge>
                                            {isExpanded
                                                ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                            }
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded: folder details */}
                                {isExpanded && (
                                    <div className="px-3 pb-3 space-y-3">
                                        {/* NAS Path */}
                                        <button
                                            onClick={() => copyPath(job.nasPath)}
                                            className="w-full flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-left active:bg-muted transition-colors"
                                        >
                                            <HardDrive className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                            <code className="text-[11px] text-muted-foreground font-mono flex-1 truncate">
                                                {job.nasPath}
                                            </code>
                                            <Copy className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                            {copiedPath === job.nasPath && (
                                                <span className="text-[10px] text-emerald-500 font-medium shrink-0">คัดลอกแล้ว!</span>
                                            )}
                                        </button>

                                        {/* File checklist */}
                                        <div className="space-y-1.5">
                                            {FOLDER_TEMPLATE.map((folder) => {
                                                const status = job.files[folder.key] || 'empty'
                                                const Icon = folder.icon

                                                return (
                                                    <div
                                                        key={folder.key}
                                                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/30 transition-colors"
                                                    >
                                                        {fileStatusIcon[status]}
                                                        <Icon className="w-4 h-4 text-muted-foreground" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium">{folder.label}</p>
                                                            <p className="text-[10px] text-muted-foreground">{folder.desc}</p>
                                                        </div>
                                                        <span className={cn(
                                                            'text-[10px]',
                                                            status === 'complete' ? 'text-emerald-500' : status === 'has_files' ? 'text-yellow-500' : 'text-muted-foreground/50'
                                                        )}>
                                                            {fileStatusLabel[status]}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
