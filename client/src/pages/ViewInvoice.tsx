import { useRoute, useLocation } from "wouter";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Printer, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";

const PDF_MARGIN_TOP = 10;
const PDF_MARGIN_BOTTOM = 10;
const PDF_MARGIN_HORIZONTAL = 0;

export default function ViewInvoice() {
  const [, params] = useRoute("/invoice/:appId");
  const [, setLocation] = useLocation();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const invoiceData = {
    invoiceNumber: "INV-2025-001234",
    invoiceDate: "January 15, 2025",
    dueDate: "February 14, 2025",
    status: "paid",
    vendor: {
      name: "Slack Technologies, LLC",
      address: "500 Howard Street",
      city: "San Francisco, CA 94105",
      country: "United States",
      email: "billing@slack.com",
      phone: "+1 (415) 555-0100",
    },
    billTo: {
      company: "Appfuze.ai",
      address: "123 Business Avenue",
      city: "New York, NY 10001",
      country: "United States",
      email: "billing@appfuze.ai",
      taxId: "XX-XXXXXXX",
    },
    lineItems: [
      {
        id: "1",
        description: "Slack Pro Plan - Monthly Subscription",
        quantity: 50,
        unitPrice: 12.5,
        total: 625.0,
      },
      {
        id: "2",
        description: "Additional Storage (100 GB)",
        quantity: 1,
        unitPrice: 25.0,
        total: 25.0,
      },
      {
        id: "3",
        description: "Premium Support",
        quantity: 1,
        unitPrice: 50.0,
        total: 50.0,
      },
    ],
    subtotal: 700.0,
    tax: 63.0,
    total: 763.0,
    paymentMethod: "Credit Card •••• 4242",
    paymentDate: "January 16, 2025",
    notes: "Thank you for your business! This invoice has been paid in full.",
  };

  const handleBack = () => {
    setLocation("/");
  };

  const handleDownload = async () => {
    if (!invoiceRef.current) return;

    setIsDownloading(true);

    try {
      const element = invoiceRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      pdf.setProperties({
        title: `Invoice ${invoiceData.invoiceNumber}`,
        subject: `Invoice for ${invoiceData.vendor.name}`,
        author: invoiceData.billTo.company,
        keywords: "invoice, billing",
        creator: "Appfuze.ai",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const availableWidth = pdfWidth - 2 * PDF_MARGIN_HORIZONTAL;
      const availableHeight = pdfHeight - PDF_MARGIN_TOP - PDF_MARGIN_BOTTOM;

      const widthRatio = availableWidth / canvasWidth;
      const heightRatio = availableHeight / canvasHeight;
      const ratio = Math.min(widthRatio, heightRatio);

      const imgWidth = canvasWidth * ratio;
      const imgHeight = canvasHeight * ratio;

      const imgX = PDF_MARGIN_HORIZONTAL + (availableWidth - imgWidth) / 2;
      const imgY = PDF_MARGIN_TOP;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth, imgHeight);

      pdf.save(
        `Invoice_${invoiceData.invoiceNumber}_${invoiceData.vendor.name.replace(/\s+/g, "_")}.pdf`,
      );

      toast({
        title: "PDF Downloaded",
        description: "Invoice has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <div className="text-chart-2" data-testid="badge-status">
            Paid
          </div>
        );
      case "pending":
        return (
          <div className="text-chart-3" data-testid="badge-status">
            Pending
          </div>
        );
      case "overdue":
        return (
          <div className="text-chart-4" data-testid="badge-status">
            Overdue
          </div>
        );
      default:
        return <div data-testid="badge-status">{status}</div>;
    }
  };

  return (
    <div className="bg-background pb-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4 print:hidden mb-6">
        <Button variant="ghost" onClick={handleBack} data-testid="button-back">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading}
            data-testid="button-download"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Generating PDF..." : "Download"}
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            data-testid="button-print"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Invoice Card */}
      <Card data-testid="card-invoice">
        <div ref={invoiceRef}>
          <CardHeader className="space-y-6">
            {/* Invoice Header */}
            <div className="flex flex-col items-start justify-between gap-4 w-full">
              <div className="flex items-center gap-3 mb-2">
                {/* <FileText className="h-8 w-8 text-primary" /> */}
                <h1 className="text-3xl font-bold text-foreground">INVOICE</h1>
              </div>
              <div className="flex justify-between align-center w-full">
                <p className="text-sm text-muted-foreground">
                  Invoice Number:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {invoiceData.invoiceNumber}
                  </span>
                </p>
                <div className="text-right">
                  {getStatusBadge(invoiceData.status)}
                </div>
              </div>
            </div>

            <Separator />

            {/* Dates and Vendor Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendor Information */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  From
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-foreground">
                    {invoiceData.vendor.name}
                  </p>
                  <p className="text-muted-foreground">
                    {invoiceData.vendor.address}
                  </p>
                  <p className="text-muted-foreground">
                    {invoiceData.vendor.city}
                  </p>
                  <p className="text-muted-foreground">
                    {invoiceData.vendor.country}
                  </p>
                  <p className="text-muted-foreground mt-2">
                    {invoiceData.vendor.email}
                  </p>
                  <p className="text-muted-foreground">
                    {invoiceData.vendor.phone}
                  </p>
                </div>
              </div>

              {/* Bill To Information */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Bill To
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-foreground">
                    {invoiceData.billTo.company}
                  </p>
                  <p className="text-muted-foreground">
                    {invoiceData.billTo.address}
                  </p>
                  <p className="text-muted-foreground">
                    {invoiceData.billTo.city}
                  </p>
                  <p className="text-muted-foreground">
                    {invoiceData.billTo.country}
                  </p>
                  <p className="text-muted-foreground mt-2">
                    {invoiceData.billTo.email}
                  </p>
                  <p className="text-muted-foreground">
                    Tax ID: {invoiceData.billTo.taxId}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Date</p>
                <p className="font-semibold text-foreground">
                  {invoiceData.invoiceDate}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-semibold text-foreground">
                  {invoiceData.dueDate}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Line Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-line-items">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-semibold text-foreground">
                        Description
                      </th>
                      <th className="text-right p-3 text-sm font-semibold text-foreground">
                        Quantity
                      </th>
                      <th className="text-right p-3 text-sm font-semibold text-foreground">
                        Unit Price
                      </th>
                      <th className="text-right p-3 text-sm font-semibold text-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoiceData.lineItems.map((item) => (
                      <tr
                        key={item.id}
                        data-testid={`row-line-item-${item.id}`}
                      >
                        <td className="p-3 text-sm text-foreground">
                          {item.description}
                        </td>
                        <td className="p-3 text-sm text-right text-muted-foreground">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-sm text-right font-mono text-muted-foreground">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="p-3 text-sm text-right font-mono font-semibold text-foreground">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-1/2 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span
                    className="font-mono font-semibold text-foreground"
                    data-testid="text-subtotal"
                  >
                    ${invoiceData.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (9%)</span>
                  <span
                    className="font-mono font-semibold text-foreground"
                    data-testid="text-tax"
                  >
                    ${invoiceData.tax.toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span
                    className="text-xl font-mono font-bold text-primary"
                    data-testid="text-total"
                  >
                    ${invoiceData.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {invoiceData.status === "paid" && (
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-semibold text-foreground">
                      {invoiceData.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Date</p>
                    <p className="font-semibold text-foreground">
                      {invoiceData.paymentDate}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {invoiceData.notes && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Notes
                </h3>
                <p className="text-sm text-muted-foreground">
                  {invoiceData.notes}
                </p>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
