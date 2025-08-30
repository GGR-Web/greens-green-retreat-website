
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { FieldValue, Timestamp, FieldPath } from 'firebase-admin/firestore';
import { z } from 'zod';

export interface Booking {
    id: string;
    name: string;
    email: string;
    cottageName: string;
    checkIn: string;
    checkOut: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: string;
}

const adminBookingFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  cottageId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  customPrice: z.coerce.number().optional(),
  bookingNotes: z.string().optional(),
});

type AdminBookingFormInput = z.infer<typeof adminBookingFormSchema>;

export async function getBookings(): Promise<{ bookings?: Booking[], error?: string }> {
    if (!adminDb) {
        return { error: 'Database not initialized.' };
    }

    try {
        const bookingsSnapshot = await adminDb.collection('bookings').orderBy('createdAt', 'desc').get();

        if (bookingsSnapshot.empty) {
            return { bookings: [] };
        }

        const bookingPromises = bookingsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            let cottageName = 'Unknown Cottage';
            
            if (data.cottageId) {
                 const cottageDoc = await adminDb.collection('cottages').doc(data.cottageId).get();
                 if (cottageDoc.exists) {
                    cottageName = cottageDoc.data()?.name || 'Unnamed Cottage';
                 }
            }
           
            const toDate = (timestamp: Timestamp | undefined) => timestamp ? timestamp.toDate() : null;

            const checkInDate = toDate(data.checkIn);
            const checkOutDate = toDate(data.checkOut);
            const createdAtDate = toDate(data.createdAt);

            return {
                id: doc.id,
                name: data.name || 'N/A',
                email: data.email || 'N/A',
                cottageName,
                checkIn: checkInDate ? checkInDate.toLocaleDateString() : 'N/A',
                checkOut: checkOutDate ? checkOutDate.toLocaleDateString() : 'N/A',
                status: data.status || 'pending',
                createdAt: createdAtDate ? createdAtDate.toISOString() : new Date().toISOString(),
            };
        });

        const bookings = await Promise.all(bookingPromises);
        
        return { bookings };
    } catch (error: any) {
        console.error("Error fetching bookings:", error);
        return { error: error.message || "An unknown error occurred." };
    }
}

export async function updateBookingStatus(bookingId: string, status: string): Promise<{ success: boolean; error?: string }> {
    if (!adminDb) {
        return { success: false, error: 'Database not initialized.' };
    }
    if (!bookingId || !status) {
        return { success: false, error: 'Invalid input provided.'};
    }

    try {
        await adminDb.collection('bookings').doc(bookingId).update({ status });
        revalidatePath('/admin/bookings'); // Revalidate the bookings page to show the updated status
        return { success: true };
    } catch (error: any) {
        console.error(`Error updating booking ${bookingId}:`, error);
        return { success: false, error: error.message || 'An unknown error occurred.'};
    }
}


