-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wbsCode" TEXT,
    "type" TEXT NOT NULL DEFAULT 'TASK_DEPENDENT',
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "originalDuration" INTEGER NOT NULL DEFAULT 8,
    "remainingDuration" INTEGER NOT NULL DEFAULT 8,
    "actualDuration" INTEGER NOT NULL DEFAULT 0,
    "percentComplete" REAL NOT NULL DEFAULT 0,
    "startDate" DATETIME,
    "finishDate" DATETIME,
    "earlyStart" DATETIME,
    "earlyFinish" DATETIME,
    "lateStart" DATETIME,
    "lateFinish" DATETIME,
    "totalFloat" INTEGER,
    "freeFloat" INTEGER,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Activity" ("actualDuration", "createdAt", "earlyFinish", "earlyStart", "finishDate", "freeFloat", "id", "isCritical", "lateFinish", "lateStart", "name", "originalDuration", "projectId", "remainingDuration", "startDate", "status", "totalFloat", "type", "updatedAt", "wbsCode") SELECT "actualDuration", "createdAt", "earlyFinish", "earlyStart", "finishDate", "freeFloat", "id", "isCritical", "lateFinish", "lateStart", "name", "originalDuration", "projectId", "remainingDuration", "startDate", "status", "totalFloat", "type", "updatedAt", "wbsCode" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
