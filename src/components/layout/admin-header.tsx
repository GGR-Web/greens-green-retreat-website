
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Calendar,
  BedDouble,
  PanelLeft,
  BookText,
  Sparkles,
  Settings,
  Database,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';


const adminNavLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/accommodations', label: 'Accommodations', icon: BedDouble },
  { href: '/admin/journal', label: 'Journal', icon: BookText },
  { href: '/admin/journal/ai-studio', label: 'AI Studio', icon: Sparkles },
  { href: '/admin/knowledge-base', label: 'Knowledge Base', icon: Database },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function getBreadcrumb(pathname: string) {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumb = segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        let label = segment.charAt(0).toUpperCase() + segment.slice(1);
        if (label === 'Ai-studio') label = 'AI Studio';
        if (label === 'Knowledge-base') label = 'Knowledge Base';
        const isLast = index === segments.length - 1;
        return { href, label, isLast };
    });
    return breadcrumb;
}

export default function AdminHeader() {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <SheetHeader>
            <SheetTitle className="sr-only">Admin Menu</SheetTitle>
            <SheetDescription className="sr-only">Navigation links for the admin dashboard.</SheetDescription>
          </SheetHeader>
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/admin/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Image src="https://res.cloudinary.com/degsnfmco/image/upload/v1756123580/GGR_LOGO_PNG_hgwx2g.png" alt="Green's Green Retreat Logo" width={20} height={20} className="h-5 w-5 rounded-full transition-all group-hover:scale-110" />
              <span className="sr-only">Green's Green Retreat</span>
            </Link>
            {adminNavLinks.map((link) => (
               <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                    pathname.startsWith(link.href) && "text-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
            {breadcrumb.map((item, index) => (
                <React.Fragment key={item.href}>
                    <BreadcrumbItem>
                        {item.isLast ? (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink asChild>
                                <Link href={item.href}>{item.label}</Link>
                            </BreadcrumbLink>
                        )}
                    </BreadcrumbItem>
                    {!item.isLast && <BreadcrumbSeparator />}
                </React.Fragment>
            ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
