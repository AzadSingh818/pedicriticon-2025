// /api/abstracts/download/[id]/route.js
import { NextResponse } from 'next/server';
import { getAbstractById, getFilesByAbstractId } from '@/lib/database-postgres';
import { s3 } from '@/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * ─────────────────────────────
 *  GET  /api/abstracts/download/:id
 * ─────────────────────────────
 * ▸ If the abstract has 1 file   → 302 redirect to that file (as before)
 * ▸ If it has >1 file            → returns JSON:  { files: [ ...signedUrls ] }
 *                                 (pass  ?list=1  or  Accept: application/json
 *                                  to *force* JSON even for a single file)
 */
export async function GET(req, { params }) {
  const { id } = params ?? {};
  if (!id) {
    return NextResponse.json(
      { errorType: 'NO_ID_PROVIDED', error: 'Missing abstract id' },
      { status: 400 }
    );
  }

  // ── 1. Make sure the abstract exists
  const abstract = await getAbstractById(id);
  if (!abstract) {
    return NextResponse.json(
      { errorType: 'ABSTRACT_NOT_FOUND', error: 'Abstract not found' },
      { status: 404 }
    );
  }

  // ── 2. Pull ALL uploaded‑file rows
  const files = await getFilesByAbstractId(id);
  if (!files.length) {
    return NextResponse.json(
      { errorType: 'NO_FILE_ATTACHED', error: 'No file attached to this abstract' },
      { status: 404 }
    );
  }

  // ── 3. Build a signed‑URL array
  const signedUrls = await Promise.all(
    files.map(async (f) => {
      const key = f.key || f.file_path?.split('.com/')[1];
      if (!key) return null;                      // skip malformed row
      return getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
        }),
        { expiresIn: 600 }                        // 10 min
      );
    })
  ).then((arr) => arr.filter(Boolean));           // remove nulls

  if (!signedUrls.length) {
    return NextResponse.json(
      { errorType: 'FILE_NOT_FOUND', error: 'Could not sign any file' },
      { status: 404 }
    );
  }

  const wantsJson =
    req.nextUrl.searchParams.get('list') === '1' ||      // ?list=1
    (req.headers.get('accept') ?? '').includes('json');  // or Accept: json

  // ▸ One file & caller did **not** ask for JSON  → as‑is redirect (old behaviour)
  if (signedUrls.length === 1 && !wantsJson) {
    return NextResponse.redirect(signedUrls[0], 302);
  }

  // ▸ Otherwise return the list
  return NextResponse.json({ files: signedUrls });
}

// (unchanged) CORS pre‑flight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
