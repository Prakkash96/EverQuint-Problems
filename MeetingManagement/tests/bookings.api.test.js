const request = require('supertest');
const { app } = require('../src/app');
const { memoryStore } = require('../repositories/memoryStore');

describe('POST /bookings', () => {
  beforeEach(() => {
    memoryStore.reset();
  });

  it('creates a booking and prevents overlap', async () => {
    await request(app).post('/rooms').send({
      name: 'Room A',
      capacity: 10,
      floor: 1,
      amenities: [],
    });

    const body = {
      roomId: 1,
      title: 'Standup',
      organizerEmail: 'user@example.com',
      startTime: '2024-05-06T10:00:00.000Z',
      endTime: '2024-05-06T11:00:00.000Z',
    };

    const res1 = await request(app).post('/bookings').send(body);
    expect(res1.status).toBe(201);

    const res2 = await request(app).post('/bookings').send(body);
    expect(res2.status).toBe(409);
  });

  it('is idempotent for same key', async () => {
    await request(app).post('/rooms').send({
      name: 'Room B',
      capacity: 5,
      floor: 1,
      amenities: [],
    });

    const body = {
      roomId: 1,
      title: 'Planning',
      organizerEmail: 'user@example.com',
      startTime: '2024-05-07T10:00:00.000Z',
      endTime: '2024-05-07T11:00:00.000Z',
    };

    const key = 'idem-key-1';
    const res1 = await request(app)
      .post('/bookings')
      .set('Idempotency-Key', key)
      .send(body);
    const res2 = await request(app)
      .post('/bookings')
      .set('Idempotency-Key', key)
      .send(body);

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(res1.body.id).toBe(res2.body.id);
  });
});

