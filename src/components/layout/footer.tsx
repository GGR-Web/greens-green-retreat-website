
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary/50 text-secondary-foreground">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold text-primary">
              <Image src="https://res.cloudinary.com/degsnfmco/image/upload/v1756123580/GGR_LOGO_PNG_hgwx2g.png" alt="Green's Green Retreat Logo" width={24} height={24} className="h-6 w-6 rounded-full" />
              <span>Green's Green Retreat</span>
            </Link>
            <p className="text-sm">Find your peace and tranquility with us.</p>
            <div className="flex gap-4">
              <Link href="#" aria-label="Twitter"><Twitter className="h-5 w-5 hover:text-primary transition-colors" /></Link>
              <Link href="#" aria-label="Facebook"><Facebook className="h-5 w-5 hover:text-primary transition-colors" /></Link>
              <Link href="https://www.instagram.com/greens_green_retreat/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram className="h-5 w-5 hover:text-primary transition-colors" /></Link>
            </div>
          </div>
          <div className="grid gap-2">
            <h3 className="font-headline font-semibold">Quick Links</h3>
            <Link href="/" className="text-sm hover:text-primary transition-colors">Home</Link>
            <Link href="/the-retreat" className="text-sm hover:text-primary transition-colors">The Retreat</Link>
            <Link href="/our-story" className="text-sm hover:text-primary transition-colors">Our Story</Link>
            <Link href="/journal" className="text-sm hover:text-primary transition-colors">Journal</Link>
            <Link href="/booking" className="text-sm hover:text-primary transition-colors">Booking</Link>
            <Link href="/wellness-tips" className="text-sm hover:text-primary transition-colors">Wellness</Link>
            <Link href="/legal/disclaimer" className="text-sm hover:text-primary transition-colors">Disclaimer</Link>
            <Link href="/admin" className="text-sm hover:text-primary transition-colors">Admin Login</Link>
          </div>
          <div className="grid gap-2">
            <h3 className="font-headline font-semibold">Contact</h3>
            <Link href="https://maps.app.goo.gl/s5BuoCmyv6XtVmxR6" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">Address: VM3M+FQ, Riara Ridge</Link>
            <p className="text-sm">greensgreenretreat@gmail.com</p>
            <p className="text-sm">+254 714 281791</p>
          </div>
          <div>
            <h3 className="font-headline font-semibold">Newsletter</h3>
            <p className="text-sm mb-2">Stay updated with our latest offers and news.</p>
            <form className="flex gap-2">
              <Input type="email" placeholder="Enter your email" className="flex-1 bg-background" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Green's Green Retreat. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
