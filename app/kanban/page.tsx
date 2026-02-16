'use client'

import { useState } from 'react'
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
    type DragOverEvent,
    useDroppable,
} from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { KANBAN_COLUMNS, STATUS_CONFIG, PRIORITY_CONFIG, type OrderStatus, type Priority } from '@/lib/types'
import { Clock, GripVertical } from 'lucide-react'

interface KanbanJob {
    id: string
    title: string
    customer: string
    status: OrderStatus
    priority: Priority
    deadline: string
}

// Demo data
const demoJobs: KanbanJob[] = [
    { id: '1', title: 'ป้ายหน้าร้าน ABC', customer: 'คุณสมชาย', status: 'new', priority: 'high', deadline: '2026-02-20' },
    { id: '2', title: 'ป้ายไวนิลงานเปิดตัว', customer: 'บ.XYZ', status: 'designing', priority: 'urgent', deadline: '2026-02-18' },
    { id: '3', title: 'ตัวอักษร LED', customer: 'คุณมาลี', status: 'new', priority: 'medium', deadline: '2026-02-25' },
    { id: '4', title: 'สติกเกอร์กระจก', customer: 'คุณวิชัย', status: 'production', priority: 'low', deadline: '2026-02-22' },
    { id: '5', title: 'ป้ายอะคริลิค', customer: 'คุณจิรา', status: 'approved', priority: 'medium', deadline: '2026-02-28' },
    { id: '6', title: 'ป้ายไฟ Neon', customer: 'คุณอรุณ', status: 'production', priority: 'high', deadline: '2026-02-21' },
    { id: '7', title: 'โรลอัพ สัมมนา', customer: 'บ.ABC', status: 'qc', priority: 'medium', deadline: '2026-02-19' },
    { id: '8', title: 'ป้าย Lightbox', customer: 'คุณพิชัย', status: 'installing', priority: 'high', deadline: '2026-02-17' },
    { id: '9', title: 'สติกเกอร์รถ', customer: 'คุณกานดา', status: 'done', priority: 'low', deadline: '2026-02-15' },
]

// ===== Draggable Job Card =====
function DraggableJobCard({ job }: { job: KanbanJob }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: job.id,
        data: { job },
    })
    const priorityConf = PRIORITY_CONFIG[job.priority]

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.3 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <Card className="border-0 shadow-sm touch-none">
                <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                        <div {...listeners} className="cursor-grab active:cursor-grabbing touch-none p-1 -ml-1">
                            <GripVertical className="w-4 h-4 text-muted-foreground/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{job.title}</p>
                            <p className="text-xs text-muted-foreground">{job.customer}</p>
                            <div className="flex items-center gap-1.5 mt-2">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">
                                    {new Date(job.deadline).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                </span>
                                <span className={cn('text-[10px]', priorityConf.color)}>
                                    {priorityConf.label}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// ===== Overlay Card (shown while dragging) =====
function OverlayCard({ job }: { job: KanbanJob }) {
    const priorityConf = PRIORITY_CONFIG[job.priority]
    return (
        <div className="w-[260px] rotate-2 scale-105">
            <Card className="border-2 border-primary shadow-xl">
                <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{job.title}</p>
                            <p className="text-xs text-muted-foreground">{job.customer}</p>
                            <div className="flex items-center gap-1.5 mt-2">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">
                                    {new Date(job.deadline).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                </span>
                                <span className={cn('text-[10px]', priorityConf.color)}>
                                    {priorityConf.label}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
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
                isOver ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-muted/30'
            )}
        >
            {children}
        </div>
    )
}

// ===== Main Kanban Page =====
export default function KanbanPage() {
    const [jobs, setJobs] = useState<KanbanJob[]>(demoJobs)
    const [activeJob, setActiveJob] = useState<KanbanJob | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const job = event.active.data.current?.job as KanbanJob
        setActiveJob(job || null)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveJob(null)
        const { active, over } = event

        if (!over) return

        const jobId = active.id as string
        const newStatus = over.id as OrderStatus

        // Only update if dropped on a valid column
        if (KANBAN_COLUMNS.includes(newStatus)) {
            setJobs(prev =>
                prev.map(job =>
                    job.id === jobId ? { ...job, status: newStatus } : job
                )
            )
        }
    }

    return (
        <div className="min-h-screen">
            <PageHeader title="📋 กระดานงาน" subtitle="ลากย้ายการ์ดเพื่อเปลี่ยนสถานะ (ไป-กลับได้)" />

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-3 px-4 pb-4 min-w-max">
                        {KANBAN_COLUMNS.map((col) => {
                            const config = STATUS_CONFIG[col]
                            const columnJobs = jobs.filter(j => j.status === col)

                            return (
                                <div key={col} className="w-[280px] shrink-0">
                                    {/* Column Header */}
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <div className={cn('w-3 h-3 rounded-full', config.color)} />
                                        <span className="font-semibold text-sm">{config.icon} {config.label}</span>
                                        <Badge variant="secondary" className="text-[10px] ml-auto">
                                            {columnJobs.length}
                                        </Badge>
                                    </div>

                                    {/* Droppable area */}
                                    <DroppableColumn id={col}>
                                        {columnJobs.length === 0 && (
                                            <div className="flex items-center justify-center h-24 text-muted-foreground text-xs border-2 border-dashed border-muted-foreground/20 rounded-lg">
                                                ลากวางที่นี่
                                            </div>
                                        )}
                                        {columnJobs.map((job) => (
                                            <DraggableJobCard key={job.id} job={job} />
                                        ))}
                                    </DroppableColumn>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeJob ? <OverlayCard job={activeJob} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
