
// components/search/AdvancedSearch.tsx
"use client";

import { useState, useEffect } from 'react';
import { Task, User, Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  User as UserIcon,
  Tag,
  Flag,
  FolderOpen,
  SlidersHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface SearchFilters {
  query: string;
  status: string[];
  priority: string[];
  assigneeIds: string[];
  projectIds: string[];
  tags: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
}

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  projects: Project[];
  users: User[];
  availableTags: string[];
  className?: string;
}

const statusOptions = [
  { value: 'TODO', label: 'Por hacer', color: 'bg-gray-100 text-gray-700' },
  { value: 'IN_PROGRESS', label: 'En progreso', color: 'bg-blue-100 text-blue-700' },
  { value: 'REVIEW', label: 'Revisión', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'DONE', label: 'Completado', color: 'bg-green-100 text-green-700' }
];

const priorityOptions = [
  { value: 'LOW', label: 'Baja', color: 'bg-gray-500' },
  { value: 'MEDIUM', label: 'Media', color: 'bg-blue-500' },
  { value: 'HIGH', label: 'Alta', color: 'bg-orange-500' },
  { value: 'URGENT', label: 'Urgente', color: 'bg-red-500' }
];

export function AdvancedSearch({
  filters,
  onFiltersChange,
  projects,
  users,
  availableTags,
  className
}: AdvancedSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...localFilters, ...newFilters };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const clearAllFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      status: [],
      priority: [],
      assigneeIds: [],
      projectIds: [],
      tags: [],
      dueDateFrom: undefined,
      dueDateTo: undefined,
      createdFrom: undefined,
      createdTo: undefined,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const toggleArrayFilter = (array: string[], value: string) => {
    if (array.includes(value)) {
      return array.filter(item => item !== value);
    } else {
      return [...array, value];
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.query) count++;
    count += localFilters.status.length;
    count += localFilters.priority.length;
    count += localFilters.assigneeIds.length;
    count += localFilters.projectIds.length;
    count += localFilters.tags.length;
    if (localFilters.dueDateFrom) count++;
    if (localFilters.dueDateTo) count++;
    if (localFilters.createdFrom) count++;
    if (localFilters.createdTo) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

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
                <Label className="text-sm font-medium">Estado de las tareas</Label>
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={localFilters.status.includes(option.value)}
                      onCheckedChange={(checked) => {
                        updateFilters({
                          status: checked
                            ? [...localFilters.status, option.value]
                            : localFilters.status.filter(s => s !== option.value)
                        });
                      }}
                    />
                    <Label htmlFor={`status-${option.value}`} className="text-sm">
                      <Badge variant="secondary" className={cn("ml-1", option.color)}>
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
                                    className={cn(
                                      "group",
                                      snapshot.isDragging && "rotate-3 shadow-lg"
                                    )}
                                  >
                                    <TaskCard
                                      task={task}
                                      onEdit={onTaskEdit}
                                      onDelete={onTaskDelete}
                                      onMove={onTaskMove}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}

                            {/* Add Task Button */}
                            <Button
                              variant="dashed"
                              className="w-full h-12 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50"
                              onClick={() => onTaskCreate({ status: column.status })}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Agregar tarea
                            </Button>
                          </div>
                        )}
                      </Droppable>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Vista de Lista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron tareas con los filtros aplicados</p>
                </div>
              ) : (
                sortTasks(filteredTasks).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onTaskEdit}
                    onDelete={onTaskDelete}
                    onMove={onTaskMove}
                    className="hover:shadow-sm"
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}