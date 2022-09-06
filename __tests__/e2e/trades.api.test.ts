import request from "supertest";
import { app, HTTP_STATUSES } from "../../src/server";
import { CreateTradeModel } from "../../src/server/models/CreateTradeModel";
import { UpdateTradeModel } from "../../src/server/models/UpdateTradeModel";

describe('/api/scalping', () => {
  beforeAll(async () => {
    await request(app).delete('/__test__/data');
  });

  it('SHOULD return 200 and empty array', async () => {
    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, []);
  });
  
  it('SHOULD NOT create trade with empty or invalid input', async () => {
    await request(app)
      .post('/api/scalping/db')
      .send({})
      .expect(HTTP_STATUSES.NO_CONTENT_204);
      
    await request(app)
      .post('/api/scalping/db')
      .send([])
      .expect(HTTP_STATUSES.NO_CONTENT_204);
      
    await request(app)
      .post('/api/scalping/db')
      .send('')
      .expect(HTTP_STATUSES.NO_CONTENT_204);
      
    await request(app)
      .post('/api/scalping/db')
      .send(undefined)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, []);
  });
  
  let createdTrade1: any = null;
  it('SHOULD create a trade with correct input', async () => {
    const newTrade: CreateTradeModel = {
      trade: ['coin1', '0.01', '20', '30', 0.01, false]
    };

    const createResponse = await request(app)
      .post('/api/scalping/db')
      .send(newTrade)
      .expect(HTTP_STATUSES.CREATED_201);

    createdTrade1 = createResponse.body;

    expect(createdTrade1).toEqual({
      id: expect.any(Number),
      name: newTrade.trade[0],
      amount: newTrade.trade[1],
      buyPrice: newTrade.trade[2],
      sellPrice: newTrade.trade[3],
      fee: newTrade.trade[4],
      singleFee: newTrade.trade[5],
    });

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [createdTrade1]);
  });

  let createdTrade2: any = null;
  it('SHOULD create one more trade with correct input', async () => {
    const newTrade: CreateTradeModel = {
      trade: ['coin2', '0.01', '20', '30', 0.01, false]
    };

    const createResponse = await request(app)
      .post('/api/scalping/db')
      .send(newTrade)
      .expect(HTTP_STATUSES.CREATED_201);

    createdTrade2 = createResponse.body;

    expect(createdTrade2).toEqual({
      id: expect.any(Number),
      name: newTrade.trade[0],
      amount: newTrade.trade[1],
      buyPrice: newTrade.trade[2],
      sellPrice: newTrade.trade[3],
      fee: newTrade.trade[4],
      singleFee: newTrade.trade[5],
    });

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [createdTrade1, createdTrade2]);
  });

  it('SHOULD NOT update trade with invalid ID', async () => {
    const newTrade: UpdateTradeModel = {
      trade: ['coin3', '0.01', '20', '30', 0.01, false]
    };

    await request(app)
      .put('/api/scalping/db' + -111)
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

  it('SHOULD update trade with correct input', async () => {
    const newTrade: UpdateTradeModel = {
      trade: ['coinUpdated', '0.02', '23', '35', 0.02, true]
    };

    await request(app)
      .put('/api/scalping/db/' + createdTrade1.id)
      .send(newTrade)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [
        {
          id: createdTrade1.id,
          name: newTrade.trade[0],
          amount: newTrade.trade[1],
          buyPrice: newTrade.trade[2],
          sellPrice: newTrade.trade[3],
          fee: newTrade.trade[4],
          singleFee: newTrade.trade[5],
        },
        createdTrade2,
      ]);
  });

  it('SHOULD delete 1 and 2 trade', async () => {
    await request(app)
      .delete('/api/scalping/db/' + createdTrade1.id)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, [createdTrade2]);
  
    
    await request(app)
      .delete('/api/scalping/db/' + createdTrade2.id)
      .expect(HTTP_STATUSES.NO_CONTENT_204);

    await request(app)
      .get('/api/scalping/db')
      .expect(HTTP_STATUSES.OK_200, []);
  });
});

