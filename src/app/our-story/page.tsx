import Image from 'next/image';

export default function OurStory() {
  return (
    <div className="bg-background">
      {/* Page Header */}
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Our Heritage on Coomete Farm</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            The retreat is located on Coomete Farm in Tigoni, an area characterized by its 'lush farmland' and 'endless tea fields'. Coomete Farm has been producing high-quality groceries, meats, and dairy for over 70 years, relying on organic, home-grown produce while supporting the local community.
          </p>
        </div>
        <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
            <Image
                src="https://res.cloudinary.com/degsnfmco/image/upload/v1756149686/GGR-Collage-1_mmrmyp.png"
                alt="A collage of images from Green's Green Retreat"
                fill
                className="object-cover"
                data-ai-hint="retreat collage"
            />
        </div>
      </div>

      {/* Passion for Nature Section */}
      <div className="bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                    <h2 className="font-headline text-3xl font-bold text-primary mb-4">A Passion for Nature</h2>
                    <div className="prose prose-stone dark:prose-invert max-w-none text-muted-foreground">
                        <p>
                            Our family's passion for the outdoors influenced the unique design of each of the four cottages, ensuring they harmonize with the surrounding environment. This setting offers an environment of 'tranquility, privacy, and a deep connection to nature,' encouraging guests to unwind. The experience is enhanced by sensory details such as waking up to the sound of birdsong and enjoying expansive, uninterrupted views from a spacious deck.
                        </p>
                    </div>
                </div>
                <div className="order-1 md:order-2">
                <Image
                    src="https://res.cloudinary.com/degsnfmco/image/upload/v1756150747/ggr-gold-blend_iigw7k.png"
                    alt="A cup of GGR Gold Blend tea"
                    width={800}
                    height={600}
                    className="rounded-lg shadow-xl object-cover"
                    data-ai-hint="gold blend"
                />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
