import React from "react";
import { AddOn, NailLength, Service } from "../types";
import { formatDuration, formatPrice } from "../utils/formatters";

interface Props {
  services: Service[];
  selectedServices: Service[];
  selectedAddOns: AddOn[];
  onToggleService: (service: Service) => void;
  onToggleAddOn: (addOn: AddOn) => void;
  nailShape: string;
  onSetNailShape: (shape: string) => void;
  nailLength: NailLength | null;
  onSetNailLength: (length: NailLength | null) => void;
  totalDuration: number;
  totalPrice: number;
  onNext: () => void;
}

const NAIL_SHAPES = [
  "Square",
  "Round",
  "Oval",
  "Squoval",
  "Almond",
  "Stiletto",
  "Coffin",
  "Flare",
];

const NAIL_LENGTHS: NailLength[] = [
  { id: "short", label: "Short", extraDuration: 0, extraPrice: 0 },
  { id: "medium", label: "Medium", extraDuration: 0, extraPrice: 0 },
  { id: "long", label: "Long", extraDuration: 15, extraPrice: 10 },
  { id: "xl", label: "XL", extraDuration: 20, extraPrice: 15 },
];

const ADD_ONS: AddOn[] = [
  { id: "nail-art", name: "Nail Art", duration: 15, price: 10 },
  { id: "ombre", name: "Ombré", duration: 15, price: 15 },
  { id: "chrome-powder", name: "Chrome Powder", duration: 10, price: 10 },
  { id: "paraffin-wax", name: "Paraffin Wax", duration: 15, price: 12 },
  { id: "callus-removal", name: "Callus Removal", duration: 15, price: 10 },
  { id: "gel-removal", name: "Gel Removal", duration: 30, price: 15 },
  { id: "lash-bath", name: "Lash Bath", duration: 10, price: 10 },
  { id: "brow-tint", name: "Brow Tint", duration: 20, price: 25 },
  { id: "brow-wax", name: "Brow Wax", duration: 20, price: 18 },
];

