
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

import { getBookings, Booking } from "./actions";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import StatusUpdater from './status-updater';
import BookingActions from './booking-actions';

export default async function AdminBookingsPage() {
  const { bookings, error } = await getBookings();

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="px-7 flex flex-row items-center justify-between">
        <div>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>A list of all recent booking inquiries.</CardDescription>
        </div>
        <div>
            <Button asChild>
                <Link href="/admin/bookings/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Booking
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
         {(!bookings || bookings.length === 0) ? (
             <div className="text-center py-12">
                <h3 className="text-lg font-medium">No bookings found.</h3>
                <p className="text-muted-foreground mt-2">When guests make inquiries, they will appear here.</p>
            </div>
         ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Cottage</TableHead>
                  <TableHead className="hidden sm:table-cell">Dates</TableHead>
                  <TableHead className="hidden md:table-cell">Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-medium">{booking.name}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {booking.email}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{booking.cottageName}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                        {booking.checkIn} - {booking.checkOut}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{format(parseISO(booking.createdAt), "PPP")}</TableCell>
                    <TableCell>
                        <StatusUpdater bookingId={booking.id} currentStatus={booking.status} />
                    </TableCell>
                    <TableCell className="text-right">
                        <BookingActions bookingId={booking.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
         )}
      </CardContent>
    </Card>
  )
}
