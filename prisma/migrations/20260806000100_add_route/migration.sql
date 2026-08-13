-- CreateTable
CREATE TABLE "route" (
    "id" VARCHAR(150) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "information" TEXT,
    "campusId" VARCHAR(100),
    "geometryType" "GeoGeometryType" NOT NULL,
    "geometry" JSONB NOT NULL,
    "longitude" DECIMAL(12,8),
    "latitude" DECIMAL(12,8),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_place" (
    "routeId" VARCHAR(150) NOT NULL,
    "placeId" VARCHAR(150) NOT NULL,

    CONSTRAINT "route_place_pkey" PRIMARY KEY ("routeId","placeId")
);

-- CreateIndex
CREATE INDEX "route_campusId_idx" ON "route"("campusId");

-- CreateIndex
CREATE INDEX "route_place_placeId_idx" ON "route_place"("placeId");

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_place" ADD CONSTRAINT "route_place_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_place" ADD CONSTRAINT "route_place_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
