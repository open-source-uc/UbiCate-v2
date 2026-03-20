"use client";

import { useState, useEffect } from "react";
import { Announcement } from "../ui";

export default function AnnouncementHandler() {
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    // Verificar si el usuario marcó "no volver a mostrar"
    const dontShowAgain = localStorage.getItem("announcement-dont-show");
    
    // Si existe el flag, no mostrar
    if (dontShowAgain === "true") {
      setShowAnnouncement(false);
      return;
    }
    
    // Mostrar el anuncio
    setShowAnnouncement(true);
  }, []);

  const handleClose = () => {
    setShowAnnouncement(false);
  };

  const handleDontShowToday = () => {
    // Guardar un flag permanente
    localStorage.setItem("announcement-dont-show", "true");
  };

  return (
    <Announcement
      isOpen={showAnnouncement}
      title="Bienvenido a Ubicate UC"
      description="Responde nuestra encuesta y ayuda a mejorar Ubicate: el mapa digital UC."
      actionLabel="Ir a la encuesta"
      actionHref="https://forms.office.com/pages/responsepage.aspx?id=-tn1Xz_4wUqk0utI6goA0pLsok3fJ7pFn2yk5LTI9bNUOFQ3UTBUNDBITE1BMk1MUVNBV1YwQlY3WS4u&route=shorturl"
      onClose={handleClose}
      onDontShowToday={handleDontShowToday}
    />
  );
}
