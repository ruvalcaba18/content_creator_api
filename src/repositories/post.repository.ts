import db from "../database/postgres";
import { Post } from "../models/post.model";

export class PostRepository {
  private mapRowToPost(row: any): Post {
    if (!row) return row;
    return {
      ...row,
      schedule_days: row.schedule_days ? row.schedule_days.split(',').map(Number) : undefined,
    };
  }

  async create(post: Post): Promise<Post> {
    const query = `
      INSERT INTO posts (title, text, image, schedule_days, schedule_time, active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      post.title,
      post.text || null,
      post.image || null,
      post.schedule_days ? post.schedule_days.join(',') : null,
      post.schedule_time || null,
      post.active !== undefined ? post.active : true,
    ];

    const result = await db.query(query, values);

    return this.mapRowToPost(result.rows[0]);
  }

  async getAll(): Promise<Post[]> {
    const query = `
      SELECT * FROM posts
      ORDER BY created_at DESC
    `;

    const result = await db.query(query);

    return result.rows.map((row: any) => this.mapRowToPost(row));
  }

  async getById(id: number): Promise<Post | null> {
    const query = `
      SELECT * FROM posts
      WHERE id = $1
    `;

    const result = await db.query(query, [id]);

    return result.rows[0] ? this.mapRowToPost(result.rows[0]) : null;
  }

  async update(id: number, post: Partial<Post>): Promise<Post | null> {
    const query = `
      UPDATE posts
      SET
        title = COALESCE($1, title),
        text = COALESCE($2, text),
        image = COALESCE($3, image),
        schedule_days = COALESCE($4, schedule_days),
        schedule_time = COALESCE($5, schedule_time),
        last_posted = COALESCE($6, last_posted),
        active = COALESCE($7, active)
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      post.title || null,
      post.text || null,
      post.image || null,
      post.schedule_days ? post.schedule_days.join(',') : null,
      post.schedule_time || null,
      post.last_posted || null,
      post.active !== undefined ? post.active : null,
      id,
    ];

    const result = await db.query(query, values);

    return result.rows[0] ? this.mapRowToPost(result.rows[0]) : null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `
      DELETE FROM posts
      WHERE id = $1
    `;

    const result = await db.query(query, [id]);

    return (result.rowCount ?? 0) > 0;
  }

  async getActivePosts(): Promise<Post[]> {
    const query = `
      SELECT * FROM posts
      WHERE schedule_days IS NOT NULL
      AND schedule_time IS NOT NULL
      AND active = true
    `;

    const result = await db.query(query);

    return result.rows.map((row: any) => this.mapRowToPost(row));
  }

  async updateLastPosted(id: number): Promise<void> {
    const query = `
      UPDATE posts
      SET last_posted = NOW()
      WHERE id = $1
    `;

    await db.query(query, [id]);
  }

  async markAsInactive(id: number): Promise<void> {
    const query = `
      UPDATE posts
      SET active = false
      WHERE id = $1
    `;

    await db.query(query, [id]);
  }

}

export const postRepository = new PostRepository();
