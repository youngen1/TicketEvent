import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@shared/schema";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image, Upload } from "lucide-react";

interface EditEventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = insertEventSchema.extend({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  id: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditEventModal({ event, isOpen, onClose }: EditEventModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isVideoProcessing, setIsVideoProcessing] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      date: "",
      time: "",
      location: "",
      image: "",
      video: "",
      thumbnail: "",
      schedule: "",
    },
  });

  // Update form when event changes
  useEffect(() => {
    if (event) {
      form.reset({
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.date,
        time: event.time,
        location: event.location,
        image: event.image || "",
        video: event.video || "",
        thumbnail: event.thumbnail || "",
        schedule: event.schedule || "",
      });
      
      if (event.image) {
        setImagePreview(event.image);
      } else {
        setImagePreview(null);
      }

      if (event.thumbnail) {
        setVideoPreview(event.thumbnail);
      } else {
        setVideoPreview(null);
      }
    }
  }, [event, form]);

  const updateEventMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!event) return null;
      const res = await apiRequest("PUT", `/api/events/${event.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event updated",
        description: "Your event has been updated successfully.",
      });
      onClose();
      setVideoPreview(null);
      setVideoFile(null);
      setIsVideoProcessing(false);
      setVideoError(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    updateEventMutation.mutate(data);
  };

  // Upload video to the server
  const uploadVideoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      
      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload video');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Set the video and thumbnail URLs
      form.setValue('video', data.videoPath);
      form.setValue('thumbnail', data.thumbnailPath);
      setVideoPreview(data.thumbnailPath);
      setIsVideoProcessing(false);
      
      toast({
        title: 'Video uploaded',
        description: 'Your video has been uploaded and processed successfully.',
      });
    },
    onError: (error: any) => {
      setIsVideoProcessing(false);
      setVideoError(error.message || 'Failed to upload video');
      
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload video. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select a video file.',
        variant: 'destructive',
      });
      return;
    }
    
    // Reset previous video states
    setVideoError(null);
    setVideoFile(file);
    setIsVideoProcessing(true);
    
    // Upload the video
    uploadVideoMutation.mutate(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real application, you would upload this file to a server
    // and get back a URL. For now, we'll just use a data URL.
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      form.setValue("image", "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80");
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-neutral-900 font-heading">
            Edit Event
          </DialogTitle>
          <p className="text-sm text-neutral-500 mt-2">
            Uploading a new video will replace any existing video for this event.
          </p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Art">Art</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter event description" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="block text-sm font-medium text-neutral-700">Event Video</FormLabel>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {videoPreview ? (
                    <div className="mb-4">
                      <img src={videoPreview} alt="Video Thumbnail" className="h-32 mx-auto rounded" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center mx-auto text-neutral-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video">
                        <path d="m22 8-6 4 6 4V8Z"/>
                        <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
                      </svg>
                    </div>
                  )}
                  
                  {videoError && (
                    <div className="mt-2 text-sm text-red-600">
                      {videoError}
                    </div>
                  )}
                  
                  <div className="flex text-sm text-neutral-600 justify-center">
                    <label htmlFor="event-video-edit" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-500">
                      <span>{isVideoProcessing ? "Processing..." : "Upload a video"}</span>
                      <input
                        id="event-video-edit"
                        name="event-video-edit"
                        type="file"
                        className="sr-only"
                        accept="video/*"
                        onChange={handleVideoChange}
                        disabled={isVideoProcessing}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-neutral-500">
                    MP4, MOV, WebM up to 50MB (max duration: 1:30)
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-blue-700 text-white"
                disabled={updateEventMutation.isPending}
              >
                {updateEventMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}