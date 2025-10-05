import * as Astronomy from "astronomy-engine";

export const BODIES = ['Mercury','Venus','Earth','Mars','Jupiter','Saturn'] as const;

export function helioXYZAt(date: Date, bodies: readonly string[]) {
  return bodies.map(b => {
    const v = Astronomy.HelioVector(b as any, date); // km, J2000 equator, Sun at origin
    return { name: b, x: v.x, y: v.y, z: v.z };
  });
}
