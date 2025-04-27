import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image, Upload, X } from "lucide-react";

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
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // If we have images to upload, handle that first
      if (imageFiles.length > 0) {
        try {
          setIsUploading(true);
          setUploadProgress(10);
          
          // Upload images first
          const formData = new FormData();
          imageFiles.forEach(file => {
            formData.append('images', file);
          });
          
          setUploadProgress(30);
          
          // Upload the images
          const uploadResponse = await fetch('/api/upload/images', {
            method: 'POST',
            body: formData,
          });
          
          setUploadProgress(70);
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.message || 'Failed to upload images');
          }
          
          const uploadResult = await uploadResponse.json();
          // Set the images URLs as JSON string in the form data
          data.images = JSON.stringify(uploadResult.imageUrls);
          
          // Also set the first image as the main image for backward compatibility
          if (uploadResult.imageUrls.length > 0) {
            data.image = uploadResult.imageUrls[0];
          }
          
          setUploadProgress(100);
          setIsUploading(false);
        } catch (error: any) {
          setIsUploading(false);
          throw new Error(error.message || 'Failed to upload images');
        }
      }
      
      // Now create the event with uploaded image URLs
      const response = await apiRequest("POST", "/api/events", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event created",
        description: "Your event has been created successfully.",
      });
      onClose();
      form.reset();
      setImageFiles([]);
      setImagePreviews([]);
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

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Check number of files
    if (files.length > 30) {
      toast({
        title: 'Too many files',
        description: 'Please select a maximum of 30 images.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate file types
    const fileArray = Array.from(files);
    const invalidFile = fileArray.find(file => !file.type.startsWith('image/'));
    
    if (invalidFile) {
      toast({
        title: 'Invalid file type',
        description: 'Please select only image files.',
        variant: 'destructive',
      });
      return;
    }
    
    // Reset existing upload state
    setUploadError(null);
    setUploadProgress(0);
    
    // Store files for later upload
    setImageFiles(prev => [...prev, ...fileArray]);
    
    // Generate previews
    const newPreviews: string[] = [];
    
    for (const file of fileArray) {
      const preview = await readFileAsDataURL(file);
      newPreviews.push(preview);
    }
    
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    toast({
      title: 'Images ready',
      description: `${fileArray.length} image${fileArray.length > 1 ? 's' : ''} selected successfully.`,
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
  
  // Remove image from the list
  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormValues) => {
    // Validate images
    if (imageFiles.length === 0) {
      toast({
        title: 'Images required',
        description: 'Please upload at least one image for your event.',
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

        <div>
          <FormLabel className="block text-sm font-medium text-neutral-700">Event Images (1-30)</FormLabel>
          <div className="mt-1 flex flex-col px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreviews.length > 0 ? (
                <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Image ${index + 1}`} className="h-24 w-full object-cover rounded" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center mx-auto text-neutral-400">
                  <Image className="h-8 w-8" />
                </div>
              )}
              
              {uploadError && (
                <div className="mt-2 text-sm text-red-600">
                  {uploadError}
                </div>
              )}
              
              {isUploading && (
                <div className="mt-2 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-blue-700">Uploading: {uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="mt-1 text-xs text-neutral-500">
                    Uploading images...
                  </p>
                </div>
              )}
              
              <div className="flex text-sm text-neutral-600 justify-center">
                <label htmlFor="event-images" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-500">
                  <span>{isUploading ? "Uploading..." : "Upload images"}</span>
                  <input
                    id="event-images"
                    name="event-images"
                    type="file"
                    multiple
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImagesUpload}
                    disabled={isUploading}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-neutral-500">
                JPEG, PNG, GIF, WebP up to 10MB each (1-30 images)
              </p>
              <div className="text-xs mt-2 text-neutral-600">
                <span className="font-medium">{imagePreviews.length}</span> of 30 images selected 
                {imagePreviews.length > 0 && 
                  <span className="text-green-600 ml-1">✓</span>
                }
              </div>
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
            disabled={createEventMutation.isPending || isUploading}
          >
            {createEventMutation.isPending ? "Creating..." : "Create Event"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-neutral-900 font-heading">
            Create New Event
          </DialogTitle>
        </DialogHeader>
        
        {!user ? unauthenticatedContent : eventForm}
      </DialogContent>
    </Dialog>
  );
}