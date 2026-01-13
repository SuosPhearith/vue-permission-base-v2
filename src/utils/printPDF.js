import axiosInstance from "./axiosInstance";

const handlePrintAction = async (
  route,
  data = {},
  mode = "print",
  filename = "document"
) => {
  let isSubmitting = true;
  try {
    // Step 1: Fetch the Base64 PDF from backend
    const response = await axiosInstance.post(`${route}`, data);
    const base64String = response.data.data;

    // Step 2: Decode Base64 to binary
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Step 3: Create Blob for PDF
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    if (mode === "print") {
      // Step 4a: Print the PDF using iframe
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        try {
          iframe.contentWindow.print();
        } catch (error) {
          console.error("Error triggering print:", error);
        }
      };

      // Clean up after print
      iframe.addEventListener("afterprint", () => {
        document.body.removeChild(iframe);
        window.URL.revokeObjectURL(url);
        isSubmitting = false;
      });

      // Fallback cleanup if user cancels print dialog
      window.addEventListener(
        "focus",
        () => {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
              window.URL.revokeObjectURL(url);
              isSubmitting = false;
            }
          }, 1000);
        },
        { once: true }
      );
      isSubmitting = false;
    } else if (mode === "download") {
      // Step 4b: Download the PDF
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      isSubmitting = false;
    }
  } catch (error) {
    console.error(
      `Error ${
        mode === "print" ? "fetching/printing" : "fetching/downloading"
      } PDF:`,
      error
    );
    isSubmitting = false;
  }
};

export default handlePrintAction;
