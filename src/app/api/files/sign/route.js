import { NextResponse } from 'next/server';
import { s3 } from '@/lib/s3';                          // ⬅️ your existing s3 client
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');                 // the S3 object key we stored

  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  try {
    // make a 10‑minute signed URL
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 600 }                               // 600 s = 10 min
    );

    // simple 302 redirect to the signed URL
    return NextResponse.redirect(signedUrl, 302);
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return NextResponse.json({ error: 'Could not generate signed URL' }, { status: 500 });
  }
}
