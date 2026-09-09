import { SignJWT, jwtVerify } from 'jose';

/**
 * Sesión del panel: JWT firmado (HS256) guardado en una cookie httpOnly.
 * El secreto vive sólo en el servidor (AUTH_SECRET) y nunca se expone al
 * cliente. La cookie no contiene datos sensibles, sólo id, correo y rol.
 */
export const SESSION_COOKIE = 'ylane_session';
const DURACION_SEGUNDOS = 60 * 60 * 8; // 8 horas

export type SessionPayload = {
  uid: number;
  email: string;
  rol: string;
  nombre: string;
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'AUTH_SECRET no está definido (o es demasiado corto). Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"',
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('ylane-perfumes')
    .setExpirationTime(`${DURACION_SEGUNDOS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: 'ylane-perfumes' });
    if (typeof payload.uid !== 'number' || typeof payload.email !== 'string') return null;
    return {
      uid: payload.uid,
      email: payload.email,
      rol: typeof payload.rol === 'string' ? payload.rol : 'admin',
      nombre: typeof payload.nombre === 'string' ? payload.nombre : '',
    };
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: DURACION_SEGUNDOS,
};
