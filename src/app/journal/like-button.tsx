
'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { incrementLikeCount } from './actions';
import { useToast } from '@/hooks/use-toast';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
}

export default function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [optimisticLikes, setOptimisticLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleLike = () => {
    if (isLiked || isPending) return;
    
    setIsLiked(true);
    setOptimisticLikes(prev => prev + 1);

    startTransition(async () => {
      const result = await incrementLikeCount(postId);
      if (result.error) {
        // Revert optimistic update on error
        setOptimisticLikes(prev => prev - 1);
        setIsLiked(false);
        toast({
            title: "Error",
            description: "Could not register your like. Please try again.",
            variant: "destructive"
        });
      }
    });
  };

  return (
    <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleLike} 
        disabled={isLiked || isPending}
        className="flex items-center gap-2"
    >
      <Heart className={cn("h-5 w-5", isLiked ? 'text-destructive fill-destructive' : 'text-muted-foreground')} />
      <span className="font-semibold">{optimisticLikes}</span>
    </Button>
  );
}
