'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Activity, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getOrderHistory, type OrderHistoryRecord } from '@/actions/history'
import { updateOrderProgress } from '@/actions/orders'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { DesignFileManager } from './DesignFileManager'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

type JobSummary = {
    id: string
    title: string
    customer: string
    status: string
    priority: string
    deadline: string
    assigneeName?: string
    assigneeAvatar?: string
    progress?: number
}

interface JobDetailsDialogProps {
    job: JobSummary | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function JobDetailsDialog({ job, open, onOpenChange }: JobDetailsDialogProps) {
    const [history, setHistory] = useState<OrderHistoryRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        if (job) setProgress(job.progress || 0)
    }, [job?.id, job?.progress])

    useEffect(() => {
        let ignore = false;
        if (open && job?.id) {
            const fetchHistory = async () => {
                setLoading(true);
                try {
                    const data = await getOrderHistory(job.id);
                    if (!ignore) setHistory(data);
                } catch (err) {
                    if (!ignore) console.error(err);
                } finally {
                    if (!ignore) setLoading(false);
                }
            };
            fetchHistory();
        }
        return () => { ignore = true; };
    }, [open, job?.id])

    if (!job) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md md:max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{job.id.slice(0, 8)}</Badge>
                        <Badge className={job.priority === 'urgent' ? 'bg-red-500' : 'bg-blue-500'}>
                            {job.priority}
                        </Badge>
                    </div>
                    <DialogTitle className="text-xl">{job.title}</DialogTitle>
                    <p className="text-muted-foreground text-sm">{job.customer}</p>
                </DialogHeader>

                <div className="flex-1 overflow-hidden grid gap-4 py-4 md:grid-cols-2">
                    {/* Details Column */}
                    <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4" /> รายละเอียด
                            </h3>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">สถานะ:</span>
                                    <Badge variant="secondary">{job.status}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">กำหนดส่ง:</span>
                                    <span>{job.deadline ? format(new Date(job.deadline), 'dd MMM yyyy', { locale: th }) : '-'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">ผู้รับผิดชอบ:</span>
                                    <div className="flex items-center gap-2">
                                        {job.assigneeAvatar && <Avatar className="w-5 h-5"><AvatarImage src={job.assigneeAvatar} /></Avatar>}
                                        <span>{job.assigneeName || 'ไม่ระบุ'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Section */}
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-sm">ความคืบหน้า</h3>
                                <span className="text-lg font-bold text-primary">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="flex items-center gap-2">
                                <Input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={progress}
                                    onChange={(e) => setProgress(parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <Button 
                                    size="sm" 
                                    className="h-8 gap-1.5" 
                                    disabled={isUpdating || progress === job.progress}
                                    onClick={async () => {
                                        setIsUpdating(true)
                                        try {
                                            const res = await updateOrderProgress(job.id, progress)
                                            if (res.success) {
                                                toast.success('อัปเดตความคืบหน้าแล้ว')
                                                // We don't need to manually refresh job because KanbanPage will be revalidated
                                            } else {
                                                toast.error(res.error || 'อัปเดตล้มเหลว')
                                            }
                                        } finally {
                                            setIsUpdating(false)
                                        }
                                    }}
                                >
                                    {isUpdating ? <Activity className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                    บันทึก
                                </Button>
                            </div>
                            <div className="flex gap-1 overflow-x-auto pb-1">
                                {[0, 25, 50, 75, 100].map(p => (
                                    <Button
                                        key={p}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-[10px] px-2 min-w-[3rem]"
                                        onClick={() => setProgress(p)}
                                    >
                                        {p}%
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Design Files Section */}
                        <div className="p-4 bg-muted/10 rounded-lg border">
                            <DesignFileManager orderId={job.id} />
                        </div>
                    </div>

                    {/* History Column */}
                    <div className="flex flex-col h-full overflow-hidden">
                        <h3 className="font-semibold flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4" /> ประวัติการแก้ไข
                        </h3>
                        <div className="flex-1 overflow-y-auto bg-muted/10 rounded-lg border p-4">
                            {loading ? (
                                <div className="text-center py-4 text-muted-foreground text-sm">กำลังโหลด...</div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground text-sm">ยังไม่มีประวัติ</div>
                            ) : (
                                <div className="space-y-4 relative pl-2">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

                                    {history.map((record, i) => (
                                        <div key={record.id} className="relative z-10 flex gap-3 text-sm">
                                            <div className="mt-0.5 relative">
                                                <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">
                                                        {record.profiles?.full_name || 'ระบบ'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                        {record.createdAt ? format(new Date(record.createdAt), 'HH:mm dd/MM', { locale: th }) : '-'}
                                                    </span>
                                                </div>
                                                <p className="text-muted-foreground text-xs leading-relaxed">
                                                    {formatAction(record)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function formatAction(record: OrderHistoryRecord) {
    switch (record.action) {
        case 'STATUS_CHANGE':
            const details = JSON.parse(record.details || '{}')
            return `เปลี่ยนสถานะเป็น "${details.status}"`
        case 'ASSIGNEE_UPDATE':
            const details2 = JSON.parse(record.details || '{}')
            // Using ID mostly, ideal would be to lookup name, but keeping simple
            return details2.assigneeId ? 'เปลี่ยนผู้รับผิดชอบ' : 'ยกเลิกผู้รับผิดชอบ'
        default:
            return record.action
    }
}
