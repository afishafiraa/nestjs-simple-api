import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) {}
    getBookmarks(userId: number) {
        return this.prisma.bookmark.findMany({
            where: {
                userId: userId,
            }
        });
    }

    getBookmarkById(userId: number, bookmarkId: number) {
        return this.prisma.bookmark.findFirst({
            where: {
                userId: userId,
                id: bookmarkId,
            }
        });
    }
    
    createBookmark(userId: number, dto: CreateBookmarkDto) {
        return this.prisma.bookmark.create({
            data: {
                userId: userId,
               ...dto,
            }
        });
    }
    
    async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
        //find bookmark by Id
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId,
            }
        });

        //check access belongs to user
        if (!bookmark || bookmark.userId !== userId) {
            throw new ForbiddenException('Access to resource denied');
        }

        //update bookmark with new data
        return this.prisma.bookmark.update({
            where: {
                id: bookmarkId,
            },
            data: {
                ...dto
            }
        });
    }

    async deleteBookmarkById(userId: number, bookmarkId: number) {
        //get data bookmarks
        const bookmark = await this.prisma.bookmark.findFirst({
            where: {
                id: bookmarkId,
            }
        });

        //access bookmarks
        if (!bookmark || bookmark.userId !== userId) 
            throw new ForbiddenException('Access to resource denied');
        

        //delete bookmark
        return this.prisma.bookmark.delete({
            where: {
                id: bookmarkId,
            }
        });
    }
}
