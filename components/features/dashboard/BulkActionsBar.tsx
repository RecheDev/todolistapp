import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { MdCheckCircle, MdSchedule, MdDelete } from 'react-icons/md'

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
    <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkComplete}
            disabled={selectedCount === 0 || isBulkAction}
            className="h-12 text-sm"
          >
            <MdCheckCircle className="h-4 w-4 mr-2" />
            Complete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkIncomplete}
            disabled={selectedCount === 0 || isBulkAction}
            className="h-12 text-sm"
          >
            <MdSchedule className="h-4 w-4 mr-2" />
            Incomplete
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            disabled={selectedCount === 0 || isBulkAction}
            className="h-12 text-sm"
          >
            <MdDelete className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-12 text-sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  )
}