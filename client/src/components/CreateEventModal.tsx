import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema, GENDER_RESTRICTION, genderRestrictionSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import LocationSearchInput from "@/components/LocationSearchInput";
import FallbackLocationInput from "@/components/FallbackLocationInput";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image, Video, Upload, X, Film, FileVideo } from "lucide-react";

interface CreateEventModalProps {
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
  isFree: z.boolean().default(true),
  price: z.string().default("0"),
  genderRestriction: z.string().default(GENDER_RESTRICTION.NONE),
  ageRestriction: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { user } = useAuth();

  const [isFreeEvent, setIsFreeEvent] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      date: "",
      time: "",
      location: "",
      images: "",
      image: "",
      isFree: true,
      price: "0",
      genderRestriction: GENDER_RESTRICTION.NONE,
      ageRestriction: [],
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      try {
        setIsUploading(true);
        setUploadProgress(10);
        
        // Create a FormData object for the API request
        const formData = new FormData();
        
        // Append all the form data fields
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
        
        // Add the cover image
        if (coverImageFile) {
          // Upload the cover image first
          const imageFormData = new FormData();
          imageFormData.append('image', coverImageFile);
          
          setUploadProgress(20);
          
          const imageUploadResponse = await fetch('/api/upload/image', {
            method: 'POST',
            body: imageFormData,
          });
          
          if (!imageUploadResponse.ok) {
            const errorData = await imageUploadResponse.json();
            throw new Error(errorData.message || 'Failed to upload cover image');
          }
          
          const imageUploadResult = await imageUploadResponse.json();
          
          // Set the image URL for the event
          formData.append('image', imageUploadResult.imageUrl);
          
          // We still need to maintain backwards compatibility
          formData.append('images', JSON.stringify([imageUploadResult.imageUrl]));
          
          setUploadProgress(50);
        } else {
          throw new Error('Please upload a cover image for your event');
        }
        
        // Add the video file if present
        if (videoFile) {
          formData.append('video', videoFile);
        }
        
        setUploadProgress(60);
        
        // Now create the event with all data including uploaded image and video
        const response = await fetch('/api/events', {
          method: 'POST',
          body: formData,
        });
        
        setUploadProgress(90);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create event');
        }
        
        setUploadProgress(100);
        setIsUploading(false);
        
