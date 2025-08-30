import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface Cottage {
  id: string;
  name: string;
  description: string;
  galleryImages: string[];
  amenities: string[];
  pricePerNight: number;
  slug: string;
}

interface CottageNavigation {
  previous: { slug: string; name: string } | null;
  next: { slug: string; name: string } | null;
}

async function getCottageData(slug: string): Promise<{ cottage: Cottage | null, navigation: CottageNavigation }> {
  if (!adminDb) {
    console.error("Firebase Admin SDK not initialized.");
    return { cottage: null, navigation: { previous: null, next: null } };
  }
  try {
    const cottagesRef = adminDb.collection('cottages');
    
    // Fetch all cottages to determine navigation
    const allCottagesSnapshot = await cottagesRef.orderBy('name').get();
    const allCottages = allCottagesSnapshot.docs.map(doc => ({
        slug: doc.data().slug || doc.id,
        name: doc.data().name || 'Unnamed Cottage'
    }));
    
    const currentIndex = allCottages.findIndex(c => c.slug === slug);

    if (currentIndex === -1) {
        console.log(`No cottage found with slug: ${slug}`);
        return { cottage: null, navigation: { previous: null, next: null } };
    }

    // Determine previous and next cottages
    const navigation: CottageNavigation = {
        previous: currentIndex > 0 ? allCottages[currentIndex - 1] : null,
        next: currentIndex < allCottages.length - 1 ? allCottages[currentIndex + 1] : null,
    };

    // Fetch the specific cottage document
    const cottageDoc = allCottagesSnapshot.docs[currentIndex];
    const data = cottageDoc.data();

    const cottage: Cottage = {
      id: cottageDoc.id,
      slug: data.slug || cottageDoc.id,
      name: data.name || 'Unnamed Cottage',
      description: data.description || 'No description available.',
      galleryImages: data.galleryImages || [],
      amenities: data.amenities || [],
      pricePerNight: data.pricePerNight || 0,
    };

    return { cottage, navigation };
  } catch (error) {
    console.error(`Error fetching cottage with slug ${slug}:`, error);
    return { cottage: null, navigation: { previous: null, next: null } };
  }
}

export default async function CottageDetailsPage({ params }: { params: { slug: string } }) {
  const { cottage, navigation } = await getCottageData(params.slug);

  if (!cottage) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">{cottage.name}</h1>
        </div>

        {/* Gallery */}
        {cottage.galleryImages && cottage.galleryImages.length > 0 && (
          <div className="mb-12">
            <Carousel className="w-full">
              <CarouselContent>
                {cottage.galleryImages.map((url, index) => (
                  <CarouselItem key={index}>
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                         <Image
                            src={url}
                            alt={`Gallery image ${index + 1} for ${cottage.name}`}
                            width={1200}
                            height={800}
                            className="w-full h-auto object-cover aspect-[3/2]"
                          />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
            </Carousel>
          </div>
        )}

        {/* Details Section */}
        <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
                <h2 className="font-headline text-3xl font-bold text-primary mb-4">About the Cottage</h2>
                <div className="prose prose-stone dark:prose-invert max-w-none">
                    <p>{cottage.description}</p>
                </div>

                <h3 className="font-headline text-2xl font-bold text-primary mt-8 mb-4">Amenities</h3>
                <ul className="grid grid-cols-2 gap-4 text-muted-foreground">
                    {cottage.amenities.map(amenity => (
                        <li key={amenity} className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-accent" />
                            <span>{amenity}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Booking Card */}
            <div className="md:col-span-1">
                <Card className="sticky top-24 shadow-lg">
                     <CardContent className="p-6">
                        <p className="font-bold text-2xl text-primary mb-2">
                            KES {cottage.pricePerNight}
                            <span className="text-sm font-normal text-muted-foreground"> / night</span>
                        </p>
                        <p className="text-muted-foreground text-sm mb-6">Taxes and fees may apply.</p>
                        <Button asChild className="w-full" size="lg">
                            <Link href="/booking">Book Now</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Cottage Navigation */}
        <div className="mt-16 pt-8 border-t">
          <div className="flex justify-between items-center">
            {navigation.previous ? (
              <Link href={`/the-retreat/${navigation.previous.slug}`} className="group flex items-center gap-3 text-primary transition-all duration-300 hover:text-accent">
                  <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
                  <div className="text-left">
                    <div className="text-sm text-muted-foreground">Previous</div>
                    <div className="font-bold">{navigation.previous.name}</div>
                  </div>
              </Link>
            ) : (
                <div /> // Empty div to maintain spacing
            )}
            {navigation.next ? (
              <Link href={`/the-retreat/${navigation.next.slug}`} className="group flex items-center gap-3 text-primary transition-all duration-300 hover:text-accent">
                   <div className="text-right">
                    <div className="text-sm text-muted-foreground">Next</div>
                    <div className="font-bold">{navigation.next.name}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            ) : (
                <div /> // Empty div to maintain spacing
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
