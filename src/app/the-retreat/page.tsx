import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCottages, Cottage } from './actions';

export default async function TheRetreatPage() {
  const { cottages, error } = await getCottages();

  if (error) {
    return (
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
            <h1 className="text-2xl font-bold text-destructive">Failed to load accommodations</h1>
            <p className="text-muted-foreground">{error}</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">The Retreat</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Discover our collection of serene and private accommodations, each designed to offer a unique connection with nature.
        </p>
      </div>

      {cottages.length === 0 ? (
        <div className="text-center py-16">
            <p className="text-muted-foreground">No accommodations are currently available. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cottages.map((cottage) => (
            <Card key={cottage.id} className="overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <div className="relative w-full h-64">
                 <Image
                    src={cottage.featuredImageUrl}
                    alt={`Image of ${cottage.name}`}
                    fill
                    className="object-cover"
                    data-ai-hint="cottage exterior"
                  />
              </div>
              <CardContent className="p-6 flex flex-col flex-grow">
                <h3 className="font-headline text-2xl font-bold text-primary mb-2">{cottage.name}</h3>
                <p className="text-muted-foreground mb-4 flex-grow">{cottage.excerpt}</p>
                <div className="flex justify-between items-center mt-auto">
                    <p className="font-bold text-lg text-primary">
                        KES {cottage.pricePerNight} <span className="text-sm font-normal text-muted-foreground">/ night</span>
                    </p>
                    <Button asChild>
                        <Link href={`/the-retreat/${cottage.slug}`}>View Details</Link>
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
