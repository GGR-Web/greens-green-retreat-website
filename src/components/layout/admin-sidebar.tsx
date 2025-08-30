
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  Calendar,
  BedDouble,
  LogOut,
  BookText,
  Sparkles,
  Settings,
  Database,
} from 'lucide-react';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { signOut as serverSignOut } from '@/app/admin/login/actions';


const adminNavLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/accommodations', label: 'Accommodations', icon: BedDouble },
  { href: '/admin/journal', label: 'Journal', icon: BookText },
];

const secondaryAdminNavLinks = [
    { href: '/admin/journal/ai-studio', label: 'AI Studio', icon: Sparkles },
    { href: '/admin/knowledge-base', label: 'Knowledge Base', icon: Database },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      await serverSignOut();
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.push('/admin/login');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };


  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/admin/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Image src="https://res.cloudinary.com/degsnfmco/image/upload/v1756123580/GGR_LOGO_PNG_hgwx2g.png" alt="Green's Green Retreat Logo" width={16} height={16} className="h-4 w-4 rounded-full transition-all group-hover:scale-110" />
            <span className="sr-only">Green's Green Retreat</span>
          </Link>
          {adminNavLinks.map((link) => (
            <Tooltip key={link.href}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    (pathname.startsWith(link.href) && link.href !== '/admin/dashboard' || pathname === link.href) && "bg-accent text-accent-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="sr-only">{link.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{link.label}</TooltipContent>
            </Tooltip>
          ))}
           <div className="w-full border-t border-muted-foreground/20 my-2"></div>
            {secondaryAdminNavLinks.map((link) => (
                 <Tooltip key={link.href}>
                    <TooltipTrigger asChild>
                        <Link
                        href={link.href}
                        className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                            pathname.startsWith(link.href) && "bg-accent text-accent-foreground"
                        )}
                        >
                        <link.icon className="h-5 w-5" />
                        <span className="sr-only">{link.label}</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{link.label}</TooltipContent>
                </Tooltip>
            ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
               <Link
                  href="/admin/settings"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname.startsWith('/admin/settings') && "bg-accent text-accent-foreground"
                  )}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sign Out</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign Out</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
