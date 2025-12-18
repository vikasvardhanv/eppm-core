-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "finishDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "wbsCode" TEXT,
    "type" TEXT NOT NULL DEFAULT 'TASK_DEPENDENT',
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "originalDuration" INTEGER NOT NULL DEFAULT 8,
    "remainingDuration" INTEGER NOT NULL DEFAULT 8,
    "actualDuration" INTEGER NOT NULL DEFAULT 0,
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

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "predecessorId" TEXT NOT NULL,
    "successorId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FS',
    "lag" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Relationship_predecessorId_fkey" FOREIGN KEY ("predecessorId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Relationship_successorId_fkey" FOREIGN KEY ("successorId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'LABOR',
    "unitPrice" REAL NOT NULL DEFAULT 0.0,
    "maxUnits" REAL NOT NULL DEFAULT 1.0
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "plannedUnits" REAL NOT NULL DEFAULT 0,
    "actualUnits" REAL NOT NULL DEFAULT 0,
    "remainingUnits" REAL NOT NULL DEFAULT 0,
    "cost" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Assignment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assignment_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'TEAM_MEMBER'
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
