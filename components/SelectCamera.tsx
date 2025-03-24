import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

// Add props to pass selectedDeviceId and onSelectCamera
interface SelectCameraProps {
  devices: { deviceId: string; label: string }[];
  selectedDeviceId: string | null;
  onSelectCamera: (deviceId: string) => void;
}

const SelectCamera: React.FC<SelectCameraProps> = ({
  devices,
  selectedDeviceId,
  onSelectCamera
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleSelectCamera = (deviceId: string) => {
    onSelectCamera(deviceId); // Call the parent callback
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:w-[300px] justify-between bg-accent dark:text-white dark:hover:text-white"
        >
          {selectedDeviceId
            ? devices.find((device) => device.deviceId === selectedDeviceId)
                ?.label || "Select Camera..."
            : "Select Camera..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[328px] sm:w-[416px] md:w-[300px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No cameras found.</CommandEmpty>
            <CommandGroup>
              {devices.map((device) => (
                <CommandItem
                  key={device.deviceId}
                  value={device.deviceId}
                  onSelect={() => handleSelectCamera(device.deviceId)}
                >
                  {device.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedDeviceId === device.deviceId
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SelectCamera;