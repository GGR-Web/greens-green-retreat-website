
'use client';

import { useReducer, useRef, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { addComment } from './actions';
import type { Comment } from './actions';


interface CommentSectionProps {
    postId: string;
    initialComments: Comment[];
}

type State = Comment[];
type Action = { type: 'ADD_COMMENT'; comment: Comment };

function commentsReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'ADD_COMMENT':
            // Avoid adding duplicates if the server responds before the transition is done
            if (state.some(c => c.id === action.comment.id)) {
                return state;
            }
            return [...state, action.comment];
        default:
            return state;
    }
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Submitting...' : 'Submit Comment'}
        </Button>
    );
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
    const [optimisticComments, addOptimisticComment] = useReducer(commentsReducer, initialComments);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    const handleAddComment = async (formData: FormData) => {
        const name = formData.get('name') as string;
        const comment = formData.get('comment') as string;
        
        // Basic client-side validation
        if (!name.trim() || !comment.trim()) {
            toast({ title: 'Validation Error', description: 'Name and comment cannot be empty.', variant: 'destructive' });
            return;
        }

        const tempId = `optimistic-${Date.now()}`;
        const newComment: Comment = {
            id: tempId,
            name,
            comment,
            createdAt: new Date().toISOString()
        };

        startTransition(async () => {
            addOptimisticComment({ type: 'ADD_COMMENT', comment: newComment });
            
            const result = await addComment(postId, formData);
            if (result?.error) {
                toast({ title: 'Submission Failed', description: result.error, variant: 'destructive' });
                // Note: We are not reverting the optimistic update here. 
                // A full implementation might remove the optimistic comment on failure.
            } else {
                toast({ title: 'Comment Submitted!', description: 'Thank you for your feedback.' });
                formRef.current?.reset();
            }
        });
    };

    return (
        <div className="mt-12 pt-8 border-t">
            <h3 className="text-2xl font-headline font-bold text-primary mb-6">{optimisticComments.length} {optimisticComments.length === 1 ? 'Comment' : 'Comments'}</h3>
            <div className="space-y-6 mb-8">
                {optimisticComments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-grow">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-primary">{comment.name}</p>
                                <span className="text-xs text-muted-foreground">
                                    &middot; {formatDistanceToNow(new Date(comment.createdAt))} ago
                                </span>
                            </div>
                            <p className="text-muted-foreground mt-1">{comment.comment}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Separator className="my-8" />
            
            <Card>
                <CardContent className="p-6">
                    <h4 className="text-xl font-headline font-bold text-primary mb-4">Leave a Comment</h4>
                    <form ref={formRef} action={handleAddComment} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" placeholder="Your name" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="comment">Comment</Label>
                            <Textarea id="comment" name="comment" placeholder="Share your thoughts..." required rows={4} />
                        </div>
                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

