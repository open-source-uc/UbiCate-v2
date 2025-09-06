"use client";

import { use, useEffect } from "react";

import { pinsContext } from "@/app/context/pinsCtx";
import { usePlaceForm } from "@/app/hooks/usePlaceForm";
import { PointFeature } from "@/lib/types";

import * as Icons from "../../../ui/icons/icons";

import { CategoriesField } from "./categoriesField";
import { DescriptionField } from "./descriptionField";
import { FloorsField } from "./floorsField";
import { Notification } from "./notification";
import { PlaceNameField } from "./placeNameField";
import { SubmitButton } from "./submitButton";

interface PlaceFormData {
  name: string;
  information: string;
  categories: string[];
  floors: (number | "")[];
  identifier?: string;
}

interface CreatePlace {
  data: Omit<PlaceFormData, "identifier">;
  points: Array<PointFeature>;
  identifier?: string;
}

export default function PlaceForm({
  onClose,
  defaultData = {
    name: "",
    information: "",
    categories: [""],
    floors: [],
  },
  method = "POST",
  submitButtonText = "Crear Ubicación",
  title = "¡Nueva Ubicación!",
}: {
  onClose?: () => void;
  defaultData?: PlaceFormData;
  method?: "POST" | "PUT";
  submitButtonText?: string;
  title?: string;
}) {
  const { pins } = use(pinsContext);

  const { data, setData, notification, placeMutation, isLoading } = usePlaceForm(method, defaultData, onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const body: CreatePlace = {
      data,
      points: pins,
      identifier: defaultData?.identifier ?? "AGUAPIRAÑAJAMASNUNCAEXISTIR-123456",
    };

    placeMutation.mutate(body);
  };

  useEffect(() => {
    if (method === "POST" && pins.length === 1) {
      setData((prev) => ({
        ...prev,
        floors: [1],
      }));
    }
  }, []);

  return (
    <>
      <Notification notification={notification} />

      <form className="space-y-4 text-md px-3 py-5" onSubmit={handleSubmit}>
        <button
          type="button"
          className="text-foreground bg-accent flex items-center rounded-full hover:text-accent hover:bg-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent disabled:hover:text-foreground"
          aria-label="Cerrar menú"
          onClick={(e) => onClose?.()}
          disabled={isLoading}
        >
          <Icons.Close />
        </button>
        <h1 className="text-2xl font-bold text-center text-foreground">{title}</h1>

        <PlaceNameField
          value={data.name}
          onChange={(value) => setData((prev) => ({ ...prev, name: value }))}
          disabled={isLoading}
        />

        <CategoriesField
          categories={data.categories}
          onChange={(value) => setData((prev) => ({ ...prev, categories: value }))}
          disabled={isLoading}
        />

        <FloorsField
          floors={data.floors}
          onChange={(value) => setData((prev) => ({ ...prev, floors: value }))}
          disabled={isLoading}
        />

        <DescriptionField
          value={data.information}
          onChange={(value) => setData((prev) => ({ ...prev, information: value }))}
          disabled={isLoading}
        />

        <SubmitButton fallback="Procesando...">{submitButtonText}</SubmitButton>
      </form>
    </>
  );
}
