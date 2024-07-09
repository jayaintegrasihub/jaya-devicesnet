/*
  Warnings:

  - You are about to drop the column `mqttAccountId` on the `Gateways` table. All the data in the column will be lost.
  - Made the column `serialNumber` on table `MqttAccount` required. This step will fail if there are existing NULL values in that column.
  - Made the column `serialNumber` on table `MqttAcl` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Gateways" DROP CONSTRAINT "Gateways_mqttAccountId_fkey";

-- DropIndex
DROP INDEX "MqttAcl_serialNumber_key";

-- AlterTable
ALTER TABLE "Gateways" DROP COLUMN "mqttAccountId";

-- AlterTable
ALTER TABLE "MqttAccount" ALTER COLUMN "serialNumber" SET NOT NULL;

-- AlterTable
ALTER TABLE "MqttAcl" ALTER COLUMN "serialNumber" SET NOT NULL;
