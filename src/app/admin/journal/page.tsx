
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from "lucide-react";
import { getPosts, Post } from "./actions";
import PostActions from './post-actions';

export default async function AdminJournalPage() {
  const { posts, error } = await getPosts();

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="px-7 flex flex-row items-center justify-between">
        <div>
            <CardTitle>Journal</CardTitle>
            <CardDescription>Manage your journal posts and stories.</CardDescription>
        </div>
        <div>
            <Button asChild>
                <Link href="/admin/journal/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Post
                </Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
         {(!posts || posts.length === 0) ? (
             <div className="text-center py-12">
                <h3 className="text-lg font-medium">No posts found.</h3>
                <p className="text-muted-foreground mt-2">Click "New Post" to get started.</p>
            </div>
         ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Author</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="font-medium">{post.title}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{post.author}</TableCell>
                    <TableCell className="hidden md:table-cell">{post.createdAt}</TableCell>
                    <TableCell>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                            {post.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <PostActions postId={post.id} postStatus={post.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
         )}
      </CardContent>
    </Card>
  )
}
