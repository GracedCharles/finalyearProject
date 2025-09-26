import * as React from "react"

const PopoverContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {}
})

const Popover = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const isOpen = open !== undefined ? open : internalOpen
  const handleChange = onOpenChange || setInternalOpen
  
  const contextValue = {
    open: isOpen,
    onOpenChange: handleChange
  }

  return (
    <PopoverContext.Provider value={contextValue}>
      <div className="relative">{children}</div>
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => {
  const { onOpenChange, open } = React.useContext(PopoverContext)
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onOpenChange(!open)
    onClick?.()
  }
  
  return (
    <div onClick={handleClick}>
      {children}
    </div>
  )
}

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }
>(({ className, align = "center", ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(PopoverContext)
  
  // Close popover when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open) {
        onOpenChange(false)
      }
    }
    
    if (open) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [open, onOpenChange])
  
  if (!open) return null
  
  // Determine alignment classes
  const alignClass = {
    start: "left-0",
    center: "left-1/2 transform -translate-x-1/2",
    end: "right-0"
  }[align]
  
  return (
    <div
      ref={ref}
      className={`absolute z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 mt-2 ${alignClass} ${className || ''}`}
      style={{ minWidth: '320px' }}
      onClick={(e) => e.stopPropagation()}
      {...props}
    />
  )
})
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverContent, PopoverTrigger }
