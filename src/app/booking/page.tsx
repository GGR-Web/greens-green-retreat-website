
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from 'next/navigation';
import { DateRange } from 'react-day-picker';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from "@/lib/utils";
import { format, isWithinInterval, differenceInCalendarDays } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { getCottagesForBooking, submitBooking, getConfirmedBookings } from './actions';

const bookingFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  cottageId: z.string({ required_error: "Please select an accommodation." }),
  checkIn: z.date({ required_error: "A check-in date is required." }),
  checkOut: z.date({ required_error: "A check-out date is required." }),
  message: z.string().optional(),
}).refine(data => data.checkOut > data.checkIn, {
  message: "Check-out date must be after the check-in date.",
  path: ["checkOut"],
});


type Cottage = {
  id: string;
  name: string;
  pricePerNight: number;
}

function toDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export default function BookingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState<DateRange[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  useEffect(() => {
    async function fetchCottages() {
      const result = await getCottagesForBooking();
      if (result.cottages) {
        setCottages(result.cottages);
      } else if (result.error) {
         toast({ title: "Error", description: "Could not load cottages. " + result.error, variant: 'destructive' });
      }
    }
    fetchCottages();
  }, [toast]);


  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { name: '', email: '', phone: '', message: '' }
  });

  const selectedCottageId = form.watch('cottageId');
  const checkInDate = form.watch('checkIn');
  const checkOutDate = form.watch('checkOut');

  const selectedCottage = useMemo(() => {
    return cottages.find(c => c.id === selectedCottageId);
  }, [cottages, selectedCottageId]);

  const numberOfNights = useMemo(() => {
    if (checkInDate && checkOutDate) {
      return differenceInCalendarDays(checkOutDate, checkInDate);
    }
    return 0;
  }, [checkInDate, checkOutDate]);

  const totalPrice = useMemo(() => {
    if (selectedCottage && numberOfNights > 0) {
      return selectedCottage.pricePerNight * numberOfNights;
    }
    return 0;
  }, [selectedCottage, numberOfNights]);


  const fetchBookedDates = useCallback(async (cottageId: string) => {
      if (!cottageId) return;
      setIsCalendarLoading(true);
      const result = await getConfirmedBookings(cottageId);
      if (result.bookings) {
          // Add a day to the checkout date to correctly disable it in the calendar
          const disabledRanges = result.bookings.map(booking => ({
              from: new Date(booking.from.setHours(0, 0, 0, 0)),
              to: new Date(booking.to.setHours(0, 0, 0, 0)),
          }));
          setBookedDates(disabledRanges);
      } else if (result.error) {
          toast({ title: "Error", description: "Could not load booking information. " + result.error, variant: 'destructive' });
      }
      setIsCalendarLoading(false);
  }, [toast]);


  useEffect(() => {
    if (selectedCottageId) {
        // Clear previous dates when cottage changes
        setBookedDates([]);
        form.reset({ ...form.getValues(), cottageId: selectedCottageId, checkIn: undefined, checkOut: undefined });
        fetchBookedDates(selectedCottageId);
    }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCottageId, fetchBookedDates]);

 async function onSubmit(values: z.infer<typeof bookingFormSchema>) {
    setIsLoading(true);
    const result = await submitBooking(values);
    setIsLoading(false);

    if (result.success && result.bookingId) {
      router.push(`/booking/thank-you?id=${result.bookingId}`);
    } else {
      toast({
        title: "Booking Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  function isDateDisabled(date?: Date | null): boolean {
    const d = date instanceof Date && !isNaN(date.getTime()) ? date : null;
    if (!d) return false;
    if (d < new Date(new Date().setHours(0, 0, 0, 0))) {
        return true;
    }
    for (const range of bookedDates) {
      const start = toDate((range as any)?.from);
      const end   = toDate((range as any)?.to);
      if (start && end && isWithinInterval(d, { start, end })) return true;
    }
    return false;
  }


  return (
    <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Book Your Stay</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start your journey to relaxation. Fill out the form below to inquire about availability.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isLoading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="(123) 456-7890" {...field} disabled={isLoading} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                    <FormField
                      control={form.control}
                      name="cottageId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Accommodation</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || cottages.length === 0}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={cottages.length > 0 ? "Select an accommodation type" : "Loading accommodations..."} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cottages.map(cottage => (
                                  <SelectItem key={cottage.id} value={cottage.id}>{cottage.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="checkIn"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Check-in Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                     disabled={isLoading || !selectedCottageId || isCalendarLoading}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>{isCalendarLoading ? 'Loading...' : 'Pick a date'}</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={isDateDisabled}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="checkOut"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Check-out Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                     disabled={isLoading || !form.getValues('checkIn') || isCalendarLoading}
                                  >
                                     <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>{isCalendarLoading ? 'Loading...' : 'Pick a date'}</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => {
                                    const checkInDate = form.getValues('checkIn');
                                    // Can't select before check-in
                                    if (checkInDate && date <= checkInDate) return true;
                                    // check if standard disable logic applies
                                    return isDateDisabled(date);
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special requests or questions?"
                              className="resize-none"
                              {...field}
                               disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                      {isLoading ? 'Checking Availability...' : 'Send Inquiry'}
                    </Button>
                  </form>
                </Form>
            </div>
            <div className="md:col-span-1">
                <Card className="sticky top-24 shadow-lg">
                    <CardHeader>
                        <CardTitle>Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(!selectedCottage || numberOfNights <= 0) && (
                            <p className="text-muted-foreground">Select a cottage and your dates to see a price summary.</p>
                        )}
                        {selectedCottage && numberOfNights > 0 && (
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{selectedCottage.name}</span>
                                    <span>KES {selectedCottage.pricePerNight.toLocaleString()} / night</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Number of nights</span>
                                    <span>&times; {numberOfNights}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg text-primary">
                                    <span>Total Price</span>
                                    <span>KES {totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
