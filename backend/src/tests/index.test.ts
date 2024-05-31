import { beforeAll, describe, expect, it } from "vitest";
import { app } from "..";
import request from 'supertest';


describe("Testing Web App", () => {
    let authToken:string;
    let item_id:number;

    it("POST /users/register  --should return authToken for user register", async () => {
        const { status, body } = await request(app).post('/users/register').send({
            username: 'arun',
            email: 'a@gmail.com',
            password: 'arun',
            role: 'user'
        });

        expect(status).toBe(200);
        expect(body).toHaveProperty('authToken');
        authToken = body.authToken;
    });

    it('POST /users/login  --should return authToken for user login', async () => {
        const { status, body } = await request(app).post('/users/login').send({
            email: 'a@gmail.com',
            password: 'arun',
        });

        expect(status).toBe(200);
        expect(body).toHaveProperty('authToken');
        authToken = body.authToken;
    });

    it('GET /users/profile  --should return logged in user profile', async () => {
        const { status, body } = await request(app)
            .get('/users/profile')
            .set('Authorization', `Bearer ${authToken}`);

        expect(status).toBe(200);
        
        const { createdAt, ...rest } = body;

        const expectedProfile = {
            id: body.id,
            username: 'arun',
            email: 'a@gmail.com',
            role: 'user'
        };

        expect(rest).toMatchObject(expectedProfile);

        const profileCreatedAt = new Date(createdAt);
        expect(profileCreatedAt.toString()).not.toBe('Invalid Date');

        const now = new Date();
        expect(profileCreatedAt.getTime()).toBeLessThanOrEqual(now.getTime());
    });

    it("POST /items  --auction should be created successfully", async() =>{
        const { status, body } = await request(app)
            .post('/items')
            .send({
                name: 'car',
                description: 'It is BMW',
                starting_price: parseFloat('12.0'),
                current_price: parseFloat('13.0'),
                image_url: null,
                end_time: new Date(),
            })
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(status).toBe(200);
        expect(body.message).toBe('Auction Created successfully');
    });

    it('GET /items  --should get all items', async() =>{
        const {status, body} = await request(app).get('/items');
        
        expect(status).toBe(200);
        expect(body).toHaveProperty('items');
        expect(body).toHaveProperty('pagination');
        item_id = body.items[0].id;
    });

    it('GET /items/:id  --should get a single item by their id', async() =>{
        const {status, body} = await request(app).get(`/items/${item_id}`);

        expect(status).toBe(200);
        expect(body).toHaveProperty('name');
    });

    it('PUT /items/:id  --item should be update by their id', async() =>{
        const {status, body} = await request(app)
            .put(`/items/${item_id}`)
            .send({
                name: 'Bicycle',
                description: 'It is Bicycle',
            })
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(status).toBe(200);
        expect(body.name).toBe('Bicycle')
        expect(body.description).toBe('It is Bicycle');
    });

    it('POST /items/:itemID/bids  --create a new bids', async() =>{
        const {status, body} = await request(app)
            .post(`/items/${item_id}/bids`)
            .send({
                bid_amount: 15
            })
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(status).toBe(200);
    });

    it('GET /items/:itemID/bids  --should get bid by item_id', async() =>{
        const {status, body} = await request(app).get(`/items/${item_id}/bids`);

        expect(status).toBe(200);
        const property = ['id', 'user_id', 'bid_amount', 'created_at'];
        for(let i=0; i<4; i++){
            expect(body.bids[0]).toHaveProperty(property[i]);
        }
    });


    it('DELETE /items/:id  --item should be deleted by their id', async() =>{
        const {status, body} = await request(app)
            .delete(`/items/${item_id}`)
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(status).toBe(200);
        expect(body.message).toBe('Item deleted successfully')
    });

    it('POST /notifications/mark-read  --Mark notifications as read', async() =>{
        const {status, body} = await request(app)
            .post('/notifications/mark-read')
            .send({
                notificationIds: [1,2,3]
            })
            .set('Authorization', `Bearer ${authToken}`);
        expect(status).toBe(204);
    });

    it('GET /notifications  --Retrieve notifications for the logged-in user', async() =>{
        const {status, body} = await request(app)
            .get('/notifications')
            .set('Authorization', `Bearer ${authToken}`);

        expect(status).toBe(200);
    });
});
