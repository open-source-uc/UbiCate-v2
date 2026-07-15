-- CreateEnum
CREATE TYPE "GeoGeometryType" AS ENUM ('Point', 'Polygon', 'MultiPolygon');

-- CreateTable
CREATE TABLE "campus" (
    "id" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "shortName" VARCHAR(100),
    "address" VARCHAR(500),
    "information" TEXT,
    "category" VARCHAR(100),
    "geometryType" "GeoGeometryType" NOT NULL,
    "geometry" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place" (
    "id" VARCHAR(150) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "information" TEXT,
    "needApproval" BOOLEAN NOT NULL DEFAULT false,
    "campusId" VARCHAR(100),
    "parentPlaceId" VARCHAR(150),
    "geometryType" "GeoGeometryType" NOT NULL,
    "geometry" JSONB NOT NULL,
    "longitude" DECIMAL(12,8),
    "latitude" DECIMAL(12,8),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floor" (
    "id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "floor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_category" (
    "placeId" VARCHAR(150) NOT NULL,
    "categoryId" VARCHAR(100) NOT NULL,

    CONSTRAINT "place_category_pkey" PRIMARY KEY ("placeId","categoryId")
);

-- CreateTable
CREATE TABLE "place_floor" (
    "placeId" VARCHAR(150) NOT NULL,
    "floorId" INTEGER NOT NULL,

    CONSTRAINT "place_floor_pkey" PRIMARY KEY ("placeId","floorId")
);

-- CreateIndex
CREATE INDEX "place_campusId_idx" ON "place"("campusId");

-- CreateIndex
CREATE INDEX "place_parentPlaceId_idx" ON "place"("parentPlaceId");

-- CreateIndex
CREATE INDEX "place_name_idx" ON "place"("name");

-- CreateIndex
CREATE INDEX "place_geometryType_idx" ON "place"("geometryType");

-- CreateIndex
CREATE INDEX "place_category_categoryId_idx" ON "place_category"("categoryId");

-- CreateIndex
CREATE INDEX "place_floor_floorId_idx" ON "place_floor"("floorId");

-- AddForeignKey
ALTER TABLE "place" ADD CONSTRAINT "place_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place" ADD CONSTRAINT "place_parentPlaceId_fkey" FOREIGN KEY ("parentPlaceId") REFERENCES "place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_category" ADD CONSTRAINT "place_category_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_category" ADD CONSTRAINT "place_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_floor" ADD CONSTRAINT "place_floor_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_floor" ADD CONSTRAINT "place_floor_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
