'use client'

import { useState } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileText, BarChart3, Calendar } from 'lucide-react'

import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'

interface ReportConfig {
	type: 'task-summary' | 'productivity' | 'time-tracking' | 'project-status'
	format: 'pdf' | 'excel' | 'csv'
	dateRange: DateRange | undefined
	filters: {
		projectIds: string[]
		userIds: string[]
		statuses: string[]
		priorities: string[]
	}
	includeCharts: boolean
	includeComments: boolean
	includeAttachments: boolean
}

export function ReportGenerator() {
	const [config, setConfig] = useState<ReportConfig>({
		type: 'task-summary',
		format: 'pdf',
		dateRange: undefined,
		filters: {
			projectIds: [],
			userIds: [],
			statuses: [],
			priorities: [],
		},
		includeCharts: true,
		includeComments: false,
		includeAttachments: false,
	})
	const [isGenerating, setIsGenerating] = useState(false)

	const reportTypes = [
		{
			value: 'task-summary',
			label: 'Resumen de Tareas',
			icon: <FileText className="h-4 w-4" />,
		},
		{
			value: 'productivity',
			label: 'Productividad del Equipo',
			icon: <BarChart3 className="h-4 w-4" />,
		},
		{
			value: 'time-tracking',
			label: 'Seguimiento de Tiempo',
			icon: <Calendar className="h-4 w-4" />,
		},
		{
			value: 'project-status',
			label: 'Estado de Proyectos',
			icon: <BarChart3 className="h-4 w-4" />,
		},
	]

	const handleGenerateReport = async () => {
		if (!config.dateRange?.from || !config.dateRange?.to) {
			toast('Error', {
				description: 'Debes seleccionar un rango de fechas',
			})
			return
		}

		setIsGenerating(true)
		try {
			const response = await fetch('/api/reports/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(config),
			})

			if (!response.ok) {
				throw new Error('Error generando el reporte')
			}

			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `reporte-${config.type}-${Date.now()}.${config.format}`
			document.body.appendChild(a)
			a.click()
			window.URL.revokeObjectURL(url)
			document.body.removeChild(a)

			toast('Reporte generado', {
				description: 'El reporte se ha descargado exitosamente',
			})
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			toast('Error', {
				description: 'No se pudo generar el reporte',
			})
		} finally {
			setIsGenerating(false)
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Reportes</h1>
				<p className="text-gray-600">
					Genera reportes personalizados de tu proyecto
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Configuración del Reporte</CardTitle>
					<CardDescription>
						Selecciona los parámetros para generar tu reporte
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Report Type */}
					<div className="space-y-2">
						<Label>Tipo de Reporte</Label>
						<Select
							value={config.type}
							onValueChange={(value: ReportConfig['type']) =>
								setConfig({ ...config, type: value })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{reportTypes.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										<div className="flex items-center gap-2">
											{type.icon}
											{type.label}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Format */}
					<div className="space-y-2">
						<Label>Formato</Label>
						<Select
							value={config.format}
							onValueChange={(value: ReportConfig['format']) =>
								setConfig({ ...config, format: value })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="pdf">PDF</SelectItem>
								<SelectItem value="excel">Excel</SelectItem>
								<SelectItem value="csv">CSV</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Options */}
					<div className="space-y-4">
						<Label>Opciones Adicionales</Label>
						<div className="space-y-3">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="charts"
									checked={config.includeCharts}
									onCheckedChange={(checked) =>
										setConfig({ ...config, includeCharts: checked as boolean })
									}
								/>
								<Label htmlFor="charts">Incluir gráficos</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="comments"
									checked={config.includeComments}
									onCheckedChange={(checked) =>
										setConfig({
											...config,
											includeComments: checked as boolean,
										})
									}
								/>
								<Label htmlFor="comments">Incluir comentarios</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="attachments"
									checked={config.includeAttachments}
									onCheckedChange={(checked) =>
										setConfig({
											...config,
											includeAttachments: checked as boolean,
										})
									}
								/>
								<Label htmlFor="attachments">Incluir archivos adjuntos</Label>
							</div>
						</div>
					</div>

					<Button
						onClick={handleGenerateReport}
						disabled={isGenerating}
						className="w-full"
					>
						{isGenerating ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								Generando reporte...
							</>
						) : (
							<>
								<Download className="h-4 w-4 mr-2" />
								Generar Reporte
							</>
						)}
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
