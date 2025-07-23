import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'pending' | 'completed'

interface SearchAndFilterBarProps {
  searchQuery: string
  filter: FilterType
  stats: {
    total: number
    pending: number
    completed: number
  }
  completedCount: number
  bulkSelectMode: boolean
  isBulkAction: boolean
  onSearchChange: (value: string) => void
  onFilterChange: (filter: FilterType) => void
  onToggleBulkMode: () => void
  onDeleteCompleted: () => void
}

export const SearchAndFilterBar = forwardRef<HTMLInputElement, SearchAndFilterBarProps>(
  ({
    searchQuery,
    filter,
    stats,
    completedCount,
    bulkSelectMode,
    isBulkAction,
    onSearchChange,
    onFilterChange,
    onToggleBulkMode,
    onDeleteCompleted,
  }, ref) => {
    return (
      <div className="flex flex-col gap-3 md:flex-row md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={ref}
            placeholder="🔍 Search tasks... (Cmd+K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 text-base border-0 bg-muted/30 focus:bg-muted/50 transition-all duration-200 rounded-lg shadow-input focus:shadow-md"
            aria-label="Search todos by title or description"
            aria-describedby="search-help"
          />
          <div id="search-help" className="sr-only">
            Type to search through your todos by title or description. Press Cmd+K to focus search. Use Cmd+Shift+A for all, Cmd+Shift+P for pending, Cmd+Shift+C for completed.
          </div>
        </div>
        
        <div className="flex bg-muted/50 rounded-lg p-1 w-full md:w-auto">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange('all')}
            className={cn(
              "flex-1 md:flex-none h-10 px-4 font-medium transition-all duration-200 rounded-md",
              filter === 'all' 
                ? "bg-background shadow-sm" 
                : "hover:bg-background/50"
            )}
            aria-label={`Show all todos (${stats.total} total)`}
          >
            📋 All ({stats.total})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange('pending')}
            className={cn(
              "flex-1 md:flex-none h-10 px-4 font-medium transition-all duration-200 rounded-md",
              filter === 'pending' 
                ? "bg-background shadow-sm" 
                : "hover:bg-background/50"
            )}
            aria-label={`Show pending todos (${stats.pending} pending)`}
          >
            ⏳ Pending ({stats.pending})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange('completed')}
            className={cn(
              "flex-1 md:flex-none h-10 px-4 font-medium transition-all duration-200 rounded-md",
              filter === 'completed' 
                ? "bg-background shadow-sm" 
                : "hover:bg-background/50"
            )}
            aria-label={`Show completed todos (${stats.completed} completed)`}
          >
            ✅ Completed ({stats.completed})
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onToggleBulkMode}
            className="w-full md:w-auto h-12 font-medium hover:bg-accent transition-all duration-200 rounded-lg"
          >
            {bulkSelectMode ? '🔲 Exit Select' : '☑️ Select Multiple'}
          </Button>
          {completedCount > 0 && (
            <Button
              variant="outline"
              onClick={onDeleteCompleted}
              disabled={isBulkAction}
              className="w-full md:w-auto h-12 font-medium hover:bg-red-50 transition-all duration-200 rounded-lg text-red-600"
            >
              🗑️ Clear Completed
            </Button>
          )}
        </div>
      </div>
    )
  }
)

SearchAndFilterBar.displayName = 'SearchAndFilterBar'