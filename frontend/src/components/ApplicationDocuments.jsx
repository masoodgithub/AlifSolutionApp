import { useEffect, useRef, useState } from "react";
import "./ApplicationDocuments.css";

const API_BASE_URL = "http://localhost:5000";

const documentCategories = [
  { value: "w9", label: "W-9" },
  { value: "insurance", label: "Certificate of insurance" },
  { value: "license", label: "Professional license" },
  {
    value: "business_registration",
    label: "Business registration",
  },
  { value: "certification", label: "Certification" },
  { value: "other", label: "Other document" },
];

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCategory(category) {
  const matchingCategory = documentCategories.find(
    (item) => item.value === category
  );

  return matchingCategory
    ? matchingCategory.label
    : "Other document";
}

function ApplicationDocuments() {
  const [documents, setDocuments] = useState([]);
  const [category, setCategory] = useState("insurance");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  async function loadDocuments() {
    const token = localStorage.getItem("alif_token");

    if (!token) {
      setLoading(false);
      setMessage("Please log in to view your documents.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents/my-application`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load documents.");
      }

      setDocuments(data.documents || []);
    } catch (error) {
      setMessage(error.message || "Unable to load documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const token = localStorage.getItem("alif_token");

    if (!token) {
      setMessage("Please log in before uploading documents.");
      return;
    }

    const formData = new FormData();

    formData.append("category", category);

    files.forEach((file) => {
      formData.append("documents", file);
    });

    setUploading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/documents/my-application`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to upload documents.");
      }

      setMessage("Document upload completed.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadDocuments();
    } catch (error) {
      setMessage(error.message || "Unable to upload documents.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="document-section">
      <div className="document-section-heading">
        <div>
          <p className="eyebrow">Required documents</p>
          <h3>Company documents</h3>
        </div>

        <span className="document-count">
          {documents.length} uploaded
        </span>
      </div>

      <p className="document-help-text">
        Upload your W-9, certificate of insurance, licenses, business
        registration, and relevant certifications. ALIF will review each
        submission.
      </p>

      <div className="document-upload-controls">
        <label className="form-field">
          Document category

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={uploading}
          >
            {documentCategories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          Upload documents

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            multiple
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      <p className="form-note">
        Accepted formats: PDF, JPG, JPEG, PNG, and WEBP. Maximum 10 MB per
        file.
      </p>

      {message && (
        <p className="auth-message" role="status">
          {message}
        </p>
      )}

      {loading ? (
        <p className="admin-empty-state">Loading documents...</p>
      ) : documents.length === 0 ? (
        <p className="admin-empty-state">
          No company documents have been uploaded yet.
        </p>
      ) : (
        <ul className="document-list">
          {documents.map((document) => (
            <li className="document-list-item" key={document._id}>
  <div className="document-list-item-content">
    <strong>{document.originalName}</strong>

    <span>
      {formatCategory(document.category)} ·{" "}
      {formatFileSize(document.size)}
    </span>

    <span
      className={`application-status-badge status-${document.reviewStatus}`}
    >
      {document.reviewStatus}
    </span>

    {document.reviewNote && (
      <span className="document-review-note">
        {document.reviewNote}
      </span>
    )}
  </div>

  <div className="document-list-item-actions">
    <a
      className="text-button"
      href={`${API_BASE_URL}/uploads/${document.storedName}`}
      target="_blank"
      rel="noreferrer"
    >
      View
    </a>

    <span className="document-private-label">
      Private to ALIF and your company
    </span>
  </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ApplicationDocuments;