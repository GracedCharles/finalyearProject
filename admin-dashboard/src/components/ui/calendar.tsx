import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns"
import * as React from "react"

interface CalendarProps {
  mode?: "single" | "multiple" | "range"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  initialFocus?: boolean
  className?: string
}

const Calendar = ({ className, mode = "single", selected, onSelect, initialFocus }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState(selected)

  React.useEffect(() => {
    if (selected) {
      setSelectedDate(selected)
      setCurrentMonth(selected)
    }
  }, [selected])

  const handleDateClick = (day: Date) => {
    if (onSelect) {
      onSelect(day)
    }
    setSelectedDate(day)
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between">
        <button 
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            prevMonth()
          }}
        >
          <span>‹</span>
        </button>
        <div className="text-sm font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <button 
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            nextMonth()
          }}
        >
          <span>›</span>
        </button>
      </div>
    )
  }

  const renderDays = () => {
    const days = []
    const dateFormat = "EEE"
    const startDate = startOfWeek(currentMonth)

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-sm font-medium text-muted-foreground">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      )
    }

    return <div className="grid grid-cols-7 gap-1">{days}</div>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate
    let formattedDate = ""

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d")
        const cloneDay = day
        days.push(
          <button
            key={day.toString()}
            className={`h-9 w-9 rounded-md p-0 text-center text-sm hover:bg-accent hover:text-accent-foreground ${
              selectedDate && isSameDay(day, selectedDate) 
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" 
                : !isSameMonth(day, monthStart)
                ? "text-muted-foreground opacity-50"
                : ""
            }`}
            onClick={(e) => {
              e.stopPropagation()
              handleDateClick(cloneDay)
            }}
          >
            {formattedDate}
          </button>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      )
      days = []
    }
    return <div className="mt-4 space-y-1">{rows}</div>
  }

  return (
    <div className={`rounded-md border bg-card ${className || ''}`} style={{ minWidth: '300px' }}>
      <div className="p-3">
        {renderHeader()}
        <div className="mt-4">
          {renderDays()}
          {renderCells()}
        </div>
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }

