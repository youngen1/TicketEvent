import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Comment, Event } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MessageSquare, Trash, Edit, Check, X } from "lucide-react";

interface CommentSectionProps {
  eventId: number;
}

const commentSchema = z.object({
  content: z.string().min(3, "Comment must be at least 3 characters").max(500, "Comment cannot exceed 500 characters"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

export default function CommentSection({ eventId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // Fetch comments for this event
  const { data: comments = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/events", eventId, "comments"],
  });

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: CommentFormValues) => {
      return apiRequest(`/api/events/${eventId}/comments`, {
        method: "POST",
        body: JSON.stringify({
          content: data.content,
          userId: user?.id,
          eventId: eventId,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "comments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Edit comment mutation
  const editCommentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      return apiRequest(`/api/comments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Comment Updated",
        description: "Your comment has been updated successfully.",
      });
      setEditingCommentId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "comments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/comments/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Comment Deleted",
        description: "Your comment has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "comments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CommentFormValues) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to leave a comment.",
        variant: "destructive",
      });
      return;
    }
    addCommentMutation.mutate(data);
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const saveEdit = (id: number) => {
    if (editContent.trim().length < 3) {
      toast({
        title: "Error",
        description: "Comment must be at least 3 characters.",
        variant: "destructive",
      });
      return;
    }
    editCommentMutation.mutate({ id, content: editContent });
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-8">
      <div className="flex items-center mb-6">
        <MessageSquare className="w-5 h-5 mr-2 text-primary" />
        <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>
      </div>

      {isAuthenticated ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts about this event..."
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={addCommentMutation.isPending}
                  >
                    {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 bg-muted/50">
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Please <Button variant="link" className="p-0 h-auto">log in</Button> to leave a comment
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment: Comment) => (
            <div key={comment.id} className="p-4 rounded-lg border bg-card">
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {comment.username ? comment.username.substring(0, 2).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{comment.username || "Anonymous"}</p>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                    {user?.id === comment.userId && (
                      <div className="flex space-x-2">
                        {editingCommentId === comment.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => saveEdit(comment.id)}
                              disabled={editCommentMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(comment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(comment.id)}
                              disabled={deleteCommentMutation.isPending}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <Separator className="my-2" />
                  {editingCommentId === comment.id ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="mt-2 resize-none"
                    />
                  ) : (
                    <p className="mt-2 text-sm mobile-text">{comment.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}