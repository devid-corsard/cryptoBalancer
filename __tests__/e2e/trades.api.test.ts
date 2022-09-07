import request from 'supertest';
import { app, getTradeType, HTTP_STATUSES } from '../../src/server';
import { UpdateTradeModel } from '../../src/server/models/UpdateTradeModel';

describe('/api/scalping', () => {
  beforeAll(async () => {
    await request(app).delete('/__test__/data');
  });

  it('SHOULD return 200 and empty array', async () => {
    await request(app).get('/api/scalping/db').expect(HTTP_STATUSES.OK_200, []);
  });

  let createdTrade1 = getTradeType(undefined, -Infinity);
  it('SHOULD create blank trade', async () => {
    const createResponse = await request(app)
      .post('/api/scalping/db')
      .expect(HTTP_STATUSES.CREATED_201);

    createdTrade1.id = createResponse.body.id;

    expect(createdTrade1.id).toEqual(expect.any(Number));

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [createdTrade1]);
  });

  let createdTrade2 = getTradeType(undefined, -Infinity);
  it('SHOULD create one more blank trade', async () => {
    const createResponse = await request(app)
      .post('/api/scalping/db')
      .expect(HTTP_STATUSES.CREATED_201);

    createdTrade2.id = createResponse.body.id;

    expect(createdTrade2.id).toEqual(expect.any(Number));

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [createdTrade1, createdTrade2]);
  });

  it('SHOULD NOT update trade with invalid ID', async () => {
    const newTrade: UpdateTradeModel = {
      trade: ['coin3', '0.01', '20', '30', 0.01, false],
    };

    await request(app)
      .put('/api/scalping/db/' + -111)
      .send(newTrade)
      .expect(HTTP_STATUSES.NOT_FOUND_404);

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [createdTrade1, createdTrade2]);
  });

  it('SHOULD NOT update trade with empty or invalid input', async () => {
    await request(app)
      .put('/api/scalping/db/' + createdTrade1.id)
      .send({})
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put('/api/scalping/db/' + createdTrade1.id)
      .send([])
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put('/api/scalping/db/' + createdTrade1.id)
      .send('')
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put('/api/scalping/db/' + createdTrade1.id)
      .send(undefined)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [createdTrade1, createdTrade2]);
  });

  let updatedTrade1: any = null;
  const newTrade: UpdateTradeModel = {
    trade: ['coinUpdated', '0.02', '23', '35', 0.02, true],
  };
  it('SHOULD update 1st trade with correct input', async () => {
    await request(app)
      .put('/api/scalping/db/' + createdTrade1.id)
      .send(newTrade)
      .expect(HTTP_STATUSES.NO_CONTENT_204);
    // updatedTrade1 = getTradeType(newTrade.trade, createdTrade1.id);
    updatedTrade1 = {
      id: createdTrade1.id,
      name: newTrade.trade[0],
      amount: newTrade.trade[1],
      buyPrice: newTrade.trade[2],
      sellPrice: newTrade.trade[3],
      fee: newTrade.trade[4],
      singleFee: newTrade.trade[5],
    };
    console.dir({ upadettradeafterCreation: updatedTrade1 });

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [updatedTrade1, createdTrade2]);
  });

  it('SHOULD not dublicate trade with invalid id', async () => {
    await request(app)
      .post('/api/scalping/db/' + -100)
      .expect(HTTP_STATUSES.NOT_FOUND_404);

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [updatedTrade1, createdTrade2]);
  });

  let createdTrade3: any = null;
  it('SHOULD dublicate 1st trade with correct input', async () => {
    const createdResponse = await request(app)
      .post('/api/scalping/db/' + updatedTrade1.id)
      .expect(HTTP_STATUSES.CREATED_201);

    console.dir({ updatedTradeBeforeUnpk: updatedTrade1 });
    createdTrade3 = { ...updatedTrade1 };
    console.dir({ createdTrade3afterUpnacking: createdTrade3 });

    createdTrade3.id = createdResponse.body.id;

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [
        updatedTrade1,
        createdTrade3,
        createdTrade2,
      ]);
  });

  it('SHOULD delete 1 and 2 trade', async () => {
    await request(app)
      .delete('/api/scalping/db/' + updatedTrade1.id)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [createdTrade3, createdTrade2]);

    await request(app)
      .delete('/api/scalping/db/' + createdTrade2.id)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [createdTrade3]);
  });
});
