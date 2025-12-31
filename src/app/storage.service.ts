import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefix = 'mara-gym/';

  read<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(this.prefix + key);
    if (!raw) {
      return fallback;
    }

    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn('No se pudo parsear localStorage, reseteando clave', key, err);
      this.remove(key);
      return fallback;
    }
  }

  write<T>(key: string, value: T): void {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }
}
