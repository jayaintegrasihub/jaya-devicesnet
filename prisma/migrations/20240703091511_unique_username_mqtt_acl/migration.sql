/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `MqttAcl` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MqttAcl_username_key" ON "MqttAcl"("username");
