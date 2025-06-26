import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Delete,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { extname } from 'path';
import { PostService } from './post.service';

import { CreatePostDto } from './dto/createpost.dto';
import { GetPostByOptionsDto } from './dto/post-options.dto';
import { AddPostCommentDto } from './dto/post-comment.dto';

import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiSecurity,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { generateFileName, imageFileFilter } from '../utils/upload.utils';

@ApiTags('Post Module')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @UseInterceptors(
    FileInterceptor('postImage', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = process.env.POST_PHOTO_UPLOAD_PATH || './uploads/posts';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const filename = generateFileName(file.originalname);
          cb(null, filename);
        },
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreatePostDto,
  ) {
    const loggedInUser = req.user;

    if (file) {
      body.postImage = file.filename as any;
    }

    return this.postService.createPost(body, loggedInUser.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('edit/:id')
  @UseInterceptors(
    FileInterceptor('postImage', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = process.env.POST_PHOTO_UPLOAD_PATH || './uploads/posts';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit post' })
  @ApiResponse({ status: 200, description: 'Post updated' })
  async editPost(
    @Param('id') id: number,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreatePostDto,
  ) {
    const userId = req.user?.userId;
    return this.postService.updatePost(+id, userId, body, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-options')
  @ApiBearerAuth()
  async getPostByOptions(@Query() query: GetPostByOptionsDto, @Req() req,) {
    return this.postService.getPostByOptions(
      query.privacy,
      query.familyCode,
      query.createdBy,
      query.postId,
      query.caption,
      req.user.userId,
    );
  } 

  @UseGuards(JwtAuthGuard)
  @Post(':postId/like-toggle')
  @ApiBearerAuth()
  async toggleLike(@Param('postId') postId: number, @Req() req) {
    return this.postService.toggleLikePost(postId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
    @Post(':postId/comment')
    async addComment(
      @Param('postId') postId: number,
      @Body() dto: AddPostCommentDto,
      @Req() req,
    ) {
      return this.postService.addComment(postId, req.user.userId, dto.comment);
    }

    @Get(':postId/comments')
    async getComments(
      @Param('postId') postId: number,
      @Query('page') page = 1,
      @Query('limit') limit = 10,
    ) {
      return this.postService.getComments(postId, page, limit);
    }

    @Get(':postId/comments/count')
    async getCommentCount(@Param('postId') postId: number) {
      return this.postService.getCommentCount(postId);
    }
    
    @Get(':postId/like/count')
    async getLikeCount(@Param('postId') postId: number) {
      return this.postService.getLikeCount(postId);
    }

}