export default function ServiceSelector({
  services,
  selectedServices,
  selectedAddOns,
  onToggleService,
  onToggleAddOn,
  nailShape,
  onSetNailShape,
  nailLength,
  onSetNailLength,
  totalDuration,
  totalPrice,
  onNext,
}: Props) {
  const categories = Array.from(new Set(services.map((s) => s.category)));

  // Get available add-ons based on selected services
  const availableAddOnIds = new Set(selectedServices.flatMap((s) => s.addOns));
  const availableAddOns = ADD_ONS.filter((a) => availableAddOnIds.has(a.id));

  const hasNailServices = selectedServices.some((s) => s.category === "Nails");

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Choose Your Services</h2>
      <p style={styles.subtitle}>Select one or more services to get started</p>

      {/* Service Categories */}
      {categories.map((category) => (
        <div key={category} style={styles.category}>
          <h3 style={styles.categoryTitle}>{category}</h3>
          <div style={styles.serviceGrid}>
            {services
              .filter((s) => s.category === category)
              .map((service) => {
                const isSelected = selectedServices.some(
                  (s) => s.id === service.id,
                );
                return (
                  <button
                    key={service.id}
                    style={{
                      ...styles.serviceCard,
                      ...(isSelected ? styles.serviceCardSelected : {}),
                    }}
                    onClick={() => onToggleService(service)}
                  >
                    <div style={styles.serviceCardTop}>
                      <span
                        style={{
                          ...styles.serviceName,
                          color: isSelected ? "#2C6FAC" : "#1E2D3D",
                        }}
                      >
                        {service.name}
                      </span>
                      {isSelected && (
                        <span style={styles.selectedCheck}>✓</span>
                      )}
                    </div>
                    <p style={styles.serviceDescription}>
                      {service.description}
                    </p>
                    <div style={styles.serviceMeta}>
                      <span style={styles.metaChip}>
                        {formatDuration(service.duration)}
                      </span>
                      <span style={styles.metaChip}>
                        {formatPrice(service.price)}
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      {/* Add-Ons */}
      {availableAddOns.length > 0 && (
        <div style={styles.category}>
          <h3 style={styles.categoryTitle}>Add-Ons</h3>
          <p style={styles.sectionSubtitle}>
            Enhance your service with these extras
          </p>
          <div style={styles.addOnGrid}>
            {availableAddOns.map((addOn) => {
              const isSelected = selectedAddOns.some((a) => a.id === addOn.id);
              return (
                <button
                  key={addOn.id}
                  style={{
                    ...styles.addOnChip,
                    ...(isSelected ? styles.addOnChipSelected : {}),
                  }}
                  onClick={() => onToggleAddOn(addOn)}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isSelected ? "#2C6FAC" : "#5B6B7C",
                    }}
                  >
                    {addOn.name}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: isSelected ? "#4A90D9" : "#B8C4D0",
                      marginTop: 2,
                    }}
                  >
                    +{formatPrice(addOn.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Nail Shape */}
      {hasNailServices && (
        <div style={styles.category}>
          <h3 style={styles.categoryTitle}>Nail Shape (Optional)</h3>
          <div style={styles.shapeGrid}>
            {NAIL_SHAPES.map((shape) => (
              <button
                key={shape}
                style={{
                  ...styles.shapeChip,
                  ...(nailShape === shape ? styles.shapeChipSelected : {}),
                }}
                onClick={() => onSetNailShape(nailShape === shape ? "" : shape)}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Nail Length */}
      {hasNailServices && (
        <div style={styles.category}>
          <h3 style={styles.categoryTitle}>Nail Length (Optional)</h3>
          <div style={styles.shapeGrid}>
            {NAIL_LENGTHS.map((length) => {
              const isSelected = nailLength?.id === length.id;
              return (
                <button
                  key={length.id}
                  style={{
                    ...styles.shapeChip,
                    ...(isSelected ? styles.shapeChipSelected : {}),
                  }}
                  onClick={() => onSetNailLength(isSelected ? null : length)}
                >
                  <span>{length.label}</span>
                  {length.extraPrice > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        opacity: 0.8,
                        marginLeft: 4,
                      }}
                    >
                      +${length.extraPrice}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* Summary Bar */}
      {selectedServices.length > 0 && (
        <div style={styles.summaryBar}>
          <div>
            <div style={styles.summaryDetails}>
              <span style={styles.summaryLabel}>
                {formatDuration(totalDuration)}
              </span>
              <span style={styles.summarySeparator}>•</span>
              <span style={styles.summaryLabel}>{formatPrice(totalPrice)}</span>
            </div>
            <div style={styles.summaryServices}>
              {selectedServices.map((s) => s.name).join(", ")}
            </div>
          </div>
          <button style={styles.nextButton} onClick={onNext}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "24px 20px 120px",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1E2D3D",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#5B6B7C",
    marginBottom: 24,
  },
  category: {
    marginBottom: 28,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#4A90D9",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#5B6B7C",
    marginBottom: 12,
    marginTop: -8,
  },
  serviceGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  serviceCard: {
    backgroundColor: "#fff",
    border: "1.5px solid #EEF2F7",
    borderRadius: 12,
    padding: "14px 16px",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 4px rgba(30,45,61,0.06)",
  },
  serviceCardSelected: {
    borderColor: "#4A90D9",
    backgroundColor: "#F0F7FF",
    boxShadow: "0 0 0 3px rgba(74,144,217,0.15)",
  },
  serviceCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: 700,
  },
  selectedCheck: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    backgroundColor: "#4A90D9",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
  },
  serviceDescription: {
    fontSize: 13,
    color: "#5B6B7C",
    marginBottom: 10,
    lineHeight: 1.5,
  },
  serviceMeta: {
    display: "flex",
    gap: 8,
  },
  metaChip: {
    backgroundColor: "#D6EAFA",
    color: "#3D7DBF",
    fontSize: 12,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 999,
  },
  addOnGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  addOnChip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: 10,
    border: "1.5px solid #B8C4D0",
    backgroundColor: "#fff",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  addOnChipSelected: {
    borderColor: "#4A90D9",
    backgroundColor: "#F0F7FF",
  },
  shapeGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  shapeChip: {
    padding: "8px 16px",
    borderRadius: 999,
    border: "1.5px solid #B8C4D0",
    backgroundColor: "#fff",
    fontSize: 13,
    fontWeight: 600,
    color: "#5B6B7C",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  shapeChipSelected: {
    borderColor: "#4A90D9",
    backgroundColor: "#4A90D9",
    color: "#fff",
  },
  summaryBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTop: "1px solid #EEF2F7",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 -4px 16px rgba(30,45,61,0.08)",
    zIndex: 100,
  },
  summaryDetails: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1E2D3D",
  },
  summarySeparator: {
    color: "#B8C4D0",
  },
  summaryServices: {
    fontSize: 12,
    color: "#5B6B7C",
  },
  nextButton: {
    backgroundColor: "#4A90D9",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 24px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
};
