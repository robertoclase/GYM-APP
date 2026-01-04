import { Injectable, computed, inject, signal } from '@angular/core';
import { TrainingEntry } from '../models';
import { StorageService } from './storage.service';

const KEY = 'training-entries';

@Injectable({ providedIn: 'root' })
export class TrainingService {
  private readonly storage = inject(StorageService);
  private readonly list = signal<TrainingEntry[]>(this.storage.read<TrainingEntry[]>(KEY, []));

  readonly entries = computed(() =>
    [...this.list()].sort((a, b) => b.date.localeCompare(a.date))
  );

  add(payload: Omit<TrainingEntry, 'id'>): TrainingEntry {
    const entry: TrainingEntry = {
      ...payload,
      id: crypto.randomUUID()
    };

    this.persist([entry, ...this.list()]);
    return entry;
  }

  update(entry: TrainingEntry): void {
    const exists = this.list().some((item) => item.id === entry.id);
    if (!exists) {
      return;
    }
    const next = this.list().map((item) => (item.id === entry.id ? { ...item, ...entry } : item));
    this.persist(next);
  }

  remove(id: string): void {
    this.persist(this.list().filter((item) => item.id !== id));
  }

  clearForExercise(exerciseId: string): void {
    this.persist(this.list().filter((item) => item.exerciseId !== exerciseId));
  }

  replaceAll(next: TrainingEntry[]): void {
    this.persist(next);
  }

  entriesForExercise(exerciseId: string): TrainingEntry[] {
    return this.entries().filter((item) => item.exerciseId === exerciseId);
  }

  private persist(next: TrainingEntry[]): void {
    this.list.set(next);
    this.storage.write(KEY, next);
  }
}
