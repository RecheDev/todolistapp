import { forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MdViewList, MdSchedule, MdCheckCircle, MdSelectAll, MdDelete } from 'react-icons/md'
import { SearchErrorBoundary } from '@/components/ui/feature-error-boundaries'

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

const SearchAndFilterBarInternal = forwardRef<HTMLInputElement, SearchAndFilterBarProps>(
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
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={ref}
            placeholder="Search tasks... (Cmd+K)"
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
        
        <div className="flex bg-muted/50 rounded-lg p-2 w-full md:w-auto">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange('all')}
            className={cn(
              "flex-1 md:flex-none h-12 px-4 font-medium transition-all duration-200 rounded-md",
              filter === 'all' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-background/50"
            )}
            aria-label={`Show all todos (${stats.total} total)`}
          >
            <MdViewList className="h-4 w-4 mr-2" />
            All ({stats.total})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange('pending')}
            className={cn(
              "flex-1 md:flex-none h-12 px-4 font-medium transition-all duration-200 rounded-md",
              filter === 'pending' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-background/50"
            )}
            aria-label={`Show pending todos (${stats.pending} pending)`}
          >
            <MdSchedule className="h-4 w-4 mr-2" />
            Pending ({stats.pending})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange('completed')}
            className={cn(
              "flex-1 md:flex-none h-12 px-4 font-medium transition-all duration-200 rounded-md",
              filter === 'completed' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-background/50"
            )}
            aria-label={`Show completed todos (${stats.completed} completed)`}
          >
            <MdCheckCircle className="h-4 w-4 mr-2" />
            Completed ({stats.completed})
          </Button>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Button
            variant="outline"
            onClick={onToggleBulkMode}
            className="w-full md:w-auto h-12 font-medium hover:bg-accent transition-all duration-200 rounded-lg"
          >
            <MdSelectAll className="h-4 w-4 mr-2" />
            {bulkSelectMode ? 'Exit Select' : 'Select Multiple'}
          </Button>
          {completedCount > 0 && (
            <Button
              variant="outline"
              onClick={onDeleteCompleted}
              disabled={isBulkAction}
              className="w-full md:w-auto h-12 font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 rounded-lg text-red-600 dark:text-red-400"
            >
              <MdDelete className="h-4 w-4 mr-2" />
              Clear Completed
            </Button>
          )}
        </div>
      </div>
    )
  }
)

SearchAndFilterBarInternal.displayName = 'SearchAndFilterBarInternal'

export const SearchAndFilterBar = forwardRef<HTMLInputElement, SearchAndFilterBarProps>(
  (props, ref) => (
    <SearchErrorBoundary>
      <SearchAndFilterBarInternal {...props} ref={ref} />
    </SearchErrorBoundary>
  )
)

SearchAndFilterBar.displayName = 'SearchAndFilterBar'