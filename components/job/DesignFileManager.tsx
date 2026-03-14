'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Upload, File, Trash2, Download, Loader2, Image as ImageIcon } from 'lucide-react'
import { getDesignFiles, addDesignFile, deleteDesignFile } from '@/actions/design-files'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { createBrowser } from '@/lib/supabase-browser'

interface DesignFileManagerProps {
    orderId: string
}

export function DesignFileManager({ orderId }: DesignFileManagerProps) {
    const [files, setFiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const loadFiles = async () => {
        setLoading(true)
        try {
            const data = await getDesignFiles(orderId)
            setFiles(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadFiles()
    }, [orderId])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 50 * 1024 * 1024) {
            return toast.error("File size exceeds 50MB limit")
        }

        setUploading(true)

        try {
            const supabase = createBrowser()
            const fileName = `${orderId}/${Date.now()}_${file.name}`
            
            // 1. Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('design-files')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                    onUploadProgress: (p) => {
                        const percent = (p.loaded / p.total) * 100
                        setProgress(Math.round(percent))
                    }
                })

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('design-files')
                .getPublicUrl(fileName)

            // 3. Save to Metadata DB
            await addDesignFile({
                orderId,
                fileName: file.name,
                fileUrl: publicUrl,
                fileType: file.type,
                filesize: file.size
            })

            toast.success("อัปโหลดไฟล์เรียบร้อยแล้ว")
            loadFiles()
        } catch (error: any) {
            console.error(error)
            toast.error(`อัปโหลดล้มเหลว: ${error.message || 'Error'}`)
        } finally {
            setUploading(false)
            setProgress(0)
            e.target.value = ''
        }
    }

    const handleDelete = async (fileId: string) => {
        if (!confirm("ยืนยันการลบไฟล์?")) return
        
        try {
            await deleteDesignFile(fileId, orderId)
            toast.success("ลบไฟล์เรียบร้อยแล้ว")
            setFiles(files.filter(f => f.id !== fileId))
        } catch (error) {
            toast.error("ลบไฟล์ล้มเหลว")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <File className="w-4 h-4" /> ไฟล์ออกแบบ ({files.length})
                </h3>
                <div className="relative">
                    <Input
                        type="file"
                        className="hidden"
                        id="design-file-upload"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                    <label htmlFor="design-file-upload">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 cursor-pointer" 
                            asChild
                            disabled={uploading}
                        >
                            <span>
                                {uploading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Upload className="w-3 h-3 mr-2" />}
                                อัปโหลด
                            </span>
                        </Button>
                    </label>
                </div>
            </div>

            {uploading && (
                <div className="space-y-1">
                    <Progress value={progress} className="h-1" />
                    <p className="text-[10px] text-muted-foreground text-right">Uploading... {progress}%</p>
                </div>
            )}

            <div className="space-y-2">
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground text-xs animate-pulse font-bold uppercase tracking-widest">
                        Syncing Files...
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-10" />
                        <p className="text-xs text-muted-foreground">ยังไม่มีไฟล์ออกแบบ</p>
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {files.map((file) => (
                            <div 
                                key={file.id} 
                                className="group flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 bg-background rounded-md border text-primary">
                                        <File className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate max-w-[150px] md:max-w-[250px]">
                                            {file.fileName}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {format(new Date(file.createdAt), 'dd MMM HH:mm', { locale: th })} • {(file.filesize / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" asChild>
                                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(file.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
