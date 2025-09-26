import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { X, LucideIcon, University, MousePointer2 } from 'lucide-react';

interface CustomPopoverProps {
  id: string;
  title: string;
  subTitle?: string;
  definition?: string;
  children?: React.ReactNode;
  affiliation?: any;
  trigger: React.ReactElement;
  show?: boolean;
  onToggle: (show: boolean) => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  icon?: LucideIcon;
  onSelect?: () => void;
}

const CustomPopover: React.FC<CustomPopoverProps> = ({
  id,
  title,
  subTitle,
  definition,
  children,
  trigger,
  show,
  affiliation,
  onToggle,
  placement = 'bottom',
  icon: Icon,
  onSelect
}) => {
  return (
    <Popover open={show} onOpenChange={onToggle}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="max-w-[500px]" side={placement}>
        <div className="flex items-center justify-between bg-gray-50 p-4">
          <span className="inline-block w-[90%]">
            {Icon && <Icon className="inline text-gray-700" />} {title}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 w-[5%] text-[#353839]"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(false);
            }}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4">
          {definition && (
            <div className="w-[100%] text-justify mb-2.5">
              {definition}
            </div>
          )}
          <div className="w-[100%]">
            {affiliation && (
              <span className="flex items-center">
                <University className="mr-2 h-4 w-4" />
                <a
                  href={affiliation?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 break-all text-sm"
                >
                  {affiliation?.name}
                </a>
              </span>
            )}
          </div>
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CustomPopover;