
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/the-retreat', label: 'The Retreat' },
  { href: '/our-story', label: 'Our Story' },
  { href: '/journal', label: 'Journal' },
  { href: '/booking', label: 'Booking' },
  { href: '/wellness-tips', label: 'Wellness' },
];

export default function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setSheetOpen] = useState(false);

  const closeSheet = () => setSheetOpen(false);

  return (
    <header className="bg-background/80 sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold text-primary">
          <Image src="https://res.cloudinary.com/degsnfmco/image/upload/v1756123580/GGR_LOGO_PNG_hgwx2g.png" alt="Green's Green Retreat Logo" width={32} height={32} className="h-8 w-8 rounded-full" />
          <span>Green's Green Retreat</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-primary",
                pathname === link.href ? "text-primary font-bold" : "text-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
        </div>
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader className="sr-only">
                  <SheetTitle>Mobile Menu</SheetTitle>
                  <SheetDescription>
                    Main navigation links for Green's Green Retreat.
                  </SheetDescription>
                </SheetHeader>
              <div className="grid gap-4 py-6">
                <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold text-primary" onClick={closeSheet}>
                   <Image src="https://res.cloudinary.com/degsnfmco/image/upload/v1756123580/GGR_LOGO_PNG_hgwx2g.png" alt="Green's Green Retreat Logo" width={32} height={32} className="h-8 w-8 rounded-full" />
                  <span>Green's Green Retreat</span>
                </Link>
                <div className="grid gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "block px-4 py-2 rounded-md transition-colors hover:bg-secondary",
                        pathname === link.href ? "bg-secondary text-primary" : "text-foreground/80"
                      )}
                      onClick={closeSheet}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
