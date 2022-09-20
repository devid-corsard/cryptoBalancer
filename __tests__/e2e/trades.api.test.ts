import request from 'supertest';
import { app, HTTP_STATUSES } from '../../src/server';
import { TradeViewModel } from '../../src/server/models/TradeViewModel';
import { UpdateTradeModel } from '../../src/server/models/UpdateTradeModel';
const ID_INDEX = 6;
describe('/api/scalping', () => {
  beforeAll(async () => {
    await request(app).delete('/__test__/data');
  });

  it('SHOULD return 200 and empty array', async () => {
    await request(app).get('/api/scalping/db').expect(HTTP_STATUSES.OK_200, []);
  });

  let createdTrade1: TradeViewModel = [null,0,0,0,0.01,true,-90];
  it('SHOULD create blank trade', async () => {
    const createResponse = await request(app)
      .post('/api/scalping/db')
      .expect(HTTP_STATUSES.CREATED_201);

    createdTrade1[ID_INDEX] = createResponse.body.id;

    expect(createdTrade1[ID_INDEX]).toEqual(expect.any(Number));

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [createdTrade1]);
  });

  let createdTrade2: TradeViewModel = [null,0,0,0,0.01,true,-100];
  it('SHOULD create one more blank trade', async () => {
    const createResponse = await request(app)
      .post('/api/scalping/db')
      .expect(HTTP_STATUSES.CREATED_201);

    createdTrade2[ID_INDEX] = createResponse.body.id;

    expect(createdTrade2[ID_INDEX]).toEqual(expect.any(Number));

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [createdTrade1, createdTrade2]);
  });

  it('SHOULD NOT update trade with invalid ID', async () => {
    const newTrade: UpdateTradeModel = {
      trade: ['coin3', 0.01, 20, 30, 0.01, false],
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
      .put('/api/scalping/db/' + createdTrade1[ID_INDEX])
      .send({})
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put('/api/scalping/db/' + createdTrade1[ID_INDEX])
      .send([])
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put('/api/scalping/db/' + createdTrade1[ID_INDEX])
      .send('')
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .put('/api/scalping/db/' + createdTrade1[ID_INDEX])
      .send(undefined)
      .expect(HTTP_STATUSES.BAD_REQUEST_400);

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [createdTrade1, createdTrade2]);
  });

  let updatedTrade1: TradeViewModel;
  const newTrade: UpdateTradeModel = {
    trade: ['coinUpdated', 0.02, 23, 35, 0.02, true],
  };
  it('SHOULD update 1st trade with correct input', async () => {
    await request(app)
      .put('/api/scalping/db/' + createdTrade1[ID_INDEX])
      .send(newTrade)
      .expect(HTTP_STATUSES.NO_CONTENT_204);
    updatedTrade1 = [...newTrade.trade, createdTrade1[ID_INDEX]];

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

  let createdTrade3: TradeViewModel;
  it('SHOULD dublicate 1st trade with correct input', async () => {
    const createdResponse = await request(app)
      .post('/api/scalping/db/' + updatedTrade1[ID_INDEX])
      .expect(HTTP_STATUSES.CREATED_201);

    createdTrade3 = [ ...updatedTrade1 ];

    createdTrade3[ID_INDEX] = createdResponse.body.id;

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
      .delete('/api/scalping/db/' + updatedTrade1[ID_INDEX])
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [createdTrade3, createdTrade2]);

    await request(app)
      .delete('/api/scalping/db/' + createdTrade2[ID_INDEX])
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [createdTrade3]);
  });
});
