
'use client';

import { useState, useEffect } from 'react';
import { Twitter, Facebook, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonsProps {
  post: {
    title: string;
    slug: string;
  };
}

export default function ShareButtons({ post }: ShareButtonsProps) {
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    // Ensure this runs only on the client
    setPageUrl(window.location.href);
  }, []);

  if (!pageUrl) {
    // Return null or a placeholder during server-side rendering
    return null;
  }

  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(post.title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  return (
    <div className="mt-12 pt-8 border-t">
        <h3 className="text-lg font-semibold text-center mb-4">Share this article</h3>
        <div className="flex justify-center items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
                    <Twitter className="h-5 w-5" />
                </a>
            </Button>
             <Button asChild variant="outline" size="icon">
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                    <Facebook className="h-5 w-5" />
                </a>
            </Button>
             <Button asChild variant="outline" size="icon">
                <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
                    <MessageCircle className="h-5 w-5" />
                </a>
            </Button>
        </div>
    </div>
  );
}
