import { randomUUID } from "node:crypto";
import { Db } from "./db.js";
import { buildRoutePath } from "./utils/build-route-url.js";

const db = new Db();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = db.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      try {
        const tasks = req.body;

        if (!Array.isArray(tasks)) {
          console.error("Invalid input: tasks is not an array", tasks);
          return res
            .writeHead(400)
            .end("Invalid input. Expected an array of tasks.");
        }
        tasks.forEach((taskData) => {
          const { title, description } = taskData;

          const task = {
            id: randomUUID(),
            title,
            description,
            completed_at: null,
            created_at: new Date(),
          };

          db.insert("tasks", task);
        });

        return res.writeHead(201).end();
      } catch (error) {
        console.error("Error inserting tasks:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      }
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;
      const taskNow = db.internSelect(
        "tasks",
        id
          ? {
              id: id,
            }
          : null
      );

      db.update("tasks", id, {
        title,
        description,
        created_at: taskNow.created_at,
        completed_at: taskNow.completed_at,
        updated_at: new Date(),
      });
      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      db.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;
      const taskToPatch = db.internSelect("tasks", { id });
      db.patch("tasks", id, {
        title: taskToPatch.title,
        description: taskToPatch.description,
        created_at: taskToPatch.created_at,
        updated_at: taskToPatch.updated_at,
        completed_at: new Date(),
      });

      return res.writeHead(204).end();
    },
  },
];
