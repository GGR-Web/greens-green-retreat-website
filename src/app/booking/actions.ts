
'use server';

import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const bookingFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  cottageId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  message: z.string().optional(),
});

type BookingFormInput = z.infer<typeof bookingFormSchema>;

export async function getCottagesForBooking(): Promise<{ cottages?: {id: string, name: string, pricePerNight: number}[]; error?: string }> {
    if (!adminDb) return { error: "Database not initialized." };
    try {
        const cottagesSnapshot = await adminDb.collection('cottages').orderBy('name').get();
        if (cottagesSnapshot.empty) {
            return { cottages: [] };
        }
        const cottages = cottagesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || 'Unnamed Cottage',
                pricePerNight: data.pricePerNight || 0,
            };
        });
        return { cottages };
    } catch (error: any) {
        console.error("Error fetching cottages for booking:", error);
        return { error: error.message || "An unknown error occurred." };
    }
}

export async function getConfirmedBookings(cottageId: string): Promise<{ bookings: {id: string, from: Date; to: Date }[]; error?: string }> {
    if (!adminDb) {
        return { bookings: [], error: 'Database connection not available.' };
    }
    if (!cottageId) {
        return { bookings: [] }; // No cottage selected, return empty array.
    }

    try {
        const bookingsSnapshot = await adminDb.collection('bookings')
            .where('cottageId', '==', cottageId)
            .where('status', '==', 'confirmed')
            .get();

        if (bookingsSnapshot.empty) {
            return { bookings: [] };
        }

        const bookings = bookingsSnapshot.docs.map(doc => {
            const data = doc.data();
            // Firestore timestamps need to be converted to JS Dates
            const checkIn = (data.checkIn as Timestamp).toDate();
            const checkOut = (data.checkOut as Timestamp).toDate();
            return { id: doc.id, from: checkIn, to: checkOut };
        });
        
        return { bookings };

    } catch (error: any) {
        console.error(`Error fetching bookings for cottage ${cottageId}:`, error);
        return { bookings: [], error: error.message || 'An unexpected error occurred.' };
    }
}


export async function submitBooking(input: BookingFormInput): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    if (!adminDb) {
        return { success: false, error: 'Database connection not available.' };
    }

    const parsedData = bookingFormSchema.safeParse(input);
    if (!parsedData.success) {
        return { success: false, error: 'Invalid data provided.' };
    }

    const { name, email, phone, cottageId, checkIn, checkOut, message } = parsedData.data;

    try {
        const bookingsRef = adminDb.collection('bookings');

        // Check for overlapping bookings
        const overlappingBookingsSnapshot = await bookingsRef
            .where('cottageId', '==', cottageId)
            .where('status', '==', 'confirmed')
            .where('checkIn', '<', checkOut)
            .get();

        const isOverlapping = overlappingBookingsSnapshot.docs.some(doc => {
            const booking = doc.data();
            const bookingCheckOut = (booking.checkOut as Timestamp).toDate();
            return bookingCheckOut > checkIn;
        });

        if (isOverlapping) {
            return { success: false, error: 'The selected dates for this cottage are no longer available. Please choose different dates.' };
        }
        
        let totalPrice = 0;
        const cottageDoc = await adminDb.collection('cottages').doc(cottageId).get();
        if (cottageDoc.exists) {
            const pricePerNight = cottageDoc.data()?.pricePerNight || 0;
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
            totalPrice = pricePerNight * nights;
        }

        // Create new booking
        const newBookingRef = await bookingsRef.add({
            name,
            email,
            phone,
            cottageId,
            cottageName: cottageDoc.exists() ? cottageDoc.data()?.name : 'Unknown Cottage',
            checkIn: Timestamp.fromDate(checkIn),
            checkOut: Timestamp.fromDate(checkOut),
            totalPrice,
            message: message || '',
            status: 'pending',
            createdAt: FieldValue.serverTimestamp(),
        });
        
        return { success: true, bookingId: newBookingRef.id };

    } catch (error: any) {
        console.error('Error submitting booking:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}

export async function getBookingDetails(bookingId: string) {
    if (!adminDb) {
        return { error: 'Database not initialized.' };
    }
    if (!bookingId) {
        return { error: 'A booking ID is required to fetch details.' };
    }

    try {
        const bookingDoc = await adminDb.collection('bookings').doc(bookingId).get();

        if (!bookingDoc.exists) {
            return { error: 'Booking not found.' };
        }
        
        const bookingData = bookingDoc.data()!;
        
        const checkIn = bookingData.checkIn && (bookingData.checkIn as Timestamp).toDate();
        const checkOut = bookingData.checkOut && (bookingData.checkOut as Timestamp).toDate();
        
        if (!checkIn || !checkOut) {
            return { error: 'Booking is missing check-in or check-out dates.' };
        }

        return {
            booking: {
                id: bookingDoc.id,
                name: bookingData.name,
                email: bookingData.email,
                phone: bookingData.phone,
                checkIn: checkIn.toISOString(),
                checkOut: checkOut.toISOString(),
                cottageName: bookingData.cottageName || 'Unknown Cottage',
                totalPrice: bookingData.totalPrice || 0,
            }
        };

    } catch (error: any) {
        console.error(`Error fetching booking ${bookingId}:`, error);
        return { error: error.message || 'An unknown error occurred.' };
    }
}
