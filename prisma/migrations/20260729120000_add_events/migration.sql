-- AlterTable
ALTER TABLE "place" ADD COLUMN     "isEventOnly" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "event" (
    "id" VARCHAR(150) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "information" TEXT,
    "campusId" VARCHAR(100),
    "geometryType" "GeoGeometryType" NOT NULL,
    "geometry" JSONB NOT NULL,
    "longitude" DECIMAL(12,8),
    "latitude" DECIMAL(12,8),
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "floors" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "showFrom" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_place" (
    "eventId" VARCHAR(150) NOT NULL,
    "placeId" VARCHAR(150) NOT NULL,

    CONSTRAINT "event_place_pkey" PRIMARY KEY ("eventId","placeId")
);

-- CreateIndex
CREATE INDEX "place_isEventOnly_idx" ON "place"("isEventOnly");

-- CreateIndex
CREATE INDEX "event_campusId_idx" ON "event"("campusId");

-- CreateIndex
CREATE INDEX "event_startDate_idx" ON "event"("startDate");

-- CreateIndex
CREATE INDEX "event_endDate_idx" ON "event"("endDate");

-- CreateIndex
CREATE INDEX "event_place_placeId_idx" ON "event_place"("placeId");

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_place" ADD CONSTRAINT "event_place_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_place" ADD CONSTRAINT "event_place_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
