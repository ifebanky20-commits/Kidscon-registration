import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFBFE',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottom: '2px solid #6750A4',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#6750A4',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#79747E',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  qrContainer: {
    alignItems: 'center',
    border: '1px solid #E8DEF8',
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
    color: '#6750A4',
    fontFamily: 'Courier',
  },
  section: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #E7E0EC',
    paddingVertical: 15,
  },
  label: {
    fontSize: 12,
    color: '#79747E',
  },
  value: {
    fontSize: 16,
    color: '#1C1B1F',
    fontWeight: 'bold',
  },
  alertBox: {
    marginTop: 40,
    backgroundColor: '#F3EDF7',
    padding: 20,
    borderRadius: 8,
    borderLeft: '4px solid #6750A4',
  },
  alertTitle: {
    fontSize: 14,
    color: '#6750A4',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  alertText: {
    fontSize: 11,
    color: '#49454F',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#79747E',
    borderTop: '1px solid #E7E0EC',
    paddingTop: 15,
  }
});

export default function RegistrationTicketPDF({ schoolName, totalStudents, registrationId }) {
  const [qrCodeData, setQrCodeData] = useState(null);

  useEffect(() => {
    const dataString = `KIDSCON-REG:${registrationId || 'PENDING'}|SCHOOL:${schoolName}`;
    QRCode.toDataURL(dataString, { width: 300, margin: 1, color: { dark: '#6750A4', light: '#FFFFFF' } })
      .then(url => setQrCodeData(url))
      .catch(err => console.error('QR Code generation failed:', err));
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
            <Text style={styles.qrText}>{registrationId?.slice(0, 8).toUpperCase() || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>School Name</Text>
            <Text style={styles.value}>{schoolName || 'Unknown School'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Enrolled Students</Text>
            <Text style={styles.value}>{totalStudents || 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date Registered</Text>
            <Text style={styles.value}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
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
            3. Ensure all students listed in your original registration are present.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Generated securely by Kidscon Registry System.</Text>
        </View>

      </Page>
    </Document>
  );
}
