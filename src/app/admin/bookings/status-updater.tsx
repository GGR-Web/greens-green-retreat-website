'use client';

import { useState, useTransition } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateBookingStatus } from "./actions";
import { useToast } from "@/hooks/use-toast";

type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

const statusOptions: BookingStatus[] = ['pending', 'confirmed', 'cancelled'];

function getBadgeVariant(status: BookingStatus) {
  switch (status) {
    case 'confirmed':
      return 'default'; // a green-like color from theme
    case 'pending':
      return 'secondary'; // a yellow-ish/gray color
    case 'cancelled':
      return 'destructive'; // a red color
    default:
      return 'outline';
  }
}

interface StatusUpdaterProps {
    bookingId: string;
    currentStatus: BookingStatus;
}

export default function StatusUpdater({ bookingId, currentStatus }: StatusUpdaterProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [optimisticStatus, setOptimisticStatus] = useState(currentStatus);

    const handleStatusChange = (newStatus: BookingStatus) => {
        if (newStatus === optimisticStatus) return;

        startTransition(async () => {
            const originalStatus = optimisticStatus;
            setOptimisticStatus(newStatus);
            const result = await updateBookingStatus(bookingId, newStatus);
            if (result.error) {
                setOptimisticStatus(originalStatus);
                toast({
                    title: "Update Failed",
                    description: result.error,
                    variant: "destructive"
                });
            } else {
                 toast({
                    title: "Status Updated",
                    description: `Booking status changed to ${newStatus}.`,
                });
            }
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                    <Badge variant={getBadgeVariant(optimisticStatus)} className="capitalize cursor-pointer">
                        {optimisticStatus}
                    </Badge>
                    <span className="sr-only">Toggle booking status</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                {statusOptions.map(status => (
                    <DropdownMenuItem 
                        key={status} 
                        onSelect={() => handleStatusChange(status)}
                        disabled={isPending || optimisticStatus === status}
                        className={cn("capitalize", optimisticStatus === status && "bg-accent")}
                    >
                        {status}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
