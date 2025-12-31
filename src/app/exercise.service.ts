import { Injectable, computed, inject, signal } from '@angular/core';
import { Exercise } from './models';
import { StorageService } from './storage.service';

const KEY = 'exercises';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private readonly storage = inject(StorageService);
  private readonly list = signal<Exercise[]>(this.storage.read<Exercise[]>(KEY, []));

  readonly exercises = computed(() => this.list());

  add(name: string, muscleGroup?: string): Exercise {
    const cleanName = name.trim();
    const cleanGroup = muscleGroup?.trim() || undefined;
    const existing = this.list().find((item) => item.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      return existing;
    }

    const created: Exercise = {
      id: crypto.randomUUID(),
      name: cleanName,
      muscleGroup: cleanGroup
    };

    this.persist([...this.list(), created]);
    return created;
  }

  update(updated: Exercise): void {
    const next = this.list().map((item) => (item.id === updated.id ? { ...item, ...updated } : item));
    this.persist(next);
  }

  remove(id: string): void {
    this.persist(this.list().filter((item) => item.id !== id));
  }

  private persist(next: Exercise[]): void {
    this.list.set(next);
    this.storage.write(KEY, next);
  }
}
