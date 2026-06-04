import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "qrcode";
import "../css/Factura.css";

const API_URL =
  "https://api-restaurant-elegant-frdxh8dxbrhgcfcz.mexicocentral-01.azurewebsites.net/api/facturas";

export default function FacturaPage() {
  const { pedidoId } = useParams();
  const [factura, setFactura] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [error, setError] = useState(null);

  // -----------------------------
  // Cargar factura + generar QR
  // -----------------------------
  useEffect(() => {
    fetch(`${API_URL}/pedido/${pedidoId}`)
      .then(async (res) => {
        if (!res.ok) {
          setError("Este pedido aún no tiene factura generada.");
          return null;
        }
        return res.json();
      })
      .then(async (data) => {
        if (!data) return;
        setFactura(data);

        // Crear QR
        const qrContent = `Factura #${data.id}\nTotal: $${data.total}\nFecha: ${data.fecha}`;
        const qrImg = await QRCode.toDataURL(qrContent);
        setQrDataUrl(qrImg);
      })
      .catch(() => setError("Error obteniendo la factura."));
  }, [pedidoId]);

  // -----------------------------
  // PDF
  // -----------------------------
  const generarPDF = () => {
    const element = document.getElementById("factura-pdf");

    setTimeout(() => {
      const opt = {
        margin: 8,
        filename: `factura_${factura.id}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      window.html2pdf().set(opt).from(element).save();
    }, 300);
  };

  // -----------------------------
  // Render
  // -----------------------------
  if (error)
    return (
      <h3 style={{ textAlign: "center", marginTop: "40px" }}>{error}</h3>
    );

  if (!factura) return <p>Cargando factura...</p>;

  return (
    <div className="factura-container">
      <div className="factura-card" id="factura-pdf">
        {/* ---------- ENCABEZADO SIN LOGO ---------- */}
        <div className="factura-header">
          <h1>Restaurante Elegant</h1>
          <p>NIT: 123456789-0</p>
          <p>Valledupar - Cesar</p>
        </div>

        <hr />

        {/* ---------- INFO ---------- */}
        <div className="factura-info">
          <p>
            <strong>Factura #:</strong> {factura.id}
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {new Date(factura.fecha).toLocaleString()}
          </p>
          <p>
            <strong>Subtotal:</strong> ${factura.subtotal}
          </p>
          <p>
            <strong>IVA (19%):</strong> ${factura.iva}
          </p>
          <p>
            <strong>Total:</strong> ${factura.total}
          </p>
        </div>

        <hr />

        {/* ---------- DETALLES ---------- */}
        <h3>Detalles</h3>
        <ul className="factura-detalles">
          {factura.detalles.map((d) => (
            <li key={d.id}>
              {d.platoNombre} × {d.cantidad} — ${d.precioUnitario}
            </li>
          ))}
        </ul>

        <hr />

        {/* ---------- QR ---------- */}
        <div className="factura-qr-container">
          <p><strong>Código QR:</strong></p>
          {qrDataUrl && (
            <img src={qrDataUrl} alt="QR" className="factura-qr" />
          )}
        </div>
      </div>

      <button onClick={generarPDF} className="factura-btn-pdf">
        Descargar PDF
      </button>
    </div>
  );
}
4