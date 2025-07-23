import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface BulkActionsBarProps {
  selectedCount: number
  totalCount: number
  allSelected: boolean
  isBulkAction: boolean
  onSelectAll: () => void
  onBulkComplete: () => void
  onBulkIncomplete: () => void
  onBulkDelete: () => void
  onCancel: () => void
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  allSelected,
  isBulkAction,
  onSelectAll,
  onBulkComplete,
  onBulkIncomplete,
  onBulkDelete,
  onCancel,
}: BulkActionsBarProps) {
  return (
    <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={allSelected && totalCount > 0}
            onCheckedChange={onSelectAll}
            className="h-5 w-5"
            aria-label="Select all todos"
          />
          <span className="text-sm font-medium">
            {selectedCount} of {totalCount} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkComplete}
            disabled={selectedCount === 0 || isBulkAction}
            className="h-8 text-xs"
          >
            ✅ Complete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkIncomplete}
            disabled={selectedCount === 0 || isBulkAction}
            className="h-8 text-xs"
          >
            ⏳ Incomplete
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            disabled={selectedCount === 0 || isBulkAction}
            className="h-8 text-xs"
          >
            🗑️ Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 text-xs"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  )
}