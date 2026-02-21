'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { User, Activity, Clock, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getOrderHistory } from '@/actions/history'

interface JobDetailsDialogProps {
    job: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function JobDetailsDialog({ job, open, onOpenChange }: JobDetailsDialogProps) {
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && job?.id) {
            setLoading(true)
            getOrderHistory(job.id)
                .then(data => setHistory(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false))
        }
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
                                                        {format(new Date(record.createdAt), 'HH:mm dd/MM', { locale: th })}
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

function formatAction(record: any) {
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
