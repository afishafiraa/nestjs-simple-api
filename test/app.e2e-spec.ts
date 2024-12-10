import { Test } from '@nestjs/testing'
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { EditUserDto } from '../src/user/dto/edit-user.dto';
import { CreateBookmarkDto } from '../src/bookmark/dto/create-bookmark.dto';
import { EditBookmarkDto } from '../src/bookmark/dto/edit-bookmark.dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = 
      await Test.createTestingModule({
        imports: [ AppModule ],
      }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
    }));
    await app.init();
    await app.listen(3334);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3334')
  });
  
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'halo123@example.com',
      password: '123',
    };

    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw if nobody provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);
      });
      it('should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw if nobody provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400);
      });
      it('should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get Me', () => {
      it('should get current user', () => {
        return pactum
         .spec()
         .get('/users/me')
         .withHeaders({
           Authorization: 'Bearer $S{userAt}',
         })
         .expectStatus(200);
      })
    });
    describe('Edit User', () => {
      const dto: EditUserDto = {
        firstName: 'Example John',
        email: 'test123@example.com',
      };
      it('should edit user', () => {
        return pactum
         .spec()
         .patch('/users')
         .withHeaders({
           Authorization: 'Bearer $S{userAt}',
         })
         .withBody(dto)
         .expectStatus(200)
         .expectBodyContains(dto.firstName)
         .expectBodyContains(dto.email);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should return empty bookmarks', () => {
        return pactum
         .spec()
         .get('/bookmarks')
         .withHeaders({
           Authorization: 'Bearer $S{userAt}',
         })
         .expectStatus(200)
         .expectBody([]);
      })
    });
    describe('Create Bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'Example Book',
        description: 'This is an example book',
        link: 'https://example.com',
      };

      it('should create a bookmark', () => {
        return pactum
           .spec()
           .post('/bookmarks')
           .withHeaders({
             Authorization: 'Bearer $S{userAt}',
           })
           .withBody(dto)
           .expectStatus(201)
           .stores('bookmarkId', 'id');
      });
    });
    describe('Get All Bookmarks by Users', () => {
      it('should get all bookmarks by user', () => {
        return pactum
         .spec()
         .get(`/bookmarks`)
         .withHeaders({
             Authorization: 'Bearer $S{userAt}',
           })
         .expectStatus(200);
      });
    });
    describe('Get Bookmark by Id', () => {
      it('should get bookmark by bookmarkId', () => {
        return pactum
         .spec()
         .get(`/bookmarks/{id}`)
         .withPathParams('id', '$S{bookmarkId}')
         .withHeaders({
             Authorization: 'Bearer $S{userAt}',
         })
         .expectStatus(200)
         .expectBodyContains('$S{bookmarkId}');
      });
    });
    describe('Edit Bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: 'Update example bookmarks',
        description: 'This is updated example book',
      };

      it('should edit bookmark by bookmarkId', () => {
        return pactum
         .spec()
         .patch(`/bookmarks/{id}`)
         .withPathParams('id', '$S{bookmarkId}')
         .withHeaders({
             Authorization: 'Bearer $S{userAt}',
           })
         .withBody(dto)
         .expectStatus(200)
         .expectBodyContains(dto.title)
         .expectBodyContains(dto.description);
      });
    });
    describe('Delete Bookmark by id', () => {
      it('should delete bookmark by bookmarkId', () => {
        return pactum
         .spec()
         .delete(`/bookmarks/{id}`)
         .withPathParams('id', '$S{bookmarkId}')
         .withHeaders({
             Authorization: 'Bearer $S{userAt}',
           })
         .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
         .spec()
         .get(`/bookmarks/`)
         .withHeaders({
             Authorization: 'Bearer $S{userAt}',
           })
         .expectStatus(200)
         .expectJsonLength(0);
      });

    });
  });
});