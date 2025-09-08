'use client'

import {
	Download,
	Eye,
	Trash2,
	FileText,
	ImageIcon,
	FileSpreadsheet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface Attachment {
	id: string
	name: string
	url: string
	size: number
	type: string
	uploadedAt: Date
	uploadedBy: {
		name: string
		avatar?: string
	}
}

interface AttachmentViewerProps {
	attachments: Attachment[]
	onDelete?: (id: string) => void
	canDelete?: boolean
}

export function AttachmentViewer({
	attachments,
	onDelete,
	canDelete = false,
}: AttachmentViewerProps) {
	const { toast } = useToast()

	const getFileIcon = (type: string) => {
		if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
		if (type.includes('pdf')) return <FileText className="h-4 w-4" />
		if (type.includes('sheet') || type.includes('excel'))
			return <FileSpreadsheet className="h-4 w-4" />
		return <FileText className="h-4 w-4" />
	}

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
	}

	const handleDownload = async (attachment: Attachment) => {
		try {
			const response = await fetch(attachment.url)
			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = attachment.name
			document.body.appendChild(a)
			a.click()
			window.URL.revokeObjectURL(url)
			document.body.removeChild(a)
		} catch (error) {
			toast({
				title: 'Error',
				description: 'No se pudo descargar el archivo',
				variant: 'destructive',
			})
		}
	}

	const handleDelete = async (id: string) => {
		if (onDelete) {
			try {
				await onDelete(id)
				toast({
					title: 'Archivo eliminado',
					description: 'El archivo se ha eliminado exitosamente',
				})
			} catch (error) {
				toast({
					title: 'Error',
					description: 'No se pudo eliminar el archivo',
					variant: 'destructive',
				})
			}
		}
	}

	if (attachments.length === 0) {
		return (
			<div className="text-center py-6 text-gray-500">
				No hay archivos adjuntos
			</div>
		)
	}

	return (
		<div className="space-y-3">
			{attachments.map((attachment) => (
				<div
					key={attachment.id}
					className="flex items-center justify-between p-3 border rounded-lg"
				>
					<div className="flex items-center gap-3">
						<div className="flex-shrink-0">{getFileIcon(attachment.type)}</div>
						<div className="min-w-0 flex-1">
							<div className="text-sm font-medium truncate">
								{attachment.name}
							</div>
							<div className="flex items-center gap-2 text-xs text-gray-500">
								<span>{formatFileSize(attachment.size)}</span>
								<span>•</span>
								<span>Subido por {attachment.uploadedBy.name}</span>
								<span>•</span>
								<span>
									{new Date(attachment.uploadedAt).toLocaleDateString()}
								</span>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-1">
						{attachment.type.startsWith('image/') && (
							<Dialog>
								<DialogTrigger asChild>
									<Button variant="ghost" size="sm">
										<Eye className="h-4 w-4" />
									</Button>
								</DialogTrigger>
								<DialogContent className="max-w-4xl">
									<DialogHeader>
										<DialogTitle>{attachment.name}</DialogTitle>
									</DialogHeader>
									<div className="flex justify-center">
										<Image
											src={attachment.url}
											alt={attachment.name}
											className="max-w-full max-h-[70vh] object-contain"
											width={1024}
											height={768}
											unoptimized={true}
										/>
									</div>
								</DialogContent>
							</Dialog>
						)}

						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleDownload(attachment)}
						>
							<Download className="h-4 w-4" />
						</Button>

						{canDelete && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleDelete(attachment.id)}
								className="text-red-600 hover:text-red-700"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			))}
		</div>
	)
}
