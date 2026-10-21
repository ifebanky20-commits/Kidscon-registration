import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import QRCode from "qrcode";

import { useEffect, useState } from "react";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFDF8",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    borderBottom: "2px solid #007C43",
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    color: "#007C43",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    color: "#727D6F",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  qrContainer: {
    alignItems: "center",
    border: "1px solid #CDE8D4",
    padding: 5,
    borderRadius: 8,
  },
  qrCode: {
    width: 80,
    height: 80,
  },
  qrText: {
    fontSize: 8,
    marginTop: 4,
    color: "#007C43",
    fontFamily: "Courier",
  },
  section: {
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #DCE5DA",
    paddingVertical: 15,
  },
  label: {
    fontSize: 12,
    color: "#727D6F",
  },
  value: {
    fontSize: 16,
    color: "#231F20",
    fontWeight: "bold",
  },
  alertBox: {
    marginTop: 40,
    backgroundColor: "#F0F4EC",
    padding: 20,
    borderRadius: 8,
    borderLeft: "4px solid #007C43",
  },
  alertTitle: {
    fontSize: 14,
    color: "#007C43",
    fontWeight: "bold",
    marginBottom: 8,
  },
  alertText: {
    fontSize: 11,
    color: "#4F5B4D",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#727D6F",
    borderTop: "1px solid #DCE5DA",
    paddingTop: 15,
  },
});

export default function RegistrationTicketPDF({
  schoolName,
  totalStudents,
  registrationId,
}: {
  schoolName: string;
  totalStudents: number;
  registrationId: string;
}) {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  useEffect(() => {
    const dataString = `KIDSCON-REG:${registrationId || "PENDING"}|SCHOOL:${schoolName}`;
    QRCode.toDataURL(dataString, {
      width: 300,
      margin: 1,
      color: { dark: "#007C43", light: "#FFFFFF" },
    })
      .then((url) => setQrCodeData(url))
      .catch((err) => console.error("QR Code generation failed:", err));
  }, [schoolName, registrationId]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>KIDSCON 2026</Text>
            <Text style={styles.subtitle}>Official Entry Pass</Text>
          </View>
          <View style={styles.qrContainer}>
            {qrCodeData && <Image src={qrCodeData} style={styles.qrCode} />}
            <Text style={styles.qrText}>
              {registrationId?.slice(0, 8).toUpperCase() || "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>School Name</Text>
            <Text style={styles.value}>{schoolName || "Unknown School"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Enrolled Students</Text>
            <Text style={styles.value}>{totalStudents || 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date Registered</Text>
            <Text style={styles.value}>
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>Important Instructions</Text>
          <Text style={styles.alertText}>
            1. Please present this ticket (digitally or printed) upon arrival.
          </Text>
          <Text style={styles.alertText}>
            2. The QR Code must be clearly visible for scanning.
          </Text>
          <Text style={styles.alertText}>
            3. Ensure all students listed in your original registration are
            present.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Generated securely by Kidscon Registry System.</Text>
        </View>
      </Page>
    </Document>
  );
}
