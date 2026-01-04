import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExerciseService } from './services/exercise.service';
import { TrainingService } from './services/training.service';
import { Exercise, TrainingEntry } from './models';
import { TrainingFormComponent } from './components/training-form/training-form.component';

interface RoutineExercise {
  name: string;
  detail: string;
  muscleGroup?: string;
}

interface RoutineDay {
  key: 'push' | 'pull' | 'legs';
  title: string;
  icon: string;
  warmup: string[];
  training: RoutineExercise[];
  finish?: string[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, TrainingFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly exerciseService = inject(ExerciseService);
  private readonly trainingService = inject(TrainingService);

  @ViewChild('logFormRef') private logFormRef?: ElementRef<HTMLElement>;
  @ViewChild('importInput') private importInput?: ElementRef<HTMLInputElement>;

  readonly exercises = this.exerciseService.exercises;
  readonly entries = this.trainingService.entries;
  readonly selectedExerciseName = computed(() => {
    const id = this.selectedExerciseId();
    if (!id) {
      return null;
    }
    return this.exercises().find((item) => item.id === id)?.name ?? null;
  });

  readonly routine: RoutineDay[] = [
    {
      key: 'push',
      title: 'PUSH (empuje)',
      icon: '🔹',
      warmup: [
        'Manguito rotador 2-3 ejercicios con goma',
        'Series de aproximación del press principal'
      ],
      training: [
        { name: 'Press de banca con barra', detail: '4x6-8 (fuerza)', muscleGroup: 'Pecho' },
        {
          name: 'Press de banca inclinado con máquina',
          detail: '3x8-10 (fuerza e hipertrofia)',
          muscleGroup: 'Pecho'
        },
        { name: 'Pec Deck', detail: '3x12-15 (hipertrofia)', muscleGroup: 'Pecho' },
        {
          name: 'Extensión de tríceps en polea',
          detail: '3x10-12 (hipertrofia)',
          muscleGroup: 'Tríceps'
        },
        { name: 'Tríceps katana', detail: '2x12-15 (hipertrofia)', muscleGroup: 'Tríceps' },
        { name: 'Crunch en polea', detail: '3x12-15 (hipertrofia)', muscleGroup: 'Core' },
        {
          name: 'Crunch abdominal con discos',
          detail: '3x10-12 (hipertrofia) *',
          muscleGroup: 'Core'
        },
        { name: 'Russian twists', detail: '3x12-15 (hipertrofia) *', muscleGroup: 'Core' }
      ],
      finish: ['Colgarse de la barra 1-2x30-60s']
    },
    {
      key: 'pull',
      title: 'PULL (tirón)',
      icon: '🔹',
      warmup: ['5 min remo en máquina', 'Movilidad escapular', '2 series ligeras de jalón'],
      training: [
        {
          name: 'Dominadas asistidas/libres',
          detail: '4x6-8 (fuerza)',
          muscleGroup: 'Espalda'
        },
        { name: 'Remo con barra', detail: '4x8-10 (fuerza e hipertrofia)', muscleGroup: 'Espalda' },
        { name: 'Jalón al pecho', detail: '3x10-12 (fuerza e hipertrofia)', muscleGroup: 'Espalda' },
        {
          name: 'Rear delt en Pec Deck inverso',
          detail: '3x12-15 (hipertrofia)',
          muscleGroup: 'Hombro'
        },
        {
          name: 'Curl de bíceps martillo con mancuernas',
          detail: '3x8-10 (hipertrofia)',
          muscleGroup: 'Bíceps'
        },
        { name: 'Curl predicador', detail: '2x10-12 (hipertrofia)', muscleGroup: 'Bíceps' },
        {
          name: 'Curl de bíceps con mancuernas',
          detail: '3x12-15 (hipertrofia) *',
          muscleGroup: 'Bíceps'
        },
        {
          name: 'Elevaciones frontales con mancuernas',
          detail: '3x12-15 (hipertrofia) *',
          muscleGroup: 'Hombro'
        },
        {
          name: 'Elevaciones laterales con mancuernas',
          detail: '3x12-15 (hipertrofia) *',
          muscleGroup: 'Hombro'
        }
      ],
      finish: ['Colgarse de la barra 1-2x30-60 s']
    },
    {
      key: 'legs',
      title: 'LEGS (pierna)',
      icon: '🔹',
      warmup: ['5-7 min andando', 'Movilidad cadera/rodilla/tobillo/femoral', 'Activación de glúteo y core'],
      training: [
        { name: 'Sentadilla con barra', detail: '4x6-8 (fuerza)', muscleGroup: 'Pierna' },
        { name: 'Peso muerto rumano', detail: '3x8-10 (hipertrofia)', muscleGroup: 'Pierna' },
        { name: 'Extensión de cuádriceps', detail: '3x12-15 (hipertrofia)', muscleGroup: 'Cuádriceps' },
        { name: 'Curl femoral', detail: '3x10-12 (hipertrofia)', muscleGroup: 'Femoral' },
        { name: 'Hip Thrust', detail: '3x8-10 (hipertrofia)', muscleGroup: 'Glúteo' },
        { name: 'Adductores en máquina', detail: '2x15-20 (hipertrofia)', muscleGroup: 'Aductores' },
        { name: 'Abductores en máquina', detail: '2x15-20 (hipertrofia) *', muscleGroup: 'Glúteo' },
        { name: 'Elevaciones de talones de pie', detail: '4x12-15 (hipertrofia) *', muscleGroup: 'Gemelos' }
      ]
    }
  ];

  trackDay = (_: number, item: RoutineDay) => item.key;
  trackExercise = (_: number, item: RoutineExercise) => item.name;

  readonly selectedExerciseId = signal<string | null>(null);
  readonly historyExerciseId = signal<string | null>(null);
  readonly mode = signal<'log' | 'history'>('log');

  editingEntryId = signal<string | null>(null);
  editingDraft: { weight: string | null; reps: string | null; date: string } | null = null;

  readonly historyExercises = computed(() =>
    [...this.exercises()].sort((a, b) => a.name.localeCompare(b.name))
  );

  readonly historyEntries = computed(() => {
    const id = this.historyExerciseId();
    if (!id) {
      return [] as TrainingEntry[];
    }
    return this.entries().filter((item) => item.exerciseId === id);
  });

  handleSaveEntry(payload: Omit<TrainingEntry, 'id'>): void {
    this.trainingService.add(payload);
  }

  handleQuickLog(name: string, muscleGroup?: string): void {
    const existing = this.exercises().find((item) => item.name.toLowerCase() === name.toLowerCase());
    const exercise = existing ?? this.exerciseService.add(name, muscleGroup);
    this.selectedExerciseId.set(exercise.id);
    this.scrollToForm();
  }

  handleSelectHistoryExercise(id: string): void {
    this.historyExerciseId.set(id);
  }

  switchMode(next: 'log' | 'history'): void {
    this.mode.set(next);
  }

  startEdit(entry: TrainingEntry): void {
    this.editingEntryId.set(entry.id);
    this.editingDraft = {
      weight: entry.weight,
      reps: entry.reps ?? null,
      date: entry.date
    };
  }

  cancelEdit(): void {
    this.editingEntryId.set(null);
    this.editingDraft = null;
  }

  saveEdit(entry: TrainingEntry): void {
    if (!this.editingDraft) {
      return;
    }
    const payload: TrainingEntry = {
      ...entry,
      weight: (this.editingDraft.weight ?? entry.weight).toString(),
      reps: this.editingDraft.reps?.toString() ?? undefined,
      date: this.editingDraft.date
    };
    this.trainingService.update(payload);
    this.cancelEdit();
  }

  deleteEntry(id: string): void {
    this.trainingService.remove(id);
    if (this.editingEntryId() === id) {
      this.cancelEdit();
    }
  }

  exportData(): void {
    const data = {
      exercises: this.exercises(),
      entries: this.entries()
    } satisfies { exercises: Exercise[]; entries: TrainingEntry[] };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mara-gym-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  triggerImport(): void {
    this.importInput?.nativeElement?.click();
  }

  async handleImport(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { exercises?: Exercise[]; entries?: TrainingEntry[] };

      if (!Array.isArray(parsed.exercises) || !Array.isArray(parsed.entries)) {
        throw new Error('Formato inválido: se esperaban ejercicios y registros.');
      }

      this.exerciseService.replaceAll(parsed.exercises);
      this.trainingService.replaceAll(parsed.entries);
      this.historyExerciseId.set(null);
      this.cancelEdit();
    } catch (err) {
      console.error('No se pudo importar el respaldo', err);
      alert('No se pudo importar el archivo. Revisa que sea un JSON exportado desde la app.');
    } finally {
      input.value = '';
    }
  }

  private scrollToForm(): void {
    queueMicrotask(() => {
      this.logFormRef?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
