-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InviteToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "bakerProfileId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "InviteToken_bakerProfileId_fkey" FOREIGN KEY ("bakerProfileId") REFERENCES "BakerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InviteToken" ("active", "bakerProfileId", "code", "createdAt", "id") SELECT "active", "bakerProfileId", "code", "createdAt", "id" FROM "InviteToken";
DROP TABLE "InviteToken";
ALTER TABLE "new_InviteToken" RENAME TO "InviteToken";
CREATE UNIQUE INDEX "InviteToken_code_key" ON "InviteToken"("code");
CREATE INDEX "InviteToken_code_idx" ON "InviteToken"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
