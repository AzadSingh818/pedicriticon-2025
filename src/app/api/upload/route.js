import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '@/lib/s3';
import path from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];

function validateFileType(file) {
  const fileName = file.name.toLowerCase();
  const fileExtension = path.extname(fileName);
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
    };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format. Allowed: PDF, DOC, DOCX, TXT`
    };
  }
  return { valid: true };
}

function generateSafeFilename(originalName) {
  const extension = path.extname(originalName).toLowerCase();
  const nameWithoutExt = path.basename(originalName, extension);
  const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
  const timestamp = Date.now();
  const uuid = crypto.randomUUID().split('-')[0];
  return `${timestamp}_${uuid}_${safeName}${extension}`;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');
    const submissionId = formData.get('submissionId') || 'temp';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: 'Max 5 files allowed' }, { status: 400 });
    }

    const uploaded = [];
    const failed = [];

    for (const file of files) {
      try {
        if (!file || typeof file.arrayBuffer !== 'function') {
          failed.push({ fileName: 'unknown', error: 'Invalid file object' });
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          failed.push({ fileName: file.name, error: 'File too large. Max 10MB' });
          continue;
        }

        const typeValidation = validateFileType(file);
        if (!typeValidation.valid) {
          failed.push({ fileName: file.name, error: typeValidation.error });
          continue;
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = generateSafeFilename(file.name);
        const key = `abstracts/${submissionId}/${safeName}`;

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type
          })
        );

        uploaded.push({
          originalName: file.name,
          fileName: safeName,                                              // 👈 NEW
          size:      file.size,                                            // 👈 NEW
          type:      file.type,                                            // 👈 NEW
          path:      `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`, // 👈 (was url)
          key,
          uploadedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
        failed.push({ fileName: file.name, error: 'Upload failed' });
      }
    }

    return NextResponse.json({
      success: uploaded.length > 0,
      uploadedFiles: uploaded,
      errors: failed,
      totalFiles: files.length
    });
  } catch (err) {
    console.error('❌ API Upload Error:', err);
    return NextResponse.json({ error: 'Upload failed', details: err.message }, { status: 500 });
  }
}
