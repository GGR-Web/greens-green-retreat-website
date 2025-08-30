
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { getCottages } from './the-retreat/actions';

export default async function Home() {
  const { cottages } = await getCottages();
  const featuredCottages = cottages.slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[90vh] flex items-center justify-center text-center text-white overflow-hidden">
        <video
            src="https://res.cloudinary.com/degsnfmco/video/upload/v1756052176/GGR_2K_vhmyxv.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover z-[-1] brightness-75"
        />
        <div className="container mx-auto px-4 md:px-6 z-10">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
            Breathe. Unwind. Reconnect.
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
            A peaceful escape from city life, offering a profound connection to nature.
          </p>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/booking">Book Your Escape <ArrowRight className="ml-2" /></Link>
          </Button>
        </div>
      </section>
      
      {/* Intro Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
             <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">Welcome to Green's Green Retreat</h2>
             <p className="mt-4 text-lg text-muted-foreground">
                Situated on Coomete Farm, a property with a rich agricultural history spanning over 76 years, Green's Green Retreat is a nature lover's paradise designed for families, corporate groups, and individuals looking for relaxation and connection. Our family-run nature fosters a personal and heartfelt approach to hospitality, earning us the reputation of a unique countryside experience and one of Tigoni's hidden gems.
             </p>
          </div>
        </div>
      </section>

      {/* Featured Suites Section */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">Featured Accommodations</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Each of our suites is a private sanctuary, designed for ultimate comfort and connection with nature.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCottages.map((cottage) => (
                <Card key={cottage.id} className="overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                    <Link href={`/the-retreat/${cottage.slug}`} className="block">
                        <CardContent className="p-0">
                            <div className="relative w-full h-64">
                                <Image 
                                    src={cottage.featuredImageUrl} 
                                    alt={`Image of ${cottage.name}`} 
                                    fill
                                    className="object-cover" 
                                    data-ai-hint="cottage exterior" />
                            </div>
                            <div className="p-6">
                            <h3 className="font-headline text-xl font-bold text-primary">{cottage.name}</h3>
                            <p className="mt-2 text-muted-foreground line-clamp-2">{cottage.excerpt}</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>
            ))}
          </div>
          {cottages.length > 3 && (
            <div className="text-center mt-12">
                <Button asChild>
                    <Link href="/the-retreat">View All Accommodations</Link>
                </Button>
            </div>
          )}
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-headline text-3xl font-bold text-primary mb-4">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                The retreat is located on Coomete Farm in Tigoni, an area characterized by its 'lush farmland' and 'endless tea fields'. Coomete Farm has been producing high-quality groceries, meats, and dairy for over 70 years, relying on organic, home-grown produce while supporting the local community.
              </p>
              <Button asChild variant="outline">
                <Link href="/our-story">Learn More About Us</Link>
              </Button>
            </div>
            <div className="w-full max-w-[800px] aspect-[4/3] relative">
              <Image
                src="https://res.cloudinary.com/degsnfmco/image/upload/v1756217286/GGR-Cottage-with-logo_ifc8hu.png"
                alt="A beautiful cottage at Green's Green Retreat"
                fill
                className="rounded-lg shadow-xl object-cover"
                data-ai-hint="retreat cottage"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