        return await response.json();
      } catch (error: any) {
        setIsUploading(false);
        throw new Error(error.message || 'Failed to create event');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event created",
        description: "Your event has been created successfully.",
      });
      onClose();
      form.reset();
      setCoverImageFile(null);
      setCoverImagePreview(null);
      setVideoFile(null);
      setVideoName(null);
      setIsUploading(false);
      setUploadError(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle cover image upload
  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Validate file type
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select only image files for the cover image.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image file smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }
    
    // Compress image if it's large
    let imageToUpload = file;
    if (file.size > 2 * 1024 * 1024) { // If larger than 2MB
      toast({
        title: 'Processing image',
        description: 'Large image detected, optimizing for upload...',
      });
      
      // Generate preview immediately for better UX
      const preview = await readFileAsDataURL(file);
      setCoverImagePreview(preview);
      
      // We'll handle image compression later in the form submission
    }
    
    // Reset existing upload state
    setUploadError(null);
    setUploadProgress(0);
    
    // Store file for later upload
    setCoverImageFile(file);
    
    // Generate preview if not already done
    if (!coverImagePreview) {
      const preview = await readFileAsDataURL(file);
      setCoverImagePreview(preview);
    }
    
    toast({
      title: 'Cover image ready',
      description: 'Cover image selected successfully.',
    });
  };
  
  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Validate file type
    const file = files[0];
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select only video files (MP4, MOV, etc.).',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file size (max 80MB)
    if (file.size > 80 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a video file smaller than 80MB.',
        variant: 'destructive',
      });
      return;
    }
    
    // Store file for later upload
    setVideoFile(file);
    setVideoName(file.name);
    
    toast({
      title: 'Video ready',
      description: 'Video selected successfully. It will be uploaded when you create the event.',
    });
  };
  
  // Helper function to read file as data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // Remove cover image
  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
  };
  
  // Remove video
  const removeVideo = () => {
    setVideoFile(null);
    setVideoName(null);
  };

  const onSubmit = (data: FormValues) => {
    // Validate cover image
    if (!coverImageFile) {
      toast({
        title: 'Cover image required',
        description: 'Please upload a cover image for your event.',
        variant: 'destructive',
      });
      return;
    }
    
    // Add the user ID to the event data
    if (user) {
      data.userId = user.id;
    }
    
    createEventMutation.mutate(data);
  };

  // Content for when user is not logged in
  const unauthenticatedContent = (
    <div className="flex flex-col items-center justify-center py-6 space-y-4">
      <p className="text-center text-neutral-600">
        You need to be logged in to create an event.
      </p>
      <Button
        onClick={onClose}
        className="bg-primary hover:bg-blue-700 text-white w-full"
      >
        Go back and log in
      </Button>
    </div>
  );

  // Form content when user is logged in
  const eventForm = (
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
        
        {/* Pricing section */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="isFree"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Free Event</FormLabel>
                  <FormDescription>
                    Toggle if this is a free event (R0 ticket price)
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      setIsFreeEvent(checked);
                      // Reset price to 0 when marked as free
                      if (checked) {
                        form.setValue("price", "0");
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Gender Restriction Section */}
          <FormField
            control={form.control}
            name="genderRestriction"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="genderRestriction">Gender Restriction</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger id="genderRestriction" className="w-full">
                      <SelectValue placeholder="Select gender restriction" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="male-only">Male Only</SelectItem>
                    <SelectItem value="female-only">Female Only</SelectItem>
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
                <div className="space-y-2">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="under18" 
                        checked={field.value?.includes("under18")} 
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          const newValue = checked 
                            ? [...currentValue, "under18"] 
                            : currentValue.filter(v => v !== "under18");
                          field.onChange(newValue);
                        }}
                      />
                      <label
                        htmlFor="under18"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Under 18
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="20s" 
                        checked={field.value?.includes("20s")} 
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          const newValue = checked 
                            ? [...currentValue, "20s"] 
                            : currentValue.filter(v => v !== "20s");
                          field.onChange(newValue);
                        }}
                      />
                      <label
                        htmlFor="20s"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        20s
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="30s" 
                        checked={field.value?.includes("30s")} 
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          const newValue = checked 
                            ? [...currentValue, "30s"] 
                            : currentValue.filter(v => v !== "30s");
                          field.onChange(newValue);
                        }}
                      />
                      <label
                        htmlFor="30s"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        30s
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="40plus" 
                        checked={field.value?.includes("40plus")} 
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          const newValue = checked 
                            ? [...currentValue, "40plus"] 
                            : currentValue.filter(v => v !== "40plus");
                          field.onChange(newValue);
                        }}
                      />
                      <label
                        htmlFor="40plus"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        40+
                      </label>
                    </div>
                  </div>
                </div>
                <FormDescription>
                  Select which age groups are NOT allowed to attend or purchase tickets (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {!isFreeEvent && (
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Price (R)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      placeholder="Enter price in Rands" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the ticket price in Rands (e.g., 250 for R250.00)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Cover Image Upload */}
        <div>
          <FormLabel className="block text-sm font-medium text-neutral-700">Cover Image (Required)</FormLabel>
          <div className="mt-1 flex flex-col px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
            <div className="space-y-3 text-center">
              {coverImagePreview ? (
                <div className="relative group">
                  <img 
                    src={coverImagePreview} 
                    alt="Cover image preview" 
                    className="h-48 w-full object-cover rounded-md mx-auto" 
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                    onClick={removeCoverImage}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center mx-auto text-neutral-400">
                  <Image className="h-12 w-12" />
                </div>
              )}
              
              {uploadError && (
                <div className="mt-2 text-sm text-red-600">
                  {uploadError}
                </div>
              )}
              
              <div className="flex text-sm text-neutral-600 justify-center">
                <label htmlFor="cover-image" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-500">
                  <span>{!coverImagePreview ? "Upload cover image" : "Change cover image"}</span>
                  <input
                    id="cover-image"
                    name="cover-image"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <p className="text-xs text-neutral-500">
                JPEG, PNG, GIF, WebP up to 10MB
              </p>
            </div>
          </div>
        </div>
        
        {/* Video Upload (Optional) */}
        <div>
          <FormLabel className="block text-sm font-medium text-neutral-700">
            Event Video (Optional)
          </FormLabel>
          <div className="mt-1 flex flex-col px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
            <div className="space-y-3 text-center">
              {videoFile ? (
                <div className="relative group bg-gray-100 p-4 rounded-md">
                  <div className="flex items-center justify-center">
                    <FileVideo className="h-10 w-10 text-primary mr-3" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-neutral-800 truncate">{videoName}</p>
                      <p className="text-xs text-neutral-500">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                    onClick={removeVideo}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center mx-auto text-neutral-400">
                  <Film className="h-12 w-12" />
                </div>
              )}
              
              <div className="flex text-sm text-neutral-600 justify-center">
                <label htmlFor="event-video" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-500">
                  <span>{!videoFile ? "Upload video" : "Change video"}</span>
                  <input
                    id="event-video"
                    name="event-video"
                    type="file"
                    className="sr-only"
                    accept="video/mp4,video/mov,video/avi,video/webm,video/mkv"
                    onChange={handleVideoUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <p className="text-xs text-neutral-500">
                MP4, MOV, AVI, WEBM, MKV up to 80MB (max 90 seconds)
              </p>
            </div>
          </div>
        </div>
        
        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-2 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-blue-700">Uploading: {uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <p className="mt-1 text-xs text-neutral-500">
              Uploading files...
            </p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isUploading || createEventMutation.isPending}
          >
            {isUploading || createEventMutation.isPending ? (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </span>
            ) : (
              'Create Event'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new event.
          </DialogDescription>
        </DialogHeader>
        {user ? eventForm : unauthenticatedContent}
      </DialogContent>
    </Dialog>
  );
}