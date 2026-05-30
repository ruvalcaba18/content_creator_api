export interface Post {
  id?: number;
  title: string;
  text?: string;
  image?: string;
  schedule_days?: number[];
  schedule_time?: string;
  last_posted?: Date;
  active?: boolean;
  created_at?: Date;
}