export async function createBookingFromAdmin(input: AdminBookingFormInput): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    if (!adminDb) {
        return { success: false, error: 'Database connection not available.' };
    }

    const parsedData = adminBookingFormSchema.safeParse(input);
    if (!parsedData.success) {
        const errorDetails = parsedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return { success: false, error: `Invalid data provided: ${errorDetails}` };
    }

    const { name, email, phone, cottageId, checkIn, checkOut, customPrice, bookingNotes } = parsedData.data;

    try {
        const bookingsRef = adminDb.collection('bookings');

        // Check for overlapping bookings
        const overlappingBookingsSnapshot = await bookingsRef
            .where('cottageId', '==', cottageId)
            .where('status', '!=', 'cancelled') // Don't check against cancelled bookings
            .where('checkIn', '<', checkOut)
            .get();

        const isOverlapping = overlappingBookingsSnapshot.docs.some(doc => {
            const booking = doc.data();
            const bookingCheckOut = (booking.checkOut as Timestamp).toDate();
            return bookingCheckOut > checkIn;
        });
        
        if (isOverlapping) {
            return { success: false, error: 'The selected dates for this cottage are already booked. Please choose different dates.' };
        }

        // Calculate final price
        let finalPrice = 0;
        if (customPrice && customPrice > 0) {
            finalPrice = customPrice;
        } else {
            const cottageDoc = await adminDb.collection('cottages').doc(cottageId).get();
            const pricePerNight = cottageDoc.data()?.pricePerNight || 0;
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
            finalPrice = pricePerNight * nights;
        }


        // Create new booking
        const newBookingRef = await bookingsRef.add({
            name,
            email,
            phone,
            cottageId,
            checkIn: Timestamp.fromDate(checkIn),
            checkOut: Timestamp.fromDate(checkOut),
            finalPrice,
            bookingNotes: bookingNotes || '',
            status: 'confirmed', // Default to confirmed for admin entries
            createdAt: FieldValue.serverTimestamp(),
        });
        
        revalidatePath('/admin/bookings');
        return { success: true, bookingId: newBookingRef.id };

    } catch (error: any) {
        console.error('Error creating admin booking:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}

export async function getBooking(bookingId: string) {
    if (!adminDb) return { error: "Database not initialized." };
    try {
        const bookingDoc = await adminDb.collection('bookings').doc(bookingId).get();
        if (!bookingDoc.exists) {
            return { error: "Booking not found." };
        }
        const data = bookingDoc.data()!;
        
        // Convert Timestamps to serializable format (JS Date objects)
        const toDate = (timestamp: Timestamp | undefined) => timestamp ? timestamp.toDate() : null;
        
        return {
            booking: {
                id: bookingDoc.id,
                ...data,
                checkIn: toDate(data.checkIn),
                checkOut: toDate(data.checkOut),
                createdAt: toDate(data.createdAt)?.toISOString() ?? new Date().toISOString()
            }
        };
    } catch (error: any) {
        console.error("Error fetching booking:", error);
        return { error: error.message || "An unknown error occurred." };
    }
}

export async function updateBooking(bookingId: string, input: AdminBookingFormInput): Promise<{ success: boolean; error?: string }> {
    if (!adminDb) {
        return { success: false, error: 'Database connection not available.' };
    }

    const parsedData = adminBookingFormSchema.safeParse(input);
    if (!parsedData.success) {
        const errorDetails = parsedData.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return { success: false, error: `Invalid data provided: ${errorDetails}` };
    }

    const { name, email, phone, cottageId, checkIn, checkOut, customPrice, bookingNotes } = parsedData.data;

    try {
        const bookingsRef = adminDb.collection('bookings');

        // Check for overlapping bookings.
        const overlappingBookingsSnapshot = await bookingsRef
            .where('cottageId', '==', cottageId)
            .where('status', '!=', 'cancelled')
            .where('checkIn', '<', checkOut)
            .get();

        const isOverlapping = overlappingBookingsSnapshot.docs
            .filter(doc => doc.id !== bookingId) // Exclude the current booking from the check
            .some(doc => {
                const booking = doc.data();
                const bookingCheckOut = (booking.checkOut as Timestamp).toDate();
                return bookingCheckOut > checkIn;
            });

        if (isOverlapping) {
            return { success: false, error: 'The selected dates for this cottage conflict with another booking.' };
        }

        // Calculate final price
        let finalPrice = 0;
        if (customPrice && customPrice > 0) {
            finalPrice = customPrice;
        } else {
            const cottageDoc = await adminDb.collection('cottages').doc(cottageId).get();
            const pricePerNight = cottageDoc.data()?.pricePerNight || 0;
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
            finalPrice = pricePerNight * nights;
        }
        
        await bookingsRef.doc(bookingId).update({
            name,
            email,
            phone,
            cottageId,
            checkIn: Timestamp.fromDate(checkIn),
            checkOut: Timestamp.fromDate(checkOut),
            finalPrice,
            bookingNotes: bookingNotes || '',
        });
        
        revalidatePath('/admin/bookings');
        revalidatePath(`/admin/bookings/edit/${bookingId}`);

        return { success: true };

    } catch (error: any) {
        console.error('Error updating booking:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}
