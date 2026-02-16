interface PageHeaderProps {
    title: string
    subtitle?: string
    children?: React.ReactNode
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
    return (
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
                )}
            </div>
            {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
    )
}
