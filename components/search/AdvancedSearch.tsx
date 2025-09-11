'use client'

import { useState, useEffect } from 'react'
import { User, Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Search,
	Filter,
	X,
	Calendar as CalendarIcon,
	User as UserIcon,
	Tag,
	Flag,
	FolderOpen,
	SlidersHorizontal,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export interface SearchFilters {
	query: string
	status: string[]
	priority: string[]
	assigneeIds: string[]
	projectIds: string[]
	dueDateFrom?: Date
	dueDateTo?: Date
	createdFrom?: Date
	createdTo?: Date
}

interface AdvancedSearchProps {
	filters: SearchFilters
	onFiltersChange: (filters: SearchFilters) => void
	projects: Project[]
	users: User[]
	className?: string
}

const statusOptions = [
	{ value: 'BACKLOG', label: 'Backlog', color: 'bg-gray-100 text-gray-700' },
	{ value: 'TODO', label: 'Por hacer', color: 'bg-blue-100 text-blue-700' },
	{
		value: 'IN_PROGRESS',
		label: 'En progreso',
		color: 'bg-yellow-100 text-yellow-700',
	},
	{
		value: 'IN_REVIEW',
		label: 'En revisión',
		color: 'bg-purple-100 text-purple-700',
	},
	{ value: 'DONE', label: 'Completado', color: 'bg-green-100 text-green-700' },
]

const priorityOptions = [
	{ value: 'LOW', label: 'Baja', color: 'bg-gray-500' },
	{ value: 'MEDIUM', label: 'Media', color: 'bg-blue-500' },
	{ value: 'HIGH', label: 'Alta', color: 'bg-orange-500' },
	{ value: 'URGENT', label: 'Urgente', color: 'bg-red-500' },
]

export function AdvancedSearch({
	filters,
	onFiltersChange,
	projects,
	users,
	className,
}: AdvancedSearchProps) {
	const [showAdvanced, setShowAdvanced] = useState(false)
	const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)

	useEffect(() => {
		setLocalFilters(filters)
	}, [filters])

	const updateFilters = (newFilters: Partial<SearchFilters>) => {
		const updated = { ...localFilters, ...newFilters }
		setLocalFilters(updated)
		onFiltersChange(updated)
	}

	const clearAllFilters = () => {
		const clearedFilters: SearchFilters = {
			query: '',
			status: [],
			priority: [],
			assigneeIds: [],
			projectIds: [],
			dueDateFrom: undefined,
			dueDateTo: undefined,
			createdFrom: undefined,
			createdTo: undefined,
		}
		setLocalFilters(clearedFilters)
		onFiltersChange(clearedFilters)
	}

	const toggleArrayFilter = (array: string[], value: string) => {
		if (array.includes(value)) {
			return array.filter((item) => item !== value)
		} else {
			return [...array, value]
		}
	}

	const getActiveFiltersCount = () => {
		let count = 0
		if (localFilters.query) count++
		count += localFilters.status.length
		count += localFilters.priority.length
		count += localFilters.assigneeIds.length
		count += localFilters.projectIds.length
		if (localFilters.dueDateFrom) count++
		if (localFilters.dueDateTo) count++
		if (localFilters.createdFrom) count++
		if (localFilters.createdTo) count++
		return count
	}

	const activeFiltersCount = getActiveFiltersCount()

	return (
		<Card className={className}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg flex items-center gap-2">
						<Search className="h-5 w-5" />
						Búsqueda y Filtros
					</CardTitle>
					<div className="flex items-center gap-2">
						{activeFiltersCount > 0 && (
							<Badge variant="secondary" className="text-xs">
								{activeFiltersCount} filtros activos
							</Badge>
						)}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowAdvanced(!showAdvanced)}
						>
							<SlidersHorizontal className="h-4 w-4 mr-1" />
							Avanzado
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Search Query */}
				<div className="relative">
					<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Buscar tareas por título, descripción..."
						value={localFilters.query}
						onChange={(e) => updateFilters({ query: e.target.value })}
						className="pl-10"
					/>
				</div>

				{/* Quick Filters */}
				<div className="flex flex-wrap gap-2">
					{/* Status Filter */}
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm" className="h-8">
								<Filter className="h-3 w-3 mr-1" />
								Estado
								{localFilters.status.length > 0 && (
									<Badge variant="secondary" className="ml-1 h-4 text-xs">
										{localFilters.status.length}
									</Badge>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-64 p-3">
							<div className="space-y-2">
								<Label className="text-sm font-medium">
									Estado de las tareas
								</Label>
								{statusOptions.map((option) => (
									<div
										key={option.value}
										className="flex items-center space-x-2"
									>
										<Checkbox
											id={`status-${option.value}`}
											checked={localFilters.status.includes(option.value)}
											onCheckedChange={(checked) => {
												updateFilters({
													status: checked
														? [...localFilters.status, option.value]
														: localFilters.status.filter(
																(s) => s !== option.value,
														  ),
												})
											}}
										/>
										<Label
											htmlFor={`status-${option.value}`}
											className="text-sm"
										>
											<Badge
												variant="secondary"
												className={cn('ml-1', option.color)}
											>
												{option.label}
											</Badge>
										</Label>
									</div>
								))}
							</div>
						</PopoverContent>
					</Popover>

					{/* Priority Filter */}
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm" className="h-8">
								<Flag className="h-3 w-3 mr-1" />
								Prioridad
								{localFilters.priority.length > 0 && (
									<Badge variant="secondary" className="ml-1 h-4 text-xs">
										{localFilters.priority.length}
									</Badge>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-64 p-3">
							<div className="space-y-2">
								<Label className="text-sm font-medium">
									Prioridad de las tareas
								</Label>
								{priorityOptions.map((option) => (
									<div
										key={option.value}
										className="flex items-center space-x-2"
									>
										<Checkbox
											id={`priority-${option.value}`}
											checked={localFilters.priority.includes(option.value)}
											onCheckedChange={(checked) => {
												updateFilters({
													priority: checked
														? [...localFilters.priority, option.value]
														: localFilters.priority.filter(
																(p) => p !== option.value,
														  ),
												})
											}}
										/>
										<Label
											htmlFor={`priority-${option.value}`}
											className="text-sm flex items-center"
										>
											<div
												className={cn(
													'w-3 h-3 rounded-full mr-2',
													option.color,
												)}
											/>
											{option.label}
										</Label>
									</div>
								))}
							</div>
						</PopoverContent>
					</Popover>

					{/* Project Filter */}
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm" className="h-8">
								<FolderOpen className="h-3 w-3 mr-1" />
								Proyecto
								{localFilters.projectIds.length > 0 && (
									<Badge variant="secondary" className="ml-1 h-4 text-xs">
										{localFilters.projectIds.length}
									</Badge>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-64 p-3">
							<div className="space-y-2">
								<Label className="text-sm font-medium">Proyectos</Label>
								{projects.map((project) => (
									<div key={project.id} className="flex items-center space-x-2">
										<Checkbox
											id={`project-${project.id}`}
											checked={localFilters.projectIds.includes(project.id)}
											onCheckedChange={(checked) => {
												updateFilters({
													projectIds: checked
														? [...localFilters.projectIds, project.id]
														: localFilters.projectIds.filter(
																(p) => p !== project.id,
														  ),
												})
											}}
										/>
										<Label
											htmlFor={`project-${project.id}`}
											className="text-sm"
										>
											{project.name}
										</Label>
									</div>
								))}
							</div>
						</PopoverContent>
					</Popover>

					{/* Assignee Filter */}
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm" className="h-8">
								<UserIcon className="h-3 w-3 mr-1" />
								Asignado
								{localFilters.assigneeIds.length > 0 && (
									<Badge variant="secondary" className="ml-1 h-4 text-xs">
										{localFilters.assigneeIds.length}
									</Badge>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-64 p-3">
							<div className="space-y-2">
								<Label className="text-sm font-medium">Asignado a</Label>
								{users.map((user) => (
									<div key={user.id} className="flex items-center space-x-2">
										<Checkbox
											id={`user-${user.id}`}
											checked={localFilters.assigneeIds.includes(user.id)}
											onCheckedChange={(checked) => {
												updateFilters({
													assigneeIds: checked
														? [...localFilters.assigneeIds, user.id]
														: localFilters.assigneeIds.filter(
																(u) => u !== user.id,
														  ),
												})
											}}
										/>
										<Label htmlFor={`user-${user.id}`} className="text-sm">
											{user.name}
										</Label>
									</div>
								))}
							</div>
						</PopoverContent>
					</Popover>

					{/* Clear All Filters */}
					{activeFiltersCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={clearAllFilters}
							className="h-8 text-muted-foreground hover:text-destructive"
						>
							<X className="h-3 w-3 mr-1" />
							Limpiar
						</Button>
					)}
				</div>

				{/* Advanced Filters */}
				{showAdvanced && (
					<div className="pt-4 border-t space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Date Filters */}
							<div className="space-y-3">
								<Label className="text-sm font-medium">
									Fecha de vencimiento
								</Label>
								<div className="flex gap-2">
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="w-full justify-start text-left font-normal"
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{localFilters.dueDateFrom ? (
													format(localFilters.dueDateFrom, 'PPP', {
														locale: es,
													})
												) : (
													<span>Desde</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0">
											<Calendar
												mode="single"
												selected={localFilters.dueDateFrom}
												onSelect={(date) =>
													updateFilters({ dueDateFrom: date })
												}
												initialFocus
											/>
										</PopoverContent>
									</Popover>

									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="w-full justify-start text-left font-normal"
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{localFilters.dueDateTo ? (
													format(localFilters.dueDateTo, 'PPP', { locale: es })
												) : (
													<span>Hasta</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0">
											<Calendar
												mode="single"
												selected={localFilters.dueDateTo}
												onSelect={(date) => updateFilters({ dueDateTo: date })}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Active Filters Display */}
				{activeFiltersCount > 0 && (
					<div className="pt-4 border-t">
						<Label className="text-sm font-medium mb-2 block">
							Filtros activos:
						</Label>
						<div className="flex flex-wrap gap-1">
							{localFilters.query && (
								<Badge variant="secondary" className="text-xs">
									{`Búsqueda: ${localFilters.query}`}
									<X
										className="ml-1 h-3 w-3 cursor-pointer"
										onClick={() => updateFilters({ query: '' })}
									/>
								</Badge>
							)}

							{localFilters.status.map((status) => (
								<Badge key={status} variant="secondary" className="text-xs">
									{statusOptions.find((s) => s.value === status)?.label}
									<X
										className="ml-1 h-3 w-3 cursor-pointer"
										onClick={() =>
											updateFilters({
												status: localFilters.status.filter((s) => s !== status),
											})
										}
									/>
								</Badge>
							))}

							{localFilters.priority.map((priority) => (
								<Badge key={priority} variant="secondary" className="text-xs">
									{priorityOptions.find((p) => p.value === priority)?.label}
									<X
										className="ml-1 h-3 w-3 cursor-pointer"
										onClick={() =>
											updateFilters({
												priority: localFilters.priority.filter(
													(p) => p !== priority,
												),
											})
										}
									/>
								</Badge>
							))}

							{localFilters.projectIds.map((projectId) => (
								<Badge key={projectId} variant="secondary" className="text-xs">
									{projects.find((p) => p.id === projectId)?.name}
									<X
										className="ml-1 h-3 w-3 cursor-pointer"
										onClick={() =>
											updateFilters({
												projectIds: localFilters.projectIds.filter(
													(p) => p !== projectId,
												),
											})
										}
									/>
								</Badge>
							))}

							{localFilters.assigneeIds.map((userId) => (
								<Badge key={userId} variant="secondary" className="text-xs">
									{users.find((u) => u.id === userId)?.name}
									<X
										className="ml-1 h-3 w-3 cursor-pointer"
										onClick={() =>
											updateFilters({
												assigneeIds: localFilters.assigneeIds.filter(
													(u) => u !== userId,
												),
											})
										}
									/>
								</Badge>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
