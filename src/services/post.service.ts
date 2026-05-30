import { postRepository } from "../repositories/post.repository";
import { Post } from "../models/post.model";

export class PostService {
  async createPost(data: Partial<Post>): Promise<Post> {
    if (!data.title) {
      throw new Error("Title is required");
    }

    const postToCreate: Post = {
      title: data.title,
      text: data.text,
      image: data.image,
      schedule_days: data.schedule_days,
      schedule_time: data.schedule_time,
    };

    return await postRepository.create(postToCreate);
  }

  async getAllPosts(): Promise<Post[]> {
    return await postRepository.getAll();
  }

  async getPostById(id: number): Promise<Post> {
    const post = await postRepository.getById(id);
    if (!post) {
      throw new Error(`Post with ID ${id} not found`);
    }
    return post;
  }

  async updatePost(id: number, data: Partial<Post>): Promise<Post> {
    await this.getPostById(id);

    const updatedPost = await postRepository.update(id, data);
    if (!updatedPost) {
      throw new Error(`Could not update post with ID ${id}`);
    }
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    await this.getPostById(id);

    return await postRepository.delete(id);
  }

  async publishPost(post: Post): Promise<void> {
    console.log(`[PUBLISHER] Publicando post ID ${post.id}: "${post.title}"`);

    // Aquí puedes integrar la lógica real de tus redes sociales (Twitter API, Facebook API, etc.)

    // Actualizar la fecha de última publicación en DB
    if (post.id) {
      await postRepository.update(post.id, { last_posted: new Date() });
    }
  }

  async processPendingPosts(): Promise<void> {
    const posts = await postRepository.getActivePosts();
    const now = new Date();

    const currentDay = now.getDay();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    for (const post of posts) {
      if (post.schedule_days && post.schedule_time) {
        if (!post.schedule_days.includes(currentDay)) continue;
        if (post.schedule_time !== currentTimeStr) continue;

        if (post.last_posted) {
          const lastPosted = new Date(post.last_posted);
          if (
            lastPosted.getFullYear() === now.getFullYear() &&
            lastPosted.getMonth() === now.getMonth() &&
            lastPosted.getDate() === now.getDate()
          ) {
            continue; // Already published today
          }
        }

        await this.publishPost(post);
      }
    }
  }
}

export const postService = new PostService();
