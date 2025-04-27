import { Input } from "@/components/ui/input";

interface FallbackLocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * A simple fallback input for locations when Google Maps can't be loaded
 */
export default function FallbackLocationInput({ 
  value, 
  onChange, 
  placeholder = "Enter a location" 
}: FallbackLocationInputProps) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full"
    />
  );
}