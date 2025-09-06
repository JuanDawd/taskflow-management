"use client";

import { useState, useEffect } from 'react';
import { Comment, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  MessageCircle, 
  Send, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Reply,
  Heart,
  Flag
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { commentSchema } from '@/lib/validation';
import { z } from 'zod';

interface CommentWithUser extends Comment {
  user: User;
  replies?: CommentWithUser[];
  likes?: number;
  isLiked?: boolean;
}

interface CommentSystemProps {
  taskId: string;
  comments: CommentWithUser[];
  currentUser: User;
  onAddComment: (data: { content: string; parentId?: string }) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  onFlagComment: (commentId: string) => Promise<void>;
}

export function CommentSystem({
  taskId,
  comments,
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
  onFlagComment
}: CommentSystemProps) {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleAddComment = async (parentId?: string) => {
    const content = parentId ? replyContent : newComment;
    setErrors({});
    setIsLoading(true);

    try {
      commentSchema.parse({ content, taskId });
      await onAddComment({ content, parentId });
      
      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ content: error.errors[0]?.message || 'Error de validación' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    setErrors({});
    setIsLoading(true);

    try {
      commentSchema.parse({ content: editContent, taskId });
      await onEditComment(commentId, editContent);
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ edit: error.errors[0]?.message || 'Error de validación' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (comment: CommentWithUser) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setErrors({});
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
    setErrors({});
  };

  const startReplying = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
    setErrors({});
  };

  const cancelReplying = () => {
    setReplyingTo(null);
    setReplyContent('');
    setErrors({});
  };

  const renderComment = (comment: CommentWithUser, depth = 0) => (
    <div key={comment.id} className={cn("space-y-3", depth > 0 && "ml-8 border-l-2 border-muted pl-4")}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.avatar} />
          <AvatarFallback>
            {comment.user.name?.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.user.name}</span>
              <span className="text-xs text-muted-foreground">
                {format(parseISO(comment.createdAt), 'dd MMM HH:mm', { locale: es })}
              </span>
              {comment.createdAt !== comment.updatedAt && (
                <Badge variant="outline" className="text-xs">
                  Editado
                </Badge>
              )}
            </div>

            {comment.user.id === currentUser.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => startEditing(comment)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. El comentario será eliminado permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteComment(comment.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Comment Content */}
          {editingId === comment.id ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={errors.edit ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.edit && (
                <p className="text-sm text-red-500">{errors.edit}</p>
              )}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleEditComment(comment.id)}
                  disabled={isLoading}
                >
                  Guardar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={cancelEditing}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              
              {/* Comment Actions */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => onLikeComment(comment.id)}
                >
                  <Heart className={cn(
                    "h-3 w-3 mr-1",
                    comment.isLiked && "fill-red-500 text-red-500"
                  )} />
                  {comment.likes || 0}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => startReplying(comment.id)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Responder
                </Button>

                {comment.user.id !== currentUser.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-red-600"
                    onClick={() => onFlagComment(comment.id)}
                  >
                    <Flag className="h-3 w-3 mr-1" />
                    Reportar
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="space-y-2 mt-3">
              <Textarea
                placeholder="Escribe tu respuesta..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className={errors.content ? 'border-red-500' : ''}
                rows={2}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content}</p>
              )}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleAddComment(comment.id)}
                  disabled={isLoading || !replyContent.trim()}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Responder
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={cancelReplying}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  const topLevelComments = comments.filter(comment => !comment.parentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comentarios ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment */}
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>
              {currentUser.name?.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Añadir un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={errors.content ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}
            <Button 
              onClick={() => handleAddComment()}
              disabled={isLoading || !newComment.trim()}
              size="sm"
            >
              <Send className="h-4 w-4 mr-1" />
              {isLoading ? 'Enviando...' : 'Comentar'}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        {topLevelComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay comentarios aún</p>
            <p className="text-sm">Sé el primero en comentar esta tarea</p>
          </div>
        ) : (
          <div className="space-y-6">
            {topLevelComments.map(comment => renderComment(comment))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Prioridad</Label>
                {priorityOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${option.value}`}
                      checked={localFilters.priority.includes(option.value)}
                      onCheckedChange={(checked) => {
                        updateFilters({
                          priority: checked
                            ? [...localFilters.priority, option.value]
                            : localFilters.priority.filter(p => p !== option.value)
                        });
                      }}
                    />
                    <Label htmlFor={`priority-${option.value}`} className="text-sm flex items-center gap-1">
                      <div className={cn("w-3 h-3 rounded-full", option.color)} />
                      {option.label}
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
                      id={`assignee-${user.id}`}
                      checked={localFilters.assigneeIds.includes(user.id)}
                      onCheckedChange={(checked) => {
                        updateFilters({
                          assigneeIds: checked
                            ? [...localFilters.assigneeIds, user.id]
                            : localFilters.assigneeIds.filter(id => id !== user.id)
                        });
                      }}
                    />
                    <Label htmlFor={`assignee-${user.id}`} className="text-sm flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
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
                            : localFilters.projectIds.filter(id => id !== project.id)
                        });
                      }}
                    />
                    <Label htmlFor={`project-${project.id}`} className="text-sm">
                      {project.name}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8">
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  Etiquetas
                </Label>
                <div className="flex flex-wrap gap-1">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={localFilters.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/90"
                      onClick={() => updateFilters({
                        tags: toggleArrayFilter(localFilters.tags, tag)
                      })}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2">Fecha límite</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal",
                          !localFilters.dueDateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {localFilters.dueDateFrom ? (
                          format(localFilters.dueDateFrom, "dd/MM", { locale: es })
                        ) : (
                          "Desde"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={localFilters.dueDateFrom}
                        onSelect={(date) => updateFilters({ dueDateFrom: date })}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal",
                          !localFilters.dueDateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {localFilters.dueDateTo ? (
                          format(localFilters.dueDateTo, "dd/MM", { locale: es })
                        ) : (
                          "Hasta"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={localFilters.dueDateTo}
                        onSelect={(date) => updateFilters({ dueDateTo: date })}
                        disabled={(date) => 
                          localFilters.dueDateFrom ? date < localFilters.dueDateFrom : false
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2">Fecha de creación</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal",
                          !localFilters.createdFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {localFilters.createdFrom ? (
                          format(localFilters.createdFrom, "dd/MM", { locale: es })
                        ) : (
                          "Desde"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={localFilters.createdFrom}
                        onSelect={(date) => updateFilters({ createdFrom: date })}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal",
                          !localFilters.createdTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {localFilters.createdTo ? (
                          format(localFilters.createdTo, "dd/MM", { locale: es })
                        ) : (
                          "Hasta"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={localFilters.createdTo}
                        onSelect={(date) => updateFilters({ createdTo: date })}
                        disabled={(date) => 
                          localFilters.createdFrom ? date < localFilters.createdFrom : false
                        }
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
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Filtros activos</Label>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-3 w-3 mr-1" />
                Limpiar todo
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {/* Query Filter */}
              {localFilters.query && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Búsqueda: "{localFilters.query}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({ query: '' })}
                  />
                </Badge>
              )}

              {/* Status Filters */}
              {localFilters.status.map(status => {
                const option = statusOptions.find(o => o.value === status);
                return option ? (
                  <Badge key={status} variant="secondary" className="flex items-center gap-1">
                    {option.label}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilters({
                        status: localFilters.status.filter(s => s !== status)
                      })}
                    />
                  </Badge>
                ) : null;
              })}

              {/* Priority Filters */}
              {localFilters.priority.map(priority => {
                const option = priorityOptions.find(o => o.value === priority);
                return option ? (
                  <Badge key={priority} variant="secondary" className="flex items-center gap-1">
                    {option.label}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilters({
                        priority: localFilters.priority.filter(p => p !== priority)
                      })}
                    />
                  </Badge>
                ) : null;
              })}

              {/* Assignee Filters */}
              {localFilters.assigneeIds.map(assigneeId => {
                const user = users.find(u => u.id === assigneeId);
                return user ? (
                  <Badge key={assigneeId} variant="secondary" className="flex items-center gap-1">
                    {user.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilters({
                        assigneeIds: localFilters.assigneeIds.filter(id => id !== assigneeId)
                      })}
                    />
                  </Badge>
                ) : null;
              })}

              {/* Project Filters */}
              {localFilters.projectIds.map(projectId => {
                const project = projects.find(p => p.id === projectId);
                return project ? (
                  <Badge key={projectId} variant="secondary" className="flex items-center gap-1">
                    {project.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilters({
                        projectIds: localFilters.projectIds.filter(id => id !== projectId)
                      })}
                    />
                  </Badge>
                ) : null;
              })}

              {/* Tag Filters */}
              {localFilters.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters({
                      tags: localFilters.tags.filter(t => t !== tag)
                    })}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}