import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Exercise, TrainingEntry, Trend } from '../../models';

interface ExerciseHistory {
  exercise: Exercise;
  entries: TrainingEntry[];
  trend: Trend;
  delta?: number;
}

@Component({
  selector: 'mg-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {
  @Input({ required: true }) exercises: Exercise[] = [];
  @Input({ required: true }) entries: TrainingEntry[] = [];

  get histories(): ExerciseHistory[] {
    return this.exercises.map((exercise) => {
      const entries = this.entries
        .filter((item) => item.exerciseId === exercise.id)
        .sort((a, b) => b.date.localeCompare(a.date));

      return {
        exercise,
        entries,
        ...this.trend(entries)
      } satisfies ExerciseHistory;
    });
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(
      new Date(value)
    );
  }

  private trend(entries: TrainingEntry[]): { trend: Trend; delta?: number } {
    if (entries.length < 2) {
      return { trend: 'solo' };
    }

    const [latest, previous] = entries;
    const latestNum = this.toNumber(latest.weight);
    const prevNum = this.toNumber(previous.weight);

    if (latestNum === null || prevNum === null) {
      return { trend: 'solo' };
    }

    const diff = latestNum - prevNum;

    if (Math.abs(diff) < 0.1) {
      return { trend: 'equal', delta: 0 };
    }

    return diff > 0
      ? { trend: 'up', delta: diff }
      : { trend: 'down', delta: Math.abs(diff) };
  }

  private toNumber(value: string | number | undefined): number | null {
    const parsed = typeof value === 'number' ? value : parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : null;
  }
}
