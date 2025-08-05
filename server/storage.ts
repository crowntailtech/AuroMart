import {
  users,
  categories,
  products,
  inventory,
  orders,
  orderItems,
  invoices,
  whatsappNotifications,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Inventory,
  type InsertInventory,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Invoice,
  type InsertInvoice,
  type WhatsappNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(categoryId?: string): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Inventory operations
  getInventoryByDistributor(distributorId: string): Promise<Inventory[]>;
  getAvailableProducts(categoryId?: string): Promise<(Product & { inventory: Inventory })[]>;
  updateInventory(inventoryData: InsertInventory): Promise<Inventory>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersByRetailer(retailerId: string): Promise<Order[]>;
  getOrdersByDistributor(distributorId: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  updateOrderStatus(orderId: string, status: string): Promise<Order>;
  
  // Order item operations
  createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]>;
  getOrderItems(orderId: string): Promise<(OrderItem & { product: Product })[]>;
  
  // Invoice operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoiceByOrderId(orderId: string): Promise<Invoice | undefined>;
  
  // WhatsApp notification operations
  createNotification(notification: Omit<WhatsappNotification, 'id' | 'createdAt'>): Promise<WhatsappNotification>;
  getPendingNotifications(): Promise<WhatsappNotification[]>;
  markNotificationSent(id: string): Promise<void>;
  
  // Analytics operations
  getOrderStats(userId: string, role: string): Promise<any>;
  getDistributors(): Promise<User[]>;
  getManufacturers(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Product operations
  async getProducts(categoryId?: string): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.isActive, true));
    if (categoryId) {
      query = query.where(eq(products.categoryId, categoryId));
    }
    return await query;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  // Inventory operations
  async getInventoryByDistributor(distributorId: string): Promise<Inventory[]> {
    return await db
      .select()
      .from(inventory)
      .where(eq(inventory.distributorId, distributorId));
  }

  async getAvailableProducts(categoryId?: string): Promise<(Product & { inventory: Inventory })[]> {
    let query = db
      .select()
      .from(products)
      .innerJoin(inventory, eq(products.id, inventory.productId))
      .where(and(
        eq(products.isActive, true),
        eq(inventory.isAvailable, true),
        sql`${inventory.quantity} > 0`
      ));

    if (categoryId) {
      query = query.where(eq(products.categoryId, categoryId));
    }
    const results = await query;
    return results.map(result => ({
      ...result.products,
      inventory: result.inventory
    }));
  }

  async updateInventory(inventoryData: InsertInventory): Promise<Inventory> {
    const [updatedInventory] = await db
      .insert(inventory)
      .values(inventoryData)
      .onConflictDoUpdate({
        target: [inventory.distributorId, inventory.productId],
        set: {
          ...inventoryData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return updatedInventory;
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrdersByRetailer(retailerId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.retailerId, retailerId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByDistributor(distributorId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.distributorId, distributorId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    return updatedOrder;
  }

  // Order item operations
  async createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]> {
    return await db.insert(orderItems).values(items).returning();
  }

  async getOrderItems(orderId: string): Promise<(OrderItem & { product: Product })[]> {
    const results = await db
      .select()
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));
    
    return results.map(result => ({
      ...result.order_items,
      product: result.products
    }));
  }

  // Invoice operations
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async getInvoiceByOrderId(orderId: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.orderId, orderId));
    return invoice;
  }

  // WhatsApp notification operations
  async createNotification(notification: Omit<WhatsappNotification, 'id' | 'createdAt'>): Promise<WhatsappNotification> {
    const [newNotification] = await db.insert(whatsappNotifications).values(notification).returning();
    return newNotification;
  }

  async getPendingNotifications(): Promise<WhatsappNotification[]> {
    return await db
      .select()
      .from(whatsappNotifications)
      .where(eq(whatsappNotifications.isDelivered, false));
  }

  async markNotificationSent(id: string): Promise<void> {
    await db
      .update(whatsappNotifications)
      .set({ isDelivered: true, sentAt: new Date() })
      .where(eq(whatsappNotifications.id, id));
  }

  // Analytics operations
  async getOrderStats(userId: string, role: string): Promise<any> {
    const whereClause = role === 'retailer' 
      ? eq(orders.retailerId, userId)
      : eq(orders.distributorId, userId);

    const totalOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(whereClause);

    const pendingOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(whereClause, eq(orders.status, 'pending')));

    const monthlySpend = await db
      .select({ total: sql<number>`sum(${orders.totalAmount})` })
      .from(orders)
      .where(and(
        whereClause,
        sql`${orders.createdAt} >= date_trunc('month', current_date)`
      ));

    return {
      totalOrders: totalOrders[0]?.count || 0,
      pendingOrders: pendingOrders[0]?.count || 0,
      monthlySpend: monthlySpend[0]?.total || 0,
    };
  }

  async getDistributors(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(eq(users.role, 'distributor'), eq(users.isActive, true)));
  }

  async getManufacturers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(eq(users.role, 'manufacturer'), eq(users.isActive, true)));
  }
}

export const storage = new DatabaseStorage();
