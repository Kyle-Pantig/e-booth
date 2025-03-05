"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
    Command, 
    CommandEmpty, 
    CommandGroup, 
    CommandItem, 
    CommandList 
  } from "@/components/ui/command";
  
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";

interface Device {
  deviceId: string;
  label: string;
}

interface SelectCameraProps {
  selectedDeviceId: string | null;
  setSelectedDeviceId: (deviceId: string) => void;
}

const SelectCamera: React.FC<SelectCameraProps> = ({
  selectedDeviceId,
  setSelectedDeviceId,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceInfos
          .filter((device) => device.kind === "videoinput")
          .map((device, index) => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${index + 1}`,
          }));

        setDevices(videoDevices);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    getDevices();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between bg-gray-300 dark:text-black-100 dark:hover:text-white"
        >
          {selectedDeviceId
            ? devices.find((device) => device.deviceId === selectedDeviceId)
                ?.label || "Select Camera..."
            : "Select Camera..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No cameras found.</CommandEmpty>
            <CommandGroup>
              {devices.map((device) => (
                <CommandItem
                  key={device.deviceId}
                  value={device.deviceId}
                  onSelect={() => {
                    setSelectedDeviceId(device.deviceId);
                    setOpen(false);
                  }}
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
