-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenants" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "bucketId" VARCHAR(16),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nodes" (
    "id" TEXT NOT NULL,
    "serialNumber" VARCHAR(30) NOT NULL,
    "alias" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(30) NOT NULL,
    "group" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "Nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gateways" (
    "id" TEXT NOT NULL,
    "serialNumber" VARCHAR(30) NOT NULL,
    "alias" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(30) NOT NULL,
    "group" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "Gateways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Types" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "groups" TEXT[],
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestLogs" (
    "id" SERIAL NOT NULL,
    "user" VARCHAR(30) NOT NULL,
    "auditLog" VARCHAR(30) NOT NULL,
    "ipAddress" VARCHAR(30),
    "status" VARCHAR(30),
    "body" TEXT,
    "params" TEXT,
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MqttAccount" (
    "id" SERIAL NOT NULL,
    "gatewaySerialNumber" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isSuperUser" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MqttAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKeys" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "expiresAt" VARCHAR(30) NOT NULL,
    "isEnable" BOOLEAN NOT NULL,
    "apiKey" TEXT NOT NULL,
    "secretKey" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKeys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tenants_name_key" ON "Tenants"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Nodes_serialNumber_key" ON "Nodes"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Nodes_alias_key" ON "Nodes"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "Gateways_serialNumber_key" ON "Gateways"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Gateways_alias_key" ON "Gateways"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "Types_name_key" ON "Types"("name");

-- CreateIndex
CREATE INDEX "RequestLogs_createdAt_idx" ON "RequestLogs"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "RequestLogs_status_idx" ON "RequestLogs"("status");

-- CreateIndex
CREATE INDEX "RequestLogs_user_idx" ON "RequestLogs"("user");

-- CreateIndex
CREATE INDEX "RequestLogs_status_user_createdAt_idx" ON "RequestLogs"("status", "user", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MqttAccount_gatewaySerialNumber_key" ON "MqttAccount"("gatewaySerialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MqttAccount_username_key" ON "MqttAccount"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKeys_username_key" ON "ApiKeys"("username");

-- AddForeignKey
ALTER TABLE "Nodes" ADD CONSTRAINT "Nodes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gateways" ADD CONSTRAINT "Gateways_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MqttAccount" ADD CONSTRAINT "MqttAccount_gatewaySerialNumber_fkey" FOREIGN KEY ("gatewaySerialNumber") REFERENCES "Gateways"("serialNumber") ON DELETE SET NULL ON UPDATE CASCADE;
