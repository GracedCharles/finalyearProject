import * as React from "react"

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  value: "",
  onValueChange: () => {},
  open: false,
  onOpenChange: () => {}
})

const Select = ({ 
  children, 
  value, 
  onValueChange, 
  defaultValue 
}: { 
  children: React.ReactNode, 
  value?: string, 
  onValueChange?: (value: string) => void,
  defaultValue?: string
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const [open, setOpen] = React.useState(false)
  
  const handleValueChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue)
    } else {
      setInternalValue(newValue)
    }
    setOpen(false)
  }
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }
  
  const contextValue = {
    value: value !== undefined ? value : internalValue,
    onValueChange: handleValueChange,
    open,
    onOpenChange: handleOpenChange
  }

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(SelectContext)
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    onOpenChange(!open)
  }
  
  return (
    <button
      ref={ref}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      onClick={handleClick}
      {...props}
    />
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { open } = React.useContext(SelectContext)
  
  if (!open) return null
  
  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className || ''}`}
      {...props}
    />
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, onClick, ...props }, ref) => {
  const { onValueChange, value: selectedValue } = React.useContext(SelectContext)
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e)
    onValueChange(value)
  }
  
  const isSelected = selectedValue === value
  
  return (
    <div
      ref={ref}
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${isSelected ? 'bg-accent text-accent-foreground' : ''} ${className || ''}`}
      onClick={handleClick}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2">✓</span>
      )}
      {props.children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = React.useContext(SelectContext)
  
  return (
    <span className={value ? "" : "text-muted-foreground"}>
      {value || placeholder}
    </span>
  )
}

export {
    Select, SelectContent,
    SelectItem, SelectTrigger, SelectValue
}
