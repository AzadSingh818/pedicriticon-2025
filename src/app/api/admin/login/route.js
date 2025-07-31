// src/app/api/admin/login/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'          // keep if you want hashed pw later

/* ▶ 1.  Pull creds & secret from .env */
const {
  ADMIN_EMAIL = 'admin@apbmt2025.org',
  ADMIN_PASSWORD_HASH = '',                 // ← pulled from .env.local
  ADMIN_JWT_SECRET = 'change‑me‑in‑prod'
} = process.env

console.log('[env] hash length ->', ADMIN_PASSWORD_HASH.length);
console.log('[env] first 20 chars ->', ADMIN_PASSWORD_HASH.slice(0, 20));

/* ▶ 2.  How long a session lasts */
const TOKEN_TTL = '2h'   // any jwt‑expiresIn format (e.g. "7200s", "2h")

/* ------------------------------------ POST /api/admin/login */
export async function POST (req) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ success:false, error:'Email & password required' }, { status:400 })
  }

  /* 👉 3.  Check creds  (swap for DB check when ready) */
 const passwordOk = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
 const isValid    = email === ADMIN_EMAIL && passwordOk;

 console.log('[login] email ok:', email === ADMIN_EMAIL,
             'password ok:', passwordOk);
  if (!isValid) {
    console.log('❌ Invalid admin login:', email)
    return NextResponse.json({ success:false, error:'Invalid credentials' }, { status:401 })
  }

  /* 👉 4.  Sign JWT that middleware will trust */
  const token = jwt.sign(
    { email, role:'admin' },
    ADMIN_JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  )

  /* 👉 5.  Ship token both as JSON (client use) and HTTP‑only cookie (server use) */
  const res = NextResponse.json({
    success: true,
    admin: { email, role:'admin' },
    token            // handy if the React side wants to stash it too
  })

  res.cookies.set(
  'admin-token',          // name
  token,                  // value
  {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2,  // 2 h
    path: '/'             // send to all routes
  }
)


  return res
}

/* ------------------------------------ POST /api/admin/logout */
export async function DELETE () {
  const res = NextResponse.json({ success:true })
  res.cookies.set('admin-token', '', { path: '/', expires: new Date(0) })
  return res
}

/* ------------------------------------ GET /api/admin/login  (token check) */
export async function GET (req) {
  const token = req.cookies.get('admin-token')?.value
  if (!token) {
    return NextResponse.json({ success:false, error:'No token' }, { status:401 })
  }

  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET)
    return NextResponse.json({ success:true, admin:decoded })
  } catch (err) {
    return NextResponse.json({ success:false, error:'Invalid / expired token' }, { status:401 })
  }
}

/* CORS pre‑flight */
export function OPTIONS () {
  return new NextResponse(null, {
    status: 200,
    headers:{
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Methods':'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type'
    }
  })
}
