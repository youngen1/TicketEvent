import { useState, useEffect } from 'react';
import { Search, FilterX, Calendar, Clock, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';

interface EventFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  categories: string[];
  tags: string[];
  fromDate: Date | null;
  toDate: Date | null;
}

import { EVENT_CATEGORIES } from "@shared/schema";

const POPULAR_TAGS = [
  "workshop", "conference", "meetup", "concert", "exhibition", 
  "networking", "hackathon", "seminar", "festival", "fundraiser"
];

export default function EventFilters({ onFilterChange }: EventFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    tags: [],
    fromDate: null,
    toDate: null
  });
  
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Update active filters count whenever the filter state changes
  useEffect(() => {
    const active: string[] = [];
    
    if (filters.search) active.push('search');
    if (filters.categories.length > 0) active.push('categories');
    if (filters.tags.length > 0) active.push('tags');
    if (filters.fromDate || filters.toDate) active.push('date');
    
    setActiveFilters(active);
    
    // Notify parent component of filter changes
    onFilterChange(filters);
  }, [filters, onFilterChange]);
  
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };
  
  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };
  
  const handleTagChange = (tag: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      tags: checked 
        ? [...prev.tags, tag]
        : prev.tags.filter(t => t !== tag)
    }));
  };
  
  const handleDateChange = (type: 'from' | 'to', date: Date | null) => {
    setFilters(prev => ({
      ...prev,
      [type === 'from' ? 'fromDate' : 'toDate']: date
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      categories: [],
      tags: [],
      fromDate: null,
      toDate: null
    });
  };
  
  const clearSingleFilter = (filter: string) => {
    if (filter === 'search') {
      setFilters(prev => ({ ...prev, search: '' }));
    } else if (filter === 'categories') {
      setFilters(prev => ({ ...prev, categories: [] }));
    } else if (filter === 'tags') {
      setFilters(prev => ({ ...prev, tags: [] }));
    } else if (filter === 'date') {
      setFilters(prev => ({ ...prev, fromDate: null, toDate: null }));
    }
  };
  
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search events..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 h-10">
                <Tag className="h-4 w-4" />
                Categories
                {filters.categories.length > 0 && <Badge variant="secondary" className="ml-1">{filters.categories.length}</Badge>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Event Categories</h4>
                <Separator />
                <div className="grid grid-cols-2 gap-2">
                  {EVENT_CATEGORIES.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${category}`} 
                        checked={filters.categories.includes(category)}
                        onCheckedChange={(checked) => 
                          handleCategoryChange(category, checked === true)
                        }
                      />
                      <Label htmlFor={`category-${category}`}>{category}</Label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, categories: [] }))}
                  >
                    Clear
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setIsCategoryPopoverOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 h-10">
                <Tag className="h-4 w-4" />
                Tags
                {filters.tags.length > 0 && <Badge variant="secondary" className="ml-1">{filters.tags.length}</Badge>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Popular Tags</h4>
                <Separator />
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_TAGS.map(tag => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`tag-${tag}`} 
                        checked={filters.tags.includes(tag)}
                        onCheckedChange={(checked) => 
                          handleTagChange(tag, checked === true)
                        }
                      />
                      <Label htmlFor={`tag-${tag}`}>{tag}</Label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, tags: [] }))}
                  >
                    Clear
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setIsTagPopoverOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 h-10">
                <Calendar className="h-4 w-4" />
                Date
                {(filters.fromDate || filters.toDate) && <Badge variant="secondary" className="ml-1">1</Badge>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-4">
                <h4 className="font-medium">Date Range</h4>
                <Separator />
                <div className="flex flex-col space-y-2">
                  <Label>From</Label>
                  <DatePicker 
                    date={filters.fromDate} 
                    setDate={(date) => handleDateChange('from', date)} 
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>To</Label>
                  <DatePicker 
                    date={filters.toDate} 
                    setDate={(date) => handleDateChange('to', date)} 
                  />
                </div>
                <div className="flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, fromDate: null, toDate: null }))}
                  >
                    Clear
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setIsDatePopoverOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center flex-wrap gap-2 mt-3">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {activeFilters.includes('search') && (
            <Badge 
              variant="outline" 
              className="flex gap-1 items-center"
              onClick={() => clearSingleFilter('search')}
            >
              Search: {filters.search.length > 15 ? `${filters.search.substring(0, 15)}...` : filters.search}
              <button className="rounded-full hover:bg-secondary p-0.5">
                <FilterX className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {activeFilters.includes('categories') && (
            <Badge 
              variant="outline" 
              className="flex gap-1 items-center"
              onClick={() => clearSingleFilter('categories')}
            >
              Categories: {filters.categories.length}
              <button className="rounded-full hover:bg-secondary p-0.5">
                <FilterX className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {activeFilters.includes('tags') && (
            <Badge 
              variant="outline" 
              className="flex gap-1 items-center"
              onClick={() => clearSingleFilter('tags')}
            >
              Tags: {filters.tags.length}
              <button className="rounded-full hover:bg-secondary p-0.5">
                <FilterX className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {activeFilters.includes('date') && (
            <Badge 
              variant="outline" 
              className="flex gap-1 items-center"
              onClick={() => clearSingleFilter('date')}
            >
              Date Range
              <button className="rounded-full hover:bg-secondary p-0.5">
                <FilterX className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}