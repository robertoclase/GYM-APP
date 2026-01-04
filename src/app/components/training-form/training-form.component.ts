import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Exercise, TrainingEntry } from '../../models';

@Component({
  selector: 'mg-training-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './training-form.component.html',
  styleUrl: './training-form.component.css'
})
export class TrainingFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input({ required: true }) exercises: Exercise[] = [];
  @Input() selectedExerciseId: string | null = null;

  @Output() saveEntry = new EventEmitter<Omit<TrainingEntry, 'id'>>();

  readonly form = this.fb.group({
    exerciseId: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    weight: this.fb.control<string | null>(null, {
      validators: [Validators.required]
    }),
    reps: this.fb.control<string | null>(null),
    date: this.fb.control(this.todayIso(), { nonNullable: true, validators: [Validators.required] })
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedExerciseId'] && this.selectedExerciseId) {
      this.form.patchValue({ exerciseId: this.selectedExerciseId });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: Omit<TrainingEntry, 'id'> = {
      exerciseId: raw.exerciseId,
      weight: (raw.weight ?? '').toString().trim(),
      reps: raw.reps?.toString().trim() || undefined,
      date: raw.date
    };

    this.saveEntry.emit(payload);
    this.form.patchValue({ weight: null, reps: null, date: this.todayIso() });
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
