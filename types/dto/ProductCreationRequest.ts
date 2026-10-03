import { compare } from "bcryptjs";
import z from "zod";

const ProductStatusEnum = z.enum(["active", "inactive","deleted"]);
const mediaTypeEnum = z.enum(["image", "video"]);

const ProductCreationRequestSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(50, "SKU must be at most 50 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  altName: z.array(z.string().max(100)).optional().default([]),
  description: z.string().optional(),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
  status: ProductStatusEnum.optional().default("active"),
  price: z.number().min(0, "Price must be a non-negative number").optional(),
  compareAt: z.number().min(0, "Compare at price must be a non-negative number").optional(),
  brand : z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  media: z.array(
    z.object({
      url: z.string().url("Media URL must be a valid URL"),
      type: mediaTypeEnum,
    })
  ).optional()

});
