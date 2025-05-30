import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTodoSchema, updateTodoSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all todos
  app.get("/api/todos", async (req, res) => {
    try {
      const todos = await storage.getTodos();
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });

  // Get single todo
  app.get("/api/todos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid todo ID" });
      }

      const todo = await storage.getTodo(id);
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }

      res.json(todo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todo" });
    }
  });

  // Create new todo
  app.post("/api/todos", async (req, res) => {
    try {
      const result = insertTodoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid todo data",
          errors: result.error.errors 
        });
      }

      const todo = await storage.createTodo(result.data);
      res.status(201).json(todo);
    } catch (error) {
      res.status(500).json({ message: "Failed to create todo" });
    }
  });

  // Update todo
  app.patch("/api/todos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid todo ID" });
      }

      const result = updateTodoSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid update data",
          errors: result.error.errors 
        });
      }

      const todo = await storage.updateTodo(id, result.data);
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }

      res.json(todo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update todo" });
    }
  });

  // Delete todo
  app.delete("/api/todos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid todo ID" });
      }

      const deleted = await storage.deleteTodo(id);
      if (!deleted) {
        return res.status(404).json({ message: "Todo not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
