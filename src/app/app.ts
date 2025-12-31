import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { ExerciseService } from './exercise.service';
import { TrainingService } from './training.service';
import { TrainingEntry } from './models';
import { TrainingFormComponent } from './components/training-form.component';

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
  imports: [CommonModule, TrainingFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly exerciseService = inject(ExerciseService);
  private readonly trainingService = inject(TrainingService);

  @ViewChild('logFormRef') private logFormRef?: ElementRef<HTMLElement>;

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
          name: 'Elevaciones de piernas colgado',
          detail: '3x10-12 (hipertrofia)',
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

  private scrollToForm(): void {
    queueMicrotask(() => {
      this.logFormRef?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
