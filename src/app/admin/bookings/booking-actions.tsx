
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateBookingStatus } from "./actions";

interface BookingActionsProps {
    bookingId: string;
}

export default function BookingActions({ bookingId }: BookingActionsProps) {
    const { toast } = useToast();
    const [isCancelPending, startCancelTransition] = useTransition();
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const handleCancel = () => {
        startCancelTransition(async () => {
            const result = await updateBookingStatus(bookingId, 'cancelled');
            if (result.error) {
                 toast({
                    title: "Cancellation Failed",
                    description: result.error,
                    variant: "destructive"
                });
            } else {
                 toast({
                    title: "Booking Cancelled",
                    description: "The booking has been successfully cancelled.",
                });
            }
            setShowCancelDialog(false);
        });
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/bookings/edit/${bookingId}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setShowCancelDialog(true)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Cancel Booking
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will cancel the booking. This cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={isCancelPending}>Back</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel} disabled={isCancelPending} className="bg-destructive hover:bg-destructive/90">
                        {isCancelPending ? "Cancelling..." : "Yes, cancel booking"}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
