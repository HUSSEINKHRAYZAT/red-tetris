/**
 * URL Routes Tests
 * 
 * Tests for URL-based game join functionality
 * Subject requirement V.2.1: http://<server>:<port>/<room>/<player>
 */

const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');

describe('URL-based Game Join Routes', () => {
  let app;

  beforeEach(() => {
    // Create a minimal Express app with the URL route
    app = express();
    app.use(express.static('public'));
    
    // URL-based game join route: /:room/:player
    app.get('/:room/:player', (req, res) => {
      const indexPath = path.join(__dirname, '../../../public/index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          // If index.html doesn't exist (dev mode), send a simple message
          res.status(200).send(`
            <!DOCTYPE html>
            <html>
              <head><title>Red Tetris</title></head>
              <body>
                <p>Game join URL detected: Room "${req.params.room}", Player "${req.params.player}"</p>
                <p>In development, please use the Vite dev server at http://localhost:5173/${req.params.room}/${req.params.player}</p>
              </body>
            </html>
          `);
        }
      });
    });
  });

  describe('GET /:room/:player', () => {
    it('should respond with 200 status', async () => {
      const response = await request(app).get('/testRoom/testPlayer');
      expect(response.status).toBe(200);
    });

    it('should respond with HTML content type', async () => {
      const response = await request(app).get('/room123/alice');
      expect(response.type).toBe('text/html');
    });

    it('should handle special characters in room name', async () => {
      const response = await request(app).get('/room-with-dashes/player1');
      expect(response.status).toBe(200);
      expect(response.text).toContain('room-with-dashes');
    });

    it('should handle special characters in player name', async () => {
      const response = await request(app).get('/lobby/player_123');
      expect(response.status).toBe(200);
      expect(response.text).toContain('player_123');
    });

    it('should include room name in dev mode response', async () => {
      const response = await request(app).get('/myRoom/bob');
      expect(response.text).toContain('myRoom');
    });

    it('should include player name in dev mode response', async () => {
      const response = await request(app).get('/arena/charlie');
      expect(response.text).toContain('charlie');
    });

    it('should handle URL encoded characters', async () => {
      const response = await request(app).get('/room%20name/player%20name');
      expect(response.status).toBe(200);
      // Express automatically decodes URL params
      expect(response.text).toContain('room name');
      expect(response.text).toContain('player name');
    });

    it('should provide development server URL in dev mode', async () => {
      const response = await request(app).get('/testRoom/testPlayer');
      expect(response.text).toContain('localhost:5173');
    });

    it('should handle numeric room and player names', async () => {
      const response = await request(app).get('/123/456');
      expect(response.status).toBe(200);
      expect(response.text).toContain('123');
      expect(response.text).toContain('456');
    });

    it('should handle long room names', async () => {
      const longRoom = 'a'.repeat(50);
      const response = await request(app).get(`/${longRoom}/player`);
      expect(response.status).toBe(200);
    });

    it('should handle long player names', async () => {
      const longPlayer = 'b'.repeat(50);
      const response = await request(app).get(`/room/${longPlayer}`);
      expect(response.status).toBe(200);
    });
  });

  describe('Static file serving', () => {
    it('should not match root path', async () => {
      const response = await request(app).get('/');
      // Root should be handled differently (static files)
      expect(response.status).toBe(404); // No static file at root in test
    });

    it('should not match single segment paths', async () => {
      const response = await request(app).get('/onlyone');
      expect(response.status).toBe(404); // Doesn't match /:room/:player pattern
    });

    it('should not match three segment paths', async () => {
      const response = await request(app).get('/room/player/extra');
      expect(response.status).toBe(404); // Doesn't match /:room/:player pattern
    });
  });
});
