const express = require("express");
const { asyncHandler } = require("./utilities/utils");
const { requireAuth } = require("./utilities/auth");
const { check, validationResult } = require("express-validator");
const { TaskList, Task } = require("../../db/models");
const router = express.Router();

//Authenticates user before being able to use API
// router.use(requireAuth);

//get all tasklists
router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const tasklists = await TaskList.findAll({});

    res.json(tasklists);
  })
);

//get all tasks for tasklist
router.get(
  "/:id/tasks",
  asyncHandler(async (req, res, next) => {
    const tasklist_id = req.params.id;
    const tasks = await Task.findAll({
      where: {
        tasklist_id: tasklist_id,
      },
    });
    res.json(tasks);
  })
);

//Create task to tasklist
router.post(
  "/:id/task",
  asyncHandler(async (req, res) => {
    const tasklist_id = req.params.id;
    const {
      name,
      projectId,
      assigneeId,
      due_date,
      completed,
      description,
    } = req.body;

    if (!tasklist_id || !name || !projectId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const finalCompleted = Array.isArray(completed) && completed.length === 0 ? false : completed;

    const task = await Task.create({
      name,
      project_id: projectId,
      assignee_id: assigneeId,
      due_date,
      completed: finalCompleted,
      description,
      tasklist_id,
    });

    if (!task) {
      return res.status(500).json({ message: "Task creation failed" });
    }

    res.status(201).json(task);
  })
);

//Delete TaskList
router.delete(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const tasklist_id = req.params.id;

    const tasklist = await TaskList.destroy({
      where: { id: tasklist_id },
    });
    res.json(202);
  })
);

//Edit Column index
router.put(
  "/:id/columnindex",
  asyncHandler(async (req, res, next) => {
    const { newIndex } = req.body;
    const tasklist_id = req.params.id;
    const column_index = req.params.columnIndex;

    try {
      const updateIndex = await TaskList.update(
        {
          column_index: newIndex,
        },
        {
          where: {
            id: tasklist_id,
          },
        }
      );
      console.log(newIndex);
      res.json(updateIndex);
    } catch (err) {
      res.status(401).send({ error: "Something went wrong" });
    }
  })
);

//update tasklist name

router.put(
  "/:id/title",
  asyncHandler(async (req, res, next) => {
    const tasklist_id = req.params.id;
    const { columnTitle } = req.body;
    const tasklist = await TaskList.update(
      { name: columnTitle },
      { where: { id: tasklist_id } }
    );
    res.json({ message: "updated" });
  })
);

module.exports = router;
