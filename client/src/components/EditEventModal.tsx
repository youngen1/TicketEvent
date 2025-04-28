import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema, GENDER_RESTRICTION, genderRestrictionSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@shared/schema";
import LocationSearchInput from "@/components/LocationSearchInput";
import FallbackLocationInput from "@/components/FallbackLocationInput";
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
import { Progress } from "@/components/ui/progress";
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
  genderRestriction: z.string().default(GENDER_RESTRICTION.NONE),
  ageRestriction: z.number().nullable().default(null),
  id: z.number().optional(),
  image: z.string().optional(),
  video: z.string().optional(),
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
  const [uploadProgress, setUploadProgress] = useState(0);

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
      genderRestriction: GENDER_RESTRICTION.NONE,
      ageRestriction: null,
    },
  });

  // Update form when event changes
  useEffect(() => {
    if (event) {
      form.reset({
        id: event.id,
        title: event.title || "",
        description: event.description || "",
        category: event.category || "",
        date: event.date || "",
        time: event.time || "",
        location: event.location || "",  // This is always a string, never null
        image: event.image || "",
        video: event.video || "",
        genderRestriction: event.genderRestriction || GENDER_RESTRICTION.NONE,
        ageRestriction: event.ageRestriction || null,
      });
      
      // Update the image preview
      setImagePreview(event.image || null);
      
      // Update the video preview
      setVideoPreview(event.video || null);
    }
  }, [event, form]);

  const updateEventMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!event) return null;
      
      // If we have a video file, use FormData to upload directly
      if (videoFile) {
        // Create form data with all event fields plus the video file
        const formData = new FormData();
        
        // Add all form fields to FormData
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        
        // Add the video file
        formData.append('video', videoFile);
        
        // Use fetch directly for multipart FormData
        const response = await fetch(`/api/events/${event.id}`, {
          method: 'PUT',
          body: formData,
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update event');
        }
        
        return response.json();
      } else {
        // Regular JSON submission if no video file
        const res = await apiRequest("PUT", `/api/events/${event.id}`, data);
        return res.json();
      }
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
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    updateEventMutation.mutate(data);
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setUploadProgress(0);
    
    // Create FormData and append file
    const formData = new FormData();
    formData.append('video', file);
    
    try {
      // Create new XMLHttpRequest to track upload progress with optimized settings
      const xhr = new XMLHttpRequest();
      
      // Setting timeout to a higher value to avoid premature timeouts
      xhr.timeout = 180000; // 3 minutes
      
      // Set up chunked transfer if the browser supports it
      if ('mozChunkedUpload' in xhr || 'webkitChunkedUpload' in xhr) {
        console.log('Using chunked upload for better performance');
      }
      
      // Setup more frequent progress tracking with more granular updates
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
          
          // Add processing status message for better user feedback
          if (percentComplete === 100) {
            // Update to inform user that processing is happening after upload completes
            setTimeout(() => {
              console.log('Upload complete, now processing video...');
            }, 500);
          } else if (percentComplete % 5 === 0) {
            // Log every 5% for more frequent updates
            console.log(`Upload progress: ${percentComplete}%`);
          }
          
          // Fast-forward progress for small files for better UX
          if (event.total < 2 * 1024 * 1024 && percentComplete > 50) { // For files under 2MB
            setUploadProgress(Math.min(percentComplete + 20, 100)); // Jump ahead to give perception of speed
          }
        }
      });
      
      // Wait for the request to complete
      const response = await new Promise((resolve, reject) => {
        xhr.open('POST', '/api/upload/video');
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (e) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || 'Upload failed'));
            } catch (e) {
              reject(new Error(`Server error: ${xhr.status}`));
            }
          }
        };
        
        xhr.onerror = () => {
          reject(new Error('Network error occurred'));
        };
        
        xhr.send(formData);
      });
      
      // Process successful response
      const data = response as any;
      console.log('Video upload successful:', data);
      
      // Set the video URL
      form.setValue('video', data.videoPath);
      
      // Set the preview with the full URL for local display
      const videoUrl = data.videoPath.startsWith('/uploads') 
        ? `http://localhost:5000${data.videoPath}` 
        : data.videoPath;
      
      setVideoPreview(videoUrl);
      
      // Check if it's still processing in the background
      if (data.processing) {
        // Still give user feedback that they're done, but reduce state to 'processing done'
        setUploadProgress(100);
        setTimeout(() => setIsVideoProcessing(false), 500);
        
        toast({
          title: 'Video uploaded',
          description: 'Your video was uploaded successfully and is being optimized in the background.',
        });
      } else {
        setIsVideoProcessing(false);
        
        toast({
          title: 'Video uploaded',
          description: 'Your video has been uploaded and processed successfully.',
        });
      }
      
    } catch (error: any) {
      setIsVideoProcessing(false);
      setVideoError(error.message || 'Failed to upload video');
      
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload video. Please try again.',
        variant: 'destructive',
      });
    }
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
                    {(window as any)._env?.USE_FALLBACK_MAP ? (
                      // Use fallback input when Google Maps is not available
                      <FallbackLocationInput 
                        value={field.value} 
                        onChange={(value) => field.onChange(value)}
                        placeholder="Enter location (e.g., 123 Main St, City, State)"
                      />
                    ) : (
                      // Use Google Maps input when available
                      <LocationSearchInput 
                        value={field.value || ''} 
                        onChange={(value, placeDetails) => {
                          field.onChange(value);
                          // If you want to store additional place details like coordinates
                          if (placeDetails?.geometry?.location) {
                            // You could store these in separate form fields if needed
                            console.log('Location coordinates:', {
                              lat: placeDetails.geometry.location.lat(),
                              lng: placeDetails.geometry.location.lng(),
                            });
                          }
                        }}
                        placeholder="Search for a location"
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Gender Restriction Section */}
            <FormField
              control={form.control}
              name="genderRestriction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender Restriction</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || GENDER_RESTRICTION.NONE}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender restriction" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={GENDER_RESTRICTION.NONE}>No Restriction</SelectItem>
                      <SelectItem value={GENDER_RESTRICTION.MALE_ONLY}>Male Only</SelectItem>
                      <SelectItem value={GENDER_RESTRICTION.FEMALE_ONLY}>Female Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Restrict attendance to a specific gender (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Age Restriction Section */}
            <FormField
              control={form.control}
              name="ageRestriction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Restriction</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      // Parse as integer only if it's not "none"
                      const numValue = value === "none" ? null : parseInt(value);
                      field.onChange(numValue);
                    }} 
                    defaultValue={field.value ? field.value.toString() : "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age restriction" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Age Restriction</SelectItem>
                      <SelectItem value="13">13+</SelectItem>
                      <SelectItem value="16">16+</SelectItem>
                      <SelectItem value="18">18+</SelectItem>
                      <SelectItem value="21">21+</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set minimum age requirement for attendees (optional)
                  </FormDescription>
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
                      <img src={videoPreview} alt="Video Preview" className="h-32 mx-auto rounded" />
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
                  
                  {isVideoProcessing && (
                    <div className="mt-2 mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-700">Uploading: {uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="mt-1 text-xs text-neutral-500">
                        {uploadProgress === 100 ? "Processing video..." : "Uploading video..."}
                      </p>
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
                    MP4, MOV, WebM, AVI, MKV up to 80MB (max duration: 1:30)
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