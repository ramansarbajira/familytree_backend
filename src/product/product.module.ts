import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from './model/product.model';
import { Category } from './model/category.model';
import { Order } from './model/order.model'; // <-- Import Order model

import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

import { OrderService } from './order.service'; // <-- Import OrderService
import { OrderController } from './order.controller'; // <-- Import OrderController

@Module({
  imports: [SequelizeModule.forFeature([Product, Category, Order])], // <-- Register Order
  providers: [
    ProductService,
    CategoryService,
    OrderService, // <-- Add OrderService
  ],
  controllers: [
    ProductController,
    CategoryController,
    OrderController, // <-- Add OrderController
  ],
})
export class ProductModule {}
