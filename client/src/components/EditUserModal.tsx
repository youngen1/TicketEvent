import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: number;
    username: string;
    displayName: string;
  } | null;
  isAdmin?: boolean;
}

const formSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  displayName: z.string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditUserModal({ isOpen, onClose, user, isAdmin = false }: EditUserModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || "",
      displayName: user?.displayName || "",
    },
  });

  // Reset form when user changes
  if (user && (form.getValues().username !== user.username || form.getValues().displayName !== user.displayName)) {
    form.reset({
      username: user.username,
      displayName: user.displayName,
    });
  }

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!user) throw new Error("No user selected");

      const res = await apiRequest(
        "PATCH", 
        isAdmin ? `/api/admin/users/${user.id}` : "/api/users/profile", 
        data
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update user");
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      if (isAdmin) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      }
      
      toast({
        title: "Profile updated",
        description: "User profile has been updated successfully.",
      });
      
      onClose();
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    setErrorMessage(null);
    updateUserMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update the username and display name for this account.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {errorMessage && (
              <div className="bg-red-50 p-3 rounded-md text-red-800 text-sm mb-4">
                {errorMessage}
              </div>
            )}
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Display Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={updateUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateUserMutation.isPending || !form.formState.isDirty}
              >
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}