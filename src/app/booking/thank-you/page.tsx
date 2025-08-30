
import Link from "next/link";
import { notFound } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, Home } from "lucide-react";
import { getBookingDetails } from "../actions";
import { format } from "date-fns";

// This is the correct type definition for a page using searchParams
type ThankYouPageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const bookingId = searchParams?.id as string | undefined;

  if (!bookingId) {
    notFound();
  }

  const { booking, error } = await getBookingDetails(bookingId);

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-destructive">
            An Error Occurred
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We couldn't retrieve your booking details. Please contact us directly for assistance.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Error: {error || 'Booking not found.'}</p>
          <div className="mt-10">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 bg-secondary/30">
      <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
              <CardHeader className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <CardTitle className="font-headline text-3xl md:text-4xl text-primary">Booking Request Received!</CardTitle>
                  <CardDescription className="text-muted-foreground text-base">
                    We've got your inquiry and will respond via email within 24 hours.
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                    <h3 className="font-headline text-lg font-semibold text-primary mb-2">Booking Summary</h3>
                    <div className="border rounded-lg p-4 space-y-3 bg-background">
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Booking ID:</span>
                            <span className="font-mono text-sm">{booking.id}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-semibold">{booking.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-semibold">{booking.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Accommodation:</span>
                            <span className="font-semibold">{booking.cottageName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Check-in:</span>
                            <span className="font-semibold">{booking.checkIn ? format(new Date(booking.checkIn), 'PPP') : 'N/A'}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Check-out:</span>
                            <span className="font-semibold">{booking.checkOut ? format(new Date(booking.checkOut), 'PPP') : 'N/A'}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between text-lg">
                            <span className="text-muted-foreground">Estimated Total:</span>
                            <span className="font-bold text-primary">KES {booking.totalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-headline text-lg font-semibold text-primary mb-2">Payment Instructions</h3>
                    <div className="border-2 border-accent/50 rounded-lg p-4 bg-accent/10">
                        <p className="text-center text-accent-foreground font-semibold">
                            To confirm your booking, please make the full payment to:
                        </p>
                        <div className="text-center my-4">
                            <p className="text-lg"><span className="text-muted-foreground">Paybill:</span> <strong className="text-2xl font-mono text-primary">625625</strong></p>
                            <p className="text-lg"><span className="text-muted-foreground">Account No:</span> <strong className="text-2xl font-mono text-primary">01520262670600</strong></p>
                        </div>
                         <p className="text-xs text-center text-muted-foreground mt-2">
                           Your booking is provisional and will be held for 24 hours pending payment.
                         </p>
                    </div>
                </div>
              </CardContent>
              <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="/"><Home className="mr-2"/> Return to Home</Link>
                  </Button>
              </CardFooter>
          </Card>
      </div>
    </div>
  );
}
