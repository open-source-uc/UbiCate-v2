import React, { FC, ReactNode } from "react";

interface MapNavbarProps {
    ref: React.RefObject<HTMLSelectElement | null>;
    children?: ReactNode;
}

const MapNavbar: FC<MapNavbarProps> = ({ ref, children }) => {
    return (
        <section ref={ref} className="relative top-0 flex w-full">
            {children}
        </section>
    );
};

export default MapNavbar;
