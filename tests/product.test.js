const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Product = require('../src/models/product.model');
const { connectDB, disconnectDB } = require('../src/config/db');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  // Use test database
  process.env.MONGODB_URI =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/product_db_test';
  await connectDB();
  await Product.deleteMany({});
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await Product.deleteMany({});
    await disconnectDB();
  }
});

describe('Healthcheck Endpoint', () => {
  it('GET /health - should return status UP and connected MongoDB', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.services.api.status).toBe('UP');
    expect(res.body.services.mongodb.connected).toBe(true);
  });
});

describe('Product CRUD API Tests', () => {
  const sampleProduct = {
    pid: 'PROD001',
    pname: 'Mechanical Keyboard RGB',
    price: 89.99,
    quantity: 15,
  };

  it('POST /api/products - should create a new product', async () => {
    const res = await request(app)
      .post('/api/products')
      .send(sampleProduct);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pid).toBe(sampleProduct.pid);
    expect(res.body.data.pname).toBe(sampleProduct.pname);
    expect(res.body.data.price).toBe(sampleProduct.price);
    expect(res.body.data.quantity).toBe(sampleProduct.quantity);
  });

  it('POST /api/products - should fail on duplicate pid', async () => {
    const res = await request(app)
      .post('/api/products')
      .send(sampleProduct);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/products - should fail validation on missing fields', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ pid: 'PROD002' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/products - should fail validation on negative price', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        pid: 'PROD003',
        pname: 'Gaming Mouse',
        price: -10,
        quantity: 5,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/products - should return all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/products/:pid - should return product by pid', async () => {
    const res = await request(app).get(`/api/products/${sampleProduct.pid}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pid).toBe(sampleProduct.pid);
    expect(res.body.data.pname).toBe(sampleProduct.pname);
  });

  it('GET /api/products/:pid - should return 404 for non-existent product', async () => {
    const res = await request(app).get('/api/products/NONEXISTENT');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/products/:pid - should update product details', async () => {
    const updatedData = {
      pname: 'Mechanical Keyboard RGB Pro',
      price: 99.99,
      quantity: 20,
    };

    const res = await request(app)
      .put(`/api/products/${sampleProduct.pid}`)
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pname).toBe(updatedData.pname);
    expect(res.body.data.price).toBe(updatedData.price);
    expect(res.body.data.quantity).toBe(updatedData.quantity);
  });

  it('DELETE /api/products/:pid - should delete product by pid', async () => {
    const res = await request(app).delete(`/api/products/${sampleProduct.pid}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pid).toBe(sampleProduct.pid);

    // Verify it is gone
    const verifyRes = await request(app).get(`/api/products/${sampleProduct.pid}`);
    expect(verifyRes.statusCode).toBe(404);
  });
});
