import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Check, Edit2, Trash2, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Todo } from "@shared/schema";

type FilterType = "all" | "incomplete" | "completed";

export default function Home() {
  const [newTodoText, setNewTodoText] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch todos
  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  // Create todo mutation
  const createTodoMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/todos", { text, completed: false });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setNewTodoText("");
      toast({ title: "Todo created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create todo", variant: "destructive" });
    },
  });

  // Update todo mutation
  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Todo> }) => {
      const response = await apiRequest("PATCH", `/api/todos/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setEditingId(null);
      setEditingText("");
      toast({ title: "Todo updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update todo", variant: "destructive" });
    },
  });

  // Delete todo mutation
  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setDeleteConfirmId(null);
      toast({ title: "Todo deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete todo", variant: "destructive" });
    },
  });

  // Filter todos
  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.completed;
    if (filter === "incomplete") return !todo.completed;
    return true;
  });

  // Calculate stats
  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    pending: todos.filter((t) => !t.completed).length,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      createTodoMutation.mutate(newTodoText.trim());
    }
  };

  const handleToggleComplete = (todo: Todo) => {
    updateTodoMutation.mutate({
      id: todo.id,
      updates: { completed: !todo.completed },
    });
  };

  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const handleSaveEdit = () => {
    if (editingId && editingText.trim()) {
      updateTodoMutation.mutate({
        id: editingId,
        updates: { text: editingText.trim() },
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-3">
              <CheckCircle className="text-[#3B82F6]" size={28} />
              TODO
            </h1>
            <div className="text-sm text-[#6B7280]">
              {stats.total} task{stats.total !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Add Todo Form */}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Add a new task..."
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200 text-[#111827]"
                disabled={createTodoMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              disabled={createTodoMutation.isPending || !newTodoText.trim()}
              className="px-6 py-3 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 transition-all duration-200 font-medium flex items-center gap-2"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              {(["all", "incomplete", "completed"] as FilterType[]).map((filterType) => (
                <Button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  variant={filter === filterType ? "default" : "secondary"}
                  className={
                    filter === filterType
                      ? "px-4 py-2 rounded-lg bg-[#3B82F6] text-white font-medium transition-all duration-200"
                      : "px-4 py-2 rounded-lg bg-gray-100 text-[#6B7280] hover:bg-gray-200 font-medium transition-all duration-200"
                  }
                >
                  {filterType === "all" ? "All Tasks" : filterType === "incomplete" ? "Incomplete" : "Completed"}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Todo List */}
        <Card>
          {isLoading ? (
            <CardContent className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6] mb-4"></div>
              <p className="text-[#6B7280]">Loading...</p>
            </CardContent>
          ) : filteredTodos.length === 0 ? (
            <CardContent className="p-12 text-center text-[#6B7280]">
              <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No tasks found</p>
              <p className="text-sm">
                {filter === "all" ? "Add a new task to get started" : `No ${filter} tasks`}
              </p>
            </CardContent>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors duration-200 group ${
                    editingId === todo.id ? "bg-blue-50" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(todo)}
                    disabled={updateTodoMutation.isPending}
                    className={`w-5 h-5 rounded border-2 transition-colors duration-200 flex items-center justify-center ${
                      todo.completed
                        ? "border-[#059669] bg-[#059669] text-white"
                        : "border-gray-300 hover:border-[#3B82F6]"
                    }`}
                  >
                    {todo.completed && <Check size={12} />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {editingId === todo.id ? (
                      <Input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full px-3 py-2 border border-[#3B82F6] rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-[#111827] font-medium"
                        autoFocus
                      />
                    ) : (
                      <p
                        className={`font-medium ${
                          todo.completed ? "text-[#6B7280] line-through" : "text-[#111827]"
                        }`}
                      >
                        {todo.text}
                      </p>
                    )}
                    <p className="text-sm text-[#6B7280] mt-1">
                      {todo.completed ? `Completed ${formatDate(todo.updatedAt)}` : `Created ${formatDate(todo.createdAt)}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className={`flex items-center gap-2 ${editingId === todo.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity duration-200`}>
                    {editingId === todo.id ? (
                      <>
                        <Button
                          onClick={handleSaveEdit}
                          disabled={updateTodoMutation.isPending}
                          size="sm"
                          className="p-2 text-[#059669] hover:text-green-700 transition-colors duration-200"
                          variant="ghost"
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          className="p-2 text-[#6B7280] hover:text-red-500 transition-colors duration-200"
                          variant="ghost"
                        >
                          <ExternalLink size={16} className="rotate-45" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleStartEdit(todo)}
                          size="sm"
                          className="p-2 text-[#6B7280] hover:text-[#3B82F6] transition-colors duration-200"
                          variant="ghost"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          onClick={() => setDeleteConfirmId(todo.id)}
                          size="sm"
                          className="p-2 text-[#6B7280] hover:text-red-500 transition-colors duration-200"
                          variant="ghost"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Stats */}
        {todos.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#111827]">{stats.total}</p>
                  <p className="text-sm text-[#6B7280]">Total Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#059669]">{stats.completed}</p>
                  <p className="text-sm text-[#6B7280]">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#3B82F6]">{stats.pending}</p>
                  <p className="text-sm text-[#6B7280]">Remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Trash2 className="text-red-500" size={20} />
              Delete Task
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && deleteTodoMutation.mutate(deleteConfirmId)}
              disabled={deleteTodoMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
