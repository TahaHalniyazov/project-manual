const admin = require("firebase-admin");
const { onValueWritten } = require("firebase-functions/v2/database");


admin.initializeApp({
  databaseURL: "http://127.0.0.1:9000/?ns=test-ead6f-default-rtdb",
});

exports.syncTaskReverseIndex = onValueWritten("/tasks/{taskId}", async (event) => {
  const taskId = event.params.taskId;

  const before = event.data.before.val();
  const after = event.data.after.val();

  const beforeProjectId = before?.projectId || null;
  const afterProjectId = after?.projectId || null;

  const updates = {};


  if (!after) {
    if (beforeProjectId) {
      updates[`/tasksByProject/${beforeProjectId}/${taskId}`] = null;
    }
    if (Object.keys(updates).length) {
      await admin.database().ref().update(updates);
    }
    return;
  }


  if (beforeProjectId && beforeProjectId !== afterProjectId) {
    updates[`/tasksByProject/${beforeProjectId}/${taskId}`] = null;
  }


  if (afterProjectId) {
    updates[`/tasksByProject/${afterProjectId}/${taskId}`] = true;
  }

  if (Object.keys(updates).length) {
    await admin.database().ref().update(updates);
  }
});
