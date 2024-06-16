-- CreateEnum
CREATE TYPE "ACTION" AS ENUM ('publish', 'subscribe', 'all');

-- CreateEnum
CREATE TYPE "PERMISSION" AS ENUM ('allow', 'deny');

-- CreateTable
CREATE TABLE "MqttAcl" (
    "id" SERIAL NOT NULL,
    "ipaddress" TEXT NOT NULL DEFAULT '',
    "username" VARCHAR(255) NOT NULL DEFAULT '',
    "clientid" VARCHAR(255) NOT NULL DEFAULT '',
    "action" "ACTION" NOT NULL,
    "permission" "PERMISSION" NOT NULL,
    "topic" VARCHAR(255) NOT NULL,
    "qos" INTEGER,
    "retain" INTEGER,

    CONSTRAINT "MqttAcl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mqtt_acl_username_idx" ON "MqttAcl"("username");
