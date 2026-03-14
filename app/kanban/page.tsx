'use client'

import { useState, useEffect } from 'react'
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    closestCenter,
    type DragStartEvent,
    type DragEndEvent,
    useDroppable,
} from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { KANBAN_COLUMNS, STATUS_CONFIG, PRIORITY_CONFIG, type OrderStatus, type Priority } from '@/lib/types'
import { Clock, GripVertical, MoreHorizontal, Loader2, User, CheckCircle2, Paperclip } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { getOrders, updateOrderStatus, updateOrderAssignee } from '@/actions/orders'
import { getProfiles } from '@/actions/profiles'
import { toast } from 'sonner'
import { JobDetailsDialog } from '@/components/job/JobDetailsDialog'

interface KanbanJob {
    id: string
    title: string
    customer: string
    status: OrderStatus
    priority: Priority
    deadline: string
    assigneeId: string | null
    assigneeName?: string
    assigneeAvatar?: string
    progress?: number
    attachmentCount?: number
}

interface Profile {
    id: string
    full_name: string | null
    avatar_url: string | null
}

// ===== Job Card Component =====
function JobCard({
    job,
    isMobile,
    profiles,
    onMoveTo,
    onAssign,
    onClick
}: {
    job: KanbanJob;
    isMobile?: boolean;
    profiles: Profile[];
    onMoveTo?: (status: OrderStatus) => void;
    onAssign: (jobId: string, assigneeId: string | null) => void;
    onClick: () => void;
}) {
    const priorityConf = PRIORITY_CONFIG[job.priority] || PRIORITY_CONFIG.medium

    return (
        <Card
            className="border-0 shadow-sm touch-none h-full flex flex-col hover:shadow-md transition-shadow group cursor-pointer"
            onClick={onClick}
        >
            <CardContent className="p-3 flex-1">
                <div className="flex items-start gap-2">
                    {/* Drag Handle for Desktop */}
                    {!isMobile && (
                        <div className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/40 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4" />
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <p className="font-medium text-sm truncate pr-2">{job.title}</p>
                            {/* Mobile Move Menu */}
                            {isMobile && onMoveTo && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1" onClick={(e) => e.stopPropagation()}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>ย้ายไปสถานะ...</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {KANBAN_COLUMNS.map((col) => {
                                            if (col === job.status) return null // Don't show current status
                                            const config = STATUS_CONFIG[col]
                                            return (
                                                <DropdownMenuItem key={col} onClick={(e) => {
                                                    e.stopPropagation()
                                                    onMoveTo(col)
                                                }}>
                                                    <span className={cn("w-2 h-2 rounded-full mr-2", config.color.replace('text-', 'bg-'))} />
                                                    {config.label}
                                                </DropdownMenuItem>
                                            )
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground">{job.customer}</p>

                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {job.deadline && (
                                    <div className="flex items-center gap-1" title="Deadline">
                                        <Clock className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-[10px] text-muted-foreground">
                                            {new Date(job.deadline).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                )}
                                    <Badge variant="outline" className={cn('text-[10px] h-5 px-1.5 font-normal border-0 bg-opacity-10', priorityConf.color.replace('text-', 'bg-').replace('600', '100'), priorityConf.color)}>
                                    {priorityConf.label}
                                </Badge>
                                {(job.attachmentCount ?? 0) > 0 && (
                                    <div className="flex items-center gap-1 ml-1" title={`${job.attachmentCount} attachments`}>
                                        <Paperclip className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-[10px] text-muted-foreground font-medium">{job.attachmentCount}</span>
                                    </div>
                                )}
                                {(job.progress ?? 0) > 0 && (
                                    <div className="flex items-center gap-1.5 ml-1" title={`Progress: ${job.progress}%`}>
                                        <CheckCircle2 className={cn("w-3 h-3", job.progress === 100 ? "text-green-500" : "text-muted-foreground")} />
                                        <span className="text-[10px] text-muted-foreground font-medium">{job.progress}%</span>
                                    </div>
                                )}
                            </div>

                            {/* Assignee Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0 -mr-1" title={job.assigneeName || "Unassigned"} onClick={(e) => e.stopPropagation()}>
                                        <Avatar className="h-6 w-6 border border-border">
                                            <AvatarImage src={job.assigneeAvatar || undefined} />
                                            <AvatarFallback className="text-[10px] bg-muted">
                                                {job.assigneeName ? job.assigneeName[0].toUpperCase() : <User className="w-3 h-3 text-muted-foreground" />}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>มอบหมายงานให้</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation()
                                        onAssign(job.id, null)
                                    }}>
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="w-5 h-5 rounded-full border border-dashed border-muted-foreground flex items-center justify-center">
                                                <User className="w-3 h-3 text-muted-foreground" />
                                            </div>
                                            <span className="text-muted-foreground">ไม่ระบุ</span>
                                        </div>
                                    </DropdownMenuItem>
                                    {profiles.map(profile => (
                                        <DropdownMenuItem key={profile.id} onClick={(e) => {
                                            e.stopPropagation()
                                            onAssign(job.id, profile.id)
                                        }}>
                                            <div className="flex items-center gap-2 w-full">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarImage src={profile.avatar_url || undefined} />
                                                    <AvatarFallback className="text-[9px]">{profile.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <span>{profile.full_name || 'ธนิส'}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
                {/* Progress Bar */}
                {(job.progress ?? 0) > 0 && job.progress !== 100 && (
                    <div className="mt-3">
                        <Progress value={job.progress} className="h-1" />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ===== Draggable Wrapper (Desktop) =====
function DraggableJobCard({ job, profiles, onAssign, onClick }: { job: KanbanJob; profiles: Profile[]; onAssign: (jobId: string, assigneeId: string | null) => void; onClick: () => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: job.id,
        data: { job },
    })

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.3 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <JobCard job={job} profiles={profiles} onAssign={onAssign} onClick={onClick} />
        </div>
    )
}

// ===== Overlay Card (shown while dragging) =====
function OverlayCard({ job, profiles }: { job: KanbanJob; profiles: Profile[] }) {
    return (
        <div className="w-[280px] rotate-2 scale-105 opacity-90 cursor-grabbing">
            <JobCard job={job} profiles={profiles} onAssign={() => { }} onClick={() => { }} />
        </div>
    )
}

// ===== Droppable Column =====
function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
    const { isOver, setNodeRef } = useDroppable({ id })

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'space-y-2 min-h-[200px] rounded-xl p-2 transition-colors',
                isOver ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-muted/30'
            )}
        >
            {children}
        </div>
    )
}

// ===== Main Kanban Page =====
export default function KanbanPage() {
    const [jobs, setJobs] = useState<KanbanJob[]>([])
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeJob, setActiveJob] = useState<KanbanJob | null>(null)
    const [activeTab, setActiveTab] = useState<OrderStatus>('new') // Mobile Tab State
    const [mounted, setMounted] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Details Dialog State
    const [selectedJob, setSelectedJob] = useState<KanbanJob | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)

    useEffect(() => {
        setMounted(true)
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Fetch Real Data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [orders, profilesData] = await Promise.all([
                    getOrders(),
                    getProfiles()
                ])

                // Map API data to Kanban format
                const mappedJobs: KanbanJob[] = orders.map((o: any) => ({
                    id: o.id,
                    title: o.OrderItem?.[0]?.name || 'งานไม่ระบุชื่อ',
                    customer: o.Customer?.name || 'ลูกค้าทั่วไป',
                    status: o.status as OrderStatus,
                    priority: o.priority as Priority,
                    deadline: o.deadline || '',
                    assigneeId: o.assigneeId,
                    assigneeName: o.profiles?.full_name,
                    assigneeAvatar: o.profiles?.avatar_url,
                    progress: o.progresspercent || 0,
                    attachmentCount: o.DesignFile?.length || 0
                }))

                setJobs(mappedJobs)
                setProfiles(profilesData as Profile[])
            } catch (error) {
                console.error("Failed to fetch data:", error)
                toast.error("โหลดข้อมูลล้มเหลว")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    )

    // Handlers
    const handleDragStart = (event: DragStartEvent) => {
        const job = event.active.data.current?.job as KanbanJob
        setActiveJob(job || null)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveJob(null)
        const { active, over } = event

        if (!over) return

        const jobId = active.id as string
        const newStatus = over.id as OrderStatus

        if (active.data.current?.job.status === newStatus) return

        // Optimistic Update
        const oldJobs = [...jobs]
        setJobs(prev => prev.map(job => job.id === jobId ? { ...job, status: newStatus } : job))

        // Server Action
        try {
            const result = await updateOrderStatus(jobId, newStatus)
            if (!result.success) {
                throw new Error(result.error)
            }
            toast.success(`ย้ายงานไปที่ '${STATUS_CONFIG[newStatus].label}' แล้ว`)
        } catch (error) {
            setJobs(oldJobs) // Revert
            toast.error("อัปเดตสถานะไม่สำเร็จ")
        }
    }

    const handleMobileMove = async (jobId: string, newStatus: OrderStatus) => {
        const oldJobs = [...jobs]
        setJobs(prev => prev.map(job => job.id === jobId ? { ...job, status: newStatus } : job))

        try {
            const result = await updateOrderStatus(jobId, newStatus)
            if (!result.success) throw new Error(result.error)
            toast.success(`ย้ายงานไปที่ '${STATUS_CONFIG[newStatus].label}' แล้ว`)
        } catch (error) {
            setJobs(oldJobs)
            toast.error("เกิดข้อผิดพลาดในการย้ายงาน")
        }
    }

    const handleAssign = async (jobId: string, assigneeId: string | null) => {
        // Optimistic Update
        const oldJobs = [...jobs]
        const assignee = profiles.find(p => p.id === assigneeId)

        setJobs(prev => prev.map(job =>
            job.id === jobId
                ? {
                    ...job,
                    assigneeId,
                    assigneeName: assignee?.full_name || undefined,
                    assigneeAvatar: assignee?.avatar_url || undefined
                }
                : job
        ))

        try {
            const result = await updateOrderAssignee(jobId, assigneeId)
            if (!result.success) throw new Error(result.error)
            toast.success("อัปเดตผู้รับผิดชอบแล้ว")
        } catch (error) {
            setJobs(oldJobs)
            toast.error("เกิดข้อผิดพลาดในการมอบหมายงาน")
        }
    }

    if (!mounted) return null

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <PageHeader title="📋 กระดานงาน" subtitle="กำลังโหลด..." />
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-20 md:pb-6">
            <PageHeader title="📋 กระดานงาน" subtitle={isMobile ? "แตะที่ ... เพื่อย้ายสถานะ" : "ลากการ์ดเพื่อย้ายสถานะ"} />

            {/* Mobile View: Tabs + Single Column */}
            <div className="md:hidden">
                <div className="px-4 sticky top-0 z-10 bg-background/95 backdrop-blur py-2 border-b">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
                        {KANBAN_COLUMNS.map((col) => {
                            const config = STATUS_CONFIG[col]
                            const count = jobs.filter(j => j.status === col).length
                            const isActive = activeTab === col

                            return (
                                <button
                                    key={col}
                                    onClick={() => setActiveTab(col)}
                                    className={cn(
                                        "snap-start flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border whitespace-nowrap",
                                        isActive
                                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                            : "bg-background text-muted-foreground border-border hover:bg-muted"
                                    )}
                                >
                                    <span className={cn("w-2 h-2 rounded-full", isActive ? "bg-white" : config.color.replace('text-', 'bg-'))} />
                                    {config.label}
                                    {count > 0 && (
                                        <Badge variant="secondary" className="ml-1 px-1.5 h-5 min-w-[1.25rem] bg-white/20 text-current">
                                            {count}
                                        </Badge>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="p-4 space-y-3 min-h-[50vh]">
                    {jobs.filter(j => j.status === activeTab).map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            profiles={profiles}
                            isMobile={true}
                            onMoveTo={(status) => handleMobileMove(job.id, status)}
                            onAssign={handleAssign}
                            onClick={() => {
                                setSelectedJob(job)
                                setDetailsOpen(true)
                            }}
                        />
                    ))}
                    {jobs.filter(j => j.status === activeTab).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                            <p>ไม่มีงานในสถานะนี้</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop View: Drag & Drop Columns */}
            <div className="hidden md:block px-6">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex gap-4 pb-4 min-w-max">
                            {KANBAN_COLUMNS.map((col) => {
                                const config = STATUS_CONFIG[col]
                                const columnJobs = jobs.filter(j => j.status === col)

                                return (
                                    <div key={col} className="w-[300px] shrink-0">
                                        <div className="flex items-center gap-2 mb-3 px-1 sticky top-0 bg-background/50 backdrop-blur-sm py-2 z-10">
                                            <div className={cn('w-3 h-3 rounded-full', config.color)} />
                                            <span className="font-semibold text-sm">{config.icon} {config.label}</span>
                                            <Badge variant="secondary" className="text-[10px] ml-auto">
                                                {columnJobs.length}
                                            </Badge>
                                        </div>

                                        <DroppableColumn id={col}>
                                            {columnJobs.length === 0 && (
                                                <div className="flex items-center justify-center h-24 text-muted-foreground text-xs border-2 border-dashed border-muted-foreground/20 rounded-lg">
                                                    ลากวางที่นี่
                                                </div>
                                            )}
                                            {columnJobs.map((job) => (
                                                <DraggableJobCard
                                                    key={job.id}
                                                    job={job}
                                                    profiles={profiles}
                                                    onAssign={handleAssign}
                                                    onClick={() => {
                                                        setSelectedJob(job)
                                                        setDetailsOpen(true)
                                                    }}
                                                />
                                            ))}
                                        </DroppableColumn>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <DragOverlay>
                        {activeJob ? <OverlayCard job={activeJob} profiles={profiles} /> : null}
                    </DragOverlay>
                </DndContext>
            </div>

            <JobDetailsDialog
                job={selectedJob}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
            />
        </div>
    )
}
