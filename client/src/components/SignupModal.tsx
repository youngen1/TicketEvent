import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { GENDER_OPTIONS } from "@shared/schema";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onSuccess: () => void;
}

const signupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  gender: z.string({
    required_error: "Please select a gender",
  }),
  dateOfBirth: z.date({
    required_error: "Please select your date of birth",
  }).refine((date) => {
    // Check if user is at least 13 years old
    const today = new Date();
    const minAge = 13;
    const minDate = new Date(
      today.getFullYear() - minAge,
      today.getMonth(),
      today.getDate()
    );
    return date <= minDate;
  }, {
    message: "You must be at least 13 years old to register"
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupModal({ isOpen, onClose, onLoginClick, onSuccess }: SignupModalProps) {
  const { toast } = useToast();
  const [signupError, setSignupError] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
      dateOfBirth: undefined,
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormValues) => {
      const { confirmPassword, ...userData } = data;
      const res = await apiRequest("POST", "/api/auth/signup", userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Signup failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Signup successful",
        description: "Your account has been created. Please check your email to verify your account.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error.message || "An error occurred during signup. Please try again.";
      if (errorMessage.includes("Username already taken")) {
        setSignupError("Username already taken. Please choose a different username.");
      } else {
        setSignupError(errorMessage);
      }
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    setSignupError(null);
    signupMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Create an account</DialogTitle>
          <DialogDescription className="text-center">
            Enter your details to create a new account
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {signupError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{signupError}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Choose a username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Create a password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={GENDER_OPTIONS.MALE}>Male</SelectItem>
                      <SelectItem value={GENDER_OPTIONS.FEMALE}>Female</SelectItem>
                      <SelectItem value={GENDER_OPTIONS.NON_BINARY}>Non-binary</SelectItem>
                      <SelectItem value={GENDER_OPTIONS.OTHER}>Other</SelectItem>
                      <SelectItem value={GENDER_OPTIONS.PREFER_NOT_TO_SAY}>Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const today = new Date();
                          const minAge = 13;
                          const minDate = new Date(
                            today.getFullYear() - minAge,
                            today.getMonth(),
                            today.getDate()
                          );
                          return date > minDate || date > new Date();
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? "Signing up..." : "Sign up"}
            </Button>
          </form>
        </Form>
        <div className="pt-2 text-center text-sm">
          <span className="text-muted-foreground">Already have an account?</span>{" "}
          <button
            type="button"
            className="text-primary hover:underline font-medium"
            onClick={() => {
              onClose();
              onLoginClick();
            }}
          >
            Log in
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}