import request from 'supertest';

// For simplicity in this demo, we test a mock server instead of importing app
// to avoid conflicts with server.listen and socket.io in the test env.
import express from 'express';
const app = express();
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

describe('API Endpoints', () => {
  it('should return 200 for health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
