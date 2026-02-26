export type Workout = {
  id: number;
  title: string;
  description: string;
  workout_date: string;
  duration_minutes: number;
  exercises_csv: string;
};

export type WorkoutForm = {
  title: string;
  description: string;
  duration_minutes: string;
  exercises_csv: string;
};
