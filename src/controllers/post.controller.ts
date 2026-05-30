import { Request, Response } from "express";
import { postService } from "../services/post.service";

export const createPost = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const post = await postService.createPost(req.body);

    res.status(201).json({
      ok: true,
      post,
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      message: error.message || "Error creating post",
    });
  }
};

export const getAllPosts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const posts = await postService.getAllPosts();
    res.json({
      ok: true,
      posts,
    });
  } catch (error: any) {
    res.status(500).json({
      ok: false,
      message: error.message || "Error fetching posts",
    });
  }
};

export const getPostById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ ok: false, message: "Invalid ID format" });
      return;
    }

    const post = await postService.getPostById(id);
    res.json({
      ok: true,
      post,
    });
  } catch (error: any) {
    res.status(404).json({
      ok: false,
      message: error.message || "Post not found",
    });
  }
};

export const updatePost = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ ok: false, message: "Invalid ID format" });
      return;
    }

    const post = await postService.updatePost(id, req.body);
    res.json({
      ok: true,
      post,
    });
  } catch (error: any) {
    res.status(400).json({
      ok: false,
      message: error.message || "Error updating post",
    });
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ ok: false, message: "Invalid ID format" });
      return;
    }

    await postService.deletePost(id);
    res.json({
      ok: true,
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    res.status(404).json({
      ok: false,
      message: error.message || "Error deleting post",
    });
  }
};
