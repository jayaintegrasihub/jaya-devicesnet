/*
  Warnings:

  - You are about to drop the column `gatewaySerialNumber` on the `MqttAccount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serialNumber]` on the table `MqttAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialNumber]` on the table `MqttAcl` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "MqttAccount" DROP CONSTRAINT "MqttAccount_gatewaySerialNumber_fkey";

-- DropIndex
DROP INDEX "MqttAccount_gatewaySerialNumber_key";

-- DropIndex
DROP INDEX "MqttAcl_username_key";

-- AlterTable
ALTER TABLE "Gateways" ADD COLUMN     "mqttAccountId" INTEGER;

-- AlterTable
ALTER TABLE "MqttAccount" DROP COLUMN "gatewaySerialNumber",
ADD COLUMN     "serialNumber" TEXT;

-- AlterTable
ALTER TABLE "MqttAcl" ADD COLUMN     "serialNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MqttAccount_serialNumber_key" ON "MqttAccount"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MqttAcl_serialNumber_key" ON "MqttAcl"("serialNumber");

-- AddForeignKey
ALTER TABLE "Gateways" ADD CONSTRAINT "Gateways_mqttAccountId_fkey" FOREIGN KEY ("mqttAccountId") REFERENCES "MqttAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
