import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Exercise } from '../models';

@Component({
  selector: 'mg-exercise-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exercise-manager.component.html',
  styleUrl: './exercise-manager.component.css'
})
export class ExerciseManagerComponent {
  private readonly fb = inject(FormBuilder);

  @Input({ required: true }) exercises: Exercise[] = [];
  @Input() selectedId: string | null = null;

  @Output() saveExercise = new EventEmitter<Omit<Exercise, 'id'> & { id?: string }>();
  @Output() deleteExercise = new EventEmitter<string>();
  @Output() selectExercise = new EventEmitter<string>();

  readonly form = this.fb.group({
    id: this.fb.control<string | null>(null),
    name: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    }),
    muscleGroup: this.fb.control('', { nonNullable: true })
  });

  readonly editing = signal(false);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload = {
      id: value.id ?? undefined,
      name: value.name.trim(),
      muscleGroup: value.muscleGroup.trim() || undefined
    } satisfies Omit<Exercise, 'id'> & { id?: string };

    this.saveExercise.emit(payload);
    this.reset();
  }

  startEdit(exercise: Exercise): void {
    this.form.patchValue({
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup ?? ''
    });
    this.editing.set(true);
  }

  reset(): void {
    this.form.reset({ id: null, name: '', muscleGroup: '' });
    this.editing.set(false);
  }

  remove(id: string): void {
    this.deleteExercise.emit(id);
    if (this.selectedId === id) {
      this.selectExercise.emit('');
    }
  }

  pick(id: string): void {
    this.selectExercise.emit(id);
  }
}
