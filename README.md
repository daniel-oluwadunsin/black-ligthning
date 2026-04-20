# Black Thunder

Black Thunder is a full-stack music recognition app.

It lets you:

- add songs (audio + artwork) to a fingerprint database
- identify a song from a short microphone recording

The client is a Next.js app. The server is an Express API with Prisma (PostgreSQL) and BullMQ (Redis).

## What The App Does

- Add Song flow:
  - user uploads song file + artwork from the web UI
  - server stores files (artwork/audio upload path handled in backend)
  - server creates a Song row in the database
  - server pushes a background job to generate fingerprints

- Identify flow:
  - user records audio in the browser
  - client sends recorded file to the identify API
  - server generates fingerprints from the uploaded clip
  - server compares clip fingerprints against stored fingerprints
  - best match returns with confidence score

## Fingerprinting Logic (High-Level)

In the backend, audio is processed roughly like this:

1. Normalize audio input

- convert input file to WAV using ffmpeg
- resample to mono, 44.1 kHz

2. Build spectral frames

- split waveform into overlapping windows
- run FFT per window
- compute magnitudes per frequency bin

3. Extract salient peaks

- pick local peak frequencies above threshold
- keep top peaks per frame

4. Create hashes

- pair nearby peak frequencies into compact hash keys
- store hash + frame offset for matching

This creates many lightweight fingerprints for each song.

## Matching Logic (How Identify Works)

When a new clip is uploaded:

1. Generate fingerprints from the clip using the same pipeline.
2. Compare clip hashes with database hashes.
3. For each hash match, compute offset difference:
   - offset difference = db offset - sample offset
4. Count votes per song and offset pattern.
5. Pick the song with the highest consistent vote count.
6. Return that song and the score as confidence.

The approach is offset-tolerant, so a clip can start from different points in the original song and still match.

## Queue Processing Flow

Fingerprint generation for newly added songs is asynchronous:

1. Add Song API saves song metadata.
2. API enqueues an audio fingerprinting job in BullMQ.
3. Worker consumes the job.
4. Worker decodes audio, generates fingerprints, inserts them in chunks.
5. Worker cleans temporary files and emits queue events (active/completed/failed).

Why queue it:

- avoids blocking the request/response cycle
- keeps add-song API fast
- supports scaling background processing

## API Summary

- POST /song
  - multipart form: title, artist, song file, artwork file
  - creates song + queues fingerprint job

- POST /song/identify
  - multipart form: file
  - returns matched song + confidence

- GET /health-check
  - verifies DB and Redis connectivity

## Project Structure

- client: Next.js frontend
- server: Express API, queue worker, fingerprint engine

## Quick Start

Prerequisites:

- Node.js
- PostgreSQL
- Redis
- ffmpeg available on PATH

1. Install dependencies

Client:

- cd client
- npm install

Server:

- cd server
- npm install

2. Configure environment variables (server)

Required values include:

- DATABASE_URL
- REDIS_HOST
- REDIS_PORT
- REDIS_USERNAME
- REDIS_PASSWORD
- GCS_PROJECT_ID
- GCS_BUCKET_NAME
- GCS_PRIVATE_KEY
- GCS_CLIENT_EMAIL

3. Run both apps

Server:

- cd server
- npm run dev

Client:

- cd client
- npm run dev

Default local ports:

- client: 3000
- server: 4000

If needed, set NEXT_PUBLIC_API_BASE_URL in the client environment to point to the server URL.
